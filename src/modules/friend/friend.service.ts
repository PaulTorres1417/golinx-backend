import * as friendModel from './friend.model.ts';
import { getUserById } from '../user/user.model.ts';
import { pubsub } from '../../config/pubsub.ts';
import { Context } from '@/types/context.ts';

export const myFollowings = async (args: { userId: string }, context: Context) => {
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

export const myFollowers = async (args: { userId: string }, context: Context) => {
  try {
    if (!context.user || !context.user.userId) throw new Error('No autorizado');
    const { userId } = args;
    const res = await friendModel.myFollowers(userId);
    return res.rows.length;
  } catch (error) {
    console.error('Error al obtener', error);
    throw error;
  }
}

export const getFollowing = async (context: Context) => {
  try {
    if (!context.user || !context.user.userId) throw new Error('No autorizado');
    const res = await friendModel.myFollowings(context.user.userId);
    return res.rows;
  } catch (error) {
    console.error('Error al obtener', error);
    throw error;
  }
}

{/* mutation */}

export const followUser = async (args: { userId: string }, context: Context) => {
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

export const unFollowUser = async (args:{ userId: string }, context: Context) => {
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

export const user_id = async (parent: { user_id: string }) => {
  try {
    const { user_id: id } = parent;
    const res = await getUserById(id);
      return res.rows[0] || null;
  } catch (error) {
    console.error('Error al obtener user_id', error);
    throw new Error('Error al obtener user_id');
  }
}

export const friend_id = async (parent: { friend_id: string }) => {
  try {
    const { friend_id: id } = parent;
     const res = await getUserById(id);
      return res.rows[0] || null;
  } catch (error) {
    console.error('Error al obtener friend_id', error);
    throw new Error('Error al obtener friend_id');
  }
}