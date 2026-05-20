import { z } from 'zod';
import { passeComposeFlow } from '@/ai/flows/passe-compose-flow';
import type { PasseComposeSettings, Question } from './questions';

export async function generatePasseComposeQuestions(
  settings: PasseComposeSettings,
  count: number
): Promise<Question[]> {
  const result = await passeComposeFlow({
    auxiliaries: settings.auxiliaries,
    groups: settings.groups,
    theme: settings.theme,
    count,
  });

  if (!result || !result.questions) {
    throw new Error('Failed to generate questions');
  }

  return result.questions.map((q: any, index: number) => ({
    id: Date.now() + index,
    level: 'B',
    type: settings.answerMode === 'qcm' ? 'qcm' : 'text-input',
    question: q.sentence,
    options: settings.answerMode === 'qcm' ? q.options : undefined,
    answer: q.answer,
    verbHint: settings.answerMode === 'text' ? q.infinitive : undefined,
    passeComposeSettings: settings,
  }));
}
