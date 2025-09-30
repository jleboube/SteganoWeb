import Stripe from 'stripe';
import type { Prisma } from '@prisma/client';
import env from '../config/env.js';
import { HttpError } from '../middleware/errorHandlers.js';
import prisma from '../lib/prisma.js';
import logger from '../lib/logger.js';

const stripe = env.stripeSecretKey ? new Stripe(env.stripeSecretKey, { apiVersion: '2024-04-10' }) : null;

const PACKAGES = {
  PACK_25: { credits: 25, amountCents: 5000, name: '25 edits' },
  PACK_50: { credits: 50, amountCents: 6500, name: '50 edits' },
  PACK_100: { credits: 100, amountCents: 7500, name: '100 edits' }
} as const;

type PackageType = keyof typeof PACKAGES;

export const createCheckoutSession = async (userId: string, packageType: PackageType, origin?: string) => {
  if (!env.enablePayments) {
    throw new HttpError(503, 'Payments are disabled for the MVP release.');
  }

  if (!stripe) {
    throw new HttpError(500, 'Stripe secret key is not configured');
  }

  const pkg = PACKAGES[packageType];

  const purchase = await prisma.purchase.create({
    data: {
      userId,
      packageType,
      creditsPurchased: pkg.credits,
      amountCents: pkg.amountCents,
      currency: 'USD',
      status: 'PENDING'
    }
  });

  const baseUrl = origin?.startsWith('http') ? origin : env.frontendUrl;
  const sanitizedBase = (baseUrl ?? env.frontendUrl).replace(/\/$/, '');

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    success_url: `${sanitizedBase}/dashboard?success=1`,
    cancel_url: `${sanitizedBase}/dashboard?canceled=1`,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: pkg.amountCents,
          product_data: {
            name: `SteganoWeb ${pkg.name}`
          }
        },
        quantity: 1
      }
    ],
    metadata: {
      purchaseId: purchase.id,
      userId
    },
    customer_email: (await prisma.user.findUnique({ where: { id: userId } }))?.email
  });

  await prisma.purchase.update({
    where: { id: purchase.id },
    data: { stripeSessionId: session.id }
  });

  return session.url;
};

export const handleStripeWebhook = async (payload: Buffer, signature: string | undefined) => {
  if (!env.enablePayments) {
    logger.warn('Received Stripe webhook while payments disabled');
    return;
  }

  if (!stripe || !env.stripeWebhookSecret) {
    throw new HttpError(500, 'Stripe webhook configuration missing');
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature ?? '', env.stripeWebhookSecret);
  } catch (error) {
    logger.error({ err: error }, 'Failed to verify Stripe webhook');
    throw new HttpError(400, 'Invalid webhook signature');
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const purchaseId = session.metadata?.purchaseId;
    if (!purchaseId) {
      logger.error('Checkout session missing purchase metadata');
      return;
    }

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const purchase = await tx.purchase.findUnique({
        where: { id: purchaseId },
        include: { user: true }
      });
      if (!purchase || purchase.status === 'COMPLETED') {
        return;
      }

      await tx.purchase.update({
        where: { id: purchase.id },
        data: { status: 'COMPLETED' }
      });

      await tx.user.update({
        where: { id: purchase.userId },
        data: { credits: { increment: purchase.creditsPurchased } }
      });

      await tx.usageEvent.create({
        data: {
          userId: purchase.userId,
          type: 'ENCODE',
          creditsUsed: 0,
          isFreeCredit: false
        }
      });
    });
  }
};

export default { createCheckoutSession, handleStripeWebhook };
