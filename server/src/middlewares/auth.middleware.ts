import type { Request, Response, NextFunction } from 'express';
import { getAuth } from '@clerk/express';
import type { AuthedRequest } from '../types/common.types.js';

/**
 * Enforces a signed-in Clerk user. Preserves the original `{ error: 'Unauthorized' }`
 * 401 body. Clerk's clerkMiddleware must run earlier in the chain (see app.ts).
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  (req as AuthedRequest).userId = userId;
  next();
}

/** Reads the authenticated user id attached by requireAuth. */
export function getUserId(req: Request): string {
  return (req as AuthedRequest).userId;
}
