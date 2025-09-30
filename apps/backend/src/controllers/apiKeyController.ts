import type { Request, Response, NextFunction } from 'express';
import { ZodError, z } from 'zod';
import {
  createApiKeyForUser,
  listApiKeysForUser,
  deactivateApiKey
} from '../services/apiKeyService.js';
import { HttpError } from '../middleware/errorHandlers.js';

const createSchema = z.object({
  name: z.string().max(100).optional()
});

export const createApiKeyHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.authUser) {
      throw new HttpError(401, 'Authentication required');
    }

    const { name } = createSchema.parse(req.body ?? {});
    const { secret, apiKey } = await createApiKeyForUser(req.authUser.id, name);

    res.status(201).json({
      secret,
      apiKey
    });
  } catch (error) {
    if (error instanceof ZodError) {
      next(new HttpError(400, 'Validation failed', error.flatten()));
      return;
    }
    next(error as Error);
  }
};

export const listApiKeysHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.authUser) {
      throw new HttpError(401, 'Authentication required');
    }

    const keys = await listApiKeysForUser(req.authUser.id);
    res.json({ apiKeys: keys });
  } catch (error) {
    next(error as Error);
  }
};

export const revokeApiKeyHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.authUser) {
      throw new HttpError(401, 'Authentication required');
    }

    const { id } = req.params;
    if (!id) {
      throw new HttpError(400, 'API key id is required');
    }

    await deactivateApiKey(req.authUser.id, id);
    res.status(204).send();
  } catch (error) {
    next(error as Error);
  }
};
