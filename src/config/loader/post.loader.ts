import DataLoader from "dataloader";
import pool from '../../database/db.ts';

export type postLoaderResult = {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  original_post: string;
  original_comment: string;
  repost_count: number;
}

export const createPostLoader = () => {
  return new DataLoader(async (ids: readonly string[]) => {
    const res = await pool.query(
      `SELECT * FROM posts WHERE id = ANY($1)`,
      [ids]
    );

    const posts: postLoaderResult[] = res.rows;

    const postMap = new Map(posts.map(post => [post.id, post]));
    return ids.map(id => postMap.get(id) ?? null);
  });
};