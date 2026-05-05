import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../database/db.ts';
import { Response } from 'express';

export const signAccessToken = (userId: string): string => {
  if(!process.env.SECRET_KEY) throw new Error('Falta SECRET_KEY en .env');
  return jwt.sign({ userId }, process.env.SECRET_KEY, { expiresIn: '15m' });
}
export const signRefreshToken = (userId: string): string  => {
  if(!process.env.JWT_REFRESH_SECRET) throw new Error('Falta JWT_REFRESH_SECRET en .env');
  return jwt.sign({ sub: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
}
export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
}
export const saveRefreshToken = async (res: Response, userId: string): Promise<string> => {
  const refreshToken = signRefreshToken(userId);

  await pool.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
    [userId, hashToken(refreshToken)]
  );

  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });

  return refreshToken;
};