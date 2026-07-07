import { VALID_PLAN_TYPES, type PlanType } from '../utils/constants.js';

export function validateCreateSubscription(body: unknown): string | null {
  const b = (body ?? {}) as { planType?: string };
  if (!b.planType || !VALID_PLAN_TYPES.includes(b.planType as PlanType)) {
    return 'Invalid plan type. Must be monthly or yearly.';
  }
  return null;
}
