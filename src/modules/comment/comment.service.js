import { getPostById } from '../post/post.model.js';
import * as commentModel from './comment.model.js';
import { pubsub } from '../../config/pubsub.js';

export const getSavedComment = async (context) => {
  try {
    if (!context.user || !context.user.userId) throw new Error('No Autorizado');
    const res = await commentModel.getSavedComment(context);
    return res.rows;
  } catch (error) {
    console.error('Error al obtener la lista comentarios guardados', error);
    throw new Error('Error al obtener lista de comentarios guardados');
  }
}

export const commentsByPost = async (args, context) => {
  try {
    if (!context.user.userId || !context.user) throw new Error('No Autorizado');
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
  } catch (error) {
    console.error('Error al obtener la lista comentarios del post', error);
    throw new Error('Error al obtener lista de comentarios del post');
  }
}

export const repliesByComment = async (args, context) => {
  try {
    if (!context.user.userId || !context.user) throw new Error('No Autorizado');
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
  } catch (error) {
    console.error('Error al obtener la lista de subcomentarios', error);
    throw new Error('Error al obtener lista de subcomentarios');
  }
}

export const savedComment = async (args, context) => {
  try {
    if (!context.user || !context.user.userId) throw new Error('No Autorizado');
    const { commentId: id } = args;
    await commentModel.savedComment(id, context);
    const res = await commentModel.getCommentById(id);
    return { ...res.rows[0], __typename: 'Comment', isSaved: true };
  } catch (error) {
    console.error('Error al guardar comentario', error);
    throw new Error('Error al guardar comentario');
  }
}

export const removeSavedComment = async (args, context) => {
  try {
    if (!context.user || !context.user.userId) throw new Error('No Autorizado');
    const { commentId: id } = args;
    const remove = await commentModel.removeSavedComment(id, context);
    if (remove.rowCount === 0) {
      throw new Error("Comentario no encontrado o no pertenece al usuario");
    }
    const res = await commentModel.getCommentById(id);
    return { ...res.rows[0], __typename: 'Comment', isSaved: false };
  } catch (error) {
    console.error('Error al remover el comentario guardado', error);
    throw new Error('Error al eliminar comentario guardado');
  }
}

export const createComment = async (args, context) => {
  try {
    if (!context.user || !context.user.userId) throw new Error("No autorizado");
    const { postId: id, content, parentCommentId } = args;
    let res;
    if (parentCommentId) {
      res = await commentModel.insertCommentByParentId(args, context);
      const enrichedComment = {
        ...res.rows[0],
        user_id: context.user.userId,
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
        user_id: context.user.userId,
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
      user_id: context.user.userId,
      parent_id: parentCommentId ?? null,
      comments: 0,
      reactions: 0,
      initialReaction: false,
      view_count: 0,
      has_viewed: false,
      isSaved: false,
      created_at: res.rows[0].created_at.toISOString()
    };

  } catch (error) {
    console.error('Error al crear un comentario', error);
    throw new Error('Error al craer comentario');
  }
}

export const createReply = async (args, context) => {
  try {
    if (!context.user || !context.user.userId) throw new Error("No autorizado");
    const res = await commentModel.createReply(args, context);
    return res.rows[0];
  } catch (error) {
    console.error('Error al crear createReply', error);
    throw new Error('Error al crear createReply');
  }
}
export const createViewComment = async (args, context) => {
  try {
    if (!context.user || !context.user.userId) throw new Error('No autorizado');
    const { commentId: id } = args;
    await commentModel.createViewComment(id, context);
    const res = await commentModel.getCommentById(id);
    const comment = res.rows[0];

    pubsub.publish('VIEW_COMMENT_CHANNEL', { commentViewed: comment });

    return comment;
  } catch (error) {
    console.error('Error al crear view del comentario', error);
    throw new Error('Error al crear view comentario');
  }
}

{/* resolvers Comment */ }

export const user_id = async (parent, context) => {
  try {
    const { user_id } = parent;
    if (!user_id) return null
    
    if (typeof user_id === 'object' && user_id !== null) {
      return user_id;
    }
    const id = user_id;
    return await context.loaders.userLoader.load(id);

  } catch (error) {
    console.error('Error al obtener user_id', error);
    throw new Error('Error al obtener user_id');
  }
};

export const post_id = async (parent, context) => {
  try {
    const { post_id } = parent;
    if(typeof post_id === 'object' && post_id !== null) {
      return post_id;
    }
    const id = post_id;
    return await context.loaders.postLoader.load(id);
  } catch (error) {
    console.error('Error al obtener post_id', error);
    throw new Error('Error al obtener post_id');
  }
}

export const replyCount = async (parent) => {
  try {
    const { id } = parent;
    const res = await commentModel.replyCount(id);
    return parseInt(res.rows[0].count, 10);
  } catch (error) {
    console.error('Error al obtener replyCount', error);
    throw new Error('Error al obtener replyCount');
  }
}

export const hasMoreReplies = async (parent) => {
  try {
    const { id } = parent;
    const res = await commentModel.replyCount(id);
    return parseInt(res.rows[0].count, 10) > 0;
  } catch (error) {
    console.error('Error al obtener hasMorereplies', error);
    throw new Error('Error al obtener hasMorereplies');
  }
}

export const reactions = async (parent) => {
  try {
    const { id } = parent;
    const res = await commentModel.reactions(id);
    return parseInt(res.rows[0].count, 10);
  } catch (error) {
    console.error('Error al obtener reactions', error);
    throw new Error('Error al obtener reactions');
  }
}

export const initialReaction = async (parent, context) => {
  try {
    const { id } = parent;
    if (!context.user || !context.user.userId) throw new Error('No Autorizado');
    const res = await commentModel.initialReaction(id, context);
    return res.rows.length > 0;
  } catch (error) {
    console.error('Error al obtener initialReaction', error);
    throw new Error('Error al obtener initialReaction');
  }
}

export const view_Count = async (parent) => {
  try {
    const { id } = parent;
    const res = await commentModel.view_Count(id);
    return parseInt(res.rows[0].count, 10);
  } catch (error) {
    console.error('Error al obtener view_count', error);
    throw new Error('Error al obtener view_count');
  }
}

export const has_viewed = async (parent, context) => {
  try {
    const { id } = parent;
    if (!context.user || !context.user.userId) throw new Error('No Autorizado');
      const res = await commentModel.has_viewed(id, context);
      return res.rows.length > 0;
  } catch (error) {
    console.error('Error al obtener hasMorereplies', error);
    throw error;
  }
}

export const isRepost = async (parent, context) => {
  try {
    const { id } = parent;
    const res = await commentModel.isRepost(id, context);
    return res.rows.length > 0
  } catch (error) {
    console.error('Error al obtener isRepost', error);
    throw error;
  }
}