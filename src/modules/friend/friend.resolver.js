import * as friendService from './friend.service.js';
import { pubsub } from '../../config/pubsub.js';

export const friendResolvers = {
  Query: {
    myFollowings: async (_, args, context) => {
      return await friendService.myFollowings(args, context);
    },
    myFollowers: async (_, args, context) => {
      return await friendService.myFollowers(args, context);
    }
  },
  Mutation: {
    followUser: async (_, args, context) => {
      return await friendService.followUser(args, context);
    },
    unFollowUser: async (_, args, context) => {
      return await friendService.unFollowUser(args, context);
    }
  },
  Subscription: {
    newFollower: {
      subscribe: (_, { recipientId }) =>
        pubsub.asyncIterableIterator(`NEW_FOLLOWER_${recipientId}`)
    }
  },
  Friend: {
    user_id: async (parent, _, context) => {
      return await context.loaders.userLoader.load(parent.user_id);
    },
    friend_id: async (parent, _, context) => {
      return await context.loaders.userLoader.load(parent.friend_id);
    }
  }
}