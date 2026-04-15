import pool from '../../database/db.js';

export const createPostReaction = async (postId, context) => {
  return pool.query(`INSERT INTO reactions_posts (post_id, user_id)
                VALUES($1, $2)
                ON CONFLICT (post_id, user_id) DO NOTHING
                RETURNING id, post_id, user_id`,
    [postId, context.user.userId]);
}

export const selectPostReaction = async (postId, context) => {
  return pool.query(`SELECT id FROM reactions_posts WHERE 
        post_id = $1 AND user_id = $2`, [postId, context.user.userId]);
}

export const removePostReaction = async (postId, context) => {
  return pool.query(`DELETE FROM reactions_posts WHERE 
        post_id = $1 AND user_id = $2 RETURNING id`, [postId, context.user.userId]);
}

export const insertNotification = (userId, postId, context) => {
  return pool.query(`INSERT INTO notifications (recipient_id, actor_id, type
                , reference_id, reference_type)
                VALUES ($1, $2, $3, $4, $5) RETURNING id, recipient_id, actor_id, type, reference_id, reference_type, created_at`,
    [userId, context.user.userId, 'LIKED_YOUR_POST', postId, 'post']);
}