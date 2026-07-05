import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import PushSubscription from '@/app/lib/models/PushSubscription';
import Subscription from '@/app/lib/models/Subscription';
import Note from '@/app/lib/models/Note';
import webpush from 'web-push';

const NOTIFICATION_TITLE = 'Good morning — time to review';
const NOTIFICATION_BODY = 'Kickstart your day with a quick 5-min review.';
const BATCH_SIZE = 50;

function initWebPush() {
  const email = process.env.VAPID_EMAIL;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!email || !publicKey || !privateKey) {
    throw new Error('VAPID credentials are not configured');
  }

  webpush.setVapidDetails(`mailto:${email}`, publicKey, privateKey);
}

export async function GET(request: NextRequest) {
  // Production: require CRON_SECRET always
  if (process.env.NODE_ENV === 'production') {
    const authHeader = request.headers.get('authorization');
    const secret = process.env.CRON_SECRET;
    if (!secret || authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    initWebPush();
  } catch (err) {
    console.error('VAPID init failed:', err);
    return NextResponse.json({ error: 'Push service not configured' }, { status: 500 });
  }

  await connectDB();

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0); // Use UTC midnight for consistency

  // 1. Batch-fetch all active premium user IDs
  const premiumSubs = await Subscription.find(
    { plan: 'premium', status: 'active' },
    { userId: 1 },
  ).lean();

  if (premiumSubs.length === 0) {
    return NextResponse.json({ message: 'No premium users to notify', processed: 0 });
  }

  const userIds = premiumSubs.map((s) => s.userId as string);

  // 2. Batch-fetch users who already reviewed 2+ notes today
  const reviewedAgg = await Note.aggregate([
    { $match: { userId: { $in: userIds }, lastReviewedAt: { $gte: today } } },
    { $group: { _id: '$userId', count: { $sum: 1 } } },
    { $match: { count: { $gte: 2 } } },
  ]);
  const alreadyReviewed = new Set(reviewedAgg.map((r) => r._id as string));

  // 3. Filter to users who still need reminders
  const needsReminder = userIds.filter((uid) => !alreadyReviewed.has(uid));

  if (needsReminder.length === 0) {
    return NextResponse.json({ message: 'All users already practiced today', processed: 0 });
  }

  // 4. Batch-fetch push subscriptions for those users (only those who want daily reminders)
  const pushSubs = await PushSubscription.find(
    {
      userId: { $in: needsReminder },
      enabled: true,
      'notificationTypes.dailyReminder': true,
    },
    { userId: 1, endpoint: 1, subscription: 1 },
  ).lean();

  // Group subscriptions by userId — one user may have multiple devices
  const subMap = new Map<string, { endpoint: string; subscription: unknown }[]>();
  for (const ps of pushSubs) {
    const uid = ps.userId as string;
    if (!subMap.has(uid)) subMap.set(uid, []);
    subMap.get(uid)!.push({ endpoint: ps.endpoint as string, subscription: ps.subscription });
  }

  const payload = JSON.stringify({
    title: NOTIFICATION_TITLE,
    body: NOTIFICATION_BODY,
    url: '/dashboard/practice',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
  });

  // 5. Send notifications in parallel batches (queue pattern — avoids Vercel timeout)
  const results: { userId: string; status: string; error?: string }[] = [];
  const expiredEndpoints: string[] = [];

  for (let i = 0; i < needsReminder.length; i += BATCH_SIZE) {
    const batch = needsReminder.slice(i, i + BATCH_SIZE);

    const batchResults = await Promise.allSettled(
      batch.map(async (userId) => {
        const devices = subMap.get(userId);
        if (!devices?.length) return { userId, status: 'not_subscribed' };

        let sent = 0;
        await Promise.allSettled(
          devices.map(async ({ endpoint, subscription }) => {
            try {
              await webpush.sendNotification(subscription as webpush.PushSubscription, payload);
              sent++;
            } catch (err: unknown) {
              const status = (err as { statusCode?: number }).statusCode;
              if (status === 410 || status === 404) {
                expiredEndpoints.push(endpoint);
              }
            }
          }),
        );

        return { userId, status: sent > 0 ? 'sent' : 'failed' };
      }),
    );

    for (const r of batchResults) {
      if (r.status === 'fulfilled') results.push(r.value);
    }
  }

  // 6. Clean up expired subscriptions in bulk
  if (expiredEndpoints.length > 0) {
    await PushSubscription.deleteMany({ endpoint: { $in: expiredEndpoints } });
  }

  return NextResponse.json({
    success: true,
    processed: results.length,
    sent: results.filter((r) => r.status === 'sent').length,
    skipped: results.filter((r) => r.status === 'not_subscribed').length,
    expired: expiredEndpoints.length,
    failed: results.filter((r) => r.status === 'failed').length,
  });
}
