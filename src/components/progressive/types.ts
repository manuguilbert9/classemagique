export interface ActivityResult {
  answer: string;
  expected: string;
  mistakes: string[];
  reviewSpeech?: string;
}

export interface RoundProps {
  round: number;
  onComplete: (result: ActivityResult) => void;
}
