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
  const { name, username, email } = userData;
  return pool.query(`INSERT INTO users (name, username, password, email)
          VALUES ($1, $2, $3, $4)
          RETURNING id, name, username, email`,
    [name, username, hashedPassword, email]
  );
}

export const login = async (email) => {
  return pool.query(`SELECT * FROM users WHERE email = $1 LIMIT 1`,
    [email]
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

export const forgotPassword = async (email) => {
  return pool.query(`SELECT email FROM users WHERE email = $1`, [email]);
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

