import pool from '../../database/db.js';

export const getNotifications = (args, created_cursor, context) => {
  const { first, after } = args;
  let query;
  let values;
  if (after) {
    query = `SELECT * FROM notifications WHERE recipient_id = $1
                       AND created_at < $2::timestamptz
                       AND type != 'STARTED_FOLLOWING_YOU'
                       ORDER BY created_at DESC
                       LIMIT $3`;
    values = [context.user.userId, created_cursor, first + 1];
  } else {
    query = `SELECT * FROM notifications WHERE recipient_id = $1
                      AND type != 'STARTED_FOLLOWING_YOU'
                       ORDER BY created_at DESC
                       LIMIT $2`;
    values = [context.user.userId, first + 1];
  }
  return pool.query(query, values);
}

export const getFollowers = async (args, created_cursor, context) => {
  const { first, after } = args;
  let query;
  let values;
  if(after) {
    query = `SELECT * FROM notifications WHERE recipient_id = $1
                      AND created_at < $2::timestamptz
                      AND type = 'STARTED_FOLLOWING_YOU'
                      ORDER BY created_at DESC
                      LIMIT $3`;
    values = [context.user.userId, created_cursor, first + 1];
  } else {
    query = `SELECT * FROM notifications WHERE recipient_id = $1
                      AND type = 'STARTED_FOLLOWING_YOU'
                      ORDER BY created_at DESC
                      LIMIT $2`;
    values = [context.user.userId, values];
  }
  return pool.query(query, values);
}

export const showAsRead = async (notificationId, context) => {
  return pool.query(`UPDATE notifications SET read = true 
    WHERE id = $1 AND recipient_id = $2 RETURNING id`,
    [notificationId, context.user.userId]);
}