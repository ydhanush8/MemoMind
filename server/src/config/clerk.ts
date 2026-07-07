import { clerkMiddleware } from '@clerk/express';
import { env } from './env.js';

/**
 * Populates `req.auth` from the incoming request (Bearer token or Clerk cookie).
 * Mounted app-wide; individual routes enforce presence via requireAuth.
 */
export const clerk = clerkMiddleware({
  publishableKey: env.CLERK_PUBLISHABLE_KEY,
  secretKey: env.CLERK_SECRET_KEY,
});
