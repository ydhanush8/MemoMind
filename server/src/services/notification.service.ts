import webpush from 'web-push';
import PushSubscription from '../models/PushSubscription.js';
import Subscription from '../models/Subscription.js';
import Note from '../models/Note.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/appError.js';
import { CRON, LIMITS } from '../utils/constants.js';
import { utcMidnight } from '../utils/date.js';
import { logger } from '../utils/logger.js';
import type {
  WebPushSubscription,
  SendNotificationInput,
  NotificationStatusResponse,
} from '../types/notification.types.js';

/** Configures web-push with VAPID; throws if credentials are missing. */
function getWebPush(): typeof webpush {
  const email = env.VAPID_EMAIL;
  const publicKey = env.VAPID_PUBLIC_KEY;
  const privateKey = env.VAPID_PRIVATE_KEY;
  if (!email || !publicKey || !privateKey) {
    throw new Error('VAPID credentials are not fully configured');
  }
  webpush.setVapidDetails(`mailto:${email}`, publicKey, privateKey);
  return webpush;
}

export async function subscribe(userId: string, subscription: WebPushSubscription) {
  try {
    const record = await PushSubscription.findOneAndUpdate(
      { userId, endpoint: subscription.endpoint },
      {
        $set: { subscription, enabled: true, updatedAt: new Date() },
        $setOnInsert: {
          userId,
          endpoint: subscription.endpoint,
          preferredTime: '19:00',
          notificationTypes: { dailyReminder: true, streakWarning: true },
          createdAt: new Date(),
        },
      },
      { upsert: true, new: true },
    );
    return { success: true, message: 'Subscription saved', subscriptionId: record._id };
  } catch (error) {
    logger.error({ err: error }, 'Error saving push subscription');
    throw new AppError(500, 'Failed to save subscription');
  }
}

export async function getStatus(userId: string): Promise<NotificationStatusResponse> {
  try {
    const record = await PushSubscription.findOne({ userId });
    if (!record) return { subscribed: false };
    return {
      subscribed: true,
      enabled: record.enabled,
      preferredTime: record.preferredTime,
      notificationTypes: record.notificationTypes,
    };
  } catch (error) {
    logger.error({ err: error }, 'Error fetching subscription');
    throw new AppError(500, 'Failed to fetch subscription');
  }
}

export async function updatePreferences(
  userId: string,
  body: { preferredTime?: string; enabled?: boolean },
) {
  const update: Record<string, unknown> = { updatedAt: new Date() };
  if (typeof body.preferredTime === 'string' && /^\d{2}:\d{2}$/.test(body.preferredTime)) {
    update.preferredTime = body.preferredTime;
  }
  if (typeof body.enabled === 'boolean') update.enabled = body.enabled;

  try {
    const result = await PushSubscription.updateMany({ userId }, { $set: update });
    if (result.matchedCount === 0) throw new AppError(404, 'No subscription found');
    return { success: true };
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error({ err: error }, 'Error updating preferences');
    throw new AppError(500, 'Failed to update preferences');
  }
}

export async function remove(userId: string, endpoint?: string) {
  try {
    await PushSubscription.deleteMany(endpoint ? { userId, endpoint } : { userId });
    return { success: true, message: 'Subscription removed' };
  } catch (error) {
    logger.error({ err: error }, 'Error deleting subscription');
    throw new AppError(500, 'Failed to delete subscription');
  }
}

export async function send(userId: string, input: SendNotificationInput) {
  let push: typeof webpush;
  try {
    push = getWebPush();
  } catch {
    throw new AppError(503, 'Push service not configured');
  }

  const { targetUserId, title, body: msgBody, url } = input;

  // Users may only send to themselves.
  if (targetUserId && targetUserId !== userId) {
    throw new AppError(403, 'Forbidden');
  }

  // NOTE: send checks plan only (not status) — preserved from the original route.
  const userSubscription = await Subscription.findOne({ userId });
  if (!userSubscription || userSubscription.plan !== 'premium') {
    throw new AppError(403, 'Premium subscription required');
  }

  const pushSubs = await PushSubscription.find({ userId, enabled: true });
  if (!pushSubs.length) {
    throw new AppError(404, 'No active push subscription found');
  }

  const payload = JSON.stringify({
    title: title || 'MemoMind Reminder',
    body: msgBody || 'Time for your daily practice!',
    url: url || '/dashboard/practice',
    badge: '/icon-192x192.png',
    icon: '/icon-192x192.png',
  });

  const expiredEndpoints: string[] = [];
  let sent = 0;

  await Promise.allSettled(
    pushSubs.map(async (ps) => {
      try {
        await push.sendNotification(ps.subscription as webpush.PushSubscription, payload);
        sent++;
      } catch (err: unknown) {
        const status = (err as { statusCode?: number }).statusCode;
        if (status === 410 || status === 404) expiredEndpoints.push(ps.endpoint);
      }
    }),
  );

  if (expiredEndpoints.length > 0) {
    await PushSubscription.deleteMany({ userId, endpoint: { $in: expiredEndpoints } });
  }

  if (sent === 0) {
    throw new AppError(410, 'All subscriptions expired and removed');
  }

  return { success: true, message: `Notification sent to ${sent} device(s)` };
}

/**
 * Daily reminder batch — same logic as the original Vercel cron endpoint.
 * Called by the protected /api/cron/daily-reminders endpoint (triggered by an external scheduler).
 */
export async function runDailyReminders() {
  let push: typeof webpush;
  try {
    push = getWebPush();
  } catch {
    throw new AppError(500, 'Push service not configured');
  }

  const today = utcMidnight();

  const premiumSubs = await Subscription.find(
    { plan: 'premium', status: 'active' },
    { userId: 1 },
  ).lean();

  if (premiumSubs.length === 0) {
    return { message: 'No premium users to notify', processed: 0 };
  }

  const userIds = premiumSubs.map((s) => s.userId as string);

  const reviewedAgg = await Note.aggregate([
    { $match: { userId: { $in: userIds }, lastReviewedAt: { $gte: today } } },
    { $group: { _id: '$userId', count: { $sum: 1 } } },
    { $match: { count: { $gte: LIMITS.PRACTICE_DAILY_GOAL } } },
  ]);
  const alreadyReviewed = new Set(reviewedAgg.map((r) => r._id as string));

  const needsReminder = userIds.filter((uid) => !alreadyReviewed.has(uid));
  if (needsReminder.length === 0) {
    return { message: 'All users already practiced today', processed: 0 };
  }

  const pushSubs = await PushSubscription.find(
    {
      userId: { $in: needsReminder },
      enabled: true,
      'notificationTypes.dailyReminder': true,
    },
    { userId: 1, endpoint: 1, subscription: 1 },
  ).lean();

  const subMap = new Map<string, { endpoint: string; subscription: unknown }[]>();
  for (const ps of pushSubs) {
    const uid = ps.userId as string;
    if (!subMap.has(uid)) subMap.set(uid, []);
    subMap.get(uid)!.push({ endpoint: ps.endpoint as string, subscription: ps.subscription });
  }

  const payload = JSON.stringify({
    title: CRON.DAILY_REMINDER_TITLE,
    body: CRON.DAILY_REMINDER_BODY,
    url: '/dashboard/practice',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
  });

  const results: { userId: string; status: string }[] = [];
  const expiredEndpoints: string[] = [];

  for (let i = 0; i < needsReminder.length; i += CRON.BATCH_SIZE) {
    const batch = needsReminder.slice(i, i + CRON.BATCH_SIZE);

    const batchResults = await Promise.allSettled(
      batch.map(async (uid) => {
        const devices = subMap.get(uid);
        if (!devices?.length) return { userId: uid, status: 'not_subscribed' };

        let sent = 0;
        await Promise.allSettled(
          devices.map(async ({ endpoint, subscription }) => {
            try {
              await push.sendNotification(subscription as webpush.PushSubscription, payload);
              sent++;
            } catch (err: unknown) {
              const status = (err as { statusCode?: number }).statusCode;
              if (status === 410 || status === 404) expiredEndpoints.push(endpoint);
            }
          }),
        );

        return { userId: uid, status: sent > 0 ? 'sent' : 'failed' };
      }),
    );

    for (const r of batchResults) {
      if (r.status === 'fulfilled') results.push(r.value);
    }
  }

  if (expiredEndpoints.length > 0) {
    await PushSubscription.deleteMany({ endpoint: { $in: expiredEndpoints } });
  }

  return {
    success: true,
    processed: results.length,
    sent: results.filter((r) => r.status === 'sent').length,
    skipped: results.filter((r) => r.status === 'not_subscribed').length,
    expired: expiredEndpoints.length,
    failed: results.filter((r) => r.status === 'failed').length,
  };
}
