/**
 * Tirage des couleurs de l'exercice « Algorithme de couleurs ».
 *
 * Le seul élément aléatoire est l'association lettre → couleur ; elle est
 * tirée ici pour être mémorisée et partagée entre les élèves qui travaillent
 * le même algorithme.
 */

export interface TirageDeCouleurs {
  /** Les couleurs attribuées aux lettres de l'algorithme, dans l'ordre. */
  couleurs: string[];
}

export function generateTiragesDeCouleurs(
  count: number,
  clesDisponibles: string[],
  combien: number
): TirageDeCouleurs[] {
  return Array.from({ length: count }, () => {
    const melange = [...clesDisponibles];
    for (let i = melange.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [melange[i], melange[j]] = [melange[j], melange[i]];
    }
    return { couleurs: melange.slice(0, combien) };
  });
}
