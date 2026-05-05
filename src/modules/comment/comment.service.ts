import { getPostById } from '../post/post.model.ts'
import * as commentModel from './comment.model.ts';
import { pubsub } from '../../config/pubsub.ts';
import { Context } from '@/types/context.ts';
import { withAuth } from '@/middleware/requiredAuth.ts';
import { withErrorHandling } from '@/helpers/withErrorHandling.ts';
import { QueryResult } from 'pg';

export const getSavedComment = withAuth(
  withErrorHandling(
    async (context: Context) => {
      const res = await commentModel.getSavedComment(context);
      return res.rows;
    },
    'Error al obtener lista de comentarios guardados'
  )
);

export const commentsByPost = withAuth(
  withErrorHandling(
    async (args: { postId: string, after: number, first: number }) => {
      const { first } = args;
      const res = await commentModel.commentsByPost(args);

      const hasNextPage = res.rows.length > first;
      const edges = res.rows.slice(0, first).map((comment) => ({
        node: {
          ...comment,
          created_at: comment.created_at.toISOString()
        },
        cursor: new Date(comment.created_at).getTime().toString(),
      }));

      return {
        edges,
        pageInfo: {
          hasNextPage,
          endCursor: edges.length
            ? edges[edges.length - 1].cursor
            : null,
        },
      };
    },
    'Error al obtener lista de comentarios del post'
  )
)

export const repliesByComment = withAuth(
  withErrorHandling(
    async (args: { commentId: string, after: number, first: number }) => {
      const { first } = args;
      const res = await commentModel.repliesByComment(args);
      const hasNextPage = res.rows.length > first;

      const edges = res.rows.slice(0, first).map((reply) => ({
        node: {
          ...reply,
          created_at: reply.created_at.toISOString()
        },
        cursor: new Date(reply.created_at).getTime().toString(),
      }));

      return {
        edges,
        pageInfo: {
          hasNextPage,
          endCursor: edges.length
            ? edges[edges.length - 1].cursor
            : null,
        },
      };
    },
    'Error al obtener lista de comentarios de comment'
  )
)

export const savedComment = withAuth(
  withErrorHandling(
    async (args: { commentId: string }, context: Context) => {
      const { commentId: id } = args;
      await commentModel.savedComment(id, context);
      const res = await commentModel.getCommentById(id);
      return { ...res.rows[0], __typename: 'Comment', isSaved: true };
    },
    'Error al guardar comentario'
  )
)

export const removeSavedComment = withAuth(
  withErrorHandling(
    async (args: { commentId: string }, context: Context) => {
      const { commentId: id } = args;
      const remove = await commentModel.removeSavedComment(id, context);
      if (remove.rowCount === 0) {
        throw new Error("Comentario no encontrado o no pertenece al usuario");
      }
      const res = await commentModel.getCommentById(id);
      return { ...res.rows[0], __typename: 'Comment', isSaved: false };
    },
    'Error al remover saved comment'
  )
)

export const createComment = withAuth(
  withErrorHandling(
    async (args: { postId: string, content: string, parentCommentId: string }, context: Context) => {
      const { postId: id, content, parentCommentId } = args;
      let res: QueryResult;
      if (parentCommentId) {
        res = await commentModel.insertCommentByParentId(args, context);
        const enrichedComment = {
          ...res.rows[0],
          user_id: context.user?.userId,
          post_id: id,
          parent_id: parentCommentId,
          created_at: res.rows[0].created_at.toISOString()
        }
        pubsub.publish('COMMENT_CHANNEL', { commentAdded: enrichedComment });

        const parentCommentCountRes = await
          commentModel.countNestedCommentsByParentId(parentCommentId);
        pubsub.publish('COMMENTS_COUNT_CHANNEL', {
          commentsCount: {
            id: parentCommentId,
            comments: parseInt(parentCommentCountRes.rows[0].comments, 10)
          }
        });
      } else {
        res = await commentModel.insertComment(id, content, context);
        const enrichedComment = {
          ...res.rows[0],
          user_id: context.user?.userId,
          post_id: id,
          parent_id: null,
          created_at: res.rows[0].created_at.toISOString()
        }
        pubsub.publish('COMMENT_CHANNEL', { commentAdded: enrichedComment });
      }
      const commentCountRes = await commentModel.commentCount(id);
      pubsub.publish('POST_COMMENT_COUNT_CHANNEL', {
        postCommentsCount: {
          id: id,
          comments: parseInt(commentCountRes.rows[0].comments, 10)
        }
      });
      const postRes = await getPostById(id);
      return {
        ...res.rows[0],
        post_id: postRes.rows[0],
        user_id: context.user?.userId,
        parent_id: parentCommentId ?? null,
        comments: 0,
        reactions: 0,
        initialReaction: false,
        view_count: 0,
        has_viewed: false,
        isSaved: false,
        created_at: res.rows[0].created_at.toISOString()
      };
    },
    'Error al crear comentario'
  )
)

export const createReply = withAuth(
  withErrorHandling(
    async (args: { postId: string, parentCommentId: string, content: string }, context: Context) => {
      const res = await commentModel.createReply(args, context);
      return res.rows[0];
    },
    'Error al crear Reply'
  )
)

export const createViewComment = withAuth(
  withErrorHandling(
    async (args: { commentId: string }, context: Context) => {
      const { commentId: id } = args;
      await commentModel.createViewComment(id, context);
      const res = await commentModel.getCommentById(id);
      const comment = res.rows[0];

      pubsub.publish('VIEW_COMMENT_CHANNEL', { commentViewed: comment });

      return comment;
    },
    'Error al crear view comment'
  )
)

{/* resolvers Comment */ }

export const user_id = withErrorHandling(
    async (parent: { user_id: string }, context: Context) => {
      const { user_id } = parent;
      if (!user_id) return null

      if (typeof user_id === 'object' && user_id !== null) {
        return user_id;
      }
      const id = user_id;
      return await context.loaders.userLoader.load(id);
    },
    'Error al traer user_id'
  )

export const post_id = withErrorHandling(
    async (parent: { post_id: string }, context: Context) => {
      const { post_id } = parent;
      if (typeof post_id === 'object' && post_id !== null) {
        return post_id;
      }
      const id = post_id;
      return await context.loaders.postLoader.load(id);
    },
    'Error al traer post_id'
  )

export const replyCount = withErrorHandling(
    async (parent: { id: string }) => {
      const { id } = parent;
      const res = await commentModel.replyCount(id);
      return parseInt(res.rows[0].count, 10);
    },
    'Error al traer replyCount'
  )

export const hasMoreReplies = withErrorHandling(
    async (parent: { id: string }) => {
      const { id } = parent;
      const res = await commentModel.replyCount(id);
      return parseInt(res.rows[0].count, 10) > 0;
    },
    'Error al traer hasMoreReplies'
  )

export const reactions = withErrorHandling(
    async (parent: { id: string }) => {
      const { id } = parent;
      const res = await commentModel.reactions(id);
      return parseInt(res.rows[0].count, 10);
    },
    'Error al traer Reactions'
  )

export const initialReaction = withErrorHandling(
    async (parent: { id: string }, context: Context) => {
      const { id } = parent;
      if (!context.user || !context.user.userId) throw new Error('No Autorizado');
      const res = await commentModel.initialReaction(id, context);
      return res.rows.length > 0;
    },
    'Error al traer initialReaction'
  )

export const view_Count = withErrorHandling(
    async (parent: { id: string }) => {
      const { id } = parent;
      const res = await commentModel.view_Count(id);
      return parseInt(res.rows[0].count, 10);
    },
    'error al traer view_count'
  )

export const has_viewed = withErrorHandling(
    async (parent: { id: string }, context: Context) => {
      const { id } = parent;
      if (!context.user || !context.user.userId) throw new Error('No Autorizado');
      const res = await commentModel.has_viewed(id, context);
      return res.rows.length > 0;
    },
    'Error al traer has_viewed'
  )

export const isRepost = withErrorHandling(
    async (parent: { id: string }, context: Context) => {
      const { id } = parent;
      const res = await commentModel.isRepost(id, context);
      return res.rows.length > 0
    },
    'Error al traer isRepost'
  )
