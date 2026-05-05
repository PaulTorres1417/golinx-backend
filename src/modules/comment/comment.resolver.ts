import * as commentService from './comment.service.ts';
import { pubsub } from '../../config/pubsub.ts';
import { type Context } from '../../types/context.ts';

export const commentResolvers = {
  Query: {
    getSavedComment: (_: unknown, __: unknown, context: Context) => {
      return commentService.getSavedComment(context);
    },
    commentsByPost: (
      _: unknown,
      args: { postId: string; first: number; after?: string | null },
      context: Context
    ) => {
      return commentService.commentsByPost(args, context)
    },

    repliesByComment: (
      _: unknown,
      args: { commentId: string; first: number; after?: string | null },
      context: Context
    ) => {
      return commentService.repliesByComment(args, context);
    },
  },

  Mutation: {
    savedComment: (_: unknown, args: { commentId: string }, context: Context) => {
      return commentService.savedComment(args, context);
    },
    removeSavedComment: (_: unknown, args: { commentId: string }, context: Context) => {
      return commentService.removeSavedComment(args, context);
    },
    createComment: (
      _: unknown,
      args: { postId: string; content: string; parentCommentId?: string | null },
      context: Context
    ) => {
      return commentService.createComment(args, context);
    },
    //no se usa
    createReply: (
      _: unknown,
      args: { postId: string; parentCommentId: string; content: string },
      context: Context
    ) => {
      return commentService.createReply(args, context);
    },
    createViewComment: (_: unknown, args: { commentId: string }, context: Context) => {
      return commentService.createViewComment(args, context);
    }
  },

  Subscription: {
    commentAdded: {
      subscribe: () => pubsub.asyncIterableIterator(['COMMENT_CHANNEL']),
    },
    commentViewed: {
      subscribe: () => pubsub.asyncIterableIterator(['VIEW_COMMENT_CHANNEL']),
    },
    commentsCount: {
      subscribe: () => pubsub.asyncIterableIterator(['COMMENTS_COUNT_CHANNEL']),
    },
    postCommentsCount: {
      subscribe: () => pubsub.asyncIterableIterator(['POST_COMMENT_COUNT_CHANNEL']),
    },
    commentRepost: {
      subscribe: () => pubsub.asyncIterableIterator(['REPOST_COMMENT_CHANNEL']),
    }
  },

  Comment: {
    user_id: (parent: { user_id: string }, _: unknown, context: Context) => {
      return commentService.user_id(parent, context);
    },
    post_id: (parent: { post_id: string }, _: unknown, context: Context) => {
      return commentService.post_id(parent, context);
    },
    replyCount: (parent: { id: string }) => {
      return commentService.replyCount(parent);
    },
    hasMoreReplies: (parent: { id: string }) => {
      return commentService.hasMoreReplies(parent);
    },
    comments: (parent: { id: string }) => {
      return commentService.replyCount(parent);
    },
    reactions: (parent: { id: string }) => {
      return commentService.reactions(parent);
    },
    initialReaction: (parent: { id: string }, _: unknown, context: Context) => {
      return commentService.initialReaction(parent, context);
    },
    view_count: (parent: { id: string }) => {
      return commentService.view_Count(parent);
    },
    has_viewed: (parent: { id: string }, _: unknown, context: Context) => {
      return commentService.has_viewed(parent, context);
    },
    count_repost: (parent: { repost_count?: number }) => {
      return parent.repost_count ?? 0;
    },
    isRepost: (parent: { id: string }, _: unknown, context: Context) => {
      return commentService.isRepost(parent, context);
    },
  },
};
