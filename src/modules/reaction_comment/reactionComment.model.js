import pool from '../../database/db.js';

export const createCommentReaction = async (commentId, context) => {
  return pool.query(
    `INSERT INTO reactions_comments (comment_id, user_id)
          VALUES ($1, $2)
          ON CONFLICT (comment_id, user_id) DO NOTHING
          RETURNING id, comment_id, user_id`,
    [commentId, context.user.userId]
  );
}

export const deleteCommentReaction = async (commentId, context) => {
  return pool.query(`DELETE FROM reactions_comments WHERE comment_id = $1 AND user_id = $2
        RETURNING id, comment_id, user_id`,
        [commentId, context.user.userId]);
}

export const insertNotification = async (userId, commentId, context) => {
  return pool.query(`INSERT INTO notifications (recipient_id, actor_id, type,
                reference_id, reference_type )
                VALUES ($1, $2, $3, $4, $5) RETURNING id, recipient_id, 
                actor_id, type, reference_id, reference_type, created_at`,
              [userId, context.user.userId, 'LIKED_YOUR_COMMENT', commentId, 'comment']);
}
