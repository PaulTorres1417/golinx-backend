import * as reactionCommentModel from './reactionComment.model.js';
import { getCommentById } from '../comment/comment.model.js';
import { getUserById } from '../user/user.model.js';
import { pubsub } from '../../config/pubsub.js';

export const createCommentReaction = async (args, context) => {
  try {
    if (!context.user.userId || !context.user) throw new Error('No autorizado');
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
      } catch (notiError) {
        console.log('Error al guardar post', notiError.message);
      }

    }

    return res.rows.length > 0;
  } catch (error) {
    console.log('Error al guardar post', error.message, error.stack);
    throw new Error('Error al guardar post');
  }
}

export const deleteCommentReaction = async (args, context) => {
  try {
    if (!context.user.userId || !context.user) {
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

export const comment_id = async (parent) => {
  try {
    const { commentId: id } = parent;
    const res = await getCommentById(id);
    return res.rows[0];
  } catch (error) {
    console.log('Error al guardar post', error);
    throw new Error('Error al guardar post');
  }
}

export const user_id = async (parent) => {
  try {
    const { user_id: id } = parent;
    const res = await getUserById(id);
    return res.rows[0];
  } catch (error) {
    console.log('Error al guardar post', error);
    throw new Error('Error al guardar post');
  }
}
