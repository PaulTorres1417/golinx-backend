import * as friendService from './friend.service.ts';
import { pubsub } from '../../config/pubsub.ts';
import type { Context } from '@/types/context.ts';

export const friendResolvers = {
  Query: {
    myFollowings: (_: unknown, args: { userId: string }, context: Context) => {
      return friendService.myFollowings(args, context);
    },
    myFollowers: (_: unknown, args: { userId: string }, context: Context) => {
      return friendService.myFollowers(args, context);
    },
    getFollowing: (_: unknown, __: unknown, context: Context) => {
      return friendService.getFollowing(context);
    }
  },
  Mutation: {
    followUser: (_: unknown, args: { userId: string }, context: Context) => {
      return friendService.followUser(args, context);
    },
    unFollowUser: (_: unknown, args: { userId: string }, context: Context) => {
      return friendService.unFollowUser(args, context);
    }
  },
  Subscription: {
    newFollower: {
      subscribe: (_: unknown, { recipientId }: { recipientId: string }) =>
        pubsub.asyncIterableIterator(`NEW_FOLLOWER_${recipientId}`)
    }
  },
  Friend: {
    user_id: (parent: { user_id: string }, _: unknown, context: Context) => {
      return context.loaders.userLoader.load(parent.user_id);
    },
    friend_id: (parent: { friend_id: string }, _: unknown, context: Context) => {
      return context.loaders.userLoader.load(parent.friend_id);
    }
  }
}