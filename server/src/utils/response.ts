import type { Response } from 'express';

/**
 * Thin helpers that preserve the EXACT response shapes of the original
 * Next.js routes — raw payloads for success, `{ error, ...extra }` for errors.
 * No envelope wrapping, so the frontend sees identical bodies.
 */
export function sendData<T>(res: Response, data: T, status = 200): Response {
  return res.status(status).json(data);
}

export function sendError(
  res: Response,
  message: string,
  status = 500,
  extra?: Record<string, unknown>,
): Response {
  return res.status(status).json({ error: message, ...(extra ?? {}) });
}
