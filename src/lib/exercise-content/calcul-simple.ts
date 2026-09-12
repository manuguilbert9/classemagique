/**
 * Générateurs des petits exercices de calcul dont le tirage vivait dans le
 * composant client : « Somme dix » et « Composition de sommes ».
 *
 * Ils sont ici pour que leur contenu soit mémorisé et partagé entre les élèves
 * (voir `src/services/exercise-pool.ts`). Le composant n'en importe que les types.
 */

const EMOJIS = ['🧱', '🍎', '🚗', '⭐', '🧸', '⚽', '🍓', '🍌', '🔵', '🟢'];

export interface ProblemeSommeDix {
  id: number;
  operands: number[];
  answer: number;
  emoji: string;
}

/** Deux termes dont la somme reste inférieure à dix. */
export function generateSommeDixProblems(count: number): ProblemeSommeDix[] {
  return Array.from({ length: count }, (_, index) => {
    const op1 = Math.floor(Math.random() * 8) + 1; // 1 à 8
    const op2 = Math.floor(Math.random() * (9 - op1)) + 1; // la somme reste < 10
    return {
      id: index + 1,
      operands: [op1, op2],
      answer: op1 + op2,
      emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
    };
  });
}

export interface SommeAComposer {
  /** Le montant à composer avec des pièces de 1, 2 et 5 €. */
  target: number;
}

/**
 * Des montants de 1 à 9 €, sans répétition à l'intérieur d'une même séance.
 * Au-delà de neuf montants, on repart sur un nouveau tirage mélangé.
 */
export function generateSommesAComposer(count: number): SommeAComposer[] {
  const sommes: SommeAComposer[] = [];

  while (sommes.length < count) {
    const possibles = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => 0.5 - Math.random());
    for (const target of possibles.slice(0, count - sommes.length)) {
      sommes.push({ target });
    }
  }

  return sommes;
}
