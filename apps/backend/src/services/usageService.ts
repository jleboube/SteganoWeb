import type { Prisma } from '@prisma/client';
import prisma from '../lib/prisma.js';
import { HttpError } from '../middleware/errorHandlers.js';

const DAILY_LIMITS = {
  ALGORITHM: {
    ENCODE: 15,
    DECODE: 15
  },
  AI: {
    ENCODE: 1,
    DECODE: 1
  }
};

const startOfUtcDay = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
};

export const consumeUsage = async (
  userId: string,
  options: { type: 'ENCODE' | 'DECODE'; mode: 'ALGORITHM' | 'AI' }
) => {
  const since = startOfUtcDay();

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new HttpError(404, 'User not found');
    }

    if ((user as { role?: string }).role === 'ADMIN') {
      await tx.usageEvent.create({
        data: {
          userId,
          type: options.type,
          mode: options.mode,
          creditsUsed: 0,
          isFreeCredit: true
        }
      });

      return {
        isFree: true
      };
    }

    const limit = DAILY_LIMITS[options.mode][options.type];
    const usageCount = await tx.usageEvent.count({
      where: {
        userId,
        type: options.type,
        mode: options.mode,
        createdAt: {
          gte: since
        },
        isFreeCredit: true
      }
    });

    if (usageCount < limit) {
      await tx.usageEvent.create({
        data: {
          userId,
          type: options.type,
          mode: options.mode,
          creditsUsed: 0,
          isFreeCredit: true
        }
      });

      return {
        isFree: true
      };
    }

    if (user.credits > 0) {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { credits: { decrement: 1 } }
      });

      await tx.usageEvent.create({
        data: {
          userId,
          type: options.type,
          mode: options.mode,
          creditsUsed: 1,
          isFreeCredit: false
        }
      });

      return {
        isFree: false
      };
    }

    const actionLabel = `${options.mode.toLowerCase()} ${options.type.toLowerCase()}`;
    throw new HttpError(402, `Daily ${actionLabel} limit reached. Purchase credits to continue.`);
  });
};

export const getDailyAvailability = async (userId: string) => {
  const since = startOfUtcDay();
  const [algorithmEncode, algorithmDecode, aiEncode, aiDecode, user] = await Promise.all([
    prisma.usageEvent.count({
      where: { userId, type: 'ENCODE', mode: 'ALGORITHM', createdAt: { gte: since }, isFreeCredit: true }
    }),
    prisma.usageEvent.count({
      where: { userId, type: 'DECODE', mode: 'ALGORITHM', createdAt: { gte: since }, isFreeCredit: true }
    }),
    prisma.usageEvent.count({
      where: { userId, type: 'ENCODE', mode: 'AI', createdAt: { gte: since }, isFreeCredit: true }
    }),
    prisma.usageEvent.count({
      where: { userId, type: 'DECODE', mode: 'AI', createdAt: { gte: since }, isFreeCredit: true }
    }),
    prisma.user.findUnique({ where: { id: userId } })
  ]);

  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  if ((user as { role?: string }).role === 'ADMIN') {
    return {
      ALGORITHM: { ENCODE: Infinity, DECODE: Infinity },
      AI: { ENCODE: Infinity, DECODE: Infinity }
    };
  }

  return {
    ALGORITHM: {
      ENCODE: Math.max(DAILY_LIMITS.ALGORITHM.ENCODE - algorithmEncode, 0),
      DECODE: Math.max(DAILY_LIMITS.ALGORITHM.DECODE - algorithmDecode, 0)
    },
    AI: {
      ENCODE: Math.max(DAILY_LIMITS.AI.ENCODE - aiEncode, 0),
      DECODE: Math.max(DAILY_LIMITS.AI.DECODE - aiDecode, 0)
    }
  };
};
