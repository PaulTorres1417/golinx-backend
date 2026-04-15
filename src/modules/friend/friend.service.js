import * as friendModel from './friend.model.js';
import { getUserById } from '../user/user.model.js';
import { pubsub } from '../../config/pubsub.js';

export const myFollowings = async (args, context) => {
  try {
    if (!context.user || !context.user.userId) throw new Error('No autorizado');
    const { userId } = args;
    const res = await friendModel.myFollowings(userId);
    return res.rows.length;
  } catch (error) {
    console.error('Error al obtener', error);
    throw new Error('Error al obtener');
  }
}

export const myFollowers = async (args, context) => {
  try {
    if (!context.user || !context.user.userId) throw new Error('No autorizado');
    const { userId } = args;
    const res = await friendModel.myFollowers(userId);
    return res.rows.length;
  } catch (error) {
    console.error('Error al obtener', error);
    throw new Error('Error al obtener');
  }
}

export const followUser = async (args, context) => {
  try {
    if (!context.user || !context.user.userId) throw new Error('No autorizado');
    const { userId } = args;
    const res = await friendModel.insertFriend(userId, context);
    const result = res.rows.length > 0;

    const res2 = await friendModel.insertNotification(userId, context);
    const result2 = res2.rows[0];
    pubsub.publish(`NEW_FOLLOWER_${userId}`, { 
      newFollower: {
        ...result2,
        created_at: result2.created_at.toISOString()
      } 
    })
    return result;

  } catch (error) {
    console.error('Error al obtener', error);
    throw new Error('Error al obtener');
  }
}

export const unFollowUser = async (args, context) => {
  try {
    if (!context.user || !context.user.userId) throw new Error('No autorizado');
    const { userId } = args; 
      const res = await friendModel.unFollowUser(userId, context);
      return res.rows.length > 0;
  } catch (error) {
    console.error('Error al intentar deja de seguir', error);
    throw new Error('Error al intentar dejar de seguir');
  }
}

export const user_id = async (parent) => {
  try {
    const { user_id: id } = parent;
    const res = await getUserById(id);
      return res.rows[0] || null;
  } catch (error) {
    console.error('Error al obtener user_id', error);
    throw new Error('Error al obtener user_id');
  }
}

export const friend_id = async (parent) => {
  try {
    const { friend_id: id } = parent;
     const res = await getUserById(id);
      return res.rows[0] || null;
  } catch (error) {
    console.error('Error al obtener friend_id', error);
    throw new Error('Error al obtener friend_id');
  }
}