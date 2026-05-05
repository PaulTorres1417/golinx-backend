import { Context } from '@/types/context.ts';
import pool from '../../database/db.ts';

export const getAllUsers = async (context: Context) => {
  return pool.query(`SELECT * FROM users
        WHERE id != $1
          AND id NOT IN (
            SELECT friend_id FROM friends WHERE user_id = $1
            ) LIMIT 3`, [context.user?.userId]);
}

export const users = () => {
  return pool.query('SELECT * FROM users');
}

export const getUserById = async (id: string) => {
  return pool.query('SELECT * FROM users WHERE id = $1', [id]);
}

export const searchUser = (query: string) => {
  return pool.query(`SELECT id, name, email, avatar
        FROM users WHERE name ILIKE $1 LIMIT 10`, [`%${query}%`]);
}

export const getUsersNotFollowing = async (context: Context) => {
  return pool.query(`
    SELECT u.* FROM users u
      WHERE u.id != $1
    AND u.id NOT IN(
      SELECT f.friend_id FROM friends f
        WHERE f.user_id = $1
    )`, [context.user?.userId]);
}

export const register = async (userData: { name: string, email: string, birthday: string}, hashedPassword: string) => {
  const { name, email, birthday } = userData;
  return pool.query(`INSERT INTO users (name, password, email, birthday, email_verified)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id, name, email`,
    [name, hashedPassword, email, birthday, false]
  );
}

export const searchEmail = async (email: string) => {
  return pool.query(`SELECT * FROM users WHERE email = $1`,
    [email]
  );
}

export const createToken = async (token: string, expiresAt: Date, userId: string) => {
  return pool.query(`INSERT INTO tokens (token, expires_at, user_id, type)
          VALUES ($1, $2, $3, $4)`,
    [token, expiresAt, userId, 'PASSWORD_RESET']
  );
}

export const getToken = async (token: string) => {
  return pool.query(`SELECT * FROM tokens WHERE token = $1 AND type = $2`,
    [token, 'PASSWORD_RESET']
  );
}

export const updatePassword = async (userId: string, hashedPassword: string) => {
  return pool.query(`UPDATE users SET password = $1 WHERE id = $2`,
    [hashedPassword, userId]
  );
}
export const confirmEmail = async (userId: string) => {
  return await pool.query(
    'UPDATE users SET email_verified = true WHERE id = $1',
    [userId]
  );
}

export const deleteToken = async (token: string) => {
  return await pool.query(
    'DELETE FROM tokens WHERE token = $1',
    [token]
  );
}

export const updateProfile = async (args: { name: string, bio: string, avatar: string, coverphoto: string}, context: Context) => {
  const { name, bio, avatar, coverphoto } = args;
  return pool.query(`UPDATE users SET name=$1, bio=$2, avatar=$3, coverphoto=$4
          WHERE id = $5
          RETURNING id, username, email, name, bio, avatar, coverphoto`,
    [name, bio, avatar, coverphoto, context.user?.userId]
  );
}

export const saveImagePerfil = async (args: { type: string, image: string }, context: Context) => {
  const { type, image } = args;
  let query = '';
  if (type === 'avatar') {
    query = `UPDATE users SET avatar = $1 WHERE id = $2`;
  } else if (type === 'portada') {
    query = `UPDATE users SET coverphoto = $1 WHERE id = $2`;
  } else {
    throw new Error('Tipo de imagen no válido');
  }

  return pool.query(query, [image, context.user?.userId]);
}

