import passport from './passport.js';
import { Router } from 'express';
import {
  googleCallback,
  githubCallback,
  refreshToken,
  logout,
} from './auth.controller.js';

const router = Router();

router.get('/auth/google',
  passport.authenticate('google', { scope: ['email', 'profile'], session: false })
);
router.get('/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  googleCallback
);

router.get('/auth/github',
  passport.authenticate('github', { scope: ['user:email'], session: false })
);
router.get('/auth/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: '/login' }),
  githubCallback
);

router.post('/auth/refresh', refreshToken);

router.post('/auth/logout', logout);

export default router;