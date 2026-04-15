import DataLoader from "dataloader";
import pool from '../../database/db.js';

export const createUserLoader = () => {
  return new DataLoader(async (ids) => {
    const res = await pool.query(
      `SELECT * FROM users WHERE id = ANY($1)`,
      [ids]
    );
    const users = res.rows;

    return ids.map(id =>
      users.find(user => user.id === id)
    );
  });
}


