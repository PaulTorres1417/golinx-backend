import * as reactionPostService from './reactionPost.service.ts';
import { pubsub } from '../../config/pubsub.ts';
import { Context } from '@/types/context.ts';

export const reactionPostResolvers = {
  Mutation: {
    createPostReaction: async (_: unknown, args: { postId: string }, context: Context) => {
      return await reactionPostService.createPostReaction(args, context);
    },
    deletePostReaction: async (_: unknown, args: { postId: string }, context: Context) => {
      return await reactionPostService.deletePostReaction(args, context);
    }
  },
  Subscription: {
    reactionPost: {
      subscribe: () => pubsub.asyncIterableIterator(['REACTION_POST_CHANNEL']),
    }
  }
}