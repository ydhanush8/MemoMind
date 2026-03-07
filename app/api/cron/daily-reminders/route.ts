import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import PushSubscription from '@/app/lib/models/PushSubscription';
import Subscription from '@/app/lib/models/Subscription';
import Note from '@/app/lib/models/Note';
import webpush from 'web-push';

// Initialize web-push
webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Basic protection using a secret header (Vercel Cron provides this)
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // Allow manual triggering only for development/testing if no secret is set
       if (process.env.NODE_ENV === 'production') {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
       }
    }

    await connectDB();

    // 1. Get all premium subscriptions that are active
    const premiumSubscriptions = await Subscription.find({
      plan: 'premium',
      status: 'active',
    });

    const userIds = premiumSubscriptions.map(s => s.userId);

    if (userIds.length === 0) {
      return NextResponse.json({ message: 'No premium users to notify' });
    }

    // For each premium user, check if they've practiced today
    const today = new Date();
    const currentHour = today.getUTCHours();
    today.setHours(0, 0, 0, 0);

    const notificationTitle = "☀️ Good Morning! Ready to Learn?";
    const notificationBody = "Kickstart your day with a quick 5-min review! 🧠";

    const notificationResults = [];

    for (const userId of userIds) {
      // Check for notes reviewed today
      const reviewedToday = await Note.countDocuments({
        userId,
        lastReviewedAt: { $gte: today },
      });

      // If they haven't practiced (reviewed at least 2 notes), send a reminder
      if (reviewedToday < 2) {
        const pushSub = await PushSubscription.findOne({ userId, enabled: true });

        if (pushSub && pushSub.subscription) {
          try {
            const payload = JSON.stringify({
              title: notificationTitle,
              body: notificationBody,
              url: "/practice",
              icon: "/icon-192x192.png",
              badge: "/icon-192x192.png",
            });

            await webpush.sendNotification(pushSub.subscription, payload);
            notificationResults.push({ userId, status: 'sent' });
          } catch (error: any) {
            console.error(`Error sending to user ${userId}:`, error);
            if (error.statusCode === 410 || error.statusCode === 404) {
              await PushSubscription.deleteOne({ userId });
              notificationResults.push({ userId, status: 'removed' });
            } else {
              notificationResults.push({ userId, status: 'failed', error: error.message });
            }
          }
        } else {
          notificationResults.push({ userId, status: 'not_subscribed' });
        }
      } else {
        notificationResults.push({ userId, status: 'already_practiced' });
      }
    }

    return NextResponse.json({
      success: true,
      processed: notificationResults.length,
      results: notificationResults,
    });
  } catch (error) {
    console.error('Cron job internal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
