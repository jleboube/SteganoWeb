import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';
import type { AuthenticatedUser } from '../types/user.js';

const API_KEY_PREFIX = 'sk_live_';
const API_KEY_LENGTH_BYTES = 32;
const API_KEY_PREFIX_LENGTH = 12;
const HASH_ROUNDS = 12;

export type ApiKeySummary = {
  id: string;
  name: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt: Date | null;
  keyPrefix: string;
};

const toAuthenticatedUser = (user: {
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

export const createApiKeyForUser = async (userId: string, name?: string) => {
  const rawSecret = `${API_KEY_PREFIX}${crypto.randomBytes(API_KEY_LENGTH_BYTES).toString('hex')}`;
  const keyPrefix = rawSecret.slice(0, API_KEY_PREFIX_LENGTH);
  const keyHash = await bcrypt.hash(rawSecret, HASH_ROUNDS);

  const record = await prisma.apiKey.create({
    data: {
      userId,
      name,
      keyHash,
      keyPrefix
    }
  });

  return {
    secret: rawSecret,
    apiKey: sanitizeApiKey(record)
  };
};

export const listApiKeysForUser = async (userId: string) => {
  const keys = await prisma.apiKey.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });
  return keys.map(sanitizeApiKey);
};

export const deactivateApiKey = async (userId: string, apiKeyId: string) => {
  await prisma.apiKey.updateMany({
    where: { id: apiKeyId, userId },
    data: { isActive: false }
  });
};

export const authenticateApiKey = async (providedKey: string) => {
  const keyPrefix = providedKey.slice(0, API_KEY_PREFIX_LENGTH);
  const candidateKeys = await prisma.apiKey.findMany({
    where: {
      keyPrefix,
      isActive: true
    },
    include: {
      user: true
    }
  });

  for (const candidate of candidateKeys) {
    const match = await bcrypt.compare(providedKey, candidate.keyHash);
    if (match) {
      await prisma.apiKey.update({
        where: { id: candidate.id },
        data: { lastUsedAt: new Date() }
      });
      return {
        apiKey: sanitizeApiKey(candidate),
        user: toAuthenticatedUser(candidate.user)
      };
    }
  }

  return null;
};

const sanitizeApiKey = (record: {
  id: string;
  name: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt: Date | null;
  keyPrefix: string;
}) => ({
  id: record.id,
  name: record.name,
  isActive: record.isActive,
  createdAt: record.createdAt,
  updatedAt: record.updatedAt,
  lastUsedAt: record.lastUsedAt,
  keyPrefix: record.keyPrefix
});
