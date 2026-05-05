import * as notificationService from './notification.service.ts';
import { pubsub } from '../../config/pubsub.ts';
import type { Context } from '@/types/context.ts';

export type Props = {
  first: number;
  after: string | null;
}
export const notificationResolvers = {
  Query:{ 
    getNotifications: (_: unknown, args: Props, context: Context) => 
       notificationService.getNotifications(args, context),

    getFollowers: (_: unknown, args: Props, context: Context) =>
       notificationService.getFollowers(args, context),
  },

  Mutation: {
    showAsRead: (_: unknown, args: { notificationId: string }, context: Context) =>
       notificationService.showAsRead(args, context)
  },

  Subscription: {
    likePost: {
      subscribe: (_: unknown, { recipientId }: { recipientId: string }) => 
        pubsub.asyncIterableIterator([`LIKE_POST_CHANNEL_${recipientId}`])
    },
    likeComment: {
      subscribe: (_: unknown, { recipientId }: { recipientId: string }) => 
        pubsub.asyncIterableIterator([`LIKE_COMMENT_CHANNEL_${recipientId}`])
    },
    repostPostEvent: {
      subscribe: (_: unknown, { recipientId }: { recipientId: string }) => 
        pubsub.asyncIterableIterator([`REPOST_POST_EVENT_CHANNEL_${recipientId}`])
    },
    repostCommentEvent: {
      subscribe: (_: unknown, { recipientId }: { recipientId: string }) => 
        pubsub.asyncIterableIterator([`REPOST_COMMENT_EVENT_CHANNEL_${recipientId}`])
    }
  },
  Notification: {
    recipient_id: (parent: { recipient_id: string }, _: unknown, context: Context) => 
        context.loaders.userLoader.load(parent.recipient_id),

    actor_id: (parent: { actor_id: string }, _: unknown, context: Context) => 
      context.loaders.userLoader.load(parent.actor_id)
  },  
}

