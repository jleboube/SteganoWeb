import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { UsageMode } from '@prisma/client';
import { encodeMessageIntoImage, extractMessageFromImage } from '../services/stegService.js';
import { consumeUsage } from '../services/usageService.js';
import { HttpError } from '../middleware/errorHandlers.js';
import { decodeMessageWithNanoBanana } from '../services/nanoBananaService.js';
import env from '../config/env.js';

const base64Pattern = /^[A-Za-z0-9+/=]+$/;

const modeSchema = z
  .preprocess((value) => (typeof value === 'string' ? value.toUpperCase() : value), z.enum(['ALGORITHM', 'AI']))
  .default('ALGORITHM');

const encodeSchema = z.object({
  imageBase64: z
    .string()
    .min(1, 'Image is required')
    .refine((value) => base64Pattern.test(value.replace(/^data:image\/\w+;base64,/, '')), 'Invalid base64 payload'),
  message: z.string().min(1).max(1000),
  prompt: z
    .preprocess((value) => (typeof value === 'string' ? value.trim() : value), z.string().max(500))
    .optional(),
  mode: modeSchema
});

const decodeSchema = z.object({
  imageBase64: z
    .string()
    .min(1, 'Image is required')
    .refine((value) => base64Pattern.test(value.replace(/^data:image\/\w+;base64,/, '')), 'Invalid base64 payload'),
  mode: modeSchema
});

const toBufferFromBase64 = (input: string) => {
  const sanitized = input.includes(',') ? input.split(',')[1] ?? '' : input;
  return Buffer.from(sanitized, 'base64');
};

export const encodePublicHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.authUser) {
      throw new HttpError(401, 'Authentication required');
    }

    const payload = encodeSchema.parse(req.body ?? {});
    const buffer = toBufferFromBase64(payload.imageBase64);

    const usageResult = await consumeUsage(req.authUser.id, {
      type: 'ENCODE',
      mode: payload.mode as UsageMode
    });

    const encoded = await encodeMessageIntoImage(buffer, payload.message, {
      useNanoBanana: payload.mode === 'AI' && env.enableNanoBanana,
      prompt: payload.prompt
    });

    res.json({
      mimeType: 'image/png',
      data: encoded.toString('base64'),
      metadata: {
        usedFreeCredit: usageResult.isFree,
        mode: payload.mode
      }
    });
  } catch (error) {
    next(error as Error);
  }
};

export const decodePublicHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.authUser) {
      throw new HttpError(401, 'Authentication required');
    }

    const payload = decodeSchema.parse(req.body ?? {});
    const buffer = toBufferFromBase64(payload.imageBase64);

    const usageResult = await consumeUsage(req.authUser.id, {
      type: 'DECODE',
      mode: payload.mode as UsageMode
    });

    if (payload.mode === 'AI') {
      const aiMessage = await decodeMessageWithNanoBanana(buffer, 'image/png');
      res.json({
        message: aiMessage ?? 'No hidden message detected.',
        metadata: { method: 'AI', usedFreeCredit: usageResult.isFree }
      });
      return;
    }

    const message = await extractMessageFromImage(buffer);
    res.json({ message, metadata: { method: 'ALGORITHM', usedFreeCredit: usageResult.isFree } });
  } catch (error) {
    next(error as Error);
  }
};
