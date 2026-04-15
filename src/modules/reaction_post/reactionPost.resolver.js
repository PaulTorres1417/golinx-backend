import * as reactionPostService from './reactionPost.service.js';
import { pubsub } from '../../config/pubsub.js';

export const reactionPostResolvers = {
  Mutation: {
    createPostReaction: async (_, args, context) => {
      return await reactionPostService.createPostReaction(args, context);
    },
    deletePostReaction: async (_, args, context) => {
      return await reactionPostService.deletePostReaction(args, context);
    }
  },
  Subscription: {
    reactionPost: {
      subscribe: () => pubsub.asyncIterableIterator(['REACTION_POST_CHANNEL']),
    }
  }
}