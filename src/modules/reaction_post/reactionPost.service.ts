import * as reactionPostModel from './reactionPost.model.ts';
import { pubsub } from '../../config/pubsub.ts';
import { getPostById } from '../post/post.model.ts';
import { Context } from '@/types/context.ts';

export const createPostReaction = async (args: {postId: string }, context: Context) => {
  try {
    if (!context.user || !context.user.userId) throw new Error('No autorizado');
    const { postId } = args;
    const res = await reactionPostModel.createPostReaction(postId, context);
    const reaction = res.rows[0];
    const resPost = await getPostById(postId);
    const post = resPost.rows[0];
    const userId = post.user_id;

    pubsub.publish('REACTION_POST_CHANNEL', {
      reactionPost: {
        id: reaction.id,
        post_id: { id: reaction.post_id },
        user_id: { id: reaction.user_id },
        action: 'CREATE'
      }
    })
    if (userId !== context.user.userId) {
      
      const res = await reactionPostModel.insertNotification(userId, postId, context);
      const notifId = res.rows[0]
      pubsub.publish(`LIKE_POST_CHANNEL_${userId}`, {
      likePost: {
        id: notifId.id,
        recipient_id: post.user_id,
        actor_id: context.user.userId,
        type: notifId.type,
        reference_id: postId,
        reference_type: notifId.reference_type,
        created_at: new Date().toISOString(),
        read: false
      }
    })
    }
    return res.rows.length > 0;
  } catch (error) {
    console.error('Error al reaction post resolver', error);
    throw new Error('Error al ejecutar reaction post resolver');
  }
}

export const deletePostReaction = async (args: { postId: string }, context: Context) => {
  try {
    if (!context.user || !context.user.userId) throw new Error('No autorizado');
    const { postId } = args;
    const reactionDelete = await reactionPostModel.selectPostReaction(postId, context);

    if (reactionDelete.rows.length === 0) return false;
    const reactionId = reactionDelete.rows[0].id;
    const res = await reactionPostModel.removePostReaction(postId, context);

    pubsub.publish('REACTION_POST_CHANNEL', {
      reactionPost: {
        id: reactionId,
        post_id: { id: postId },
        user_id: { id: context.user.userId },
        action: 'DELETE'
      }
    })
    return res.rows.length > 0;
  } catch (error) {
    console.error('Error al borrar post resolver', error);
    throw new Error('Error al borrar reaction post resolver');
  }
}
