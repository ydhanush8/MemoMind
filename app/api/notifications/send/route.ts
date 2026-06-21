import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import webpush from 'web-push';
import connectDB from '@/app/lib/mongodb';
import PushSubscription from '@/app/lib/models/PushSubscription';
import Subscription from '@/app/lib/models/Subscription';

function getWebPush(): typeof webpush {
  const email = process.env.VAPID_EMAIL;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!email || !publicKey || !privateKey) {
    throw new Error('VAPID credentials are not fully configured');
  }

  webpush.setVapidDetails(`mailto:${email}`, publicKey, privateKey);
  return webpush;
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let push: typeof webpush;
  try {
    push = getWebPush();
  } catch {
    return NextResponse.json({ error: 'Push service not configured' }, { status: 503 });
  }

  let body: { targetUserId?: string; title?: string; body?: string; url?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { targetUserId, title, body: msgBody, url } = body;

  // Users may only send to themselves (admin targeting is a future feature)
  if (targetUserId && targetUserId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await connectDB();

  const userSubscription = await Subscription.findOne({ userId });
  if (!userSubscription || userSubscription.plan !== 'premium') {
    return NextResponse.json({ error: 'Premium subscription required' }, { status: 403 });
  }

  const pushSubs = await PushSubscription.find({ userId, enabled: true });
  if (!pushSubs.length) {
    return NextResponse.json({ error: 'No active push subscription found' }, { status: 404 });
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
        if (status === 410 || status === 404) {
          expiredEndpoints.push(ps.endpoint as string);
        }
      }
    })
  );

  if (expiredEndpoints.length > 0) {
    await PushSubscription.deleteMany({ userId, endpoint: { $in: expiredEndpoints } });
  }

  if (sent === 0) {
    return NextResponse.json({ error: 'All subscriptions expired and removed' }, { status: 410 });
  }

  return NextResponse.json({ success: true, message: `Notification sent to ${sent} device(s)` });
}
