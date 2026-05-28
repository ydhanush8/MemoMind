import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import crypto from 'crypto';
import connectDB from '@/app/lib/mongodb';
import Subscription from '@/app/lib/models/Subscription';

const VALID_PLAN_TYPES = ['monthly', 'yearly'] as const;
type PlanType = (typeof VALID_PLAN_TYPES)[number];

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: {
    razorpay_subscription_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
    planType?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { razorpay_subscription_id, razorpay_payment_id, razorpay_signature, planType } = body;

  if (!razorpay_subscription_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: 'Missing required payment fields' }, { status: 400 });
  }

  if (!planType || !VALID_PLAN_TYPES.includes(planType as PlanType)) {
    return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 });
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 500 });
  }

  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
    .digest('hex');

  if (generatedSignature !== razorpay_signature) {
    return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
  }

  const currentPeriodStart = new Date();
  const currentPeriodEnd = new Date();
  if (planType === 'yearly') {
    currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
  } else {
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
  }

  try {
    await connectDB();
    await Subscription.findOneAndUpdate(
      { userId },
      {
        userId,
        plan: 'premium',
        planType: planType as PlanType,
        status: 'active',
        razorpaySubscriptionId: razorpay_subscription_id,
        currentPeriodStart,
        currentPeriodEnd,
      },
      { upsert: true, new: true }
    );
    return NextResponse.json({ success: true, message: 'Subscription activated!' });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json({ error: 'Failed to activate subscription' }, { status: 500 });
  }
}
