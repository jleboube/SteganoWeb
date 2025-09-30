import type { Request, Response, NextFunction } from 'express';
import type { AuthenticatedUser } from '../types/user.js';
import { ZodError } from 'zod';
import { checkoutSessionSchema } from '../utils/validators.js';
import { createCheckoutSession, handleStripeWebhook } from '../services/paymentService.js';
import { HttpError } from '../middleware/errorHandlers.js';

export const createCheckoutSessionHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.authUser) {
      throw new HttpError(401, 'Authentication required');
    }

    const authUser = req.authUser as AuthenticatedUser;

    const { packageType } = checkoutSessionSchema.parse(req.body);
    const origin = req.headers.origin ?? req.headers.referer ?? '';
    const url = await createCheckoutSession(authUser.id, packageType, origin);

    res.json({ url });
  } catch (error) {
    if (error instanceof ZodError) {
      next(new HttpError(400, 'Validation failed', error.flatten()));
    } else {
      next(error as Error);
    }
  }
};

export const stripeWebhookHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const signature = req.headers['stripe-signature'] as string | undefined;
    const payload = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));
    await handleStripeWebhook(payload, signature);
    res.json({ received: true });
  } catch (error) {
    next(error as Error);
  }
};
