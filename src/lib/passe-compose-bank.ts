export interface ReviewedPasseCompose { sentence: string; infinitive: string; answer: string; options: string[]; auxiliary: 'avoir' | 'etre'; group: '1er' | '2eme' | '3eme'; level: 'B' | 'C' | 'D' }
// Conjugaisons relues, utilisées sans dépendre d'une génération linguistique.
const verbs: Array<[string, string, string, 'avoir' | 'etre', '1er' | '2eme' | '3eme', string]> = [
 ['manger', 'mangé', 'mangés', 'avoir', '1er', 'à la cantine'],
 ['jouer', 'joué', 'joués', 'avoir', '1er', 'dans la cour'],
 ['finir', 'fini', 'finis', 'avoir', '2eme', 'le travail'],
 ['choisir', 'choisi', 'choisis', 'avoir', '2eme', 'un livre'],
 ['prendre', 'pris', 'pris', 'avoir', '3eme', 'le train'],
 ['faire', 'fait', 'faits', 'avoir', '3eme', 'un dessin'],
 ['arriver', 'arrivé', 'arrivées', 'etre', '1er', 'à la maison'],
 ['tomber', 'tombé', 'tombées', 'etre', '1er', 'dans la cour'],
 ['partir', 'parti', 'parties', 'etre', '3eme', 'en voyage'],
 ['venir', 'venu', 'venues', 'etre', '3eme', 'à la fête'],
];
export const PASSE_COMPOSE_BANK: ReviewedPasseCompose[] = verbs.flatMap(([infinitive, singular, plural, auxiliary, group, complement]) => (['B', 'C', 'D'] as const).map(level => {
 const avoir = auxiliary === 'avoir';
 const answer = level === 'B' ? `${avoir ? 'a' : 'est'} ${singular}` : `${avoir ? 'ont' : 'sont'} ${avoir ? singular : plural}`;
 const subject = level === 'B' ? 'Il' : level === 'C' ? 'Elles' : 'Les filles de notre classe';
 const sentence = `${subject} _____ ${complement}${level === 'D' ? ', après la sortie organisée par notre école' : ''}.`;
 return { sentence, infinitive, answer, options: [answer, `${level === 'B' ? (avoir ? 'est' : 'a') : (avoir ? 'sont' : 'ont')} ${singular}`, `${level === 'B' ? 'a' : 'ont'} ${infinitive}`], auxiliary, group, level };
}));
export function validPasseComposeQuestion(q: { sentence: string; answer: string; options: string[] }): boolean {
 const parts = q.sentence.split('_____');
 const participle = q.answer.trim().split(/\s+/).at(-1);
 return parts.length === 2 && q.options.length === 3 && new Set(q.options).size === 3 && q.options.includes(q.answer) && q.answer.trim().split(/\s+/).length >= 2 && !!participle && !parts.join(' ').split(/[^\p{L}]+/u).includes(participle) && !/\b(se|me|te|nous|vous)\s*$/.test(parts[0].trim());
}
