import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import webpush from 'web-push';
import connectDB from '@/app/lib/mongodb';
import PushSubscription from '@/app/lib/models/PushSubscription';
import Subscription from '@/app/lib/models/Subscription';

// Initialize web-push
webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // This endpoint should ideally be protected by a secret key or internal-only
    // For now, let's allow authenticated users to send to themselves for testing
    // Or allow a special ADMIN_INTERNAL_KEY for cron jobs
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { targetUserId, title, body, url } = await request.json();

    // Only allow users to send to themselves unless they are admin (future)
    if (targetUserId && targetUserId !== userId) {
      return NextResponse.json({ error: 'Prohibited' }, { status: 403 });
    }

    const finalUserId = targetUserId || userId;

    await connectDB();

    // Check if user is premium
    const userSubscription = await Subscription.findOne({ userId: finalUserId });
    if (!userSubscription || userSubscription.plan !== 'premium') {
      return NextResponse.json({ error: 'Premium subscription required' }, { status: 403 });
    }

    // Get push subscription
    const pushSub = await PushSubscription.findOne({ userId: finalUserId, enabled: true });

    if (!pushSub || !pushSub.subscription) {
      return NextResponse.json({ error: 'User not subscribed to push' }, { status: 404 });
    }

    const payload = JSON.stringify({
      title: title || '📚 MemoMind Reminder',
      body: body || 'Time for your daily practice!',
      url: url || '/practice',
      badge: '/icon-192x192.png',
      icon: '/icon-192x192.png',
    });

    try {
      await webpush.sendNotification(pushSub.subscription, payload);
      return NextResponse.json({ success: true, message: 'Notification sent' });
    } catch (error: any) {
      console.error('Error sending push notification:', error);
      
      // If 410 Gone or 404 Not Found, remove the subscription as it's no longer valid
      if (error.statusCode === 410 || error.statusCode === 404) {
        await PushSubscription.deleteOne({ userId: finalUserId });
        return NextResponse.json({ error: 'Subscription expired and removed' }, { status: 410 });
      }
      
      return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
    }
  } catch (error) {
    console.error('Internal error in push send:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
