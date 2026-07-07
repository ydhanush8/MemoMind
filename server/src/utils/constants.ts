export const LIMITS = {
  TITLE_MAX: 200,
  UNDERSTANDING_MAX: 10_000,
  DAILY_NOTE_LIMIT: 100,
  ANALYZE_DAILY_LIMIT: 50,
  PRACTICE_DAILY_GOAL: 2,
} as const;

export const VALID_PLAN_TYPES = ['monthly', 'yearly'] as const;
export type PlanType = (typeof VALID_PLAN_TYPES)[number];

// Razorpay statuses that mean payment has been received / is usable.
export const RAZORPAY_VALID_VERIFY_STATUSES = ['active', 'authenticated', 'created'] as const;
export const RAZORPAY_PAID_STATUSES = ['active', 'authenticated', 'completed'] as const;

export const CRON = {
  // 03:30 UTC == 09:00 IST — identical to the original vercel.json schedule.
  DAILY_REMINDER_SCHEDULE: '30 3 * * *',
  DAILY_REMINDER_TITLE: 'Good morning — time to review',
  DAILY_REMINDER_BODY: 'Kickstart your day with a quick 5-min review.',
  BATCH_SIZE: 50,
} as const;
