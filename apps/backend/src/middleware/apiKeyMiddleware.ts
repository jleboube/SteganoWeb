import type { Request, Response, NextFunction } from 'express';
import { HttpError } from './errorHandlers.js';
import { authenticateApiKey } from '../services/apiKeyService.js';

export const authenticateApiKeyMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const providedKey = (req.headers['x-api-key'] ?? req.headers['x-api_token'] ?? req.headers['authorization']) as
      | string
      | undefined;

    if (!providedKey) {
      throw new HttpError(401, 'API key required');
    }

    const token = providedKey.startsWith('Bearer ') ? providedKey.slice(7) : providedKey;

    const result = await authenticateApiKey(token.trim());
    if (!result) {
      throw new HttpError(401, 'Invalid API key');
    }

    req.authUser = result.user;
    req.apiKeyAuth = {
      id: result.apiKey.id,
      name: result.apiKey.name ?? null
    };

    next();
  } catch (error) {
    next(error as Error);
  }
};

export default authenticateApiKeyMiddleware;
