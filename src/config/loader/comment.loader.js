import DataLoader from "dataloader";
import pool from '../../database/db.js';

export const createCommentLoader = () => {
  return new DataLoader(async (ids) => {
    const res = await pool.query(
      `SELECT * FROM comments WHERE id = ANY($1)`, 
      [ids]
    );

    const comments = res.rows;

    return ids.map(id =>
      comments.find(comment => comment.id === id)
    )
  })
}