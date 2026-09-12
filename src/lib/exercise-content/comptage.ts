/**
 * Tirage des manches de « Comptage et pointage ».
 *
 * Remonté du composant client vers le serveur pour que les collections à
 * dénombrer soient mémorisées et partagées entre les élèves.
 */

/** Les collections à dénombrer, reprises de l'exercice de dénombrement existant. */
const COLLECTIONS = [
  { emoji: '🍎', nom: 'pommes' },
  { emoji: '🍌', nom: 'bananes' },
  { emoji: '🚗', nom: 'voitures' },
  { emoji: '🚜', nom: 'tracteurs' },
  { emoji: '🍓', nom: 'fraises' },
  { emoji: '🍊', nom: 'oranges' },
  { emoji: '🐟', nom: 'poissons' },
  { emoji: '🐢', nom: 'tortues' },
  { emoji: '⭐', nom: 'étoiles' },
  { emoji: '🎈', nom: 'ballons' },
];

export interface Manche {
  quantite: number;
  emoji: string;
  nom: string;
  /** Position de chaque objet, en pourcentage du cadre de comptage. */
  positions: { x: number; y: number }[];
}

/**
 * Répartit les objets dans une grille 3×3 avec un léger décalage aléatoire :
 * la disposition n'est jamais deux fois la même, sans que les objets se chevauchent.
 */
function placerLesObjets(quantite: number): { x: number; y: number }[] {
  const cases = Array.from({ length: 9 }, (_, i) => i);
  for (let i = cases.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cases[i], cases[j]] = [cases[j], cases[i]];
  }
  return cases.slice(0, quantite).map((c) => {
    const colonne = c % 3;
    const ligne = Math.floor(c / 3);
    return {
      x: 16 + colonne * 34 + (Math.random() * 12 - 6),
      y: 16 + ligne * 34 + (Math.random() * 12 - 6),
    };
  });
}

function tirerUneManche(): Manche {
  const collection = COLLECTIONS[Math.floor(Math.random() * COLLECTIONS.length)];
  const quantite = Math.floor(Math.random() * 9) + 1; // 1 à 9 : toujours inférieur à 10
  return { quantite, emoji: collection.emoji, nom: collection.nom, positions: placerLesObjets(quantite) };
}

export function generateManchesComptage(count: number): Manche[] {
  return Array.from({ length: count }, tirerUneManche);
}
