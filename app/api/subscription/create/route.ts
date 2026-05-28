import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Razorpay from 'razorpay';

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
    return NextResponse.json({ error: 'Invalid plan type. Must be monthly or yearly.' }, { status: 400 });
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

  try {
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: planType === 'monthly' ? 12 : 1,
      notes: { userId, planType },
    });

    return NextResponse.json({
      subscriptionId: subscription.id,
      razorpayKeyId: keyId,
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
  }
}
