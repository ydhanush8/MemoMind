// Type definitions for MemoMind

// Note stored in localStorage
export interface Note {
  id: string;
  title: string;
  understanding: string;
  createdAt: string; // ISO date string
  analysis?: AnalysisResponse; // Optional AI analysis
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
  accuracy_score: number; // Changed from string to number
  next_concepts_to_learn: string[]; // Renamed from next_concepts
  quick_quiz: QuizQuestion[]; // Renamed from quiz
}

export interface AnalysisRequest {
  title: string;
  understanding: string;
}
