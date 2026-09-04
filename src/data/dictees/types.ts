/**
 * Modèle de données de la méthode de dictées Dyna-Mots CE2 (Hachette Éducation, 2025).
 *
 * La méthode couvre 34 semaines réparties en 5 périodes. Chaque semaine s'articule
 * autour d'une notion, d'un corpus lexical et de deux régularités orthographiques,
 * puis se décline en 4 dictées flash (jours 1 à 4). Le type de dictée des jours 1 à 3
 * change à chaque période ; le jour 4 est toujours une dictée bilan.
 *
 * Différenciation : les contenus sont CUMULATIFS. Un élève de niveau 2 traite le
 * contenu du niveau 1 auquel s'ajoute celui du niveau 2 ; la phrase bonus s'ajoute
 * encore au niveau 2. C'est vérifiable sur les compteurs de mots des dictées bilan
 * de la méthode (semaine 1 : 27 mots → 34 mots → 48 mots).
 */

/** Niveau de différenciation appliqué à une dictée. */
export type DicteeNiveau = 1 | 2 | 3;

/** Les 12 types de dictées de la méthode, plus la dictée bilan. */
export type DicteeType =
  // Jour 1, selon la période
  | 'mots'
  | 'groupes-de-mots'
  | 'groupes-de-mots-complexes'
  | 'phrases'
  // Jour 2, selon la période
  | 'photo'
  | 'differee'
  | 'choix-multiples'
  | 'caviardee'
  | 'sans-erreur'
  // Jour 3, selon la période
  | 'du-jour'
  | 'dialoguee'
  | 'transposee'
  | 'negociee'
  | 'frigo'
  // Jour 4
  | 'bilan';

/** Libellés affichés pour chaque type de dictée. */
export const DICTEE_TYPE_LABELS: Record<DicteeType, string> = {
  'mots': 'Dictée de mots',
  'groupes-de-mots': 'Dictée de groupes de mots',
  'groupes-de-mots-complexes': 'Dictée de groupes de mots complexes',
  'phrases': 'Dictée de phrases',
  'photo': 'Dictée photo',
  'differee': 'Dictée différée',
  'choix-multiples': 'Dictée à choix multiples',
  'caviardee': 'Dictée caviardée',
  'sans-erreur': 'Dictée sans erreur',
  'du-jour': 'Dictée du jour',
  'dialoguee': 'Dictée dialoguée',
  'transposee': 'Dictée transposée',
  'negociee': 'Dictée négociée',
  'frigo': 'Dictée frigo',
  'bilan': 'Dictée bilan',
};

/** Objectif pédagogique du type de dictée, tel que défini par la méthode. */
export const DICTEE_TYPE_OBJECTIFS: Record<DicteeType, string> = {
  'mots': "Mémoriser et se remémorer l'orthographe des mots de dictée.",
  'groupes-de-mots': "Mettre en œuvre les accords dans le groupe nominal et/ou les accords sujet/verbe.",
  'groupes-de-mots-complexes': "Mettre en œuvre les accords dans des groupes nominaux et des verbes conjugués plus complexes.",
  'phrases': "Mettre en œuvre ses connaissances lexicales, orthographiques et grammaticales.",
  'photo': "Acquérir une mémoire photographique des mots à moyen terme.",
  'differee': "Effectuer des raisonnements orthographiques et grammaticaux.",
  'choix-multiples': "Effectuer des raisonnements orthographiques et grammaticaux.",
  'caviardee': "Prendre conscience de ses forces et de ses faiblesses en grammaire et en orthographe, de façon à gagner en efficacité.",
  'sans-erreur': "Prendre conscience de ses forces et de ses faiblesses en grammaire et en orthographe, de façon à gagner en efficacité.",
  'du-jour': "Traiter un problème orthographique ou grammatical et engendrer des automatismes.",
  'dialoguee': "Traiter un problème orthographique ou grammatical et engendrer des automatismes.",
  'transposee': "Mettre en œuvre l'orthographe grammaticale lors d'une transformation dans la phrase.",
  'negociee': "Mutualiser ses connaissances orthographiques et grammaticales, tout en argumentant ses choix.",
  'frigo': "Faire preuve de réflexivité par rapport à sa production et analyser ses propres forces et faiblesses.",
  'bilan': "Mesurer les progrès des élèves.",
};

/** Déroulé des jours 1 à 3 pour chaque période de la méthode. */
export const DEROULE_PAR_PERIODE: Record<1 | 2 | 3 | 4 | 5, [DicteeType, DicteeType, DicteeType]> = {
  1: ['mots', 'photo', 'du-jour'],
  2: ['groupes-de-mots', 'differee', 'dialoguee'],
  3: ['groupes-de-mots-complexes', 'choix-multiples', 'transposee'],
  4: ['phrases', 'caviardee', 'negociee'],
  5: ['phrases', 'sans-erreur', 'frigo'],
};

/** Une régularité orthographique travaillée dans la semaine. */
export interface Regularite {
  titre: string;
  explication: string;
}

/** Un mot du corpus lexical de la semaine (cahier de rituels). */
export interface CorpusEntry {
  mot: string;
  /** Précision de conjugaison, ex. « au présent », « à l'imparfait ». */
  temps?: string;
}

/** Une dictée flash des jours 1 à 3. */
export interface DicteeJour {
  jour: 1 | 2 | 3;
  type: DicteeType;
  /** Contenu du niveau 1 (socle commun à tous les élèves). */
  niveau1: string[];
  /** Contenu ajouté pour le niveau 2. */
  niveau2: string[];
}

/** La dictée bilan du jour 4 : un texte à paliers cumulatifs. */
export interface DicteeBilan {
  jour: 4;
  type: 'bilan';
  /** Texte de base, dicté à tous les élèves. */
  niveau1: { phrases: string[]; mots: number };
  /** Phrases qui s'ajoutent au texte du niveau 1. */
  niveau2: { phrases: string[]; mots: number };
  /** Phrase bonus qui s'ajoute au texte du niveau 2. */
  bonus?: { phrases: string[]; mots: number };
}

/** Une semaine complète de la méthode. */
export interface DicteeSemaine {
  semaine: number;
  periode: 1 | 2 | 3 | 4 | 5;
  notion: { numero: number; titre: string };
  corpusTheme: string;
  objectifSequence: string;
  objectifsTransversaux: string[];
  regularites: Regularite[];
  corpus: { niveau1: CorpusEntry[]; niveau2: CorpusEntry[] };
  /** Dictées flash des jours 1 à 3. */
  jours: DicteeJour[];
  /** Dictée bilan du jour 4. */
  bilan: DicteeBilan;
  /** Renvois vers les supports papier de la méthode. */
  guidePage: number;
  cahierPage: number;
}
