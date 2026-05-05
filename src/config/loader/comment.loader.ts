import DataLoader from "dataloader";
import pool from '../../database/db.ts';

export type commentLoaderResult = {
  id: string;
  content: string;
  user_id: string;
  post_id: string;
  parent_id: string;
  created_at: string;
  is_deleted: string;
  repost_count: string;
}

export const createCommentLoader = () => {
  return new DataLoader(async (ids: readonly string[]) => {
    const res = await pool.query(
      `SELECT * FROM comments WHERE id = ANY($1)`, 
      [ids]
    );

    const comments: commentLoaderResult[] = res.rows;

    const commentMap = new Map(comments.map(comment => [comment.id, comment]));

    return ids.map(id => commentMap.get(id) ?? null)
  })
}