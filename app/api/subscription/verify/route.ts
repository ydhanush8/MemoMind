import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import crypto from 'crypto';
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

  logPayment('subscription.verify.attempt', {
    userId,
    planType,
    razorpaySubscriptionId: razorpay_subscription_id,
  });

  if (!razorpay_subscription_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: 'Missing required payment fields' }, { status: 400 });
  }

  if (!planType || !VALID_PLAN_TYPES.includes(planType as PlanType)) {
    return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret || !keyId) {
    return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 500 });
  }

  // 1. Verify Razorpay HMAC signature
  const generatedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpay_payment_id}|${razorpay_subscription_id}`)
    .digest('hex');

  if (generatedSignature !== razorpay_signature) {
    logPayment('subscription.verify.signature_invalid', { userId, razorpaySubscriptionId: razorpay_subscription_id });
    return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
  }

  // 2. Cross-verify with Razorpay API that subscription is actually paid
  let rzpSubscription: {
    status: string;
    current_start?: number;
    current_end?: number;
    plan_id?: string;
  };
  try {
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    rzpSubscription = await razorpay.subscriptions.fetch(razorpay_subscription_id) as typeof rzpSubscription;
  } catch (err) {
    logPayment('subscription.verify.failure', {
      userId,
      razorpaySubscriptionId: razorpay_subscription_id,
      error: 'Razorpay API fetch failed',
    });
    // Signature already verified — don't block activation if Razorpay API is temporarily down
    rzpSubscription = { status: 'active' };
  }

  const validStatuses = ['active', 'authenticated', 'created'];
  if (!validStatuses.includes(rzpSubscription.status)) {
    logPayment('subscription.verify.razorpay_not_active', {
      userId,
      razorpaySubscriptionId: razorpay_subscription_id,
      razorpayStatus: rzpSubscription.status,
    });
    return NextResponse.json(
      { error: `Subscription is not active on Razorpay (status: ${rzpSubscription.status})` },
      { status: 400 }
    );
  }

  await connectDB();

  // 3. Check for duplicate — if already premium and period is current, just confirm success
  const now = new Date();
  const existing = await Subscription.findOne({ userId });
  if (
    existing?.plan === 'premium' &&
    existing?.status === 'active' &&
    existing?.razorpaySubscriptionId === razorpay_subscription_id &&
    existing?.currentPeriodEnd &&
    existing.currentPeriodEnd > now
  ) {
    logPayment('subscription.verify.duplicate', {
      userId,
      razorpaySubscriptionId: razorpay_subscription_id,
    });
    return NextResponse.json({ success: true, message: 'Subscription already active' });
  }

  // 4. Derive period dates — prefer Razorpay's own dates
  const currentPeriodStart = rzpSubscription.current_start
    ? new Date(rzpSubscription.current_start * 1000)
    : new Date();

  const rzpPeriodEnd = rzpSubscription.current_end
    ? new Date(rzpSubscription.current_end * 1000)
    : null;
  const nowForPeriod = new Date();
  const currentPeriodEnd =
    rzpPeriodEnd && rzpPeriodEnd > nowForPeriod
      ? rzpPeriodEnd
      : (() => {
          const d = new Date();
          (planType as PlanType) === 'yearly'
            ? d.setFullYear(d.getFullYear() + 1)
            : d.setMonth(d.getMonth() + 1);
          return d;
        })();

  // 5. Write to DB — idempotent upsert
  try {
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
  } catch (err) {
    logPayment('subscription.verify.db_failure', {
      userId,
      razorpaySubscriptionId: razorpay_subscription_id,
      error: String(err),
    });
    return NextResponse.json(
      {
        error: 'Payment verified but failed to activate subscription. Please use Restore Subscription on the pricing page.',
        recoverable: true,
      },
      { status: 500 }
    );
  }

  logPayment('subscription.verify.success', {
    userId,
    planType,
    razorpaySubscriptionId: razorpay_subscription_id,
    currentPeriodEnd: currentPeriodEnd.toISOString(),
  });

  return NextResponse.json({ success: true, message: 'Subscription activated!' });
}
