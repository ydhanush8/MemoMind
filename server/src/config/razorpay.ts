import Razorpay from 'razorpay';
import { env } from './env.js';

export function getRazorpayCredentials(): { keyId?: string; keySecret?: string } {
  return { keyId: env.RAZORPAY_KEY_ID, keySecret: env.RAZORPAY_KEY_SECRET };
}

export function getPlanId(planType: 'monthly' | 'yearly'): string | undefined {
  return planType === 'monthly' ? env.RAZORPAY_PLAN_ID_MONTHLY : env.RAZORPAY_PLAN_ID_YEARLY;
}

/** Returns a configured client, or null when credentials are missing. */
export function createRazorpayClient(): Razorpay | null {
  const { keyId, keySecret } = getRazorpayCredentials();
  if (!keyId || !keySecret) return null;
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}
