import { Router } from 'express';
import passport from '../config/passport.js';
import env from '../config/env.js';
import {
  register,
  login,
  logout,
  me,
  verifyEmailHandler,
  requestPasswordResetHandler,
  resetPasswordHandler,
  googleOAuthCallback,
  googleOAuthStart
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, me);
router.post('/verify-email', verifyEmailHandler);
router.post('/request-password-reset', requestPasswordResetHandler);
router.post('/reset-password', resetPasswordHandler);

router.get(
  '/google',
  googleOAuthStart,
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${env.frontendUrl}/login?error=oauth_failed`,
    session: false
  }),
  googleOAuthCallback
);

export default router;
