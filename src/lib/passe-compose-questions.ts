import type { PasseComposeSettings, Question } from './questions';
import { PASSE_COMPOSE_BANK, validPasseComposeQuestion } from './passe-compose-bank';
export async function generatePasseComposeQuestions(settings: PasseComposeSettings, count: number, requestedLevel: string = 'B'): Promise<Question[]> {
 const level = requestedLevel === 'D' ? 'D' : requestedLevel === 'C' ? 'C' : 'B';
 const source = PASSE_COMPOSE_BANK.filter(q => q.level === level && settings.auxiliaries.includes(q.auxiliary) && settings.groups.includes(q.group) && validPasseComposeQuestion(q));
 if (!source.length) throw new Error("Cette combinaison n'a pas de verbe relu. Choisis aussi avoir ou un autre groupe : les verbes simples du deuxième groupe se conjuguent avec avoir.");
 return Array.from({ length: count }, (_, index) => {
  const q = source[index % source.length];
  return { id: Date.now() + index, level, type: settings.answerMode === 'qcm' ? 'qcm' : 'text-input', question: q.sentence, options: settings.answerMode === 'qcm' ? [...q.options].sort(() => Math.random() - .5) : undefined, answer: q.answer, verbHint: q.infinitive, passeComposeSettings: settings };
 });
}
