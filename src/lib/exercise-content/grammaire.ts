/**
 * Tirage des phrases des exercices de repérage (« Repérer le nom », « Repérer
 * l'adjectif »).
 *
 * Le mélange vivait dans les composants clients : il est remonté ici pour que
 * la sélection de phrases soit mémorisée et partagée entre les élèves.
 */

import { NOUN_SENTENCES } from '@/data/grammaire/nouns-sentences';
import { NOUN_PHRASES } from '@/data/grammaire/nouns-phrases';
import { ADJECTIVE_SENTENCES } from '@/data/grammaire/adjectives-sentences';
import { ADJECTIVE_PHRASES } from '@/data/grammaire/adjectives-phrases';
import type { SkillLevel } from '../skills';

export interface PhraseAReperer {
  phrase: string;
}

function melanger(phrases: string[]): string[] {
  const shuffled = [...phrases];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function tirer(source: string[], count: number): PhraseAReperer[] {
  const tirage: PhraseAReperer[] = [];
  while (tirage.length < count) {
    tirage.push(...melanger(source).slice(0, count - tirage.length).map((phrase) => ({ phrase })));
  }
  return tirage;
}

/**
 * Niveau B : des groupes nominaux courts. Au-delà : des phrases complètes.
 */
export function generatePhrasesNom(niveau: SkillLevel, count: number): PhraseAReperer[] {
  return tirer(niveau === 'B' ? NOUN_PHRASES : NOUN_SENTENCES, count);
}

export function generatePhrasesAdjectif(niveau: SkillLevel, count: number): PhraseAReperer[] {
  return tirer(niveau === 'B' ? ADJECTIVE_PHRASES : ADJECTIVE_SENTENCES, count);
}
