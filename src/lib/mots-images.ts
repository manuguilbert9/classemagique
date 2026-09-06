/**
 * Tirage des manches pour les exercices de désignation (mot ↔ image).
 *
 * La réponse se donne toujours par désignation : l'élève clique sur la bonne
 * étiquette ou la bonne image, jamais par la parole ni par la saisie.
 */

import { MOTS_ILLUSTRES, motsDuTheme, type MotIllustre } from '@/data/copie/liste-imagee';

export interface MancheDesignation {
  /** Le mot attendu. */
  cible: MotIllustre;
  /** Les propositions affichées, la cible comprise, dans un ordre aléatoire. */
  choix: MotIllustre[];
}

function melanger<T>(liste: T[]): T[] {
  const copie = [...liste];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

const premiereLettre = (mot: string) =>
  mot.normalize('NFD').replace(/[̀-ͯ]/g, '').charAt(0).toUpperCase();

/**
 * Choisit les distracteurs d'une manche.
 *
 * Ils sont pris hors du thème de la cible et, autant que possible, avec une
 * initiale différente : au début de l'apprentissage, les propositions doivent se
 * distinguer d'un coup d'œil, sans piège.
 */
function choisirDistracteurs(
  cible: MotIllustre,
  nombre: number,
  dejaVus: Set<string>
): MotIllustre[] {
  const horsTheme = MOTS_ILLUSTRES.filter((m) => m.theme !== cible.theme);
  const initialeDifferente = horsTheme.filter(
    (m) => premiereLettre(m.mot) !== premiereLettre(cible.mot)
  );
  const vivier = initialeDifferente.length >= nombre ? initialeDifferente : horsTheme;

  // Un même intrus ne revient pas d'une manche à l'autre tant qu'il reste du choix :
  // sinon l'élève finit par reconnaître l'intrus au lieu de chercher la cible.
  const inedits = vivier.filter((m) => !dejaVus.has(m.mot));
  return melanger(inedits.length >= nombre ? inedits : vivier).slice(0, nombre);
}

/**
 * Prépare une série de manches sur un thème donné (ou sur tous les thèmes).
 *
 * `nbChoix` accepte une fonction pour faire varier le nombre de propositions au
 * fil de la séance : on commence à deux images, puis on en ajoute.
 */
export function tirerSerie(
  theme: string,
  nombreDeManches: number,
  nbChoix: number | ((numeroDeManche: number) => number)
): MancheDesignation[] {
  const source = theme === 'tous' ? MOTS_ILLUSTRES : motsDuTheme(theme);
  const cibles = melanger(source).slice(0, nombreDeManches);
  const dejaVus = new Set<string>();

  return cibles.map((cible, i) => {
    const combien = typeof nbChoix === 'function' ? nbChoix(i) : nbChoix;
    const distracteurs = choisirDistracteurs(cible, Math.max(1, combien - 1), dejaVus);
    distracteurs.forEach((d) => dejaVus.add(d.mot));
    return { cible, choix: melanger([cible, ...distracteurs]) };
  });
}

/**
 * Nombre de propositions au fil d'une séance : deux images pour commencer,
 * puis trois, puis quatre. L'entrée dans la tâche reste très accessible.
 */
export function progressionDesChoix(numeroDeManche: number): number {
  if (numeroDeManche < 2) return 2;
  if (numeroDeManche < 5) return 3;
  return 4;
}
