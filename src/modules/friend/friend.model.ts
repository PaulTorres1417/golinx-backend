import { Context } from '@/types/context.ts';
import pool from '../../database/db.ts';

export const myFollowings = async (userId: string) => {
  return pool.query(`SELECT u.* FROM users u
                INNER JOIN friends f ON f.friend_id = u.id
                WHERE f.user_id = $1`, [userId]);
}

export const myFollowers = async (userId: string) => {
  return pool.query(`SELECT u.* FROM users u
                INNER JOIN friends f ON f.user_id = u.id
                WHERE f.friend_id = $1`, [userId]);
}

export const insertFriend = async (userId: string, context: Context) => {
  return pool.query(`INSERT INTO friends (user_id, friend_id)
                VALUES ($1, $2) RETURNING id, user_id , friend_id`,
    [context.user?.userId, userId]);
}

export const insertNotification = async (userId: string, context: Context) => {
  return pool.query(`INSERT INTO notifications (recipient_id, actor_id, type
                , reference_id, reference_type)
                VALUES ($1, $2, $3, $4, $5) RETURNING id, recipient_id, actor_id, type, reference_id, reference_type, created_at`,
    [userId, context.user?.userId, 'STARTED_FOLLOWING_YOU', userId, 'user']);
}

export const unFollowUser = async (userId: string, context: Context) => {
  return pool.query(`DELETE FROM friends WHERE user_id = $1 AND friend_id = $2`,
        [context.user?.userId, userId]);
}