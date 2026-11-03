import type { HomeworkActivity, HomeworkPlan, HomeworkProfile, HomeworkSubject } from './homework-plan';
import { HOMEWORK_MATHS, mathsRevision } from '../data/homework-maths-p2';
import { mathsForPlan } from './homework-period';

export type HomeworkSupport =
  | { kind: 'number-line'; min: number; max: number; start?: number; instruction: string; unit?: string }
  | { kind: 'place-value'; columns: string[]; rows: string[]; instruction: string }
  | { kind: 'counters'; groups: number; max: number; instruction: string }
  | { kind: 'fraction'; parts: number; instruction: string };
export interface HomeworkAid { hint: string; checks: string[]; context?: string; support?: HomeworkSupport }

// Match by content, never by pupil level alone. This also supplies revised hints
// to already-published P2 questions without replacing teachers' edited questions.
const referenceQuestions = [
  ...Object.values(HOMEWORK_MATHS).flat(2),
  ...(['B-', 'B', 'B+', 'C'] as HomeworkProfile[]).flatMap(p => Array.from({ length: 7 }, (_, i) => mathsRevision(p, i + 8))),
].flatMap(a => a.questions);
const replacedLegacyHints = new Set([
  '5 dizaines et 2 unités valent autant que 4 dizaines et 12 unités.',
  'Utilise l’échange : 12 − 6, puis 4 − 2 et 3 − 1.',
  'Sépare 204 et 006.',
  'Recompte ou calcule 9 + 3.',
  'Dix groupes de 23 font 23 dizaines.',
  '34 dizaines.', '34 centaines.', '26 dizaines.',
  'Chaque intervalle représente un quart de l’unité.',
  'Avance de trois quarts à partir de zéro.',
  'Deux parts sur quatre forment un des deux groupes égaux.',
  'Les quatre parts doivent avoir la même taille.',
]);
const numbers = (text: string) => (text.replace(/(?<=\d)[ \u00a0\u202f](?=\d{3}(?:\D|$))/g, '').match(/\d+/g) ?? []).map(Number);
const columns = (max: number) => ['Centaines de milliers', 'Dizaines de milliers', 'Milliers', 'Centaines', 'Dizaines', 'Unités'].slice(-Math.max(2, Math.min(6, String(Math.floor(max)).length)));

function mathsAid(activity: HomeworkActivity, index: number): HomeworkAid {
  const q = activity.questions[index];
  const previous = activity.questions[index - 1];
  const reference = referenceQuestions.find(r => r.prompt === q.prompt && r.answer === q.answer);
  const hint = reference && replacedLegacyHints.has(q.hint) ? reference.hint : q.hint;
  const operation = q.prompt.match(/^Combien font (\d+) ([+−×]) (\d+) \?$/);
  const ownNumbers = numbers(q.prompt);
  const context = index > 0 && (!ownNumbers.length || /^(On |Vérifie|Comment|Combien de jetons)/.test(q.prompt)) ? previous?.prompt : undefined;
  const given = numbers(`${context ?? ''} ${q.prompt}`);
  let support: HomeworkSupport | undefined;
  const checks = ['Ai-je utilisé les nombres de la consigne ?', 'Puis-je expliquer ma démarche ou la vérifier autrement ?'];
  if (operation) {
    const a = Number(operation[1]), sign = operation[2], b = Number(operation[3]);
    if (sign !== '×' && Math.max(a, b) <= 100 && b <= 20 && (sign === '+' || a >= b)) {
      const end = sign === '+' ? a + b : a - b;
      support = { kind: 'number-line', min: Math.max(0, Math.floor(Math.min(a, end) / 10) * 10 - (Math.min(a, end) % 10 === 0 ? 10 : 0)), max: Math.ceil(Math.max(a, end) / 10) * 10 + (Math.max(a, end) % 10 === 0 ? 10 : 0), start: a,
        instruction: `Pars de ${a}. ${sign === '+' ? 'Avance' : 'Recule'} de ${b} ${b === 1 ? 'case' : 'cases'}. Pointe toi-même la case d’arrivée.` };
    } else {
      support = { kind: 'place-value', columns: columns(sign === '×' ? Math.max(a, b) * Math.min(b, 100) : Math.max(a, b)), rows: [`Départ : ${a}`, `Après ${sign} ${b}`], instruction: `Place toi-même les chiffres de ${a}. Puis cherche ce qui change quand tu ${sign === '+' ? `ajoutes ${b}` : sign === '−' ? `retires ${b}` : `prends ${b} groupes de ce nombre`}. Le tableau reste à compléter.` };
    }
    checks[0] = sign === '+' ? 'Ai-je ajouté la quantité demandée ?' : sign === '−' ? 'Ai-je retiré la quantité demandée ?' : 'Ai-je pris le bon nombre de groupes ?';
  } else if (/milliers|centaines|dizaines|unités|[Dd]écompose|[Cc]ompare.*nombres|nombre est le plus grand/.test(q.prompt) && given.length) {
    support = { kind: 'place-value', columns: columns(Math.max(...given)), rows: [...new Set(given)].slice(0, 3).map(n => `Nombre : ${n}`), instruction: 'Place toi-même les chiffres, en commençant par les unités à droite. Une case vide n’est pas un chiffre : pense aux zéros.' };
    checks[0] = 'Ai-je bien distingué le chiffre d’une position et le nombre de groupes entiers ?';
  } else if (/parts égales|intervalles égaux/.test(`${context ?? ''} ${q.prompt}`)) {
    const match = `${context ?? ''} ${q.prompt}`.match(/(?:en |parmi les )(\d+|quatre|trois) (?:parts égales|intervalles égaux)/);
    const parts = match ? ({ quatre: 4, trois: 3 }[match[1]] ?? Number(match[1])) : 0;
    if (parts >= 2 && parts <= 12) support = { kind: 'fraction', parts, instruction: 'Cette bande représente une unité. Colorie toi-même les parts indiquées dans la consigne, puis cherche comment nommer la partie coloriée.' };
  } else if (/jetons|collection|cartes|places|billets|instruments|étoiles/.test(`${context ?? ''} ${q.prompt}`) && given.length && Math.max(...given) <= 30) {
    const groups = /entre 3 personnes/.test(q.prompt) ? 3 : /deux|autant|réunit|réunis|groupe|compare|manque|libres/.test(`${context ?? ''} ${q.prompt}`) ? 2 : 1;
    support = { kind: 'counters', groups, max: Math.max(20, Math.min(60, Math.max(...given) * 2)), instruction: 'Prépare toi-même les quantités de la consigne. Déplace, ajoute ou retire les jetons selon la question, puis compte-les. Aucun total n’est affiché.' };
  } else if (/cm|centimètres/.test(`${context ?? ''} ${q.prompt}`) && given.length && Math.max(...given) <= 100) {
    support = { kind: 'number-line', min: 0, max: Math.ceil(Math.max(...given) / 10) * 10 + 10, unit: 'cm', instruction: 'Repère les deux longueurs de la consigne sur cette bande graduée en centimètres. Cherche ensuite l’écart entre elles.' };
  } else if (given.length && Math.max(...given) >= 100 && Math.max(...given) <= 999999) {
    support = { kind: 'place-value', columns: columns(Math.max(...given)), rows: [...new Set(given)].slice(0, 3).map(n => `Donnée : ${n}`), instruction: 'Reporte les nombres de la consigne dans ce tableau vide. Utilise leurs positions pour organiser ta recherche.' };
  }
  return { hint, checks, ...(context ? { context } : {}), ...(support ? { support } : {}) };
}

export function homeworkAid(plan: HomeworkPlan, subject: HomeworkSubject, id: string): HomeworkAid {
  if (subject === 'spelling' && /^word-\d+$/.test(id)) return { hint: 'Écoute le mot. Pense aux accents et aux lettres de la fin.', checks: ['Ai-je retrouvé tous les mots du groupe ?', 'Ai-je vérifié les accents et les marques du pluriel ?'] };
  const index = Number(id.slice(9));
  const activity = subject === 'maths' ? mathsForPlan(plan) : plan[subject];
  const q = activity?.questions[index];
  if (!q) return { hint: 'Relis la consigne avec un adulte.', checks: [] };
  if (subject === 'maths') return mathsAid(activity!, index);
  return { hint: q.hint, checks: subject === 'reading' ? ['Ai-je répondu à ce qui est demandé ?', 'Puis-je montrer dans le texte ce qui appuie ma réponse ?'] : ['Ai-je repéré le mot ou le groupe dont on parle ?', 'Ai-je expliqué la règle avec mes mots ?'] };
}
