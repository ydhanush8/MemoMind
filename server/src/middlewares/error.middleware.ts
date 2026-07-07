import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError.js';
import { logger } from '../utils/logger.js';

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: 'Not found' });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- 4 args = Express error handler
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  // Malformed JSON body → mirror the original per-route 'Invalid request body'.
  const parseErr = err as { type?: string } | null;
  if (parseErr?.type === 'entity.parse.failed') {
    res.status(400).json({ error: 'Invalid request body' });
    return;
  }

  if (err instanceof AppError) {
    if (err.statusCode >= 500) logger.error({ err }, err.message);
    res.status(err.statusCode).json({ error: err.message, ...(err.extra ?? {}) });
    return;
  }

  logger.error({ err }, 'Unhandled error');
  res.status(500).json({ error: 'Internal server error' });
}
