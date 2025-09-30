import type { Request, Response, NextFunction } from 'express';
import type { AuthenticatedUser } from '../types/user.js';
import { ZodError } from 'zod';
import { encodeRequestSchema, decodeRequestSchema } from '../utils/validators.js';
import { encodeMessageIntoImage, extractMessageFromImage } from '../services/stegService.js';
import { consumeUsage } from '../services/usageService.js';
import { HttpError } from '../middleware/errorHandlers.js';
import { decodeMessageWithNanoBanana } from '../services/nanoBananaService.js';
import env from '../config/env.js';

export const encodeHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.authUser) {
      throw new HttpError(401, 'Authentication required');
    }

    const authUser = req.authUser as AuthenticatedUser;

    if (!authUser.emailVerified) {
      throw new HttpError(403, 'Verify your email before performing steganography operations.');
    }

    const file = req.file;
    if (!file) {
      throw new HttpError(400, 'Image upload is required');
    }

    const { message, prompt, mode } = encodeRequestSchema.parse(req.body);

    const usageResult = await consumeUsage(authUser.id, { type: 'ENCODE', mode });

    const processed = await encodeMessageIntoImage(file.buffer, message, {
      useNanoBanana: mode === 'AI' && env.enableNanoBanana,
      prompt
    });

    const payload = processed.toString('base64');
    const mimeType = 'image/png';

    res.json({
      mimeType,
      data: payload,
      metadata: {
        usedFreeCredit: usageResult.isFree,
        mode
      }
    });
  } catch (error) {
    if (error instanceof ZodError) {
      next(new HttpError(400, 'Validation failed', error.flatten()));
    } else {
      next(error as Error);
    }
  }
};

export const decodeHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.authUser) {
      throw new HttpError(401, 'Authentication required');
    }

    const authUser = req.authUser as AuthenticatedUser;

    if (!authUser.emailVerified) {
      throw new HttpError(403, 'Verify your email before performing steganography operations.');
    }

    const file = req.file;
    if (!file) {
      throw new HttpError(400, 'Image upload is required');
    }

    const { mode } = decodeRequestSchema.parse(req.body ?? {});

    const usageResult = await consumeUsage(authUser.id, { type: 'DECODE', mode });

    if (mode === 'AI') {
      const aiMessage = await decodeMessageWithNanoBanana(file.buffer, file.mimetype || 'image/png');
      res.json({
        message: aiMessage ?? 'No hidden message detected.',
        metadata: { method: 'AI', usedFreeCredit: usageResult.isFree }
      });
      return;
    }

    const message = await extractMessageFromImage(file.buffer);
    res.json({ message, metadata: { method: 'ALGORITHM', usedFreeCredit: usageResult.isFree } });
  } catch (error) {
    next(error as Error);
  }
};
