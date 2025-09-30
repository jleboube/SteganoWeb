import { Router } from 'express';
import { createCheckoutSessionHandler, stripeWebhookHandler } from '../controllers/paymentController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/checkout', requireAuth, createCheckoutSessionHandler);
router.post('/stripe/webhook', stripeWebhookHandler);

export default router;
