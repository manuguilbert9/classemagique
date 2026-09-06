/**
 * Suivi du niveau scolaire des élèves, domaine par domaine.
 *
 * Chaque élève reçoit, pour chacun des douze domaines, un niveau exprimé dans la
 * langue de l'école : « début CP », « milieu CE1 », « fin CE2 ». Ce niveau sert à
 * deux choses :
 *
 * 1. choisir les exercices qui ont du sens pour lui (chaque compétence est calée
 *    sur une plage scolaire) ;
 * 2. en déduire la difficulté A/B/C/D des exercices qui en proposent plusieurs.
 *
 * Le réglage fin par compétence reste possible : le niveau de domaine se propage
 * aux compétences du domaine, puis l'enseignant peut déroger au cas par cas.
 */

import { skills, type Skill, type SkillCategory, type SkillLevel } from './skills';

export type AnneeScolaire = 'GS' | 'CP' | 'CE1' | 'CE2' | 'CM1' | 'CM2';
export type MomentDeLAnnee = 'debut' | 'milieu' | 'fin';

/** Un cran de l'échelle, par exemple « CE1-milieu ». */
export type NiveauScolaire = `${AnneeScolaire}-${MomentDeLAnnee}`;

const ANNEES: AnneeScolaire[] = ['GS', 'CP', 'CE1', 'CE2', 'CM1', 'CM2'];
const MOMENTS: MomentDeLAnnee[] = ['debut', 'milieu', 'fin'];

/** Les dix-huit crans, du plus bas au plus haut. */
export const ECHELLE_SCOLAIRE: NiveauScolaire[] = ANNEES.flatMap((annee) =>
  MOMENTS.map((moment) => `${annee}-${moment}` as NiveauScolaire)
);

const LIBELLE_MOMENT: Record<MomentDeLAnnee, string> = {
  debut: 'Début',
  milieu: 'Milieu',
  fin: 'Fin',
};

/** « CE1-milieu » → « Milieu CE1 ». */
export function libelleNiveauScolaire(niveau: NiveauScolaire): string {
  const [annee, moment] = niveau.split('-') as [AnneeScolaire, MomentDeLAnnee];
  return `${LIBELLE_MOMENT[moment]} ${annee}`;
}

/** Position d'un niveau sur l'échelle, de 0 (début GS) à 17 (fin CM2). */
export function rang(niveau: NiveauScolaire): number {
  const index = ECHELLE_SCOLAIRE.indexOf(niveau);
  return index === -1 ? 0 : index;
}

/* -------------------------------------------------------------------------- */
/*  Calage des compétences sur l'échelle                                       */
/* -------------------------------------------------------------------------- */

interface PlageScolaire {
  /** Niveau à partir duquel l'exercice a du sens. */
  plancher: NiveauScolaire;
  /** Niveau au-delà duquel il n'apporte plus grand-chose. */
  plafond: NiveauScolaire;
}

/**
 * À quel moment de la scolarité chaque exercice trouve sa place.
 *
 * Ces bornes sont une proposition de départ, pensée pour des élèves d'UE : elles
 * se règlent au fil des observations. Un exercice n'est proposé en devoirs que si
 * le niveau de l'élève dans le domaine tombe dans sa plage.
 */
export const PLAGES_PAR_COMPETENCE: Record<string, PlageScolaire> = {
  // Phonologie
  'letter-recognition': { plancher: 'GS-debut', plafond: 'CP-milieu' },
  'reading-direction': { plancher: 'GS-debut', plafond: 'CP-debut' },
  'decoding': { plancher: 'GS-fin', plafond: 'CP-fin' },
  'syllable-table': { plancher: 'GS-fin', plafond: 'CP-fin' },
  'lettres-et-sons': { plancher: 'GS-fin', plafond: 'CP-fin' },
  'syllabe-attaque': { plancher: 'GS-fin', plafond: 'CP-fin' },

  // Lecture / compréhension
  'mot-image': { plancher: 'GS-debut', plafond: 'CP-milieu' },
  'simple-word-reading': { plancher: 'CP-debut', plafond: 'CE1-debut' },
  'lire-des-phrases': { plancher: 'CP-milieu', plafond: 'CE1-fin' },
  'fluence': { plancher: 'CP-fin', plafond: 'CM2-fin' },

  // Écriture
  'keyboard-copy': { plancher: 'GS-debut', plafond: 'CP-fin' },
  'copie-capitales': { plancher: 'GS-debut', plafond: 'CE1-fin' },
  'writing-notebook': { plancher: 'CP-fin', plafond: 'CM2-fin' },

  // Orthographe
  'jumbled-words': { plancher: 'CP-fin', plafond: 'CE2-fin' },
  'son-an': { plancher: 'CP-milieu', plafond: 'CE1-fin' },
  'son-in': { plancher: 'CP-milieu', plafond: 'CE1-fin' },
  'regle-mbp': { plancher: 'CE1-debut', plafond: 'CE2-fin' },
  'gn-ni': { plancher: 'CE1-milieu', plafond: 'CM1-fin' },
  'spelling': { plancher: 'CE1-debut', plafond: 'CM2-fin' },

  // Grammaire
  'phrase-construction': { plancher: 'CP-fin', plafond: 'CE2-fin' },
  'label-game': { plancher: 'CP-fin', plafond: 'CE2-fin' },
  'reperer-nom': { plancher: 'CE1-debut', plafond: 'CM1-fin' },
  'reperer-adjectif': { plancher: 'CE1-milieu', plafond: 'CM1-fin' },
  'add-adjectives': { plancher: 'CE1-milieu', plafond: 'CM1-fin' },

  // Conjugaison
  'passe-compose': { plancher: 'CE2-debut', plafond: 'CM2-fin' },

  // Vocabulaire
  'montre-image': { plancher: 'GS-debut', plafond: 'CP-milieu' },
  'category-sorting': { plancher: 'GS-debut', plafond: 'CP-fin' },
  'word-families': { plancher: 'CE1-fin', plafond: 'CM2-fin' },

  // Nombres et calcul
  'comptage-pointage': { plancher: 'GS-debut', plafond: 'CP-debut' },
  'denombrement': { plancher: 'GS-debut', plafond: 'CP-fin' },
  'keyboard-count': { plancher: 'GS-milieu', plafond: 'CP-fin' },
  'ecoute-les-nombres': { plancher: 'GS-milieu', plafond: 'CP-fin' },
  'somme-dix': { plancher: 'GS-fin', plafond: 'CE1-debut' },
  'complement-dix': { plancher: 'CP-milieu', plafond: 'CE1-fin' },
  'lire-les-nombres': { plancher: 'CP-debut', plafond: 'CM2-fin' },
  'mental-calculation': { plancher: 'CP-debut', plafond: 'CM2-fin' },
  'adaptive-mental-calculation': { plancher: 'CP-milieu', plafond: 'CM2-fin' },
  'nombres-complexes': { plancher: 'CE1-debut', plafond: 'CE2-fin' },
  'mystery-number': { plancher: 'CE1-debut', plafond: 'CM2-fin' },
  'soustraction-mentale': { plancher: 'CE1-debut', plafond: 'CM2-fin' },
  'place-value-table': { plancher: 'CE1-milieu', plafond: 'CM2-fin' },
  'long-calculation': { plancher: 'CE1-fin', plafond: 'CM2-fin' },
  'subtraction-training': { plancher: 'CE1-fin', plafond: 'CM1-fin' },
  'tables-multiplication': { plancher: 'CE2-debut', plafond: 'CM2-fin' },

  // Grandeurs et mesures
  'composition-somme': { plancher: 'GS-fin', plafond: 'CP-fin' },
  'calendar': { plancher: 'GS-fin', plafond: 'CM2-fin' },
  'currency': { plancher: 'CP-milieu', plafond: 'CM2-fin' },
  'flea-market': { plancher: 'CE1-debut', plafond: 'CM2-fin' },
  'change-making': { plancher: 'CE1-milieu', plafond: 'CM2-fin' },

  // Espace et géométrie
  'coded-path': { plancher: 'GS-fin', plafond: 'CE2-fin' },

  // Problèmes
  'problemes-transformation': { plancher: 'CP-fin', plafond: 'CM2-fin' },
  'problemes-composition': { plancher: 'CP-fin', plafond: 'CM2-fin' },
  'problemes-comparaison': { plancher: 'CE1-debut', plafond: 'CM2-fin' },
  'problemes-composition-transformation': { plancher: 'CE2-milieu', plafond: 'CM2-fin' },

  // Organisation et gestion de données
  'color-algorithm': { plancher: 'GS-debut', plafond: 'CP-fin' },
};

/** Les compétences déclarées dans skills.tsx qui n'ont pas encore de plage. */
export function competencesSansPlage(): string[] {
  return skills.filter((s) => !PLAGES_PAR_COMPETENCE[s.slug]).map((s) => s.slug);
}

/* -------------------------------------------------------------------------- */
/*  Dérivation de la difficulté                                                */
/* -------------------------------------------------------------------------- */

/** L'échelle de difficulté de la plateforme, du plus accessible au plus exigeant. */
const ECHELLE_DIFFICULTE: SkillLevel[] = ['A', 'A+', 'A++', 'B', 'C', 'D'];

/** Les niveaux proposés par un exercice qui n'en restreint pas la liste. */
const DIFFICULTES_PAR_DEFAUT: SkillLevel[] = ['B', 'C', 'D'];

/** Trois ans d'écart avec le plancher pour atteindre le niveau maximal : la
 * montée en difficulté doit rester lente, un CE1 n'a rien à faire au niveau D. */
const ECART_MAXIMAL = 9;

/**
 * La difficulté à donner à un exercice pour un élève situé à `niveauEleve`
 * dans le domaine de cet exercice.
 *
 * Un élève tout juste au plancher démarre au niveau le plus accessible que
 * l'exercice propose ; deux ans plus loin, il est au plus exigeant.
 */
export function difficultePourNiveau(skill: Skill, niveauEleve: NiveauScolaire): SkillLevel {
  if (skill.isFixedLevel) return skill.isFixedLevel;

  const autorises = (skill.allowedLevels ?? DIFFICULTES_PAR_DEFAUT)
    .slice()
    .sort((a, b) => ECHELLE_DIFFICULTE.indexOf(a) - ECHELLE_DIFFICULTE.indexOf(b));
  if (autorises.length === 0) return 'B';

  const plage = PLAGES_PAR_COMPETENCE[skill.slug];
  const ecart = plage ? rang(niveauEleve) - rang(plage.plancher) : 0;
  const proportion = Math.min(Math.max(ecart, 0), ECART_MAXIMAL) / ECART_MAXIMAL;
  const index = Math.round(proportion * (autorises.length - 1));
  return autorises[index];
}

/** L'exercice est-il dans sa plage pour un élève situé à ce niveau ? */
export function competencePertinente(skill: Skill, niveauEleve: NiveauScolaire): boolean {
  const plage = PLAGES_PAR_COMPETENCE[skill.slug];
  if (!plage) return true;
  const r = rang(niveauEleve);
  return r >= rang(plage.plancher) && r <= rang(plage.plafond);
}

/**
 * Les difficultés à écrire sur la fiche d'un élève quand on renseigne le niveau
 * d'un domaine : toutes les compétences du domaine, avec leur difficulté déduite.
 */
export function difficultesDuDomaine(
  domaine: SkillCategory,
  niveauEleve: NiveauScolaire
): Record<string, SkillLevel> {
  const resultat: Record<string, SkillLevel> = {};
  for (const skill of skills.filter((s) => s.category === domaine)) {
    resultat[skill.slug] = difficultePourNiveau(skill, niveauEleve);
  }
  return resultat;
}

/**
 * Les compétences d'un domaine qui conviennent à un élève, de la plus proche de
 * son niveau à la plus éloignée : c'est dans cet ordre qu'on pioche pour les devoirs.
 */
export function competencesPourNiveau(
  domaine: SkillCategory,
  niveauEleve: NiveauScolaire
): Skill[] {
  return skills
    .filter((s) => s.category === domaine && competencePertinente(s, niveauEleve))
    .sort((a, b) => {
      const ra = PLAGES_PAR_COMPETENCE[a.slug] ? rang(PLAGES_PAR_COMPETENCE[a.slug].plancher) : 0;
      const rb = PLAGES_PAR_COMPETENCE[b.slug] ? rang(PLAGES_PAR_COMPETENCE[b.slug].plancher) : 0;
      return rb - ra;
    });
}
