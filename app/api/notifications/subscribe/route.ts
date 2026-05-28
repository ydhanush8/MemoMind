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
    const record = await PushSubscription.findOneAndUpdate(
      { userId },
      { userId, subscription, enabled: true, updatedAt: new Date() },
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
  if (typeof body.preferredTime === 'string') update.preferredTime = body.preferredTime;
  if (typeof body.enabled === 'boolean') update.enabled = body.enabled;

  try {
    await connectDB();
    const record = await PushSubscription.findOneAndUpdate({ userId }, update, { new: true });
    if (!record) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, preferredTime: record.preferredTime });
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
    await PushSubscription.deleteOne({ userId });
    return NextResponse.json({ success: true, message: 'Subscription removed' });
  } catch (error) {
    console.error('Error deleting subscription:', error);
    return NextResponse.json({ error: 'Failed to delete subscription' }, { status: 500 });
  }
}
