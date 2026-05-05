import { Context } from '@/types/context.ts';
import pool from '../../database/db.ts';
import { Media } from './types.ts';

export const getSavedPosts = async (context: Context) => {
  return pool.query(`
          SELECT p.*
            FROM posts p
            INNER JOIN saved_posts sp ON sp.post_id = p.id
            WHERE sp.user_id = $1
          `, [context.user?.userId]);
}

export const getPostById = async (id: string) => {
  return pool.query(`SELECT * FROM posts WHERE id = $1`, [id]);
}

export const posts = async () => {
  return pool.query('SELECT * FROM posts');
}

export const postsByUser = async (afterDate: Date | null, limit: number, context: Context) => {
  let query: string;
  let values: (string | number | Date | null)[];
  if (afterDate) {
    query = `SELECT * FROM posts WHERE user_id = $1 AND created_at < $2
                 ORDER BY created_at DESC LIMIT $3`;
    values = [context.user!.userId, afterDate, limit + 1];
  } else {
    query = `SELECT * FROM posts WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`;
    values = [context.user!.userId, limit + 1];
  }
  return pool.query(query, values);
}

export const countPostsByUser = async (userId: string) => {
  return pool.query(`SELECT COUNT(*) AS count FROM posts WHERE user_id = $1`,
    [userId]);
}

export const followingResultId = async (context: Context) => {
  return pool.query(`SELECT friend_id FROM friends WHERE user_id = $1`,
    [context.user?.userId]);
}

{/* Query FeedPosts */}

type FeedPostsParams = {
  userIds: string[];
  afterDate?: Date | null;
  limit: number;
};

export const feedPosts = async ({
  userIds,
  afterDate,
  limit,
}: FeedPostsParams) => {
  const conditions: string[] = [`user_id = ANY($1)`];
  const values: unknown[] = [userIds];

  if (afterDate) {
    values.push(afterDate);
    conditions.push(`created_at < $${values.length}`);
  }

  values.push(limit + 1);
  const limitParam = `$${values.length}`;

  const query = `
    SELECT *
    FROM posts
    WHERE ${conditions.join(' AND ')}
    ORDER BY created_at DESC
    LIMIT ${limitParam}
  `;

  return pool.query(query, values);
};

export const getTrendingPosts = async () => {
  const { rows } = await pool.query(`
    SELECT 
      p.id,
      p.content,
      p.user_id,
      p.created_at,
      p.repost_count,
      u.username,
      u.avatar,
      COUNT(DISTINCT r.id) AS likes_count,
      COUNT(DISTINCT c.id) AS comments_count,
      COUNT(DISTINCT v.id) AS views_count,
      COUNT(DISTINCT s.id) AS saves_count,
      
      ARRAY(
        SELECT u2.avatar 
        FROM reactions_posts r2
        JOIN users u2 ON u2.id = r2.user_id
        WHERE r2.post_id = p.id
        AND u2.avatar IS NOT NULL
        LIMIT 3
      ) AS reaction_avatars

    FROM posts p
    JOIN users u ON u.id = p.user_id
    LEFT JOIN reactions_posts r  ON r.post_id = p.id
    LEFT JOIN comments c         ON c.post_id = p.id
    LEFT JOIN post_views v       ON v.post_id = p.id
    LEFT JOIN saved_posts s      ON s.post_id = p.id
    WHERE p.original_post IS NULL
    GROUP BY p.id, u.id, u.username, u.avatar
  `);
  return rows;
}

export const insertPost = async (
  args: {
    content: string;
    originalPostId?: string | null;
    originalCommentId?: string | null;
  },
  context: Context
) => {
  const { content, originalPostId, originalCommentId } = args;
  let query: string;
  let values: (string | number | Date | null)[];
  if (originalPostId) {
    query = `INSERT INTO posts (content, user_id, original_post)
              VALUES ($1, $2, $3)
              RETURNING id, content, user_id, original_post, repost_count, created_at`;
    values = [content, context.user!.userId, originalPostId];
  } else if (originalCommentId) {
    query = `INSERT INTO posts (content, user_id, original_comment)
              VALUES ($1, $2, $3)
              RETURNING id, content, user_id, original_comment, repost_count, created_at`;
    values = [content, context.user!.userId, originalCommentId];
  } else {
    query = `INSERT INTO posts (content, user_id)
              VALUES ($1, $2)
              RETURNING id, content, user_id, created_at`;
    values = [content, context.user!.userId];
  }
  const res = await pool.query(query, values);

  if (originalPostId) {
    await pool.query(`UPDATE posts SET repost_count = repost_count + 1 
              WHERE id = $1`, [originalPostId]);
  } else if (originalCommentId) {
    await pool.query(`UPDATE comments SET repost_count = repost_count + 1
              WHERE id = $1`, [originalCommentId]);
  }
  return res;
}

export const insertMedia = async (post: { id: string }, media: Media) => {
  const { id } = post;
  const { url, media_type } = media;
  return pool.query(`INSERT INTO media (post_id, url, media_type)
          VALUES ($1, $2, $3)
          RETURNING id, url, media_type, created_at`,
    [id, url, media_type]
  );
}

export const insertarNotificationRepost = (userId: string, postId: string, type: string, reference: string, context: Context) => {
  return pool.query(`INSERT INTO notifications (recipient_id, actor_id, type
                , reference_id, reference_type)
                VALUES ($1, $2, $3, $4, $5) RETURNING id, recipient_id, actor_id, type, reference_id, reference_type, created_at`,
    [userId, context.user?.userId, type, postId, reference]);
}

export const savedPost = async (id: string, context: Context) => {
  return pool.query(`INSERT INTO saved_posts (post_id, user_id) 
          VALUES ($1, $2)`, [id, context.user?.userId]);
}

export const removeSavedPost = async (id: string, context: Context) => {
  return pool.query(`DELETE FROM saved_posts WHERE post_id = $1 AND user_id = $2`,
    [id, context.user?.userId]);
}

export const createViewPost = async (id: string, context: Context) => {
  return pool.query(`INSERT INTO post_views (post_id, user_id)
        VALUES ($1, $2)
        ON CONFLICT (post_id, user_id) DO NOTHING
        RETURNING id
        `, [id, context.user?.userId]);
}

export const removePostById = async (postId: string, context: Context) => {
  const res = await pool.query(`DELETE FROM posts WHERE id = $1 AND user_id = $2`,
    [postId, context.user?.userId]);
  return (res.rowCount ?? 0) > 0;
}

export const countPostView = async (id: string) => {
  return pool.query(
    `SELECT COUNT(*) AS count FROM post_views WHERE post_id = $1`, [id]);
}

export const media = async (id: string) => {
  return pool.query(`SELECT * FROM media WHERE post_id = $1`, [id]);
}

export const countReaction = async (id: string) => {
  return pool.query(`SELECT COUNT(*) AS count FROM reactions_posts WHERE post_id = $1`,
    [id]);
}

export const comments = (id: string) => {
  return pool.query(`SELECT * FROM comments WHERE post_id = $1`, [id])
}

export const initialReaction = async (id: string, context: Context) => {
  return pool.query(`SELECT * FROM reactions_posts WHERE 
    user_id = $1 AND post_id = $2 LIMIT 1`, [context.user?.userId, id]);
}

export const countReactionss = async (id: string) => {
  return pool.query(`SELECT * FROM comments WHERE post_id = $1`, [id])
}

export const viewCount = async (id: string) => {
  return pool.query(`SELECT COUNT(*) AS count FROM post_views WHERE post_id = $1`, [id]);
}

export const hasViewed = async (id: string, context: Context) => {
  return pool.query(`SELECT EXISTS (
        SELECT 1 FROM post_views WHERE post_id = $1 AND user_id = $2) AS has_viewed`,
    [id, context.user?.userId]);
}

export const isSaved = async (id: string, context: Context) => {
  return pool.query(
    `SELECT EXISTS (
            SELECT 1 FROM saved_posts
            WHERE post_id = $1
            AND user_id = $2
          ) AS "isSaved"`,
    [id, context.user?.userId]
  );
}

export const isRepost = async (id: string, context: Context) => {
  return pool.query(`SELECT 1 FROM posts 
          WHERE original_post = $1 AND user_id = $2 LIMIT 1`,
    [id, context.user?.userId]);
}
