import * as reactionCommentModel from './reactionComment.model.ts';
import { getCommentById } from '../comment/comment.model.ts';
import { pubsub } from '../../config/pubsub.ts';
import { Context } from '@/types/context.ts';

export const createCommentReaction = async (args: { commentId: string }, context: Context) => {
  try {
    if (!context.user || !context.user.userId) throw new Error('No autorizado');
    const { commentId } = args;
    const res = await reactionCommentModel.createCommentReaction(commentId, context);
    const resComment = await getCommentById(commentId);
    const comment = resComment.rows[0];
    const userId = comment.user_id
    const payload = {
      ...res.rows[0],
      action: 'CREATE'
    };
    pubsub.publish('REACTION_COMMENT_CHANNEL', {
      reactionComment: payload
    });

    if (String(userId) !== String(context.user.userId)) {
      try {
        const notifResult = await reactionCommentModel.insertNotification(userId, commentId, context);
        const notifRes = notifResult.rows[0];
        pubsub.publish(`LIKE_COMMENT_CHANNEL_${String(userId)}`, {
          likeComment: {
            id: notifRes.id,
            recipient_id: notifRes.recipient_id,
            actor_id: context.user.userId,
            type: notifRes.type,
            reference_id: commentId,
            reference_type: notifRes.reference_type,
            created_at: new Date().toISOString(),
            read: false
          }
        })
      } catch (notiError: unknown) {
        console.log('Error al guardar post', (notiError as { message?: string })?.message);
      }
    }
    return res.rows.length > 0;
  } catch (error) {
    console.log('Error al guardar post', error);
    throw error;
  }
}

export const deleteCommentReaction = async (args: { commentId: string }, context: Context) => {
  try {
    if (!context.user || !context.user.userId) {
      throw new Error('No autorizado');
    }
    const { commentId } = args;
    const res = await reactionCommentModel.deleteCommentReaction(commentId, context);

    if (res.rows.length > 0) {
      const payload = {
        ...res.rows[0],
        action: 'DELETE'
      };
      pubsub.publish('REACTION_COMMENT_CHANNEL', {
        reactionComment: payload
      })
    }
    return res.rows.length > 0;
  } catch (error) {
    console.log('Error al guardar post', error);
    throw new Error('Error al guardar post');
  }
}
{/*
export const comment_id = async (parent: { commentId: string }) => {
  try {
    const { commentId: id } = parent;
    const res = await getCommentById(id);
    return res.rows[0];
  } catch (error) {
    console.log('Error al guardar post', error);
    throw new Error('Error al guardar post');
  }
}

export const user_id = async (parent: { user_id: string }) => {
  try {
    const { user_id: id } = parent;
    const res = await getUserById(id);
    return res.rows[0];
  } catch (error) {
    console.log('Error al guardar post', error);
    throw new Error('Error al guardar post');
  }
}
*/}