import type { PlanType } from '../utils/constants.js';

export interface SubscriptionStatusResponse {
  isPremium: boolean;
  plan: 'free' | 'premium';
  status: 'active' | 'cancelled' | 'expired' | 'pending_payment';
  currentPeriodEnd?: Date;
}

/** Shape of a Razorpay subscription object we depend on. */
export interface RzpSubscription {
  id: string;
  status: string;
  plan_id?: string;
  current_start?: number;
  current_end?: number;
  notes?: Record<string, string>;
}

export interface VerifyPaymentInput {
  razorpay_subscription_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  planType: PlanType;
}
