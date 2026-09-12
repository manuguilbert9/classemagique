/**
 * Génération des manches de « Lettres et sons ».
 *
 * Le tirage vivait dans le composant client, ce qui le rejouait à chaque
 * passage d'élève. Il est désormais exécuté côté serveur pour que le contenu
 * puisse être mémorisé et partagé (voir `src/services/exercise-pool.ts`).
 *
 * Module serveur : le composant n'en importe que les types.
 */

import { syllableAttackData } from '../syllable-data';

export interface WordOption {
  word: string;
  isCorrect: boolean;
}

export interface SoundQuestion {
  sound: string;
  options: WordOption[];
}

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateSoundQuestion(): SoundQuestion {
  // On ne retient que les sons présents dans au moins deux mots, sans quoi on
  // ne peut pas proposer deux bonnes réponses.
  const soundCounts = new Map<string, number>();
  syllableAttackData.forEach((item) => {
    item.sounds.forEach((sound) => {
      soundCounts.set(sound, (soundCounts.get(sound) || 0) + 1);
    });
  });

  const validSounds = Array.from(soundCounts.entries())
    .filter(([, count]) => count >= 2)
    .map(([sound]) => sound);

  const selectedSound = validSounds[Math.floor(Math.random() * validSounds.length)];

  const correctWords = shuffle(syllableAttackData.filter((d) => d.sounds.includes(selectedSound))).slice(0, 2);
  const incorrectWords = shuffle(syllableAttackData.filter((d) => !d.sounds.includes(selectedSound))).slice(0, 2);

  const options: WordOption[] = [
    ...correctWords.map((w) => ({ word: w.word, isCorrect: true })),
    ...incorrectWords.map((w) => ({ word: w.word, isCorrect: false })),
  ];

  return { sound: selectedSound, options: shuffle(options) };
}

export function generateLettresEtSonsQuestions(count: number): SoundQuestion[] {
  return Array.from({ length: count }, generateSoundQuestion);
}
