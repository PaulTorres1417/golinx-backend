import pool from '../../database/db.js';

export const getAllUsers = async (context) => {
  return pool.query(`SELECT * FROM users
        WHERE id != $1
          AND id NOT IN (
            SELECT friend_id FROM friends WHERE user_id = $1
            ) LIMIT 3`, [context.user.userId]);
}

export const users = () => {
  return pool.query('SELECT * FROM users');
}

export const getUserById = async (id) => {
  return pool.query('SELECT * FROM users WHERE id = $1', [id]);
}

export const searchUser = (query) => {
  return pool.query(`SELECT id, name, email, avatar
        FROM users WHERE name ILIKE $1 LIMIT 10`, [`%${query}%`]);
}

export const register = async (userData, hashedPassword) => {
  const { name, email, birthday } = userData;
  return pool.query(`INSERT INTO users (name, password, email, birthday, email_verified)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id, name, email`,
    [name, hashedPassword, email, birthday, false]
  );
}

export const searchEmail = async (email) => {
  return pool.query(`SELECT * FROM users WHERE email = $1`,
    [email]
  );
}

export const createToken = async (token, expiresAt, userId) => {
  return pool.query(`INSERT INTO tokens (token, expires_at, user_id, type)
          VALUES ($1, $2, $3, $4)`,
    [token, expiresAt, userId, 'PASSWORD_RESET']
  );
}

export const getToken = async (token) => {
  return pool.query(`SELECT * FROM tokens WHERE token = $1 AND type = $2`,
    [token, 'PASSWORD_RESET']
  );
}

export const updatePassword = async (userId, hashedPassword) => {
  return pool.query(`UPDATE users SET password = $1 WHERE id = $2`,
    [hashedPassword, userId]
  );
}
export const confirmEmail = async (userId) => {
  return await pool.query(
    'UPDATE users SET email_verified = true WHERE id = $1',
    [userId]
  );
}

export const deleteToken = async (token) => {
  return await pool.query(
    'DELETE FROM tokens WHERE token = $1',
    [token]
  );
}

export const updateProfile = async (args, context) => {
  const { name, bio, avatar, coverphoto } = args;
  return pool.query(`UPDATE users SET name=$1, bio=$2, avatar=$3, coverphoto=$4
          WHERE id = $5
          RETURNING id, username, email, name, bio, avatar, coverphoto`,
    [name, bio, avatar, coverphoto, context.user.userId]
  );
}

export const saveImagePerfil = async (args, context) => {
  const { type, image } = args;
  let query = '';
  if (type === 'avatar') {
    query = `UPDATE users SET avatar = $1 WHERE id = $2`;
  } else if (type === 'portada') {
    query = `UPDATE users SET coverphoto = $1 WHERE id = $2`;
  } else {
    throw new Error('Tipo de imagen no válido');
  }

  return pool.query(query, [image, context.user.userId]);
}

