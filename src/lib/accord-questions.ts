'use server';

import { accordPhrases, type AccordPhrase } from './accord-phrases-data';
import type { Question } from './questions';

/**
 * Génère des questions pour l'exercice "Le chemin des accords"
 * L'élève progresse à travers les 300 phrases par séries de 5
 */

export async function generateAccordQuestions(
  numQuestions: number,
  level: 'B' | 'C',
  progressionIndex: number = 0 // Index de départ dans les 300 phrases
): Promise<Question[]> {
  const questions: Question[] = [];

  // Filtrer les phrases par niveau
  const phrasesForLevel = accordPhrases.filter(p => p.level === level);

  // Calculer quelles phrases utiliser en fonction de la progression
  const startIndex = progressionIndex % phrasesForLevel.length;

  for (let i = 0; i < numQuestions; i++) {
    const phraseIndex = (startIndex + i) % phrasesForLevel.length;
    const phrase = phrasesForLevel[phraseIndex];

    // Créer les deux lignes du tableau
    const row1 = phrase.correctRow;
    const row2 = phrase.incorrectRow;

    // Calculer le chemin correct (toujours la ligne 0 = ligne du haut)
    const correctPath = row1.map(() => 0);

    // Créer la question
    const questionType = Math.random() < 0.5 ? 'Colorie' : 'Trace';
    const instruction = questionType === 'Colorie'
      ? 'Colorie chaque phrase d\'une couleur.'
      : 'Trace le bon chemin.';

    questions.push({
      id: Date.now() + i,
      level: level,
      type: 'accord-path',
      question: instruction,
      accordRows: [row1, row2],
      accordCorrectPath: correctPath,
      accordPhraseIndex: phrase.id,
    });

    // Petit délai pour garantir des IDs uniques
    await new Promise(resolve => setTimeout(resolve, 1));
  }

  return questions;
}

/**
 * Obtient l'index de progression suivant pour un étudiant
 * Cela permet de ne jamais redonner les mêmes phrases
 */
export function getNextProgressionIndex(currentIndex: number, numQuestionsCompleted: number, level: 'B' | 'C'): number {
  const phrasesForLevel = accordPhrases.filter(p => p.level === level);
  return (currentIndex + numQuestionsCompleted) % phrasesForLevel.length;
}
