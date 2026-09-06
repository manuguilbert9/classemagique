/**
 * Élision de la préposition « de » devant un nom.
 *
 * Utilisé partout où une consigne est construite en collant un nom variable
 * après « de » : « Combien y a-t-il de pommes ? », mais « ... d'oranges ? ».
 */

/** Voyelles, accentuées et ligatures comprises, devant lesquelles « de » s'élide. */
const COMMENCE_PAR_UNE_VOYELLE = /^[aàâäeéèêëiîïoôöuùûüyœæ]/i;

/**
 * Enchaîne « de » avec un nom : « de pommes », « d'oranges », « d'étoiles ».
 *
 * Le h initial n'est volontairement pas élidé : « de haricots » (h aspiré) et
 * « d'hirondelles » (h muet) ne se déduisent pas de l'orthographe. Les rares
 * noms concernés doivent être écrits en toutes lettres par l'appelant.
 */
export function avecDe(nom: string): string {
  const propre = nom.trim();
  return COMMENCE_PAR_UNE_VOYELLE.test(propre) ? `d'${propre}` : `de ${propre}`;
}
