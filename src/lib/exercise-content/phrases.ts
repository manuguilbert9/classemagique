/**
 * Tirage des phrases des exercices d'enrichissement et de construction.
 *
 * Remonté des composants clients pour que la sélection soit mémorisée et
 * partagée entre les élèves.
 */

import {
  ADJECTIVE_ENRICHMENT_SENTENCES,
  type AdjectiveEnrichmentSentence,
} from '@/data/grammaire/adjective-enrichment-sentences';
import { PHRASE_CONSTRUCTION_SENTENCES } from '@/data/grammaire/phrase-construction-sentences';

function melanger<T>(items: T[]): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Des phrases à enrichir, sans répétition à l'intérieur d'une même séance.
 */
export function generatePhrasesAEnrichir(count: number): AdjectiveEnrichmentSentence[] {
  const phrases: AdjectiveEnrichmentSentence[] = [];
  while (phrases.length < count) {
    phrases.push(...melanger(ADJECTIVE_ENRICHMENT_SENTENCES).slice(0, count - phrases.length));
  }
  return phrases;
}

/**
 * Les phrases du jeu d'étiquettes, calibrées sur le niveau : deux à quatre mots
 * au niveau B, quatre à six au niveau C, au-delà de six ensuite.
 */
export function generatePhrasesEtiquettes(niveau: string, count: number): PhraseEtiquettes[] {
  const parNombreDeMots = (min: number, max: number) =>
    PHRASE_CONSTRUCTION_SENTENCES.filter((p) => {
      const mots = p.split(/\s+/).length;
      return mots >= min && mots <= max;
    });

  let vivier: string[];
  if (niveau === 'C') vivier = parNombreDeMots(5, 6);
  else if (niveau === 'D') vivier = parNombreDeMots(7, Number.MAX_SAFE_INTEGER);
  else vivier = parNombreDeMots(2, 4);

  // Un niveau sans phrase à sa mesure retombe sur le corpus entier.
  const source = vivier.length > 0 ? vivier : PHRASE_CONSTRUCTION_SENTENCES;

  const phrases: PhraseEtiquettes[] = [];
  while (phrases.length < count) {
    phrases.push(...melanger(source).slice(0, count - phrases.length).map((phrase) => ({ phrase })));
  }
  return phrases;
}

export interface PhraseEtiquettes {
  phrase: string;
}

/**
 * Les phrases à reconstruire, calibrées autrement que le jeu d'étiquettes :
 * jusqu'à six mots pour les petits niveaux, six à dix au niveau C, au-delà
 * ensuite.
 */
export function generatePhrasesAConstruire(niveau: string, count: number): PhraseEtiquettes[] {
  let vivier: string[];
  if (niveau === 'C') {
    vivier = PHRASE_CONSTRUCTION_SENTENCES.filter((s) => {
      const mots = s.split(' ').length;
      return mots > 6 && mots <= 10;
    });
  } else if (niveau === 'D') {
    vivier = PHRASE_CONSTRUCTION_SENTENCES.filter((s) => s.split(' ').length > 10);
  } else {
    vivier = PHRASE_CONSTRUCTION_SENTENCES.filter((s) => s.split(' ').length <= 6);
  }

  const source = vivier.length > 0 ? vivier : PHRASE_CONSTRUCTION_SENTENCES;

  const phrases: PhraseEtiquettes[] = [];
  while (phrases.length < count) {
    phrases.push(...melanger(source).slice(0, count - phrases.length).map((phrase) => ({ phrase })));
  }
  return phrases;
}

export interface MotMelange {
  mot: string;
}

/**
 * Les mots de « Mots mêlés » : ils viennent de la liste d'orthographe choisie
 * par l'élève, le tirage est donc mutualisé par liste et par séance.
 */
export function generateMotsMelanges(motsDeLaListe: string[], count: number): MotMelange[] {
  if (motsDeLaListe.length === 0) return [];

  const mots: MotMelange[] = [];
  while (mots.length < count) {
    mots.push(...melanger(motsDeLaListe).slice(0, count - mots.length).map((mot) => ({ mot })));
  }
  return mots;
}
