/**
 * La « journée scolaire » : l'unité de temps qui gouverne la durée de vie des
 * contenus d'exercices mémorisés.
 *
 * Elle ne suit pas le calendrier civil : elle bascule à 23 h (heure de Paris).
 * Tout ce qui a été généré et stocké dans la journée est donc considéré comme
 * périmé dès 23 h, et le premier élève du lendemain repart sur du contenu neuf.
 */

export const SCHOOL_DAY_CUTOFF_HOUR = 23;
export const SCHOOL_DAY_TIME_ZONE = 'Europe/Paris';

/**
 * Renvoie l'identifiant de la journée scolaire en cours, au format `yyyy-MM-dd`.
 * Entre minuit et 23 h, c'est la date du jour ; à partir de 23 h, c'est déjà
 * celle du lendemain — ce qui périme mécaniquement tous les stocks du jour.
 */
export function getSchoolDay(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('fr-FR', {
    timeZone: SCHOOL_DAY_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? '0');

  const year = get('year');
  const month = get('month');
  const day = get('day');
  const hour = get('hour');

  // On raisonne en UTC uniquement pour faire l'addition de jours sans surprise :
  // les composantes viennent déjà d'un calcul fait en heure de Paris.
  const base = Date.UTC(year, month - 1, day);
  const target = new Date(hour >= SCHOOL_DAY_CUTOFF_HOUR ? base + 24 * 60 * 60 * 1000 : base);

  return target.toISOString().slice(0, 10);
}
