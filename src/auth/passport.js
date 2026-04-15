import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import pool from '../database/db.js';
import dotenv from 'dotenv';
dotenv.config();

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_REDIRECT_URI,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      const avatar = profile.photos[0].value;
      const name = profile.displayName;
      const provider_id = profile.id;

      const result = await pool.query(
        `INSERT INTO users (email, name, avatar, username, provider, provider_id)
         VALUES ($1, $2, $3, $4, 'google', $5)
         ON CONFLICT (email) DO UPDATE SET avatar = EXCLUDED.avatar
         RETURNING *`,
        [email, name, avatar, name, provider_id]
      );

      return done(null, result.rows[0]);
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.use(new GitHubStrategy(
  {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_REDIRECT_URI,
    scope: ['user:email'],
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;
      const avatar = profile.photos[0].value;
      const name = profile.displayName || profile.username;
      const provider_id = String(profile.id);

      const result = await pool.query(
        `INSERT INTO users (email, name, avatar, username, provider, provider_id)
         VALUES ($1, $2, $3, $4, 'github', $5)
         ON CONFLICT (email) DO UPDATE SET avatar = EXCLUDED.avatar
         RETURNING *`,
        [email, name, avatar, name, provider_id]
      );

      return done(null, result.rows[0]);
    } catch (err) {
      return done(err, null);
    }
  }
));

export default passport;