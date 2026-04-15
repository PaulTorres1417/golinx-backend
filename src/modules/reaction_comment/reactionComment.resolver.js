import * as reactionCommentService from './reactionComment.service.js';
import { pubsub } from '../../config/pubsub.js';

export const reactionCommentResolver = {
  Mutation: {
    createCommentReaction: async (_, args, context) => {
      return await reactionCommentService.createCommentReaction(args, context);
    },
    deleteCommentReaction: async (_, args, context) => {
      return await reactionCommentService.deleteCommentReaction(args, context);
    }
  },
  Subscription: {
    reactionComment: {
      subscribe: () => pubsub.asyncIterableIterator(['REACTION_COMMENT_CHANNEL']),
    }
  },
  ReactionComment: {
    comment_id: async (parent, _, context) => {
      return await context.loaders.commentLoader.load(parent.comment_id);
    },
    user_id: async (parent, _, context) => {
      return await context.loaders.userLoader.load(parent.user_id);
    }
  }
} 