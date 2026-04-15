import * as notificationService from './notification.service.js';
import { pubsub } from '../../config/pubsub.js';

export const notificationResolvers = {
  Query:{ 
    getNotifications: async (_, args, context) => {
      return await notificationService.getNotifications(args, context)
    },
    getFollowers: async (_, args, context) => {
      return await notificationService.getFollowers(args, context);
    }
  },
  Mutation: {
    showAsRead: async (_, args, context) => {
      return await notificationService.showAsRead(args, context);
    }
  },
  Subscription: {
    likePost: {
      subscribe: (_, { recipientId }) => 
        pubsub.asyncIterableIterator([`LIKE_POST_CHANNEL_${recipientId}`])
    },
    likeComment: {
      subscribe: (_, { recipientId }) => 
        pubsub.asyncIterableIterator([`LIKE_COMMENT_CHANNEL_${recipientId}`])
    },
    repostPostEvent: {
      subscribe: (_, { recipientId }) => 
        pubsub.asyncIterableIterator([`REPOST_POST_EVENT_CHANNEL_${recipientId}`])
    },
    repostCommentEvent: {
      subscribe: (_, { recipientId }) => 
        pubsub.asyncIterableIterator([`REPOST_COMMENT_EVENT_CHANNEL_${recipientId}`])
    }
  },
  Notification: {
    recipient_id: async (parent, _, context) => {
        return await context.loaders.userLoader.load(parent.recipient_id);
    },
    actor_id: async (parent, _, context) => {
        return await context.loaders.userLoader.load(parent.actor_id);
    }
  }
}

