import passport from 'passport';
import { Strategy as GoogleStrategy, VerifyCallback } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy, Profile as GitHubProfile } from 'passport-github2';
import pool from '../database/db.ts';

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_REDIRECT_URI!,
  },
  async (_accessToken: string, _refreshToken: string, profile, done: VerifyCallback) => {
    try {
      const email = profile.emails?.[0]?.value;
      const avatar = profile.photos?.[0]?.value;
      const name = profile.displayName;
      const provider_id = profile.id;

      if (!email) return done(new Error('No email from Google'), false);

      const result = await pool.query(
        `INSERT INTO users (email, name, avatar, username, provider, provider_id)
         VALUES ($1, $2, $3, $4, 'google', $5)
         ON CONFLICT (email) DO UPDATE SET avatar = EXCLUDED.avatar
         RETURNING *`,
        [email, name, avatar ?? null, name, provider_id]
      );

      return done(null, result.rows[0]);
    } catch (err) {
      return done(err as Error, false);
    }
  }
));

passport.use(new GitHubStrategy(
  {
    clientID: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    callbackURL: process.env.GITHUB_REDIRECT_URI!,
    scope: ['user:email'],
  },
  async (_accessToken: string, _refreshToken: string, profile: GitHubProfile, done: VerifyCallback) => {
    try {
      const email = profile.emails?.[0]?.value;
      const avatar = profile.photos?.[0]?.value;
      const name = profile.displayName || profile.username;
      const provider_id = String(profile.id);

      if (!email) return done(new Error('No email from GitHub'), false);

      const result = await pool.query(
        `INSERT INTO users (email, name, avatar, username, provider, provider_id)
         VALUES ($1, $2, $3, $4, 'github', $5)
         ON CONFLICT (email) DO UPDATE SET avatar = EXCLUDED.avatar
         RETURNING *`,
        [email, name, avatar ?? null, name, provider_id]
      );

      return done(null, result.rows[0]);
    } catch (err) {
      return done(err as Error, false);
    }
  }
));

export default passport;