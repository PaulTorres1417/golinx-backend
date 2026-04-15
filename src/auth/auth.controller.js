import jwt from 'jsonwebtoken';
import pool from '../database/db.js';
import {
  signAccessToken,
  saveRefreshToken,
  hashToken,
} from './auth.service.js';

export const googleCallback = async (req, res) => {
  try {
    const user = req.user;
    const accessToken = signAccessToken(user.id);
    await saveRefreshToken(res, user.id);
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback#token=${accessToken}`);
  } catch (err) {
    console.error('Error en Google callback:', err);
    res.redirect(`${process.env.FRONTEND_URL}/login`);
  }
};

export const githubCallback = async (req, res) => {
  try {
    const user = req.user;
    const accessToken = signAccessToken(user.id);
    await saveRefreshToken(res, user.id);
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback#token=${accessToken}`);
  } catch (err) {
    console.error('Error en GitHub callback:', err);
    res.redirect(`${process.env.FRONTEND_URL}/login`);
  }
};

export const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refresh_token;
  if (!refreshToken) return res.status(401).json({ error: 'No hay refresh token' });

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const stored = await pool.query(
      `SELECT id FROM refresh_tokens
       WHERE user_id = $1 AND token_hash = $2 AND expires_at > NOW()`,
      [payload.sub, hashToken(refreshToken)]
    );
    if (stored.rows.length === 0) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }
    await pool.query(`DELETE FROM refresh_tokens WHERE id = $1`, [stored.rows[0].id]);
    const newAccessToken = signAccessToken(payload.sub);
    await saveRefreshToken(res, payload.sub);
    res.json({ accessToken: newAccessToken });

  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

export const logout = async (req, res) => {
  const refreshToken = req.cookies.refresh_token;

  if (refreshToken) {
    await pool.query(
      `DELETE FROM refresh_tokens WHERE token_hash = $1`,
      [hashToken(refreshToken)]
    );
  }
  res.clearCookie('refresh_token', { path: '/' });
  res.json({ ok: true });
};