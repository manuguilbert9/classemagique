/**
 * Tirage des textes de l'exercice « Compter les phrases ».
 *
 * Comme les autres générateurs de `exercise-content`, celui-ci vit côté
 * serveur : le stock partagé le fait tourner une fois par journée scolaire, et
 * toute la classe compte les phrases des mêmes textes.
 *
 * Le composant n'importe d'ici que les types.
 */

import { TEXTES_B, TEXTES_C, TEXTES_D, type TexteAPhrases } from '@/data/grammaire/textes-a-compter';

/** Un texte prêt à être affiché, avec sa réponse. */
export interface TexteACompter {
  /** Les phrases dans l'ordre : elles servent à l'affichage et à la correction. */
  phrases: string[];
  /** La réponse attendue, calculée à partir du découpage. */
  reponse: number;
  /** Le plus grand nombre proposé à l'élève, calé sur le niveau. */
  choixMax: number;
}

/**
 * Le plus grand nombre de phrases proposé à l'élève, par niveau.
 *
 * Volontairement plus haut que le plus long texte du niveau : si les nombres
 * proposés s'arrêtaient juste au-dessus de la réponse maximale, l'élève
 * apprendrait vite à choisir le dernier bouton. Les nombres commencent
 * toujours à 1, pour la même raison.
 */
const CHOIX_MAX: Record<string, number> = { B: 8, C: 10, D: 12 };

function corpusDuNiveau(niveau: string): TexteAPhrases[] {
  if (niveau === 'C') return TEXTES_C;
  if (niveau === 'D') return TEXTES_D;
  return TEXTES_B;
}

function melanger<T>(items: T[]): T[] {
  const melange = [...items];
  for (let i = melange.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [melange[i], melange[j]] = [melange[j], melange[i]];
  }
  return melange;
}

/**
 * Tire `count` textes du niveau demandé, sans répétition tant que le corpus le
 * permet. Au-delà, on repart pour un tour plutôt que de servir moins de textes
 * que la séance n'en demande.
 */
export function generateTextesACompter(niveau: string, count: number): TexteACompter[] {
  const corpus = corpusDuNiveau(niveau);
  const choixMax = CHOIX_MAX[niveau] ?? CHOIX_MAX.B;

  const textes: TexteACompter[] = [];
  while (textes.length < count) {
    const tirage = melanger(corpus).slice(0, count - textes.length);
    textes.push(
      ...tirage.map((texte) => ({
        phrases: texte.phrases,
        reponse: texte.phrases.length,
        choixMax,
      }))
    );
  }
  return textes;
}
