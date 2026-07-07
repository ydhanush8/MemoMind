import { asyncHandler } from '../utils/asyncHandler.js';
import { sendData, sendError } from '../utils/response.js';
import { env, isProd } from '../config/env.js';
import { runDailyReminders } from '../services/notification.service.js';

/**
 * Protected daily-reminder trigger. In production it requires
 * `Authorization: Bearer <CRON_SECRET>`. Called on schedule by an external
 * cron (GitHub Actions) that hits this endpoint.
 */
export const dailyReminders = asyncHandler(async (req, res) => {
  if (isProd) {
    const secret = env.CRON_SECRET;
    if (!secret || req.headers.authorization !== `Bearer ${secret}`) {
      sendError(res, 'Unauthorized', 401);
      return;
    }
  }
  sendData(res, await runDailyReminders());
});
