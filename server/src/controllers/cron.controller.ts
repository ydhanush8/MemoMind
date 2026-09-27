import crypto from 'node:crypto';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendData, sendError } from '../utils/response.js';
import { env } from '../config/env.js';
import { runDailyReminders } from '../services/notification.service.js';

function isAuthorized(header: string | undefined): boolean {
  if (!env.CRON_SECRET || !header) return false;
  const a = Buffer.from(header);
  const b = Buffer.from(`Bearer ${env.CRON_SECRET}`);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/**
 * Protected daily-reminder trigger. Always requires
 * `Authorization: Bearer <CRON_SECRET>` (fails closed when unset). Called on
 * schedule by an external cron (GitHub Actions) that hits this endpoint.
 */
export const dailyReminders = asyncHandler(async (req, res) => {
  if (!isAuthorized(req.headers.authorization)) {
    sendError(res, 'Unauthorized', 401);
    return;
  }
  sendData(res, await runDailyReminders());
});
