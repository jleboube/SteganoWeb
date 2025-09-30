import type { Request, Response, NextFunction } from 'express';
import logger from '../lib/logger.js';

export class HttpError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const notFoundHandler = (_req: Request, _res: Response, next: NextFunction) => {
  next(new HttpError(404, 'Route not found'));
};

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const status = err instanceof HttpError ? err.status : 500;
  const body = {
    error: err.message,
    ...(err instanceof HttpError && err.details ? { details: err.details } : {})
  };

  if (status >= 500) {
    logger.error({ err }, 'Unhandled error');
  } else {
    logger.warn({ err }, 'Handled error');
  }

  res.status(status).json(body);
};
