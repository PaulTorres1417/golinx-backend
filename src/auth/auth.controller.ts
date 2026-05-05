import jwt, { JwtPayload } from 'jsonwebtoken';
import pool from '../database/db.ts';
import {
  signAccessToken,
  saveRefreshToken,
  hashToken,
} from './auth.service.ts';
import { Request, Response } from 'express';

export const googleCallback = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      res.redirect(`${process.env.FRONTEND_URL}/`);
      return; 
    } 
    const accessToken = signAccessToken(user.id);
    await saveRefreshToken(res, user.id);
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback#token=${accessToken}`);
  } catch (err) {
    console.error('Error en Google callback:', err);
    res.redirect(`${process.env.FRONTEND_URL}/`);
  }
};

export const githubCallback = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      res.redirect(`${process.env.FRONTEND_URL}/`);
      return; 
    } 
    const accessToken = signAccessToken(user.id);
    await saveRefreshToken(res, user.id);
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback#token=${accessToken}`);
  } catch (err) {
    console.error('Error en GitHub callback:', err);
    res.redirect(`${process.env.FRONTEND_URL}/`);
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const token = req.cookies.refresh_token;
  if (!token) return res.status(401).json({ error: 'No refresh token' });
  
  const JWT_SECRET = process.env.JWT_REFRESH_SECRET;
  if(!JWT_SECRET) throw new Error('JWT_SECRET no definido en .env');

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    if(!payload.sub) {
      res.status(401).json({ error: 'Token invalid'});
      return;
    }
    const stored = await pool.query(
      `SELECT id FROM refresh_tokens
       WHERE user_id = $1 AND token_hash = $2 AND expires_at > NOW()`,
      [payload.sub, hashToken(token)]
    );
    if (stored.rows.length === 0) {
      return res.status(401).json({ error: 'Token invalid o expired' });
    }
    await pool.query(`DELETE FROM refresh_tokens WHERE id = $1`, [stored.rows[0].id]);
    const newAccessToken = signAccessToken(payload.sub);
    await saveRefreshToken(res, payload.sub);
    res.json({ accessToken: newAccessToken });

  } catch (err) {
    console.error('Error in refresh token', err)
    return res.status(401).json({ error: 'Token inválido' });
  }
};

export const logout = async (req: Request, res: Response) => {
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