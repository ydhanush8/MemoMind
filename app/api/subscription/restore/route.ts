import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Razorpay from 'razorpay';
import connectDB from '@/app/lib/mongodb';
import Subscription from '@/app/lib/models/Subscription';
import { logPayment } from '@/app/lib/paymentLogger';

// Only statuses where Razorpay has confirmed payment was received
const PAID_STATUSES = ['active', 'authenticated', 'completed'];

type RzpSub = {
  id: string;
  status: string;
  plan_id: string;
  current_start?: number;
  current_end?: number;
  notes?: Record<string, string>;
};

async function activateSubscription(userId: string, rzpSub: RzpSub, pendingPlanType?: string) {
  const monthlyPlanId = process.env.RAZORPAY_PLAN_ID_MONTHLY;
  const yearlyPlanId = process.env.RAZORPAY_PLAN_ID_YEARLY;

  const planType: 'monthly' | 'yearly' =
    rzpSub.plan_id === yearlyPlanId
      ? 'yearly'
      : rzpSub.plan_id === monthlyPlanId
        ? 'monthly'
        : ((rzpSub.notes?.planType as 'monthly' | 'yearly' | undefined) ??
          (pendingPlanType as 'monthly' | 'yearly' | undefined) ??
          'monthly');

  const currentPeriodStart = rzpSub.current_start
    ? new Date(rzpSub.current_start * 1000)
    : new Date();

  // If Razorpay's period end is in the past (common for test-mode subscriptions that
  // didn't auto-renew), calculate a fresh period from today so the user isn't
  // immediately treated as expired in our DB.
  const rzpPeriodEnd = rzpSub.current_end ? new Date(rzpSub.current_end * 1000) : null;
  const now = new Date();
  const currentPeriodEnd =
    rzpPeriodEnd && rzpPeriodEnd > now
      ? rzpPeriodEnd
      : (() => {
          const d = new Date();
          planType === 'yearly' ? d.setFullYear(d.getFullYear() + 1) : d.setMonth(d.getMonth() + 1);
          return d;
        })();

  await Subscription.findOneAndUpdate(
    { userId },
    {
      userId,
      plan: 'premium',
      planType,
      status: 'active',
      razorpaySubscriptionId: rzpSub.id,
      pendingPlanType: undefined,
      currentPeriodStart,
      currentPeriodEnd,
    },
    { upsert: true, new: true },
  );

  return { planType, currentPeriodEnd };
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 500 });
  }

  // Optional: user can provide their subscription ID manually from Razorpay receipt
  let manualSubscriptionId: string | undefined;
  try {
    const body = (await request.json()) as { subscriptionId?: string };
    manualSubscriptionId = body?.subscriptionId?.trim() || undefined;
  } catch {
    // No body is fine
  }

  await connectDB();
  logPayment('subscription.restore.attempt', { userId, manualSubscriptionId });

  const now = new Date();
  const existing = await Subscription.findOne({ userId });

  // Already genuinely active — nothing to restore
  if (
    existing?.plan === 'premium' &&
    existing?.status === 'active' &&
    existing?.currentPeriodEnd &&
    existing.currentPeriodEnd > now
  ) {
    logPayment('subscription.restore.already_active', { userId });
    return NextResponse.json({ alreadyActive: true, message: 'Subscription is already active' });
  }

  try {
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    let rzpSub: RzpSub | null = null;

    // Strategy 0: User provided their subscription ID manually
    if (manualSubscriptionId) {
      try {
        const fetched = (await razorpay.subscriptions.fetch(manualSubscriptionId)) as RzpSub;
        logPayment('subscription.restore.attempt', {
          userId,
          razorpaySubscriptionId: manualSubscriptionId,
          razorpayStatus: fetched.status,
        });
        if (PAID_STATUSES.includes(fetched.status)) {
          rzpSub = fetched;
        } else {
          return NextResponse.json(
            {
              error: `Subscription found but status is "${fetched.status}". Payment may not have completed yet.`,
            },
            { status: 400 },
          );
        }
      } catch {
        return NextResponse.json(
          {
            error:
              'Could not find a Razorpay subscription with that ID. Please check and try again.',
          },
          { status: 404 },
        );
      }
    }

    // Strategy 1: Use subscription ID we saved in DB at create time
    if (!rzpSub && existing?.razorpaySubscriptionId) {
      try {
        const fetched = (await razorpay.subscriptions.fetch(
          existing.razorpaySubscriptionId,
        )) as RzpSub;
        if (PAID_STATUSES.includes(fetched.status)) {
          rzpSub = fetched;
        }
      } catch {
        // Continue to next strategy
      }
    }

    // Strategy 2 & 3: Search Razorpay subscriptions list
    if (!rzpSub) {
      const result = (await razorpay.subscriptions.all({ count: 100 })) as { items?: RzpSub[] };
      const allSubs = result?.items ?? [];

      // 2a: Match by userId in notes
      const byUserId = allSubs.filter(
        (s) => s.notes?.userId === userId && PAID_STATUSES.includes(s.status),
      );

      if (byUserId.length > 0) {
        rzpSub = byUserId.sort((a, b) => (b.current_start ?? 0) - (a.current_start ?? 0))[0];
      }
      // Strategy 2b (match by plan ID without userId) is intentionally removed —
      // it could activate the wrong user's subscription in a multi-user environment.
    }

    if (!rzpSub) {
      logPayment('subscription.restore.not_found', { userId });
      return NextResponse.json(
        {
          notFound: true,
          error:
            'We could not automatically find your subscription. ' +
            'Please enter your Razorpay Subscription ID from your payment receipt email to restore manually.',
        },
        { status: 404 },
      );
    }

    const { planType, currentPeriodEnd } = await activateSubscription(
      userId,
      rzpSub,
      existing?.pendingPlanType,
    );

    logPayment('subscription.restore.success', {
      userId,
      planType,
      razorpaySubscriptionId: rzpSub.id,
      currentPeriodEnd: currentPeriodEnd.toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription restored!',
      planType,
      validUntil: currentPeriodEnd.toISOString(),
    });
  } catch (error) {
    logPayment('subscription.restore.failure', { userId, error: String(error) });
    console.error('Restore error:', error);
    return NextResponse.json(
      { error: 'Failed to restore subscription. Please try again.' },
      { status: 500 },
    );
  }
}
