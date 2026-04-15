import DataLoader from "dataloader";
import pool from '../../database/db.js';

export const createPostLoader = () => {
  return new DataLoader(async (ids) => {
    const res = await pool.query(
      `SELECT * FROM posts WHERE id = ANY($1)`,
      [ids]
    );
    const posts = res.rows;

    return ids.map(id =>
      posts.find(post => post.id === id)
    );
  });
}
