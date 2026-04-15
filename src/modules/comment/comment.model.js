import pool from '../../database/db.js';

export const getCommentById = async (id) => {
  return pool.query(`SELECT * FROM comments WHERE id = $1`, [id]);
}

export const getSavedComment = async (context) => {
  return pool.query(`SELECT c.* FROM comments c
              INNER JOIN saved_comments sc ON sc.comment_id = c.id
              WHERE sc.user_id = $1
          `, [context.user.userId]);
}

export const commentsByPost = async (args) => {
  const { postId, after, first } = args;
  let query = `SELECT * FROM comments WHERE post_id = $1 AND parent_id IS NULL`;
  const values = [postId];

  if (after) {
    query += ` AND created_at < $2`;
    values.push(new Date(parseInt(after)));
  }
  query += ` ORDER BY created_at DESC LIMIT ${first + 1}`;

  return pool.query(query, values);
}

export const repliesByComment = async (args) => {
  const { commentId, after, first } = args;
  let query = `SELECT * FROM comments WHERE parent_id = $1`;
  const values = [commentId];
  if (after) {
    query += ` AND created_at < $2`;
    values.push(new Date(parseInt(after)));
  }
  query += ` ORDER BY created_at DESC LIMIT ${first + 1}`;

  return pool.query(query, values);
}

export const savedComment = async (id, context) => {
  return pool.query(`INSERT INTO saved_comments (comment_id, user_id)
          VALUES ($1, $2)`, [id, context.user.userId]);
}

export const removeSavedComment = async (id, context) => {
  return pool.query(`DELETE FROM saved_comments WHERE 
          comment_id = $1 AND user_id = $2`, [id, context.user.userId]);
}

export const insertCommentByParentId = async (args, context) => {
  const { postId, parentCommentId, content } = args;
  return pool.query(`INSERT INTO comments (post_id, parent_id, content, user_id)
         VALUES ($1, $2, $3, $4) RETURNING id, content, user_id, created_at`,
    [postId, parentCommentId, content, context.user.userId]
  );
}
export const countNestedCommentsByParentId = async (parentCommentId) => {
  return pool.query(`WITH RECURSIVE nested AS (
            SELECT id FROM comments WHERE parent_id = $1
            UNION ALL
            SELECT c.id FROM comments c
            INNER JOIN nested n ON c.parent_id = n.id
          )
          SELECT COUNT(*) as comments FROM nested`,
    [parentCommentId]
  );
}
export const insertComment = async (id, content, context) => {
  return pool.query(`INSERT INTO comments (post_id, content, user_id)
         VALUES ($1, $2, $3)
         RETURNING id, content, user_id, created_at`,
    [id, content, context.user.userId]
  );
}
export const commentCount = async (id) => {
  return pool.query(`SELECT COUNT(*) as comments FROM comments WHERE post_id = $1`,
    [id]
  );
}
export const createReply = async (args, context) => {
  const { postId, parentCommentId, content } = args;
  return pool.query(`INSERT INTO comments (post_id, parent_id, content, user_id)
         VALUES ($1, $2, $3, $4)
         RETURNING id, content, user_id, created_at`,
    [postId, parentCommentId, content, context.user.userId]
  );
}

export const createViewComment = async (id, context) => {
  return pool.query(`INSERT INTO comment_views (comment_id, user_id)
        VALUES ($1, $2)
        ON CONFLICT (comment_id, user_id) DO NOTHING
        RETURNING id`, [id, context.user.userId]);
}

export const replyCount = async (id) => {
  return pool.query(`SELECT COUNT(*) FROM comments WHERE parent_id = $1`, 
    [id]);
}

export const reactions = async (id) => {
  return pool.query(`SELECT COUNT(*) FROM reactions_comments WHERE comment_id = $1`, 
    [id]);
}

export const initialReaction = async (id, context) => {
  return pool.query(`SELECT * FROM reactions_comments 
         WHERE comment_id = $1 AND user_id = $2 LIMIT 1`,
    [id, context.user.userId]
  );
}
export const view_Count = async (id) => {
  return pool.query(`SELECT COUNT(*) FROM comment_views WHERE comment_id = $1`, 
    [id]);
}
export const has_viewed = async (id, context) => {
  return pool.query(`SELECT 1 FROM comment_views WHERE comment_id = $1 AND user_id = $2`,
        [id, context.user.userId]
      );
}
export const isRepost = async (id, context) => {
  return pool.query(`SELECT 1 FROM posts WHERE user_id = $1 
    AND original_comment = $2 LIMIT 1`, 
    [context.user.userId, id]); 
}
export const getByComment = async (id) => {
  return pool.query(`SELECT * FROM comments WHERE id = $1`, [id]);
}