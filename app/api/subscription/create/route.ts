import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Razorpay from 'razorpay';
import connectDB from '@/app/lib/mongodb';
import Subscription from '@/app/lib/models/Subscription';
import { logPayment } from '@/app/lib/paymentLogger';

const VALID_PLAN_TYPES = ['monthly', 'yearly'] as const;
type PlanType = (typeof VALID_PLAN_TYPES)[number];

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { planType?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { planType } = body;
  if (!planType || !VALID_PLAN_TYPES.includes(planType as PlanType)) {
    return NextResponse.json(
      { error: 'Invalid plan type. Must be monthly or yearly.' },
      { status: 400 },
    );
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 500 });
  }

  const planId =
    planType === 'monthly'
      ? process.env.RAZORPAY_PLAN_ID_MONTHLY
      : process.env.RAZORPAY_PLAN_ID_YEARLY;

  if (!planId) {
    return NextResponse.json({ error: `Plan not configured for ${planType}` }, { status: 500 });
  }

  await connectDB();

  // Block if user already has a genuinely active (non-expired) premium subscription
  const now = new Date();
  const existing = await Subscription.findOne({ userId });
  if (
    existing?.plan === 'premium' &&
    existing?.status === 'active' &&
    existing?.currentPeriodEnd &&
    existing.currentPeriodEnd > now
  ) {
    logPayment('subscription.create.blocked_duplicate', { userId, planType });
    return NextResponse.json(
      { error: 'You already have an active premium subscription.', alreadyPremium: true },
      { status: 409 },
    );
  }

  logPayment('subscription.create.attempt', { userId, planType });

  try {
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: planType === 'monthly' ? 12 : 1,
      notes: { userId, planType },
    });

    // Save subscription ID to DB immediately so restore can find it if verify fails.
    // Uses $set so existing premium fields (plan, status, currentPeriodEnd) are NOT overwritten.
    // $setOnInsert initialises required fields only on first-ever document creation.
    await Subscription.findOneAndUpdate(
      { userId },
      {
        $set: {
          razorpaySubscriptionId: subscription.id,
          pendingPlanType: planType as PlanType,
        },
        $setOnInsert: {
          userId,
          plan: 'free',
          status: 'active',
        },
      },
      { upsert: true },
    );

    logPayment('subscription.create.success', {
      userId,
      planType,
      razorpaySubscriptionId: subscription.id,
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      razorpayKeyId: keyId,
    });
  } catch (error) {
    logPayment('subscription.create.failure', { userId, planType, error: String(error) });
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
  }
}
