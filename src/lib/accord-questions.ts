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

    // Mélanger les mots entre les deux lignes
    // Pour chaque position, on place aléatoirement le mot correct en haut ou en bas
    const numWords = phrase.correctRow.length;
    const row1: string[] = [];
    const row2: string[] = [];
    const correctPath: number[] = [];

    for (let wordIndex = 0; wordIndex < numWords; wordIndex++) {
      const correctWord = phrase.correctRow[wordIndex];
      const incorrectWord = phrase.incorrectRow[wordIndex];

      // Placer aléatoirement le mot correct sur la ligne 0 ou 1
      const correctOnTopRow = Math.random() < 0.5;

      if (correctOnTopRow) {
        row1.push(correctWord);
        row2.push(incorrectWord);
        correctPath.push(0); // Le bon mot est en haut
      } else {
        row1.push(incorrectWord);
        row2.push(correctWord);
        correctPath.push(1); // Le bon mot est en bas
      }
    }

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
export async function getNextProgressionIndex(currentIndex: number, numQuestionsCompleted: number, level: 'B' | 'C'): Promise<number> {
  const phrasesForLevel = accordPhrases.filter(p => p.level === level);
  return (currentIndex + numQuestionsCompleted) % phrasesForLevel.length;
}
