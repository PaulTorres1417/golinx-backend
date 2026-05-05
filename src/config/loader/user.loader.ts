import DataLoader from "dataloader";
import pool from '../../database/db.ts';

export type UserLoaderResult = {
  id: string;
  name: string;
  email: string;
  password: string;
  avatar?: string | null;
  bio?: string | null;
  coverphoto?: string | null;
  username?: string | null;
  provider?: string | null;
  provider_id?: string | null;
  email_verified?: boolean;
  created_at?: Date;
};

export const createUserLoader = () => {
  return new DataLoader(async (ids: readonly string[]) => {
    const res = await pool.query(
      `SELECT * FROM users WHERE id = ANY($1)`,
      [ids]
    );
    const users: UserLoaderResult[] = res.rows;

    const userMap = new Map(users.map(user => [user.id, user]))
    return ids.map(id => userMap.get(id) ?? null)
  });
}


