import type { HydratedDocument } from 'mongoose';
import Subscription, { type ISubscription } from '../models/Subscription.js';
import { AppError } from '../utils/appError.js';
import { addMonths, addYears } from '../utils/date.js';
import {
  VALID_PLAN_TYPES,
  RAZORPAY_VALID_VERIFY_STATUSES,
  RAZORPAY_PAID_STATUSES,
  type PlanType,
} from '../utils/constants.js';
import {
  logPayment,
  hasRazorpayCredentials,
  getRazorpayCredentials,
  getPlanId,
  verifyPaymentSignature,
  createRazorpaySubscription,
  fetchRazorpaySubscription,
  listRazorpaySubscriptions,
} from './payment.service.js';
import type { RzpSubscription, VerifyPaymentInput } from '../types/subscription.types.js';

/**
 * Premium = plan premium, status active and inside the paid period. There is no
 * Razorpay webhook, so renewals don't move currentPeriodEnd forward on their own:
 * once the stored period has passed, re-fetch the subscription from Razorpay and
 * either extend the period or mark it expired.
 */
async function checkPremium(sub: HydratedDocument<ISubscription> | null): Promise<boolean> {
  if (sub?.plan !== 'premium' || sub.status !== 'active') return false;
  // Manually granted premium (no Razorpay link, no period) never expires.
  if (!sub.currentPeriodEnd && !sub.razorpaySubscriptionId) return true;
  if (sub.currentPeriodEnd && sub.currentPeriodEnd > new Date()) return true;

  if (sub.razorpaySubscriptionId && hasRazorpayCredentials()) {
    let rzpSub: RzpSubscription;
    try {
      rzpSub = await fetchRazorpaySubscription(sub.razorpaySubscriptionId);
    } catch {
      // ponytail: Razorpay outage keeps lapsed users premium until the next check; a webhook removes the need for this.
      return true;
    }
    const periodEnd = rzpSub.current_end ? new Date(rzpSub.current_end * 1000) : null;
    if (
      RAZORPAY_PAID_STATUSES.includes(rzpSub.status as never) &&
      (!periodEnd || periodEnd > new Date())
    ) {
      if (periodEnd) {
        if (rzpSub.current_start) sub.currentPeriodStart = new Date(rzpSub.current_start * 1000);
        sub.currentPeriodEnd = periodEnd;
        await sub.save();
      }
      return true;
    }
  }

  sub.status = 'expired';
  await sub.save();
  logPayment('subscription.status.expired', {
    userId: sub.userId,
    razorpaySubscriptionId: sub.razorpaySubscriptionId,
  });
  return false;
}

export async function isUserPremium(userId: string): Promise<boolean> {
  return checkPremium(await Subscription.findOne({ userId }));
}

export async function getStatus(userId: string) {
  try {
    let subscription = await Subscription.findOne({ userId });
    if (!subscription) {
      subscription = await Subscription.create({ userId, plan: 'free', status: 'active' });
    }
    const isPremium = await checkPremium(subscription);
    return {
      isPremium,
      plan: subscription.plan,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
    };
  } catch {
    throw new AppError(500, 'Failed to fetch subscription status');
  }
}

export async function createSubscription(userId: string, planType: PlanType) {
  if (!hasRazorpayCredentials()) throw new AppError(500, 'Payment gateway not configured');

  const planId = getPlanId(planType);
  if (!planId) throw new AppError(500, `Plan not configured for ${planType}`);

  const now = new Date();
  const existing = await Subscription.findOne({ userId });
  if (
    existing?.plan === 'premium' &&
    existing?.status === 'active' &&
    existing?.currentPeriodEnd &&
    existing.currentPeriodEnd > now
  ) {
    logPayment('subscription.create.blocked_duplicate', { userId, planType });
    throw new AppError(409, 'You already have an active premium subscription.', {
      alreadyPremium: true,
    });
  }

  logPayment('subscription.create.attempt', { userId, planType });

  try {
    const subscription = await createRazorpaySubscription(planId, planType, userId);

    // $set keeps existing premium fields intact; $setOnInsert only on first creation.
    await Subscription.findOneAndUpdate(
      { userId },
      {
        $set: { razorpaySubscriptionId: subscription.id, pendingPlanType: planType },
        $setOnInsert: { userId, plan: 'free', status: 'active' },
      },
      { upsert: true },
    );

    logPayment('subscription.create.success', {
      userId,
      planType,
      razorpaySubscriptionId: subscription.id,
    });

    const { keyId } = getRazorpayCredentials();
    return { subscriptionId: subscription.id, razorpayKeyId: keyId };
  } catch (err) {
    if (err instanceof AppError) throw err;
    logPayment('subscription.create.failure', { userId, planType, error: String(err) });
    throw new AppError(500, 'Failed to create subscription');
  }
}

export async function verifyPayment(userId: string, input: VerifyPaymentInput) {
  const { razorpay_subscription_id, razorpay_payment_id, razorpay_signature, planType } = input;

  logPayment('subscription.verify.attempt', {
    userId,
    planType,
    razorpaySubscriptionId: razorpay_subscription_id,
  });

  if (!razorpay_subscription_id || !razorpay_payment_id || !razorpay_signature) {
    throw new AppError(400, 'Missing required payment fields');
  }
  if (!planType || !VALID_PLAN_TYPES.includes(planType)) {
    throw new AppError(400, 'Invalid plan type');
  }
  if (!hasRazorpayCredentials()) throw new AppError(500, 'Payment gateway not configured');

  // 1. Verify Razorpay HMAC signature
  if (!verifyPaymentSignature(razorpay_payment_id, razorpay_subscription_id, razorpay_signature)) {
    logPayment('subscription.verify.signature_invalid', {
      userId,
      razorpaySubscriptionId: razorpay_subscription_id,
    });
    throw new AppError(400, 'Invalid payment signature');
  }

  // 2. Cross-verify with Razorpay API. Never activate on the signature alone.
  let rzpSubscription: RzpSubscription;
  try {
    rzpSubscription = await fetchRazorpaySubscription(razorpay_subscription_id);
  } catch {
    logPayment('subscription.verify.failure', {
      userId,
      razorpaySubscriptionId: razorpay_subscription_id,
      error: 'Razorpay API fetch failed',
    });
    throw new AppError(
      502,
      'Payment received but we could not confirm it with Razorpay. Please use Restore Subscription on the pricing page in a few minutes.',
      { recoverable: true },
    );
  }

  if (!RAZORPAY_VALID_VERIFY_STATUSES.includes(rzpSubscription.status as never)) {
    logPayment('subscription.verify.razorpay_not_active', {
      userId,
      razorpaySubscriptionId: razorpay_subscription_id,
      razorpayStatus: rzpSubscription.status,
    });
    throw new AppError(
      400,
      `Subscription is not active on Razorpay (status: ${rzpSubscription.status})`,
    );
  }

  // 3. Duplicate — already active for this subscription id
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
    return { success: true, message: 'Subscription already active' };
  }

  // 4. Activate — plan type comes from Razorpay, not the client
  let activated: Awaited<ReturnType<typeof activateSubscription>>;
  try {
    activated = await activateSubscription(userId, rzpSubscription, existing?.pendingPlanType);
  } catch (err) {
    if (err instanceof AppError) throw err;
    logPayment('subscription.verify.db_failure', {
      userId,
      razorpaySubscriptionId: razorpay_subscription_id,
      error: String(err),
    });
    throw new AppError(
      500,
      'Payment verified but failed to activate subscription. Please use Restore Subscription on the pricing page.',
      { recoverable: true },
    );
  }

  logPayment('subscription.verify.success', {
    userId,
    planType: activated.planType,
    razorpaySubscriptionId: razorpay_subscription_id,
    currentPeriodEnd: activated.currentPeriodEnd.toISOString(),
  });

  return { success: true, message: 'Subscription activated!' };
}

async function activateSubscription(
  userId: string,
  rzpSub: RzpSubscription,
  pendingPlanType?: string,
) {
  // Subscriptions are always created with notes.userId, so this binds a payment to its buyer.
  if (rzpSub.notes?.userId !== userId) {
    logPayment('subscription.ownership_mismatch', { userId, razorpaySubscriptionId: rzpSub.id });
    throw new AppError(403, 'This subscription belongs to a different account.');
  }
  const linkedElsewhere = await Subscription.exists({
    razorpaySubscriptionId: rzpSub.id,
    userId: { $ne: userId },
    plan: 'premium',
  });
  if (linkedElsewhere) {
    logPayment('subscription.ownership_mismatch', { userId, razorpaySubscriptionId: rzpSub.id });
    throw new AppError(409, 'This subscription is already linked to another account.');
  }

  const planType: PlanType =
    rzpSub.plan_id === getPlanId('yearly')
      ? 'yearly'
      : rzpSub.plan_id === getPlanId('monthly')
        ? 'monthly'
        : ((rzpSub.notes?.planType as PlanType | undefined) ??
          (pendingPlanType as PlanType | undefined) ??
          'monthly');

  const currentPeriodStart = rzpSub.current_start
    ? new Date(rzpSub.current_start * 1000)
    : new Date();
  const rzpPeriodEnd = rzpSub.current_end ? new Date(rzpSub.current_end * 1000) : null;
  const now = new Date();
  const currentPeriodEnd =
    rzpPeriodEnd && rzpPeriodEnd > now
      ? rzpPeriodEnd
      : planType === 'yearly'
        ? addYears(new Date(), 1)
        : addMonths(new Date(), 1);

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

export async function restoreSubscription(userId: string, manualSubscriptionId?: string) {
  if (!hasRazorpayCredentials()) throw new AppError(500, 'Payment gateway not configured');

  logPayment('subscription.restore.attempt', { userId, manualSubscriptionId });

  const now = new Date();
  const existing = await Subscription.findOne({ userId });

  if (
    existing?.plan === 'premium' &&
    existing?.status === 'active' &&
    existing?.currentPeriodEnd &&
    existing.currentPeriodEnd > now
  ) {
    logPayment('subscription.restore.already_active', { userId });
    return { alreadyActive: true, message: 'Subscription is already active' };
  }

  try {
    let rzpSub: RzpSubscription | null = null;

    // Strategy 0: user-provided subscription id
    if (manualSubscriptionId) {
      try {
        const fetched = await fetchRazorpaySubscription(manualSubscriptionId);
        logPayment('subscription.restore.attempt', {
          userId,
          razorpaySubscriptionId: manualSubscriptionId,
          razorpayStatus: fetched.status,
        });
        if (RAZORPAY_PAID_STATUSES.includes(fetched.status as never)) {
          rzpSub = fetched;
        } else {
          throw new AppError(
            400,
            `Subscription found but status is "${fetched.status}". Payment may not have completed yet.`,
          );
        }
      } catch (err) {
        if (err instanceof AppError) throw err;
        throw new AppError(
          404,
          'Could not find a Razorpay subscription with that ID. Please check and try again.',
        );
      }
    }

    // Strategy 1: subscription id saved at create time
    if (!rzpSub && existing?.razorpaySubscriptionId) {
      try {
        const fetched = await fetchRazorpaySubscription(existing.razorpaySubscriptionId);
        if (RAZORPAY_PAID_STATUSES.includes(fetched.status as never)) rzpSub = fetched;
      } catch {
        // fall through
      }
    }

    // Strategy 2: search Razorpay by userId in notes
    if (!rzpSub) {
      const allSubs = await listRazorpaySubscriptions(100);
      const byUserId = allSubs.filter(
        (s) => s.notes?.userId === userId && RAZORPAY_PAID_STATUSES.includes(s.status as never),
      );
      if (byUserId.length > 0) {
        rzpSub = byUserId.sort((a, b) => (b.current_start ?? 0) - (a.current_start ?? 0))[0];
      }
    }

    if (!rzpSub) {
      logPayment('subscription.restore.not_found', { userId });
      throw new AppError(
        404,
        'We could not automatically find your subscription. ' +
          'Please enter your Razorpay Subscription ID from your payment receipt email to restore manually.',
        { notFound: true },
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

    return {
      success: true,
      message: 'Subscription restored!',
      planType,
      validUntil: currentPeriodEnd.toISOString(),
    };
  } catch (err) {
    if (err instanceof AppError) throw err;
    logPayment('subscription.restore.failure', { userId, error: String(err) });
    throw new AppError(500, 'Failed to restore subscription. Please try again.');
  }
}
