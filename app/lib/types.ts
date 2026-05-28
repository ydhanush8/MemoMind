export interface Note {
  _id: string;
  userId?: string;
  title: string;
  understanding: string;
  createdAt: string;
  updatedAt?: string;
  analysis?: AnalysisResponse;
  lastReviewedAt?: string | null;
  reviewCount?: number;
}

export interface QuizQuestion {
  q: string;
  answer: string;
}

export interface AnalysisResponse {
  cleaned_explanation: string;
  key_points_understood: string[];
  missing_or_unclear_points: string[];
  simple_summary: string;
  difficulty: string;
  accuracy_score: number;
  next_concepts_to_learn: string[];
  quick_quiz: QuizQuestion[];
}

export interface AnalysisRequest {
  title: string;
  understanding: string;
}

export interface SubscriptionStatus {
  isPremium: boolean;
  plan: 'free' | 'premium';
  status: 'active' | 'cancelled' | 'expired';
  currentPeriodEnd?: string;
}

export interface PracticeStatus {
  completed: boolean;
  reviewedToday: number;
  totalNotes: number;
  notesNeedingReview: number;
}

export interface NotificationStatus {
  subscribed: boolean;
  enabled?: boolean;
  preferredTime?: string;
  notificationTypes?: {
    dailyReminder: boolean;
    streakWarning: boolean;
  };
}
