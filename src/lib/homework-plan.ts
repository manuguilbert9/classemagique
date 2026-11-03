export type HomeworkProfile = 'B-' | 'B' | 'B+' | 'C';
export type HomeworkSubject = 'reading' | 'spelling' | 'maths';
export type HomeworkFeedbackStatus = 'alone' | 'help' | 'retry';
export interface HomeworkQuestion { prompt: string; answer: string; hint: string }
export interface HomeworkActivity {
  title: string;
  minutes: number;
  instruction: string;
  questions: HomeworkQuestion[];
}
export interface HomeworkReading extends HomeworkActivity {
  passage: string[];
  mode: 'text' | 'code';
  adultText?: string;
}
export interface HomeworkSpelling extends HomeworkActivity { words: string[] }
export interface HomeworkMaths extends HomeworkActivity {
  prerequisite?: string;
  introduced: boolean;
  fallback?: HomeworkActivity;
  tokens?: boolean;
}
export interface HomeworkProfiles {
  reading: HomeworkProfile;
  spelling: HomeworkProfile;
  maths: HomeworkProfile;
  support: 'standard' | 'syllabes';
}
export interface HomeworkPlan {
  version: 1;
  week: number;
  day: 1 | 4;
  theme: string;
  availableOn: string;
  profiles: HomeworkProfiles;
  maxMinutes: number;
  reading: HomeworkReading;
  spelling: HomeworkSpelling | null;
  maths: HomeworkMaths;
}
export interface HomeworkAnswerReview {
  checkedAnswer: string;
  questionKey: string;
  outcome: 'correct' | 'retry' | 'compare' | 'self-reviewed' | 'to-review';
  attempts: { answer: string; outcome: 'correct' | 'retry' | 'compare' }[];
  correctionSeen: boolean;
}
export interface HomeworkFeedback {
  userId: string;
  date: string;
  subject: HomeworkSubject;
  status: HomeworkFeedbackStatus;
  listened: boolean;
  usedFallback: boolean;
  updatedAt: string;
  completion?: 'draft' | 'completed';
  activityKey?: string;
  guided?: boolean;
  responses?: { id: string; prompt: string; answer: string; review?: HomeworkAnswerReview }[];
}
export const FEEDBACK_LABELS: Record<HomeworkFeedbackStatus, string> = {
  alone: 'Fait seul', help: 'Avec aide', retry: 'À reprendre',
};
