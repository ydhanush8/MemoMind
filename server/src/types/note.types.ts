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

export interface CreateNoteInput {
  title: string;
  understanding: string;
  analysis?: AnalysisResponse | null;
}

export interface UpdateNoteInput {
  title?: string;
  understanding?: string;
  analysis?: AnalysisResponse | null;
}

export interface PracticeStatus {
  completed: boolean;
  reviewedToday: number;
  totalNotes: number;
  notesNeedingReview: number;
}
