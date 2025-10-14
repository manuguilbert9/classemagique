'use server';

import type { Question, NumberLevelSettings } from './questions';
import { numberToWords } from "./utils";

// Définit les colonnes du tableau de numération en fonction du niveau
function getColumnsForLevel(level: string): string[] {
  switch(level) {
    case 'B':
      return ['C', 'D', 'U']; // Centaines, Dizaines, Unités
    case 'C':
      return ['CM', 'DM', 'UM', 'C', 'D', 'U']; // Centaines de milliers, Dizaines de milliers, Unités de milliers, Centaines, Dizaines, Unités
    case 'D':
      return ['CM (millions)', 'DM (millions)', 'UM (millions)', 'CM', 'DM', 'UM', 'C', 'D', 'U']; // Jusqu'aux centaines de millions
    default:
      return ['C', 'D', 'U'];
  }
}

// Génère un nombre aléatoire dans la plage appropriée
function generateNumberForLevel(level: string): number {
  let min: number, max: number;

  switch(level) {
    case 'B':
      min = 10;
      max = 999;
      break;
    case 'C':
      min = 100;
      max = 999999;
      break;
    case 'D':
      min = 1000;
      max = 999999999;
      break;
    default:
      min = 10;
      max = 999;
  }

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Décompose un nombre en chiffres pour chaque position
function decomposeNumber(number: number, columns: string[]): Record<string, string> {
  const numberStr = String(number).split('').reverse();
  const result: Record<string, string> = {};

  // Initialise toutes les colonnes à vide
  columns.forEach(col => result[col] = '');

  // Remplir les colonnes depuis la droite (unités)
  const columnOrder = [...columns].reverse();
  numberStr.forEach((digit, index) => {
    if (index < columnOrder.length) {
      result[columnOrder[index]] = digit;
    }
  });

  return result;
}

export async function generatePlaceValueTableQuestion(settings: NumberLevelSettings): Promise<Question> {
  const number = generateNumberForLevel(settings.level);
  const columns = getColumnsForLevel(settings.level);
  const decomposition = decomposeNumber(number, columns);

  // Pour les niveaux C et D, on écrit le nombre en lettres
  const displayNumber = (settings.level === 'C' || settings.level === 'D')
    ? numberToWords(number)
    : String(number);

  // Le type de question sera un type spécial pour le tableau de numération
  return {
    id: Date.now(),
    level: settings.level,
    type: 'qcm', // Nous utiliserons un type custom dans le composant
    question: `Place les chiffres du nombre ${displayNumber} dans le tableau de numération.`,
    answer: JSON.stringify(decomposition), // Stocke la décomposition complète
    hint: String(number), // Le nombre en chiffres pour vérification
    numberLevelSettings: settings,
    // Stocke les métadonnées pour le composant
    description: JSON.stringify({
      number: number,
      displayNumber: displayNumber,
      columns: columns,
      decomposition: decomposition
    })
  };
}
