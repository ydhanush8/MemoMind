// Analytics helper functions for PostHog tracking
import posthog from 'posthog-js';

// Check if PostHog is available (client-side only)
const isPostHogAvailable = (): boolean => {
  return typeof window !== 'undefined' && !!posthog && posthog.__loaded;
};

// ==================== USER IDENTIFICATION ====================

/**
 * Identify user with Clerk ID (privacy-safe, no PII)
 * Call this after user signs in/up
 */
export const identifyUser = (userId: string, properties?: {
  isPremium?: boolean;
  createdAt?: Date;
}) => {
  if (!isPostHogAvailable()) return;

  posthog.identify(userId, {
    premium: properties?.isPremium || false,
    account_created: properties?.createdAt?.toISOString(),
  });
};

/**
 * Reset user identification on sign out
 */
export const resetUser = () => {
  if (!isPostHogAvailable()) return;
  posthog.reset();
};

// ==================== CUSTOM PRODUCT EVENTS ====================

/**
 * Track when a user creates a note
 */
export const trackNoteCreated = (noteId: string) => {
  if (!isPostHogAvailable()) return;

  posthog.capture('note_created', {
    note_id: noteId,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Track when a user uses AI analysis (premium feature)
 */
export const trackAIAnalysisUsed = (data?: {
  noteId?: string;
  topic?: string;
  accuracyScore?: number;
}) => {
  if (!isPostHogAvailable()) return;

  posthog.capture('ai_analysis_used', {
    note_id: data?.noteId,
    topic: data?.topic,
    accuracy_score: data?.accuracyScore,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Track when a user starts daily practice (premium feature)
 */
export const trackPracticeStarted = (noteId?: string) => {
  if (!isPostHogAvailable()) return;

  posthog.capture('daily_practice_started', {
    note_id: noteId,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Track when a user upgrades to premium
 */
export const trackSubscriptionStarted = (data: {
  planType: 'monthly' | 'yearly';
  amount: number;
  currency: 'INR' | 'USD';
}) => {
  if (!isPostHogAvailable()) return;

  posthog.capture('subscription_started', {
    plan_type: data.planType,
    amount: data.amount,
    currency: data.currency,
    timestamp: new Date().toISOString(),
  });

  // Update user properties
  posthog.setPersonProperties({
    premium: true,
    plan_type: data.planType,
    subscription_started_at: new Date().toISOString(),
  });
};

/**
 * Track when a user cancels subscription
 */
export const trackSubscriptionCancelled = (data?: {
  planType?: 'monthly' | 'yearly';
  reason?: string;
}) => {
  if (!isPostHogAvailable()) return;

  posthog.capture('subscription_cancelled', {
    plan_type: data?.planType,
    cancellation_reason: data?.reason,
    timestamp: new Date().toISOString(),
  });

  // Update user properties
  posthog.setPersonProperties({
    premium: false,
    subscription_cancelled_at: new Date().toISOString(),
  });
};

/**
 * Track when a user completes their daily streak
 */
export const trackStreakCompleted = (streakDays: number) => {
  if (!isPostHogAvailable()) return;

  posthog.capture('streak_completed', {
    streak_days: streakDays,
    timestamp: new Date().toISOString(),
  });

  // Update user properties
  posthog.setPersonProperties({
    current_streak: streakDays,
    longest_streak: streakDays, // This should be max of current and previous longest
  });
};

// ==================== PAGE VIEW TRACKING ====================

/**
 * Manually track a page view (usually automatic)
 */
export const trackPageView = (pageName?: string) => {
  if (!isPostHogAvailable()) return;

  posthog.capture('$pageview', {
    page_name: pageName,
  });
};

// ==================== FEATURE FLAGS ====================

/**
 * Get feature flag value (for A/B testing)
 */
export const getFeatureFlag = (flagKey: string): boolean | string => {
  if (!isPostHogAvailable()) return false;
  return posthog.getFeatureFlag(flagKey) || false;
};

/**
 * Check if feature is enabled
 */
export const isFeatureEnabled = (flagKey: string): boolean => {
  if (!isPostHogAvailable()) return false;
  return posthog.isFeatureEnabled(flagKey) || false;
};

// ==================== EXPORT PostHog INSTANCE ====================

export { posthog };
