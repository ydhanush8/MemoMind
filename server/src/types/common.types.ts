import type { Request } from 'express';

/** Request after requireAuth has attached the Clerk user id. */
export interface AuthedRequest extends Request {
  userId: string;
}
