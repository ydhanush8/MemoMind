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

interface PaymentLogPayload {
  userId?: string;
  planType?: string;
  razorpaySubscriptionId?: string;
  razorpayStatus?: string;
  currentPeriodEnd?: string;
  error?: string;
  [key: string]: string | number | boolean | undefined;
}

export function logPayment(event: PaymentEvent, payload: PaymentLogPayload = {}) {
  // Never log secrets, keys, or raw signatures
  const safe: PaymentLogPayload = { ...payload };
  delete safe.signature;
  delete safe.key;
  delete safe.secret;

  const entry = {
    ts: new Date().toISOString(),
    event,
    ...safe,
  };

  console.log(`[PAYMENT] ${JSON.stringify(entry)}`);
}
