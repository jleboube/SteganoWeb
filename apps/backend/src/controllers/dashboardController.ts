import type { Request, Response, NextFunction } from 'express';
import type { AuthenticatedUser } from '../types/user.js';
import prisma from '../lib/prisma.js';
import { HttpError } from '../middleware/errorHandlers.js';
import { getDailyAvailability } from '../services/usageService.js';

export const getDashboardSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.authUser) {
      throw new HttpError(401, 'Authentication required');
    }

    const authUser = req.authUser as AuthenticatedUser;

    const [user, purchases, usageCounts] = await Promise.all([
      prisma.user.findUnique({ where: { id: authUser.id } }),
      prisma.purchase.findMany({
        where: { userId: authUser.id },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),
      prisma.usageEvent
        .groupBy({
          by: ['type'],
          where: { userId: authUser.id },
          _count: { _all: true }
        })
        .then((results: Array<{ type: string; _count: { _all: number } }>) =>
          results.map((item) => ({ type: item.type, count: item._count._all }))
        ) as Promise<Array<{ type: string; count: number }>>
    ]);

    if (!user) {
      throw new HttpError(404, 'User not found');
    }

    const usage: Record<string, number> = {};
    usageCounts.forEach(({ type, count }) => {
      usage[type] = count;
    });

    const availability = await getDailyAvailability(user.id);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        credits: user.credits,
        emailVerified: user.emailVerified,
        algorithmAvailable: availability.ALGORITHM,
        aiAvailable: availability.AI,
        createdAt: user.createdAt
      },
      purchases,
      usage
    });
  } catch (error) {
    next(error as Error);
  }
};
