
'use server';
import type { Question } from './questions';
import { ORAL_ATTACK_WORDS } from './oral-attack-data';
export async function generateSyllabeAttaqueQuestion(): Promise<Question> {
 const bank = ORAL_ATTACK_WORDS.filter(item => item.image);
 const correct = bank[Math.floor(Math.random() * bank.length)];
 const distractors = bank.filter(item => item.syllable !== correct.syllable && item.word !== correct.word).sort(() => Math.random() - .5).slice(0, 2);
 return { id: Date.now(), level: 'A', type: 'image-qcm', question: "Clique sur l'image qui commence par la syllabe :", syllable: correct.syllable, answer: correct.word,
 imageOptions: [correct, ...distractors].sort(() => Math.random() - .5).map(item => ({src: item.image, alt: item.word, value: item.word, hint: item.word})) };
}
