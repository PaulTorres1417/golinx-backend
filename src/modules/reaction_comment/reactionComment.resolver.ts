import * as reactionCommentService from './reactionComment.service.ts';
import { pubsub } from '../../config/pubsub.ts';
import { Context } from '@/types/context.ts';

export const reactionCommentResolver = {
  Mutation: {
    createCommentReaction: (_: unknown, args: { commentId: string }, context: Context) => {
      return reactionCommentService.createCommentReaction(args, context);
    },
    deleteCommentReaction: (_: unknown, args: { commentId: string }, context: Context) => {
      return reactionCommentService.deleteCommentReaction(args, context);
    }
  },
  Subscription: {
    reactionComment: {
      subscribe: () => pubsub.asyncIterableIterator(['REACTION_COMMENT_CHANNEL']),
    }
  },
  ReactionComment: {
    comment_id: (parent: { comment_id: string }, _: unknown, context: Context) => {
      return context.loaders.commentLoader.load(parent.comment_id);
    },
    user_id: (parent: { user_id: string }, _: unknown, context: Context) => {
      return context.loaders.userLoader.load(parent.user_id);
    }
  }
} 