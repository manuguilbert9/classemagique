import type { SkillCategory, SkillLevel } from './skills';
import type { NiveauScolaire } from './niveaux-scolaires';

export interface ProgressiveExercise {
  slug: string;
  name: string;
  description: string;
  level: 'A' | 'B−' | 'B' | 'B+' | 'C';
  category: SkillCategory;
  family: 'early' | 'french' | 'math';
  technicalLevel: SkillLevel;
  schoolMin: NiveauScolaire;
  schoolMax: NiveauScolaire;
}

type Entry = [slug: string, name: string, description: string, category: SkillCategory];
function group(level: ProgressiveExercise['level'], family: ProgressiveExercise['family'], technicalLevel: SkillLevel,
  schoolMin: NiveauScolaire, schoolMax: NiveauScolaire, entries: Entry[]): ProgressiveExercise[] {
  return entries.map(([slug, name, description, category]) => ({ slug, name, description, category, level, family, technicalLevel, schoolMin, schoolMax }));
}

export const PROGRESSIVE_EXERCISES: ProgressiveExercise[] = [
  ...group('A', 'early', 'A', 'GS-debut', 'CP-debut', [
    ['objet-utile', 'À quoi sert l’objet ?', 'Choisis l’objet qui répond à la situation entendue.', 'Vocabulaire'],
    ['deux-actions', 'La consigne en deux actions', 'Touche deux images dans l’ordre de la consigne.', 'Lecture / compréhension'],
    ['donne-a-chacun', 'Donne à chacun', 'Distribue une fleur à chaque lapin.', 'Nombres et calcul'],
    ['comparer-collections', 'Qui en a le plus ?', 'Compare deux collections en associant les objets un par un.', 'Nombres et calcul'],
  ]),
  ...group('B−', 'early', 'A', 'GS-fin', 'CP-fin', [
    ['mot-correct', 'Le mot correct', 'Retrouve le mot exact parmi des étiquettes proches.', 'Lecture / compréhension'],
    ['phrase-image', 'La phrase qui raconte l’image', 'Observe l’action et choisis la phrase qui la raconte.', 'Lecture / compréhension'],
    ['commande-incomplete', 'La commande incomplète', 'Trouve combien d’objets ajouter pour compléter la commande.', 'Nombres et calcul'],
    ['suite-train', 'La suite du train', 'Complète une suite de nombres croissante ou décroissante.', 'Nombres et calcul'],
  ]),
  ...group('B', 'french', 'B', 'CP-debut', 'CE1-fin', [
    ['detective-phrase', 'Le détective de phrase', 'Retrouve la phrase qui prouve ou contredit une affirmation.', 'Lecture / compréhension'],
    ['reparer-message', 'Réparer le message', 'Place la majuscule et le point, puis lis la phrase.', 'Ecriture'],
  ]),
  ...group('B', 'math', 'B', 'CP-debut', 'CE1-fin', [
    ['voisins-nombre', 'Le nombre entre deux voisins', 'Trouve le nombre juste avant et le nombre juste après.', 'Nombres et calcul'],
    ['choisir-operation', 'Choisis l’opération', 'Comprends la situation, choisis l’opération, puis calcule.', 'Nombres et calcul'],
  ]),
  ...group('B+', 'french', 'C', 'CE2-debut', 'CE2-fin', [
    ['accord-reparer', 'L’accord à réparer', 'Corrige les mots qui doivent s’accorder dans le groupe nominal.', 'Grammaire'],
    ['referent-pronom', 'De qui parle « il / elle » ?', 'Retrouve le personnage désigné et surligne la preuve.', 'Lecture / compréhension'],
  ]),
  ...group('B+', 'math', 'C', 'CE2-debut', 'CE2-fin', [
    ['calcul-raisonnable', 'Le calcul raisonnable', 'Estime le résultat, puis calcule pour le vérifier.', 'Nombres et calcul'],
    ['mesure-vrai-faux', 'Mesure : vrai ou faux ?', 'Vérifie une mesure en observant le zéro de la règle.', 'Grandeurs et mesures'],
  ]),
  ...group('C', 'french', 'D', 'CM1-debut', 'CM1-fin', [
    ['preuves-texte', 'Les preuves du texte', 'Réponds à une question et retrouve l’extrait qui justifie ta réponse.', 'Lecture / compréhension'],
    ['chronologie-coherente', 'La chronologie cohérente', 'Ordonne les événements et explique leurs liens de cause à effet.', 'Lecture / compréhension'],
  ]),
  ...group('C', 'math', 'D', 'CM1-debut', 'CM1-fin', [
    ['erreur-soustraction', 'L’erreur de calcul posée', 'Repère puis corrige une erreur dans une soustraction par emprunt.', 'Nombres et calcul'],
    ['point-milieu', 'Le point milieu', 'Choisis le milieu et vérifie l’égalité des deux longueurs.', 'Espace et géométrie'],
  ]),
];

export function getProgressiveExercise(slug: string) {
  return PROGRESSIVE_EXERCISES.find(exercise => exercise.slug === slug);
}
