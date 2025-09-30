import type { Request, Response, NextFunction } from 'express';
import type { AuthenticatedUser } from '../types/user.js';
import { ZodError } from 'zod';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  requestResetSchema,
  resetPasswordSchema
} from '../utils/validators.js';
import {
  registerUser,
  loginUser,
  verifyEmail,
  requestPasswordReset,
  resetPassword,
  serializeUser
} from '../services/authService.js';
import { issueAuthCookie, clearAuthCookie } from '../middleware/authMiddleware.js';
import env from '../config/env.js';
import { HttpError } from '../middleware/errorHandlers.js';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, firstName, lastName } = registerSchema.parse(req.body);
    const user = await registerUser(email.toLowerCase(), password, firstName, lastName);
    issueAuthCookie(res, { userId: user.id, sessionIssuedAt: Date.now() });
    res.status(201).json({ user });
  } catch (error) {
    if (error instanceof ZodError) {
      next(new HttpError(400, 'Validation failed', error.flatten()));
    } else {
      next(error as Error);
    }
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await loginUser(email.toLowerCase(), password);
    issueAuthCookie(res, { userId: user.id, sessionIssuedAt: Date.now() });
    res.json({ user });
  } catch (error) {
    if (error instanceof ZodError) {
      next(new HttpError(400, 'Validation failed', error.flatten()));
    } else {
      next(error as Error);
    }
  }
};

export const logout = (_req: Request, res: Response) => {
  clearAuthCookie(res);
  res.status(204).send();
};

export const me = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.authUser) {
      throw new HttpError(401, 'Not authenticated');
    }
    const authUser = req.authUser as AuthenticatedUser;
    res.json({ user: serializeUser(authUser) });
  } catch (error) {
    next(error as Error);
  }
};

export const verifyEmailHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = verifyEmailSchema.parse(req.body);
    await verifyEmail(token);
    res.json({ message: 'Email verified' });
  } catch (error) {
    if (error instanceof ZodError) {
      next(new HttpError(400, 'Validation failed', error.flatten()));
    } else {
      next(error as Error);
    }
  }
};

export const requestPasswordResetHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = requestResetSchema.parse(req.body);
    await requestPasswordReset(email.toLowerCase());
    res.json({ message: 'If that account exists, a reset link has been sent.' });
  } catch (error) {
    if (error instanceof ZodError) {
      next(new HttpError(400, 'Validation failed', error.flatten()));
    } else {
      next(error as Error);
    }
  }
};

export const resetPasswordHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token, password } = resetPasswordSchema.parse(req.body);
    await resetPassword(token, password);
    res.json({ message: 'Password reset successful.' });
  } catch (error) {
    if (error instanceof ZodError) {
      next(new HttpError(400, 'Validation failed', error.flatten()));
    } else {
      next(error as Error);
    }
  }
};

export const googleOAuthStart = (_req: Request, res: Response, next: NextFunction) => {
  if (!env.googleClientId) {
    next(new HttpError(503, 'Google OAuth is not configured.'));
    return;
  }
  next();
};

export const googleOAuthCallback = (req: Request, res: Response) => {
  const user = req.user as { id: string } | undefined;
  if (!user) {
    res.redirect(`${env.frontendUrl}/login?error=oauth_failed`);
    return;
  }
  issueAuthCookie(res, { userId: user.id, sessionIssuedAt: Date.now() });
  res.redirect(`${env.frontendUrl}/steganography`);
};
