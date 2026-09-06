/**
 * Programmation automatique des devoirs, élève par élève.
 *
 * Le rythme est celui de la classe : chaque lundi et chaque jeudi, deux devoirs à
 * la maison — l'apprentissage des mots de dictée et un exercice de mathématiques.
 * Ce qui change d'un élève à l'autre, c'est le contenu : il est choisi à partir
 * de son niveau scolaire dans le domaine concerné.
 *
 * Trois cas de figure pour le devoir de français :
 * - l'élève suit les dictées Dyna-Mots : il reçoit la séance de la semaine ;
 * - il en est trop loin (ou la dictée lui est contre-indiquée) : il reçoit à la
 *   place l'exercice d'écriture ou d'orthographe le plus proche de son niveau ;
 * - aucun exercice ne convient : la case reste vide plutôt que de proposer
 *   n'importe quoi.
 */

import { addDays, addWeeks, format, startOfWeek } from 'date-fns';
import { getSkillBySlug, skills, type Skill } from './skills';
import {
  competencePertinente,
  competencesPourNiveau,
  type NiveauScolaire,
} from './niveaux-scolaires';
import { DICTEES_CE2, formatSessionId } from '@/services/dictees';
import type { Assignment } from '@/services/homework';
import type { Student } from '@/services/students';

export interface OptionsProgrammation {
  /** Date de départ : la semaine de cette date est la première programmée. */
  dateDebut: string;
  nombreDeSemaines: number;
  /** Semaine de la méthode Dyna-Mots travaillée la première semaine. */
  semaineDicteeDepart: number;
  /** Jours de la semaine concernés (1 = lundi, 4 = jeudi). */
  jours: number[];
}

export interface DevoirProgramme {
  date: string;
  eleveId: string;
  assignment: Assignment;
}

export const OPTIONS_PAR_DEFAUT: Omit<OptionsProgrammation, 'dateDebut'> = {
  nombreDeSemaines: 6,
  semaineDicteeDepart: 1,
  jours: [1, 4],
};

/** Les domaines dans lesquels on cherche l'exercice de mathématiques. */
const DOMAINES_MATHS = ['Nombres et calcul', 'Problèmes'] as const;
/** Les domaines de repli pour le devoir de français quand la dictée ne convient pas. */
const DOMAINES_ECRIT = ['Orthographe', 'Ecriture'] as const;

/**
 * Le niveau est le seul filtre : tout exercice dont la plage scolaire recouvre
 * le niveau de l'élève dans son domaine peut lui être donné en devoirs. La mise
 * en avant sur la page « En classe » ne restreint rien ici.
 */

/**
 * Les exercices d'un domaine qui conviennent à l'élève, d'après son niveau.
 * Sans niveau renseigné, on prend tout le domaine : mieux vaut un exercice
 * approximatif que pas de devoirs du tout.
 */
function exercicesDisponibles(
  eleve: Student,
  domaine: (typeof DOMAINES_MATHS)[number] | (typeof DOMAINES_ECRIT)[number]
): Skill[] {
  const niveau = eleve.niveauxParDomaine?.[domaine];
  const candidats = niveau
    ? competencesPourNiveau(domaine, niveau)
    : skills.filter((s) => s.category === domaine);

  // Les exercices mis en avant passent devant : quand plusieurs conviennent au
  // même niveau, on donne celui que l'enseignant a choisi de mettre en avant —
  // c'est là que se joue l'adaptation d'un élève à qui l'on a taillé un exercice.
  const misEnAvant = new Set(eleve.misEnAvant ?? []);
  if (misEnAvant.size === 0) return candidats;
  return [
    ...candidats.filter((s) => misEnAvant.has(s.slug)),
    ...candidats.filter((s) => !misEnAvant.has(s.slug)),
  ];
}

/** L'élève suit-il les dictées de la méthode ? */
function suitLesDictees(eleve: Student): boolean {
  const niveau = eleve.niveauxParDomaine?.['Orthographe'];
  const dictee = getSkillBySlug('spelling');
  if (!niveau || !dictee) return true;
  return competencePertinente(dictee, niveau);
}

/**
 * Produit les devoirs d'un élève sur la période demandée.
 *
 * L'exercice de mathématiques tourne d'une séance à l'autre : on épuise la liste
 * des exercices qui conviennent avant d'en reproposer un.
 */
export function genererPourEleve(
  eleve: Student,
  options: OptionsProgrammation
): DevoirProgramme[] {
  const depart = startOfWeek(new Date(options.dateDebut), { weekStartsOn: 1 });
  const maths = exercicesDisponibles(eleve, 'Nombres et calcul').concat(
    exercicesDisponibles(eleve, 'Problèmes')
  );
  const ecrit = [...exercicesDisponibles(eleve, 'Orthographe'), ...exercicesDisponibles(eleve, 'Ecriture')]
    .filter((s) => s.slug !== 'spelling');
  const avecDictee = suitLesDictees(eleve);

  const devoirs: DevoirProgramme[] = [];
  // Les deux disciplines tournent indépendamment : on épuise la liste des
  // exercices qui conviennent avant d'en reproposer un.
  let rotationMaths = 0;
  let rotationEcrit = 0;

  for (let semaine = 0; semaine < options.nombreDeSemaines; semaine++) {
    const lundi = addWeeks(depart, semaine);
    const numeroDictee = options.semaineDicteeDepart + semaine;
    const semaineDictee = DICTEES_CE2.find((s) => s.semaine === numeroDictee);

    for (const jour of [...options.jours].sort((a, b) => a - b)) {
      const date = format(addDays(lundi, jour - 1), 'yyyy-MM-dd');

      // Début de semaine : le jour 1 de la méthode. Fin de semaine : la dictée bilan.
      const jourDeMethode = jour <= 2 ? 1 : 4;

      let orthographe: string | null = null;
      let francais: string | null = null;
      if (avecDictee && semaineDictee) {
        orthographe = formatSessionId(semaineDictee.semaine, jourDeMethode);
      } else if (ecrit.length > 0) {
        francais = ecrit[rotationEcrit % ecrit.length].slug;
        rotationEcrit++;
      }

      let mathsSlug: string | null = null;
      if (maths.length > 0) {
        mathsSlug = maths[rotationMaths % maths.length].slug;
        rotationMaths++;
      }

      devoirs.push({
        date,
        eleveId: eleve.id,
        assignment: { francais, maths: mathsSlug, orthographe, notes: null },
      });
    }
  }

  return devoirs;
}

/** Programme une liste d'élèves d'un coup, regroupée par date pour l'écriture. */
export function genererPourEleves(
  eleves: Student[],
  options: OptionsProgrammation
): Map<string, Record<string, Assignment>> {
  const parDate = new Map<string, Record<string, Assignment>>();
  for (const eleve of eleves) {
    for (const devoir of genererPourEleve(eleve, options)) {
      const { orthographe, francais, maths } = devoir.assignment;
      // Un devoir entièrement vide n'est pas écrit : mieux vaut une case absente,
      // signalée à l'enseignant, qu'une case présente et creuse.
      if (!orthographe && !francais && !maths) continue;
      const pourCetteDate = parDate.get(devoir.date) ?? {};
      pourCetteDate[devoir.eleveId] = devoir.assignment;
      parDate.set(devoir.date, pourCetteDate);
    }
  }
  return parDate;
}

/** Résumé lisible d'un devoir, pour l'aperçu avant écriture. */
export function resumerAssignment(assignment: Assignment): string {
  const morceaux: string[] = [];
  if (assignment.orthographe) morceaux.push(`dictée ${assignment.orthographe}`);
  if (assignment.francais) morceaux.push(getSkillBySlug(assignment.francais)?.name ?? assignment.francais);
  if (assignment.maths) morceaux.push(getSkillBySlug(assignment.maths)?.name ?? assignment.maths);
  return morceaux.length > 0 ? morceaux.join(' + ') : 'rien';
}

/** Une séance de devoirs : une date, et le repère de la semaine de méthode. */
export interface Seance {
  date: string;
  /** 1 pour le début de semaine, 4 pour la dictée bilan. */
  jourDeMethode: 1 | 4;
  semaineDictee: number;
}

/**
 * Les séances d'une période : pour chaque semaine, les jours retenus, avec la
 * semaine de la méthode qui leur correspond.
 */
export function listerSeances(options: OptionsProgrammation): Seance[] {
  const depart = startOfWeek(new Date(options.dateDebut), { weekStartsOn: 1 });
  const seances: Seance[] = [];

  for (let semaine = 0; semaine < options.nombreDeSemaines; semaine++) {
    const lundi = addWeeks(depart, semaine);
    for (const jour of [...options.jours].sort((a, b) => a - b)) {
      seances.push({
        date: format(addDays(lundi, jour - 1), 'yyyy-MM-dd'),
        jourDeMethode: jour <= 2 ? 1 : 4,
        semaineDictee: options.semaineDicteeDepart + semaine,
      });
    }
  }
  return seances;
}

/** Pourquoi un élève repart les mains vides. */
export interface DiagnosticEleve {
  eleveId: string;
  nom: string;
  sansDevoir: boolean;
  niveauxRenseignes: boolean;
  /** Domaines où aucun exercice ne correspond à son niveau. */
  domainesSansExercice: string[];
}

const DOMAINES_SUIVIS = ['Orthographe', 'Ecriture', 'Nombres et calcul', 'Problèmes'] as const;

/**
 * Explique pourquoi un élève ne reçoit rien.
 *
 * Depuis que le niveau est le seul filtre, il n'y a plus que deux causes : ses
 * niveaux ne sont pas renseignés, ou aucun exercice de la plateforme ne couvre
 * son niveau dans ces domaines.
 */
export function diagnostiquerEleve(eleve: Student, options: OptionsProgrammation): DiagnosticEleve {
  const devoirs = genererPourEleve(eleve, options);
  const sansDevoir = devoirs.every(
    (d) => !d.assignment.orthographe && !d.assignment.francais && !d.assignment.maths
  );

  const domainesSansExercice = DOMAINES_SUIVIS.filter((domaine) => {
    const niveau = eleve.niveauxParDomaine?.[domaine];
    if (!niveau) return false;
    return competencesPourNiveau(domaine, niveau).length === 0;
  });

  return {
    eleveId: eleve.id,
    nom: eleve.name,
    sansDevoir,
    niveauxRenseignes: Object.keys(eleve.niveauxParDomaine || {}).length > 0,
    domainesSansExercice,
  };
}
