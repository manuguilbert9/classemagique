import type { ActivityResult } from '../components/progressive/types';
import type { ScoreDetail } from '../services/scores';

/** Une manche n'est terminée qu'après toutes ses étapes, même après correction. */
export function summarizeActivityResults(results: ActivityResult[]) {
  const correct = results.filter(result => result.mistakes.length === 0).length;
  return { correct, corrected: results.length - correct, total: results.length,
    score: results.length ? Math.round(correct / results.length * 100) : 0 };
}

export function activityDetail(question: string, result: ActivityResult): ScoreDetail {
  return { question, userAnswer: result.answer, correctAnswer: result.expected,
    status: result.mistakes.length ? 'corrected' : 'correct', mistakes: [...result.mistakes] };
}
