import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import prisma from '../lib/prisma.js';
import type { CookieOptions } from 'express';
import { HttpError } from './errorHandlers.js';
import type { AuthenticatedUser } from '../types/user.js';

type TokenPayload = {
  userId: string;
  sessionIssuedAt: number;
};

export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  const token = req.cookies?.[env.sessionCookieName];
  if (!token) {
    return next();
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret) as TokenPayload;
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      return next();
    }
    const authUser: AuthenticatedUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      emailVerified: user.emailVerified,
      credits: user.credits,
      freeEditsUsedAt: user.freeEditsUsedAt,
      createdAt: user.createdAt
    };
    req.authUser = authUser;
    return next();
  } catch (error) {
    return next();
  }
};

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.authUser) {
    return next(new HttpError(401, 'Authentication required'));
  }
  return next();
};

export const requireVerifiedUser = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.authUser) {
    return next(new HttpError(401, 'Authentication required'));
  }

  if (!req.authUser.emailVerified) {
    return next(new HttpError(403, 'Email verification required for this action.'));
  }

  return next();
};

export const issueAuthCookie = (res: Response, payload: TokenPayload) => {
  const token = jwt.sign(payload, env.jwtSecret, { expiresIn: '7d' });
  const secure = env.sessionCookieSecure && env.frontendUrl.startsWith('https://');
  const options: CookieOptions = {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  };

  if (env.sessionCookieDomain) {
    options.domain = env.sessionCookieDomain;
  }

  res.cookie(env.sessionCookieName, token, options);
};

export const clearAuthCookie = (res: Response) => {
  const secure = env.sessionCookieSecure && env.frontendUrl.startsWith('https://');
  const options: CookieOptions = {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    expires: new Date(0)
  };

  if (env.sessionCookieDomain) {
    options.domain = env.sessionCookieDomain;
  }

  res.cookie(env.sessionCookieName, '', options);
};
