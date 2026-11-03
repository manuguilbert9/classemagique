import type { HomeworkAnswerReview, HomeworkPlan, HomeworkSubject } from './homework-plan';
import { mathsForPlan } from './homework-period';

const spellingText = (text: string) => text.normalize('NFC').toLocaleLowerCase('fr').replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim().replace(/[.!?]+$/, '').trim();
const plain = (text: string) => spellingText(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export function homeworkQuestion(plan: HomeworkPlan, subject: HomeworkSubject, id: string) {
  if (subject === 'spelling' && /^word-\d+$/.test(id)) {
    const index = Number(id.slice(5));
    const answer = plan.spelling?.words[index];
    if (answer === undefined) throw new Error('Mot introuvable.');
    return { prompt: `Écris le mot ou le groupe de mots ${index + 1}.`, answer, hint: 'Écoute le mot. Pense aux accents et aux lettres de la fin.', word: true };
  }
  const activity = subject === 'maths' ? mathsForPlan(plan) : plan[subject];
  const question = /^question-\d+$/.test(id) ? activity?.questions[Number(id.slice(9))] : undefined;
  if (!question) throw new Error('Question introuvable.');
  return { ...question, word: false };
}
export function homeworkQuestionKey(plan: HomeworkPlan, subject: HomeworkSubject, id: string) {
  const q = homeworkQuestion(plan, subject, id);
  return JSON.stringify([subject, id, q.prompt, q.answer]);
}

// Only grade expressions whose entire text has been understood; never extract a
// number from an otherwise unknown sentence (or use eval on a pupil's answer).
function expression(text: string): number | undefined {
  if (/\d\s+\d/.test(text)) return;
  const compact = text.replace(/\s/g, '').replace(/,/g, '.').replace(/[×x]/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
  if (!/^\d+(?:\.\d+)?(?:[+*/-]\d+(?:\.\d+)?)*$/.test(compact)) return;
  const parts = compact.match(/\d+(?:\.\d+)?|[+*/-]/g)!;
  let total = 0, term = Number(parts[0]);
  for (let i = 1; i < parts.length; i += 2) {
    const n = Number(parts[i + 1]);
    if (parts[i] === '*') term *= n;
    else if (parts[i] === '/') term /= n;
    else { total += term; term = parts[i] === '+' ? n : -n; }
  }
  const result = total + term;
  return Number.isFinite(result) ? result : undefined;
}
function quantity(text: string): Record<string, number> | undefined {
  const values: Record<string, number> = {};
  let found = false, duplicate = false;
  const rest = plain(text).replace(/(\d+)\s*(centaines?|dizaines?|unites?|[cdu])\b/g, (_, n: string, unit: string) => {
    const key = unit[0];
    if (values[key] !== undefined) duplicate = true;
    values[key] = Number(n); found = true; return '';
  }).replace(/\bet\b|[,;+\s]/g, '');
  return found && !duplicate && !rest ? values : undefined;
}
function scalar(text: string): { value: number; unit: string } | undefined {
  const normalized = plain(text).replace(/(?<=\d)[ \u00a0\u202f](?=\d{3}(?:\D|$))/g, '');
  const match = normalized.match(/^(\d+(?:[,.]\d+)?)\s*(jetons?|cartes?|places?|instruments?|billets?|sachets?(?: de nourriture)?|decorations?|etoiles?|cm|km|milliers? entiers?|lots? complets?)?$/);
  if (!match) return;
  return { value: Number(match[1].replace(',', '.')), unit: (match[2] ?? '').replace(/s\b/g, '') };
}
function mathVerdict(expected: string, answer: string): 'correct' | 'retry' | 'compare' {
  const q = quantity(expected);
  if (q) {
    const actual = quantity(answer);
    if (!actual) return 'compare';
    return [...new Set([...Object.keys(q), ...Object.keys(actual)])].every(k => (q[k] ?? 0) === (actual[k] ?? 0)) ? 'correct' : 'retry';
  }
  const target = scalar(expected);
  if (target) {
    const actual = scalar(answer);
    if (actual && (!actual.unit || actual.unit === target.unit)) return actual.value === target.value ? 'correct' : 'retry';
    const sides = plain(answer).split('=');
    const values = sides.map(expression);
    if (sides.length <= 2 && values.every(v => v !== undefined)) return values.every(v => v === target.value) ? 'correct' : 'retry';
  }
  return 'compare';
}

export function checkHomeworkAnswer(plan: HomeworkPlan, subject: HomeworkSubject, id: string, answer: string) {
  const question = homeworkQuestion(plan, subject, id);
  let outcome: 'empty' | 'correct' | 'retry' | 'compare';
  if (!answer.trim()) outcome = 'empty';
  else if (question.word) outcome = spellingText(answer) === spellingText(question.answer) ? 'correct' : 'retry';
  else if (plain(answer) === plain(question.answer)) outcome = 'correct';
  else if (subject === 'maths') outcome = mathVerdict(question.answer, answer);
  else if (subject === 'reading' && plain(question.answer) === 'son papa' && ['son pere', 'papa', 'le papa de lila', 'le pere de lila'].includes(plain(answer))) outcome = 'correct';
  else outcome = 'compare';
  return { outcome, model: question.answer, hint: question.hint };
}
export function recordHomeworkCheck(plan: HomeworkPlan, subject: HomeworkSubject, id: string, answer: string, previous?: HomeworkAnswerReview): HomeworkAnswerReview {
  const checkedAnswer = answer.trim();
  const check = checkHomeworkAnswer(plan, subject, id, checkedAnswer);
  if (check.outcome === 'empty') throw new Error('Écris une réponse avant de la valider.');
  const questionKey = homeworkQuestionKey(plan, subject, id);
  const history = previous?.questionKey === questionKey ? previous.attempts : [];
  // Keep the first attempt and the latest 19, including after reopening a session.
  const attempts = [...history, { answer: checkedAnswer, outcome: check.outcome }];
  return { checkedAnswer, questionKey, outcome: check.outcome, attempts: attempts.length > 20 ? [attempts[0], ...attempts.slice(-19)] : attempts, correctionSeen: check.outcome === 'compare' || (previous?.questionKey === questionKey && previous.correctionSeen) || false };
}
export function homeworkReviewCurrent(plan: HomeworkPlan, subject: HomeworkSubject, id: string, answer: string, review?: HomeworkAnswerReview): boolean {
  if (!review || review.checkedAnswer !== answer.trim()) return false;
  // Historical responses may refer to a question the teacher has since removed.
  try { return review.questionKey === homeworkQuestionKey(plan, subject, id); }
  catch { return false; }
}
export function homeworkReviewResolved(plan: HomeworkPlan, subject: HomeworkSubject, id: string, answer: string, review?: HomeworkAnswerReview): boolean {
  return homeworkReviewCurrent(plan, subject, id, answer, review) && ['correct', 'self-reviewed', 'to-review'].includes(review!.outcome);
}
export const HOMEWORK_REVIEW_LABELS: Record<HomeworkAnswerReview['outcome'], string> = {
  correct: 'Réponse validée', retry: 'Nouvel essai demandé', compare: 'Comparaison en cours', 'self-reviewed': 'Relue et confirmée par l’élève', 'to-review': 'À reprendre avec le maître',
};
