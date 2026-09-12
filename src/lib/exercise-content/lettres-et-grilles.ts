/**
 * Deux tirages très simples, remontés des composants clients vers le serveur
 * pour être mémorisés et partagés : les lettres de « Reconnaître les lettres »
 * et les grilles d'emojis du « Sens de lecture ».
 */

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const VEHICULES = ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🚚', '🚛', '🚜', '🚀', '🚁', '🚂', '🛸', '⛵️', '🚤'];
const FRUITS = ['🍎', '🍌', '🍇', '🍓', '🥝', '🍍', '🍑', '🍒', '🍈', '🍉', '🥭', '🥥', '🍅', '🍆', '🥑', '🌽', '🥕', '🥬', '🥦'];

export interface LettreAReconnaitre {
  lettre: string;
}

export function generateLettresAReconnaitre(count: number): LettreAReconnaitre[] {
  return Array.from({ length: count }, () => ({
    lettre: ALPHABET[Math.floor(Math.random() * ALPHABET.length)],
  }));
}

export interface GrilleDeLecture {
  /** Les cases de la grille, dans l'ordre de lecture. */
  cases: string[];
}

export function generateGrillesDeLecture(count: number, tailleDeLaGrille: number): GrilleDeLecture[] {
  return Array.from({ length: count }, () => {
    // Une grille garde un seul univers d'images, plus lisible pour l'élève.
    const jeu = Math.random() > 0.5 ? VEHICULES : FRUITS;
    return {
      cases: Array.from({ length: tailleDeLaGrille }, () => jeu[Math.floor(Math.random() * jeu.length)]),
    };
  });
}
