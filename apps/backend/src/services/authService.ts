import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import type { AuthenticatedUser } from '../types/user.js';
import prisma from '../lib/prisma.js';
import logger from '../lib/logger.js';
import { HttpError } from '../middleware/errorHandlers.js';

const PASSWORD_SALT_ROUNDS = 12;
const TOKEN_TTL_HOURS = 24;

const mapToAuthenticatedUser = (user: {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  emailVerified: boolean;
  credits: number;
  freeEditsUsedAt: Date | null;
  createdAt: Date;
}): AuthenticatedUser => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  emailVerified: user.emailVerified,
  credits: user.credits,
  freeEditsUsedAt: user.freeEditsUsedAt,
  createdAt: user.createdAt
});

const buildUserResponse = (user: {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  emailVerified: boolean;
  credits: number;
  freeEditsUsedAt: Date | null;
  createdAt: Date;
}): AuthenticatedUser => mapToAuthenticatedUser(user);

export const registerUser = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string
) => {
  const hashed = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashed,
        firstName,
        lastName,
        credits: 0
      }
    });

    const token = await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token: crypto.randomUUID(),
        expiresAt: new Date(Date.now() + TOKEN_TTL_HOURS * 60 * 60 * 1000)
      }
    });

    logger.info({ token: token.token, userId: user.id }, 'Email verification token generated');

    return buildUserResponse(user);
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new HttpError(409, 'Email already in use');
    }
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    throw new HttpError(401, 'Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new HttpError(401, 'Invalid credentials');
  }

  return buildUserResponse(user);
};

export const verifyEmail = async (token: string) => {
  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record) {
    throw new HttpError(400, 'Invalid verification token');
  }

  if (record.expiresAt < new Date()) {
    throw new HttpError(400, 'Verification token expired');
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: true }
    }),
    prisma.verificationToken.delete({ where: { id: record.id } })
  ]);
};

export const requestPasswordReset = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return;
  }

  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

  const token = await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token: crypto.randomUUID(),
      expiresAt: new Date(Date.now() + TOKEN_TTL_HOURS * 60 * 60 * 1000)
    }
  });

  logger.info({ userId: user.id, token: token.token }, 'Password reset token issued');
};

export const resetPassword = async (token: string, password: string) => {
  const record = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!record) {
    throw new HttpError(400, 'Invalid reset token');
  }

  if (record.expiresAt < new Date()) {
    throw new HttpError(400, 'Reset token expired');
  }

  const hashed = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash: hashed }
    }),
    prisma.passwordResetToken.delete({ where: { id: record.id } })
  ]);
};

export const upsertGoogleUser = async (
  googleId: string,
  email: string,
  profile: { given_name?: string; family_name?: string }
) => {
  const user = await prisma.user.upsert({
    where: { googleId },
    update: {
      email,
      firstName: profile.given_name,
      lastName: profile.family_name,
      emailVerified: true
    },
    create: {
      googleId,
      email,
      firstName: profile.given_name,
      lastName: profile.family_name,
      emailVerified: true
    }
  });

  return buildUserResponse(user);
};

export const serializeUser = buildUserResponse;
