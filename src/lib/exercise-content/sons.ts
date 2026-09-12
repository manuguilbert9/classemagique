/**
 * Tirage des mots pour « Le son [an] » et « Le son [in] ».
 *
 * Les listes et le mélange vivaient dans les composants clients : ils sont
 * remontés ici pour que la sélection soit mémorisée et partagée entre élèves.
 */

export interface MotSon {
  word: string;
  correct: string;
}

const MOTS_SON_AN:  MotSon[] = [
    { word: "maman", correct: "an" },
    { word: "enfant", correct: "en" },
    { word: "temps", correct: "em" },
    { word: "lampe", correct: "am" },
    { word: "danse", correct: "an" },
    { word: "vent", correct: "en" },
    { word: "jambe", correct: "am" },
    { word: "tremble", correct: "em" },
    { word: "grand", correct: "an" },
    { word: "serpent", correct: "en" },
    { word: "chambre", correct: "am" },
    { word: "décembre", correct: "em" },
    { word: "pantalon", correct: "an" },
    { word: "dent", correct: "en" },
    { word: "ampoule", correct: "am" },
    { word: "emmener", correct: "em" },
    { word: "chanter", correct: "an" },
    { word: "penser", correct: "en" },
];

const MOTS_SON_IN: MotSon[] = [
    { word: "matin", correct: "in" },
    { word: "important", correct: "im" },
    { word: "train", correct: "ain" },
    { word: "peinture", correct: "ein" },
    { word: "lapin", correct: "in" },
    { word: "impossible", correct: "im" },
    { word: "main", correct: "ain" },
    { word: "frein", correct: "ein" },
    { word: "jardin", correct: "in" },
    { word: "timbre", correct: "im" },
    { word: "bain", correct: "ain" },
    { word: "plein", correct: "ein" },
    { word: "chemin", correct: "in" },
    { word: "simple", correct: "im" },
    { word: "pain", correct: "ain" },
    { word: "teint", correct: "ein" },
    { word: "poussin", correct: "in" },
    { word: "grimper", correct: "im" },
];

function melanger(mots: MotSon[]): MotSon[] {
  const shuffled = [...mots];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/** Pioche `count` mots ; au-delà de la liste, on repart sur un nouveau mélange. */
function tirer(mots: MotSon[], count: number): MotSon[] {
  const tirage: MotSon[] = [];
  while (tirage.length < count) {
    tirage.push(...melanger(mots).slice(0, count - tirage.length));
  }
  return tirage;
}

export function generateSonAnQuestions(count: number): MotSon[] {
  return tirer(MOTS_SON_AN, count);
}

export function generateSonInQuestions(count: number): MotSon[] {
  return tirer(MOTS_SON_IN, count);
}
