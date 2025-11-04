import { Question } from "./questions";

/**
 * Mots de la liste D4 - Choisir entre « gn » et « ni »
 */

interface WordWithSound {
  word: string;           // Le mot complet
  correctSound: 'gn' | 'ni'; // Le son correct
  before: string;         // Partie avant le son (ex: "gag" pour "gagner")
  after: string;          // Partie après le son (ex: "er" pour "gagner")
}

const gnWords: WordWithSound[] = [
  { word: "gagner", correctSound: "gn", before: "gag", after: "er" },
  { word: "soigner", correctSound: "gn", before: "soi", after: "er" },
  { word: "baigner", correctSound: "gn", before: "bai", after: "er" },
  { word: "ligne", correctSound: "gn", before: "li", after: "e" },
  { word: "vigne", correctSound: "gn", before: "vi", after: "e" },
  { word: "campagne", correctSound: "gn", before: "campa", after: "e" },
  { word: "cygne", correctSound: "gn", before: "cy", after: "e" },
  { word: "peigne", correctSound: "gn", before: "pei", after: "e" },
  { word: "brugnon", correctSound: "gn", before: "bru", after: "on" },
  { word: "mignon", correctSound: "gn", before: "mi", after: "on" },
  { word: "grognon", correctSound: "gn", before: "gro", after: "on" },
  { word: "champignon", correctSound: "gn", before: "champi", after: "on" },
  { word: "saignée", correctSound: "gn", before: "sai", after: "ée" },
  { word: "araignée", correctSound: "gn", before: "arai", after: "ée" },
];

const niWords: WordWithSound[] = [
  { word: "jardinier", correctSound: "ni", before: "jardi", after: "er" },
  { word: "meunier", correctSound: "ni", before: "meu", after: "er" },
  { word: "dernier", correctSound: "ni", before: "der", after: "er" },
  { word: "prunier", correctSound: "ni", before: "pru", after: "er" },
  { word: "bananier", correctSound: "ni", before: "bana", after: "er" },
  { word: "opinion", correctSound: "ni", before: "opi", after: "on" },
];

const allWords: WordWithSound[] = [...gnWords, ...niWords];

/**
 * Mélange un tableau aléatoirement
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Génère une question pour choisir entre GN et NI
 */
function generateGnNiQuestion(id: number, wordData: WordWithSound): Question {
  const { word, correctSound, before, after } = wordData;

  return {
    id,
    level: "B",
    type: "qcm",
    question: `Complète le mot : ${before}___${after}`,
    options: ["gn", "ni"],
    answer: correctSound,
    hint: word,
  };
}

/**
 * Génère toutes les questions pour l'exercice GN/NI
 * Un passage complet = tous les 20 mots de la liste D4
 */
export function generateGnNiQuestions(): Question[] {
  const questions: Question[] = [];

  // Mélanger tous les mots
  const shuffledWords = shuffleArray(allWords);

  // Générer une question pour chaque mot (20 questions)
  shuffledWords.forEach((wordData, index) => {
    questions.push(generateGnNiQuestion(index, wordData));
  });

  return questions;
}
