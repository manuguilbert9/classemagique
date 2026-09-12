/**
 * Registre des générateurs de contenu mutualisables.
 *
 * Un exercice inscrit ici ne génère plus son contenu à chaque passage d'élève :
 * le premier élève de la journée génère, le contenu est mémorisé, et les
 * suivants reçoivent exactement le même (voir `src/services/exercise-pool.ts`).
 *
 * Ajouter un exercice au dispositif = ajouter une ligne dans ce registre.
 * Le générateur doit être exécutable côté serveur et renvoyer des objets
 * sérialisables en JSON (ils partent tels quels dans Firestore).
 *
 * ⚠️ Module strictement serveur : il ne doit jamais être importé par un
 * composant client. Le point d'entrée public est `getExerciseQuestions`.
 */

import { generateQuestions, type AllSettings, type Question } from './questions';
import { generatePlaceValueTableQuestion } from './place-value-table-questions';
import { generateLettresEtSonsQuestions } from './exercise-content/lettres-et-sons';
import { progressionDesChoix, tirerSerie } from './mots-images';
import { generateSubtractionTrainingSet } from './subtraction-training-questions';
import { generateProblem, type ProblemCategory } from '@/ai/flows/word-problems-flow';
import { generateSommeDixProblems, generateSommesAComposer } from './exercise-content/calcul-simple';
import { generateSonAnQuestions, generateSonInQuestions } from './exercise-content/sons';
import { generateMbpQuestions } from './exercise-content/regle-mbp';
import { generateGrillesDeLecture, generateLettresAReconnaitre } from './exercise-content/lettres-et-grilles';
import { generateCalculsPoses } from './exercise-content/calcul-pose';
import { generateManchesComptage } from './exercise-content/comptage';
import { generateSeancesDeTri } from './exercise-content/tri-categories';
import { generateTiragesDeCouleurs } from './exercise-content/algorithme-couleurs';
import { generateCheminsCodes } from './exercise-content/chemin-code';
import { generateWordFamilies } from '@/ai/flows/generate-word-families-flow';
import { generatePhrasesAdjectif, generatePhrasesNom } from './exercise-content/grammaire';
import {
  generatePhrasesAConstruire,
  generatePhrasesAEnrichir,
  generatePhrasesEtiquettes,
  generateMotsMelanges,
} from './exercise-content/phrases';
import type { SkillLevel } from './skills';

/**
 * Un élément de contenu mémorisable. Le stock ne connaît pas la forme exacte des
 * contenus : une question de QCM, une manche de désignation ou un problème
 * rédigé y entrent de la même façon, tant que c'est sérialisable en JSON.
 */
export type PooledItem = Record<string, any>;

export interface PooledContentRequest {
  /** Nombre d'éléments à produire pour compléter le stock. */
  count: number;
  /** Niveau de l'élève, quand il ne transite pas déjà par les réglages. */
  level?: SkillLevel | string | null;
  /**
   * Réglages de l'exercice (difficulté, thème…), tels que choisis à l'écran.
   * Volontairement non typé : chaque générateur connaît la forme des siens.
   */
  settings?: any;
}

/** Les réglages des exercices historiques, ou tout objet propre à un exercice. */
export type PooledSettings = AllSettings | Record<string, any>;

export type PooledContentGenerator = (req: PooledContentRequest) => Promise<PooledItem[]>;

/** Raccourci pour les exercices qui passent déjà par `generateQuestions`. */
const viaGenerateQuestions =
  (slug: string): PooledContentGenerator =>
  ({ count, settings }) =>
    generateQuestions(slug, count, settings);

/** Tire des problèmes d'une catégorie, sans répétition à l'intérieur du lot. */
const problemesDeCategorie =
  (categorie: ProblemCategory): PooledContentGenerator =>
  async ({ count }) => {
    const problemes: PooledItem[] = [];
    const dejaVus = new Set<string>();
    // La banque est finie : au bout de quelques essais infructueux, on accepte
    // une répétition plutôt que de boucler indéfiniment.
    let essais = 0;

    while (problemes.length < count && essais < count * 8) {
      essais++;
      const probleme = await generateProblem(categorie, 'easy');
      if (dejaVus.has(probleme.text)) continue;
      dejaVus.add(probleme.text);
      problemes.push(probleme);
    }

    while (problemes.length < count) {
      problemes.push(await generateProblem(categorie, 'easy'));
    }

    return problemes;
  };

export const POOLED_GENERATORS: Record<string, PooledContentGenerator> = {
  // — Vague 1 : les exercices déjà routés par `generateQuestions` —
  'time': viaGenerateQuestions('time'),
  'denombrement': viaGenerateQuestions('denombrement'),
  'keyboard-count': viaGenerateQuestions('keyboard-count'),
  'ecoute-les-nombres': viaGenerateQuestions('ecoute-les-nombres'),
  'nombres-complexes': viaGenerateQuestions('nombres-complexes'),
  'lire-les-nombres': viaGenerateQuestions('lire-les-nombres'),
  'syllabe-attaque': viaGenerateQuestions('syllabe-attaque'),
  'calendar': viaGenerateQuestions('calendar'),
  'mental-calculation': viaGenerateQuestions('mental-calculation'),
  'currency': viaGenerateQuestions('currency'),
  'change-making': viaGenerateQuestions('change-making'),
  'gn-ni': viaGenerateQuestions('gn-ni'),
  'passe-compose': viaGenerateQuestions('passe-compose'),

  // — Générateur propre, déjà isolé côté serveur —
  'place-value-table': async ({ count, settings, level }) => {
    const numberLevel = settings?.numberLevel ?? { level: (level as SkillLevel) || 'B' };
    const questions: Question[] = [];
    for (let i = 0; i < count; i++) {
      questions.push(await generatePlaceValueTableQuestion(numberLevel));
    }
    return questions;
  },

  // — Vague 2 : générateurs extraits des composants —
  'lettres-et-sons': async ({ count }) => generateLettresEtSonsQuestions(count),

  // Les manches de désignation sont tirées par séries cohérentes : un lot
  // correspond exactement à une séance, la progression du nombre de choix est
  // donc préservée pour chaque élève.
  'mot-image': async ({ count, settings }) =>
    tirerSerie(settings?.theme ?? 'tous', count, 3),
  'montre-image': async ({ count, settings }) =>
    tirerSerie(settings?.theme ?? 'tous', count, progressionDesChoix),

  // La série des trois soustractions progressives forme un tout : on la produit
  // d'un bloc, ce qui garde la progression intacte pour chaque élève.
  'subtraction-training': async ({ count }) => {
    const questions = [];
    while (questions.length < count) {
      questions.push(...generateSubtractionTrainingSet());
    }
    return questions.slice(0, count);
  },

  // Les problèmes rédigés : quatre catégories, un stock par catégorie. On évite
  // les doublons à l'intérieur d'une même séance tant que la banque le permet.
  'problemes-transformation': problemesDeCategorie('problemes-transformation'),
  'problemes-composition': problemesDeCategorie('problemes-composition'),
  'problemes-comparaison': problemesDeCategorie('problemes-comparaison'),
  'problemes-composition-transformation': problemesDeCategorie('problemes-composition-transformation'),

  // — Vague 3 : tirages remontés des composants vers le serveur —
  'somme-dix': async ({ count }) => generateSommeDixProblems(count),
  'composition-somme': async ({ count }) => generateSommesAComposer(count),
  'son-an': async ({ count }) => generateSonAnQuestions(count),
  'son-in': async ({ count }) => generateSonInQuestions(count),
  'regle-mbp': async ({ count }) => generateMbpQuestions(count),
  'letter-recognition': async ({ count }) => generateLettresAReconnaitre(count),
  'reading-direction': async ({ count, settings }) => generateGrillesDeLecture(count, settings?.taille ?? 25),
  'long-calculation': async ({ count, settings }) => generateCalculsPoses(settings?.level ?? 'B', count),
  'reperer-nom': async ({ count, settings }) => generatePhrasesNom(settings?.level ?? 'B', count),
  'reperer-adjectif': async ({ count, settings }) => generatePhrasesAdjectif(settings?.level ?? 'B', count),
  'add-adjectives': async ({ count }) => generatePhrasesAEnrichir(count),
  'label-game': async ({ count, settings }) => generatePhrasesEtiquettes(settings?.level ?? 'B', count),
  'phrase-construction': async ({ count, settings }) => generatePhrasesAConstruire(settings?.level ?? 'B', count),
  'jumbled-words': async ({ count, settings }) => generateMotsMelanges(settings?.words ?? [], count),
  'comptage-pointage': async ({ count }) => generateManchesComptage(count),
  'category-sorting': async ({ count }) => generateSeancesDeTri(count),
  'color-algorithm': async ({ count, settings }) =>
    generateTiragesDeCouleurs(count, settings?.cles ?? [], settings?.combien ?? 2),
  'coded-path': async ({ count, settings }) => generateCheminsCodes(settings?.level ?? 'A', count),

  // Les familles de mots : un appel à l'IA par liste et par journée, au lieu
  // d'un appel par élève et par passage.
  'word-families': async ({ count, settings }) => {
    const familles = [];
    for (let i = 0; i < count; i++) {
      familles.push(await generateWordFamilies({ words: settings?.words ?? [] }));
    }
    return familles;
  },
};

/** Un exercice est-il servi par le stock partagé ? */
export function isPooledSkill(slug: string): boolean {
  return Object.prototype.hasOwnProperty.call(POOLED_GENERATORS, slug);
}
