import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/app/lib/mongodb';
import PushSubscription from '@/app/lib/models/PushSubscription';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await request.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
    }

    await connectDB();

    // Create or update subscription
    const pushSubscription = await PushSubscription.findOneAndUpdate(
      { userId },
      {
        userId,
        subscription,
        enabled: true,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Subscription saved successfully',
      subscriptionId: pushSubscription._id 
    });
  } catch (error) {
    console.error('Error saving push subscription:', error);
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
  }
}

// Get current subscription status
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const subscription = await PushSubscription.findOne({ userId });

    if (!subscription) {
      return NextResponse.json({ subscribed: false });
    }

    return NextResponse.json({
      subscribed: true,
      enabled: subscription.enabled,
      preferredTime: subscription.preferredTime,
      notificationTypes: subscription.notificationTypes,
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 });
  }
}

// Delete subscription
export async function DELETE() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    await PushSubscription.deleteOne({ userId });

    return NextResponse.json({ success: true, message: 'Subscription removed' });
  } catch (error) {
    console.error('Error deleting subscription:', error);
    return NextResponse.json({ error: 'Failed to delete subscription' }, { status: 500 });
  }
}
