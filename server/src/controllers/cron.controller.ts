import { asyncHandler } from '../utils/asyncHandler.js';
import { sendData, sendError } from '../utils/response.js';
import { env, isProd } from '../config/env.js';
import { runDailyReminders } from '../services/notification.service.js';

/**
 * Protected daily-reminder trigger. In production it requires
 * `Authorization: Bearer <CRON_SECRET>` — identical to the Vercel cron route.
 * node-cron also runs the same service function on schedule (see jobs/).
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
