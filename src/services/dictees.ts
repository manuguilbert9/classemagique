'use client';

import { DICTEES_CE2, DICTEE_TYPE_LABELS, DICTEE_TYPE_OBJECTIFS } from '@/data/dictees';
import type { DicteeNiveau, DicteeSemaine, DicteeType } from '@/data/dictees';
import type { SkillLevel } from '@/lib/skills';

export type { DicteeNiveau, DicteeSemaine, DicteeType };
export { DICTEES_CE2, DICTEE_TYPE_LABELS, DICTEE_TYPE_OBJECTIFS };

/** Les deux jours de la méthode proposés en autonomie sur la plateforme. */
export type DicteeJourTravaille = 1 | 4;

/**
 * Une séance de dictée prête à être jouée : le contenu est déjà résolu
 * pour le niveau de l'élève.
 */
export interface DicteeSession {
  /** Identifiant stable, de la forme « S12-J1 ». */
  id: string;
  semaine: DicteeSemaine;
  jour: DicteeJourTravaille;
  type: DicteeType;
  typeLabel: string;
  objectif: string;
  niveau: DicteeNiveau;
  /**
   * Les éléments à dicter, dans l'ordre.
   * Jour 1 : des mots, des groupes de mots ou des phrases selon la période.
   * Jour 4 : les phrases du texte bilan.
   */
  items: string[];
  /** Nombre de mots visé par la méthode pour ce palier (dictées bilan uniquement). */
  nombreDeMots?: number;
}

/**
 * Le niveau de différenciation Dyna-Mots déduit du niveau de compétence de l'élève.
 *
 * L'échelle de la plateforme va de A (le plus accessible) à D (le plus exigeant),
 * B étant le niveau attribué par défaut à un nouvel élève.
 * - A, A+, A++, B → niveau 1 (le socle de la méthode)
 * - C            → niveau 2 (socle + contenu du niveau 2)
 * - D            → niveau 2 + phrase bonus
 */
export function niveauPourSkillLevel(level: SkillLevel | undefined): DicteeNiveau {
  if (level === 'D') return 3;
  if (level === 'C') return 2;
  return 1;
}

/** Libellé lisible d'un niveau de dictée. */
export function libelleNiveau(niveau: DicteeNiveau): string {
  if (niveau === 3) return 'Niveau 2 + phrase bonus';
  return `Niveau ${niveau}`;
}

export function getSemaine(semaine: number): DicteeSemaine | undefined {
  return DICTEES_CE2.find((s) => s.semaine === semaine);
}

/** Construit l'identifiant d'une séance, ex. « S12-J4 ». */
export function formatSessionId(semaine: number, jour: DicteeJourTravaille): string {
  return `S${semaine}-J${jour}`;
}

/** Analyse un identifiant de séance. Renvoie null si le format est invalide. */
export function parseSessionId(
  id: string
): { semaine: number; jour: DicteeJourTravaille } | null {
  const match = /^S(\d{1,2})-J([14])$/.exec(id.trim());
  if (!match) return null;
  return { semaine: Number(match[1]), jour: Number(match[2]) as DicteeJourTravaille };
}

/**
 * Résout le contenu d'une séance pour un niveau donné.
 *
 * Les contenus de la méthode sont cumulatifs : le niveau 2 traite le contenu du
 * niveau 1 auquel s'ajoute le sien, et la phrase bonus s'ajoute encore au niveau 2.
 */
export function getSession(
  id: string,
  niveau: DicteeNiveau
): DicteeSession | null {
  const parsed = parseSessionId(id);
  if (!parsed) return null;

  const semaine = getSemaine(parsed.semaine);
  if (!semaine) return null;

  if (parsed.jour === 1) {
    const jour1 = semaine.jours.find((j) => j.jour === 1);
    if (!jour1) return null;
    const items = niveau >= 2 ? [...jour1.niveau1, ...jour1.niveau2] : [...jour1.niveau1];
    return {
      id: formatSessionId(semaine.semaine, 1),
      semaine,
      jour: 1,
      type: jour1.type,
      typeLabel: DICTEE_TYPE_LABELS[jour1.type],
      objectif: DICTEE_TYPE_OBJECTIFS[jour1.type],
      niveau,
      items,
    };
  }

  const bilan = semaine.bilan;
  const items = [...bilan.niveau1.phrases];
  let nombreDeMots = bilan.niveau1.mots;
  if (niveau >= 2) {
    items.push(...bilan.niveau2.phrases);
    nombreDeMots = bilan.niveau2.mots;
  }
  if (niveau >= 3 && bilan.bonus) {
    items.push(...bilan.bonus.phrases);
    nombreDeMots = bilan.bonus.mots;
  }

  return {
    id: formatSessionId(semaine.semaine, 4),
    semaine,
    jour: 4,
    type: 'bilan',
    typeLabel: DICTEE_TYPE_LABELS.bilan,
    objectif: DICTEE_TYPE_OBJECTIFS.bilan,
    niveau,
    items,
    nombreDeMots,
  };
}

/** Le corpus lexical de la semaine, limité au niveau de l'élève. */
export function getCorpusPourNiveau(semaine: DicteeSemaine, niveau: DicteeNiveau): string[] {
  const entries =
    niveau >= 2 ? [...semaine.corpus.niveau1, ...semaine.corpus.niveau2] : semaine.corpus.niveau1;
  return entries.map((e) => (e.temps ? `${e.mot} (${e.temps})` : e.mot));
}

/** Libellé court d'une séance, pour les listes et le tableau de bord. */
export function libelleSession(semaine: DicteeSemaine, jour: DicteeJourTravaille): string {
  const type = jour === 1 ? semaine.jours.find((j) => j.jour === 1)?.type : 'bilan';
  const label = type ? DICTEE_TYPE_LABELS[type] : 'Dictée';
  return `S${semaine.semaine} · J${jour} — ${label}`;
}

/* -------------------------------------------------------------------------- */
/*  Comparaison des réponses                                                   */
/* -------------------------------------------------------------------------- */

/** Uniformise les apostrophes, les espaces et les guillemets avant comparaison. */
function uniformiser(texte: string): string {
  return texte
    .replace(/[’ʼ‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[  ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Comparaison souple : on ignore la casse et les accents (niveau 1). */
function sansAccent(texte: string): string {
  return texte.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export interface ComparaisonMot {
  attendu: string;
  saisi: string;
  correct: boolean;
}

export interface ComparaisonResultat {
  correct: boolean;
  /** Comparaison mot à mot, pour afficher précisément ce qui doit être revu. */
  mots: ComparaisonMot[];
  /** Nombre de mots correctement orthographiés. */
  motsCorrects: number;
  totalMots: number;
}

/**
 * Compare la production de l'élève à l'attendu.
 *
 * Au niveau 1, on reprend la tolérance déjà en vigueur dans les autres exercices :
 * les élèves les plus fragiles ne sont pénalisés ni sur les accents, ni sur les
 * majuscules, ni sur la ponctuation. À partir du niveau 2, tout compte — la
 * méthode fait de la majuscule et du point des objectifs à part entière.
 */
export function comparer(
  attendu: string,
  saisi: string,
  exigeant: boolean
): ComparaisonResultat {
  const normaliser = (t: string) => {
    const base = uniformiser(t);
    if (exigeant) return base;
    return sansAccent(base).replace(/[.,;:!?]/g, '');
  };

  const motsAttendus = uniformiser(attendu).split(' ').filter(Boolean);
  const motsSaisis = uniformiser(saisi).split(' ').filter(Boolean);

  const mots: ComparaisonMot[] = motsAttendus.map((mot, i) => {
    const saisiMot = motsSaisis[i] ?? '';
    return { attendu: mot, saisi: saisiMot, correct: normaliser(mot) === normaliser(saisiMot) };
  });

  const motsCorrects = mots.filter((m) => m.correct).length;
  const correct = normaliser(attendu) === normaliser(saisi);

  return { correct, mots, motsCorrects, totalMots: motsAttendus.length || 1 };
}

/* -------------------------------------------------------------------------- */
/*  Adaptations : copie des mots de la semaine                                 */
/* -------------------------------------------------------------------------- */

/**
 * Les mots du corpus lexical de la semaine, prêts à être recopiés.
 *
 * On retire les précisions de conjugaison (« au présent ») et on sépare les
 * variantes que le cahier de rituels regroupe sur une même ligne
 * (« les grains, les graines », « lumineux/lumineuse ») pour n'avoir qu'un mot
 * ou groupe de mots par étiquette.
 */
export function getMotsACopier(semaine: DicteeSemaine): string[] {
  const mots = semaine.corpus.niveau1
    .flatMap((entree) => entree.mot.split(/[,/]/))
    .map((mot) => mot.trim())
    .filter(Boolean);
  return Array.from(new Set(mots));
}

/**
 * La semaine de la méthode actuellement travaillée par un groupe, déduite des
 * dictées programmées dans ses devoirs : la dernière déjà passée, sinon la
 * prochaine à venir. Renvoie null si le groupe n'a aucune dictée programmée.
 */
export function semaineCouranteDepuisDevoirs(
  devoirs: { date: string; assignment: { orthographe?: string | null } }[],
  aujourdhui: Date = new Date()
): number | null {
  const jour = aujourdhui.toISOString().slice(0, 10);

  const programmees = devoirs
    .map((d) => {
      const seance = d.assignment.orthographe ? parseSessionId(d.assignment.orthographe) : null;
      return seance ? { date: d.date, semaine: seance.semaine } : null;
    })
    .filter((d): d is { date: string; semaine: number } => d !== null)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (programmees.length === 0) return null;

  const passees = programmees.filter((d) => d.date <= jour);
  if (passees.length > 0) return passees[passees.length - 1].semaine;
  return programmees[0].semaine;
}
