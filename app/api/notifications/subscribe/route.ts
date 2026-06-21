import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/app/lib/mongodb';
import PushSubscription from '@/app/lib/models/PushSubscription';

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let subscription: { endpoint?: string };
  try {
    subscription = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!subscription?.endpoint) {
    return NextResponse.json({ error: 'Invalid push subscription object' }, { status: 400 });
  }

  try {
    await connectDB();
    // Upsert keyed by (userId, endpoint) — one document per device.
    // $set updates mutable fields on re-subscribe; $setOnInsert writes immutable fields + defaults only on first insert.
    // This preserves preferredTime and notificationTypes when a browser renews its push subscription.
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
      { upsert: true, new: true }
    );
    return NextResponse.json({
      success: true,
      message: 'Subscription saved',
      subscriptionId: record._id,
    });
  } catch (error) {
    console.error('Error saving push subscription:', error);
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
  }
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    // Return status from any one active subscription (preferences are per-user, not per-device)
    const record = await PushSubscription.findOne({ userId });
    if (!record) {
      return NextResponse.json({ subscribed: false });
    }
    return NextResponse.json({
      subscribed: true,
      enabled: record.enabled,
      preferredTime: record.preferredTime,
      notificationTypes: record.notificationTypes,
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { preferredTime?: string; enabled?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const update: Record<string, unknown> = { updatedAt: new Date() };
  if (typeof body.preferredTime === 'string' && /^\d{2}:\d{2}$/.test(body.preferredTime)) {
    update.preferredTime = body.preferredTime;
  }
  if (typeof body.enabled === 'boolean') update.enabled = body.enabled;

  try {
    await connectDB();
    // Apply preference changes to all devices for this user
    const result = await PushSubscription.updateMany({ userId }, { $set: update });
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating preferences:', error);
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
  }
}

export async function DELETE() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    // Remove all devices for this user
    await PushSubscription.deleteMany({ userId });
    return NextResponse.json({ success: true, message: 'Subscription removed' });
  } catch (error) {
    console.error('Error deleting subscription:', error);
    return NextResponse.json({ error: 'Failed to delete subscription' }, { status: 500 });
  }
}
