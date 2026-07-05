import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '@/app/lib/mongodb';
import Subscription from '@/app/lib/models/Subscription';

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();

    let subscription = await Subscription.findOne({ userId });

    if (!subscription) {
      subscription = await Subscription.create({ userId, plan: 'free', status: 'active' });
    }

    const isPremium = subscription.plan === 'premium' && subscription.status === 'active';

    return NextResponse.json({
      isPremium,
      plan: subscription.plan,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
    });
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    return NextResponse.json({ error: 'Failed to fetch subscription status' }, { status: 500 });
  }
}
