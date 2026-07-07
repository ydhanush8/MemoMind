import { createRazorpayClient, getRazorpayCredentials, getPlanId } from '../config/razorpay.js';
import { verifyRazorpaySignature } from '../utils/encryption.js';
import { AppError } from '../utils/appError.js';
import { logger } from '../utils/logger.js';
import type { PlanType } from '../utils/constants.js';
import type { RzpSubscription } from '../types/subscription.types.js';

type PaymentEvent =
  | 'subscription.create.attempt'
  | 'subscription.create.blocked_duplicate'
  | 'subscription.create.success'
  | 'subscription.create.failure'
  | 'subscription.verify.attempt'
  | 'subscription.verify.signature_invalid'
  | 'subscription.verify.razorpay_not_active'
  | 'subscription.verify.success'
  | 'subscription.verify.duplicate'
  | 'subscription.verify.db_failure'
  | 'subscription.verify.failure'
  | 'subscription.restore.attempt'
  | 'subscription.restore.already_active'
  | 'subscription.restore.not_found'
  | 'subscription.restore.success'
  | 'subscription.restore.failure'
  | 'subscription.status.expired';

export function logPayment(event: PaymentEvent, payload: Record<string, unknown> = {}): void {
  const safe = { ...payload };
  delete safe.signature;
  delete safe.key;
  delete safe.secret;
  logger.info({ event, ...safe }, `[PAYMENT] ${event}`);
}

export { getRazorpayCredentials, getPlanId };

export function hasRazorpayCredentials(): boolean {
  const { keyId, keySecret } = getRazorpayCredentials();
  return Boolean(keyId && keySecret);
}

export function verifyPaymentSignature(
  paymentId: string,
  subscriptionId: string,
  signature: string,
): boolean {
  const { keySecret } = getRazorpayCredentials();
  if (!keySecret) return false;
  return verifyRazorpaySignature(keySecret, paymentId, subscriptionId, signature);
}

function client() {
  const c = createRazorpayClient();
  if (!c) throw new AppError(500, 'Payment gateway not configured');
  return c;
}

export async function createRazorpaySubscription(
  planId: string,
  planType: PlanType,
  userId: string,
): Promise<RzpSubscription> {
  const created = await client().subscriptions.create({
    plan_id: planId,
    customer_notify: 1,
    total_count: planType === 'monthly' ? 12 : 1,
    notes: { userId, planType },
  });
  return created as unknown as RzpSubscription;
}

export async function fetchRazorpaySubscription(id: string): Promise<RzpSubscription> {
  const fetched = await client().subscriptions.fetch(id);
  return fetched as unknown as RzpSubscription;
}

export async function listRazorpaySubscriptions(count = 100): Promise<RzpSubscription[]> {
  const result = (await client().subscriptions.all({ count })) as { items?: RzpSubscription[] };
  return result?.items ?? [];
}
