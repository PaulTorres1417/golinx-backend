import * as commentService from './comment.service.js';
import { pubsub } from '../../config/pubsub.js';

export const commentResolvers = {
  Query: {
    getSavedComment: async (_, __, context) => {
      return await commentService.getSavedComment(context);
    },
    commentsByPost: async (_, args, context) => {
      return await commentService.commentsByPost(args, context)
    },

    repliesByComment: async (_, args, context) => {
      return await commentService.repliesByComment(args, context); 
    },
  },

  Mutation: {
    savedComment: async (_, args, context) => {
      return await commentService.savedComment(args, context);
    },
    removeSavedComment: async (_, args, context) => {
      return await commentService.removeSavedComment(args, context);
    },
    createComment: async (_, args, context) => {
      return await commentService.createComment(args, context);
    },
    //no se usa
    createReply: async (_, args, context) => {
      return await commentService.createReply(args, context);
    },
    createViewComment: async (_, args, context) => {
      return await commentService.createViewComment(args, context);
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
    user_id: async (parent, _, context) => {
      return await commentService.user_id(parent, context);
    },
    post_id: async (parent, _, context) => {
      return await commentService.post_id(parent, context);
    },
    replyCount: async (parent) => {
      return await commentService.replyCount(parent);
    },
    hasMoreReplies: async (parent) => {
      return await commentService.hasMoreReplies(parent);
    },
    comments: async (parent) => {
      return await commentService.replyCount(parent);
    },
    reactions: async (parent) => {
      return await commentService.reactions(parent);
    },
    initialReaction: async (parent, _, context) => {
      return await commentService.initialReaction(parent, context);
    },
    view_count: async (parent) => {
      return await commentService.view_Count(parent);
    },
    has_viewed: async (parent, _, context) => {
      return await commentService.has_viewed(parent, context);
    },
    count_repost: async (parent) => {
      return parent.repost_count ?? 0;
    },
    isRepost: async (parent, _, context) => {
      return await commentService.isRepost(parent, context);
    },
  },
};
