import { Context } from '@/types/context.ts';
import pool from '../../database/db.ts';
import { Props } from './notification.resolver.ts';

export const getNotifications = async (args: Props, 
  created_cursor: string | null, context: Context) => {

  const { first, after } = args;
  let query: string;
  let values: (string | number | null | undefined)[];

  if (after) {
    query = `SELECT * FROM notifications WHERE recipient_id = $1
                       AND created_at < $2::timestamptz
                       AND type != 'STARTED_FOLLOWING_YOU'
                       ORDER BY created_at DESC
                       LIMIT $3`;
    values = [context.user?.userId, created_cursor, first + 1];
  } else {
    query = `SELECT * FROM notifications WHERE recipient_id = $1
                      AND type != 'STARTED_FOLLOWING_YOU'
                       ORDER BY created_at DESC
                       LIMIT $2`;
    values = [context.user?.userId, first + 1];
  }
  return pool.query(query, values);
}

export const getFollowers = async (args: { first: number; after?: string | null }, 
  created_cursor: string | null, context: Context) => {

  const { first, after } = args;
  let query: string;
  let values: (string | number | null | undefined)[];
  if(after) {
    query = `SELECT * FROM notifications WHERE recipient_id = $1
                      AND created_at < $2::timestamptz
                      AND type = 'STARTED_FOLLOWING_YOU'
                      ORDER BY created_at DESC
                      LIMIT $3`;
    values = [context.user?.userId, created_cursor, first + 1];
  } else {
    query = `SELECT * FROM notifications WHERE recipient_id = $1
                      AND type = 'STARTED_FOLLOWING_YOU'
                      ORDER BY created_at DESC
                      LIMIT $2`;
    values = [context.user?.userId, first + 1];
  }
  return pool.query(query, values);
}

export const showAsRead = async (notificationId: string, context: Context) => {
  return pool.query(`UPDATE notifications SET read = true 
    WHERE id = $1 AND recipient_id = $2 RETURNING id`,
    [notificationId, context.user?.userId]);
}