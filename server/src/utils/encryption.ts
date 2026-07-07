import crypto from 'node:crypto';

export function hmacSha256Hex(secret: string, payload: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

/**
 * Verifies the Razorpay subscription signature: HMAC-SHA256 of
 * `${paymentId}|${subscriptionId}` keyed by the Razorpay secret.
 * Timing-safe comparison (behaviourally identical to the original `!==` check).
 */
export function verifyRazorpaySignature(
  secret: string,
  paymentId: string,
  subscriptionId: string,
  signature: string,
): boolean {
  const expected = hmacSha256Hex(secret, `${paymentId}|${subscriptionId}`);
  const a = Buffer.from(expected, 'utf8');
  const b = Buffer.from(signature, 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
