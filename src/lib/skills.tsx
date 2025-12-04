

import { type ReactElement } from 'react';
import {
  Clock,
  PiggyBank,
  Coins,
  Ear,
  SquarePen,
  Spline,
  ListOrdered,
  CalendarDays,
  Rocket,
  Mic,
  BookCopy,
  Keyboard,
  Plus,
  Type,
  ArrowRight,
  PenLine,
  Blocks,
  Route,
  Tags,
  BrainCircuit,
  Wand,
  Table,
  HelpCircle,
  GraduationCap,
  Highlighter,
  Palette,
  ShoppingBag,
  Calculator,
  Sparkles,
  Puzzle,
} from 'lucide-react';
import type { CalculationSettings, CurrencySettings, TimeSettings, CalendarSettings, NumberLevelSettings, CountSettings, ReadingRaceSettings } from './questions';

export type SkillCategory =
  | "Phonologie"
  | "Lecture / compréhension"
  | "Ecriture"
  | "Orthographe"
  | "Grammaire"
  | "Conjugaison"
  | "Vocabulaire"
  | "Nombres et calcul"
  | "Grandeurs et mesures"
  | "Organisation et gestion de données"
  | "Espace et géométrie"
  | "Problèmes";

export const allSkillCategories: SkillCategory[] = [
  "Phonologie",
  "Lecture / compréhension",
  "Ecriture",
  "Orthographe",
  "Grammaire",
  "Conjugaison",
  "Vocabulaire",
  "Nombres et calcul",
  "Grandeurs et mesures",
  "Espace et géométrie",
  "Organisation et gestion de données",
  "Problèmes"
];

export const categoryStyles: Record<SkillCategory, { bg: string; text: string }> = {
  // Pôle Français (teintes de bleu clair)
  'Phonologie': { bg: 'bg-gradient-to-br from-blue-100 to-blue-200', text: 'text-gray-800' },
  'Lecture / compréhension': { bg: 'bg-gradient-to-br from-cyan-100 to-cyan-200', text: 'text-gray-800' },
  'Grammaire': { bg: 'bg-gradient-to-br from-sky-100 to-sky-200', text: 'text-gray-800' },
  'Conjugaison': { bg: 'bg-gradient-to-br from-indigo-100 to-indigo-200', text: 'text-gray-800' },
  'Orthographe': { bg: 'bg-gradient-to-br from-blue-200 to-cyan-200', text: 'text-gray-800' },
  'Vocabulaire': { bg: 'bg-gradient-to-br from-slate-100 to-slate-200', text: 'text-gray-800' },
  'Ecriture': { bg: 'bg-gradient-to-br from-sky-200 to-indigo-200', text: 'text-gray-800' },

  // Pôle Mathématiques (teintes de jaune/orange)
  'Nombres et calcul': { bg: 'bg-gradient-to-br from-yellow-100 to-amber-200', text: 'text-gray-800' },
  'Grandeurs et mesures': { bg: 'bg-gradient-to-br from-orange-100 to-yellow-200', text: 'text-gray-800' },
  'Espace et géométrie': { bg: 'bg-gradient-to-br from-amber-100 to-orange-200', text: 'text-gray-800' },

  // Pôle Joker
  'Problèmes': { bg: 'bg-gradient-to-br from-lime-100 to-green-200', text: 'text-gray-800' },

  // Fallback/Other
  'Organisation et gestion de données': { bg: 'bg-gradient-to-br from-gray-100 to-gray-200', text: 'text-gray-800' },
};


export interface Skill {
  name: string;
  slug: string;
  description: string;
  icon: ReactElement;
  category: SkillCategory;
  isFixedLevel?: SkillLevel;
  allowedLevels?: SkillLevel[];
}

export type SkillLevel = 'A' | 'A+' | 'A++' | 'B' | 'C' | 'D';

const DecodageIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 180 40"
    fill="currentColor"
  >
    <text x="0" y="30" fontFamily="Arial, sans-serif" fontSize="40" fontWeight="bold">
      B+A=BA
    </text>
  </svg>
);


const SoundBlendIcon = ({ label }: { label: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path
      d="M18 16h28a10 10 0 0 1 10 10v10a10 10 0 0 1-10 10H30l-10 8v-8h-2a10 10 0 0 1-10-10V26a10 10 0 0 1 10-10Z"
      fill="currentColor"
      opacity="0.12"
    />
    <path d="M18 16h28a10 10 0 0 1 10 10v10a10 10 0 0 1-10 10H30l-10 8v-8h-2a10 10 0 0 1-10-10V26a10 10 0 0 1 10-10Z" />
    <text
      x="32"
      y="35"
      textAnchor="middle"
      fontFamily="inherit"
      fontSize="20"
      fontWeight="600"
      fill="currentColor"
    >
      {label}
    </text>
  </svg>
);

const SyllabeAttaqueIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path
      d="M12 32c4-10 12-18 20-18s16 8 20 18c-4 10-12 18-20 18S16 42 12 32Z"
      fill="currentColor"
      opacity="0.12"
    />
    <path d="M12 32c4-10 12-18 20-18s16 8 20 18" />
    <path d="M12 32c4 10 12 18 20 18s16-8 20-18" />
    <path
      d="M18 33.5c3.2-4.6 8.8-7.5 14-7.5s10.8 2.9 14 7.5"
      fill="none"
    />
    <path d="M18 34.5c3.2 4.6 8.8 7.5 14 7.5s10.8-2.9 14-7.5" />
    <path
      d="M20 34c3-2.4 7-4.2 12-4.2s9 1.8 12 4.2c-3 2.4-7 4.2-12 4.2s-9-1.8-12-4.2Z"
      fill="currentColor"
      opacity="0.24"
      stroke="none"
    />
  </svg>
);

const RegleMBPIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 64 64"
    fill="none"
  >
    <text
      x="32"
      y="36"
      textAnchor="middle"
      fontFamily="inherit"
      fontSize="20"
      fontWeight="600"
      letterSpacing="4"
      fill="currentColor"
    >
      M B P
    </text>
  </svg>
);

const LireNombresIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="14" y="16" width="36" height="24" rx="6" fill="currentColor" opacity="0.12" />
    <rect x="14" y="16" width="36" height="24" rx="6" />
    <text
      x="32"
      y="32"
      textAnchor="middle"
      fontFamily="'Fira Mono', 'Courier New', monospace"
      fontSize="18"
      fontWeight="600"
      fill="currentColor"
    >
      42
    </text>
    <path d="M18 44h28" strokeLinecap="round" />
    <path d="M22 44v6" />
    <path d="M46 44v6" />
  </svg>
);

const LireMotsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <g strokeWidth="2">
      <path
        d="M32 16C28 13 24 12 20 12h-2c-4.4 0-8 3.6-8 8v24c2.6-2.4 5.8-3.6 9.2-3.6H24c2.8 0 5.4.6 8 1.8Z"
        fill="currentColor"
        opacity="0.12"
      />
      <path
        d="M32 16C28 13 24 12 20 12h-2c-4.4 0-8 3.6-8 8v24c2.6-2.4 5.8-3.6 9.2-3.6H24c2.8 0 5.4.6 8 1.8Z"
      />
      <g transform="scale(-1 1) translate(-64 0)">
        <path
          d="M32 16C28 13 24 12 20 12h-2c-4.4 0-8 3.6-8 8v24c2.6-2.4 5.8-3.6 9.2-3.6H24c2.8 0 5.4.6 8 1.8Z"
          fill="currentColor"
          opacity="0.12"
        />
        <path
          d="M32 16C28 13 24 12 20 12h-2c-4.4 0-8 3.6-8 8v24c2.6-2.4 5.8-3.6 9.2-3.6H24c2.8 0 5.4.6 8 1.8Z"
        />
      </g>
    </g>
    <line x1="32" y1="18" x2="32" y2="48" />
    <path d="M18 24h10" />
    <path d="M18 30h10" />
    <path d="M36 24h10" />
    <path d="M36 30h10" />
  </svg>
);


export const skills: Skill[] = [
  {
    name: 'Décodage',
    slug: 'decoding',
    description: "Lis les syllabes le plus vite possible sur le circuit de lecture.",
    icon: <DecodageIcon />,
    category: 'Phonologie',
    isFixedLevel: 'A',
  },
  {
    name: 'Tableaux de syllabes',
    slug: 'syllable-table',
    description: "Lis des tableaux de syllabes pour t'entraîner à la lecture rapide.",
    icon: <Table />,
    category: 'Phonologie',
    isFixedLevel: 'A',
  },
  {
    name: 'Syllabe d\'attaque',
    slug: 'syllabe-attaque',
    description: "Clique sur l'image dont le nom commence par la syllabe affichée.",
    icon: <SyllabeAttaqueIcon />,
    category: 'Phonologie',
    isFixedLevel: 'A',
  },
  {
    name: 'Reconnaissance des lettres',
    slug: 'letter-recognition',
    description: "Appuie sur la bonne touche du clavier correspondant à la lettre affichée.",
    icon: <Type />,
    category: 'Phonologie',
    isFixedLevel: 'A',
  },
  {
    name: 'Lettres et Sons',
    slug: 'lettres-et-sons',
    description: "Associe une lettre au son qu'elle produit en choisissant la bonne image.",
    icon: <Ear />,
    category: 'Phonologie',
    isFixedLevel: 'A',
  },
  {
    name: 'Dictée de mots',
    slug: 'spelling',
    description: 'Écoute un mot et écris-le correctement.',
    icon: <PenLine />,
    category: 'Orthographe',
  },
  {
    name: 'Le son [an]',
    slug: 'son-an',
    description: "Choisis la bonne écriture (an, en, am, em) pour compléter les mots.",
    icon: <SoundBlendIcon label="AN" />,
    category: 'Orthographe',
    isFixedLevel: 'B',
  },
  {
    name: 'Le son [in]',
    slug: 'son-in',
    description: "Choisis la bonne écriture (in, im, ain, ein) pour compléter les mots.",
    icon: <SoundBlendIcon label="IN" />,
    category: 'Orthographe',
    isFixedLevel: 'B',
  },
  {
    name: 'La règle M,B,P',
    slug: 'regle-mbp',
    description: "Complète les mots avec 'n' ou 'm' en appliquant la règle du M, B, P.",
    icon: <RegleMBPIcon />,
    category: 'Orthographe',
    isFixedLevel: 'B',
  },
  {
    name: 'GN ou NI ?',
    slug: 'gn-ni',
    description: 'Choisis entre GN (bleu) et NI (rouge) pour compléter les mots de la liste D4.',
    icon: <SoundBlendIcon label="GN" />,
    category: 'Orthographe',
    isFixedLevel: 'B',
  },
  {
    name: 'Lettres dans le désordre',
    slug: 'jumbled-words',
    description: "Remets les lettres dans le bon ordre pour retrouver le mot.",
    icon: <Puzzle />,
    category: 'Orthographe',
  },
  {
    name: 'Sens de lecture',
    slug: 'reading-direction',
    description: 'Appuie sur les objets de gauche à droite, ligne par ligne, pour t\'habituer au sens de la lecture.',
    icon: <ArrowRight />,
    category: 'Lecture / compréhension',
    isFixedLevel: 'A',
  },
  {
    name: 'Lire des mots',
    slug: 'simple-word-reading',
    description: 'Lire des mots simples à voix haute pour s\'entraîner.',
    icon: <LireMotsIcon />,
    category: 'Lecture / compréhension',
    isFixedLevel: 'B',
  },
  {
    name: 'Lire des phrases',
    slug: 'lire-des-phrases',
    description: "Lis des phrases à voix haute et vérifie ta prononciation avec la reconnaissance vocale.",
    icon: <Mic />,
    category: 'Lecture / compréhension',
    isFixedLevel: 'B',
  },
  {
    name: 'Fluence',
    slug: 'fluence',
    description: "Chronomètre ta lecture d'un texte et calcule ton score de fluence (MCLM).",
    icon: <Rocket />,
    category: 'Lecture / compréhension',
  },
  {
    name: 'Cahier d\'écriture',
    slug: 'writing-notebook',
    description: 'Écris librement chaque jour pour t\'entraîner et garder une trace de tes textes.',
    icon: <BookCopy />,
    category: 'Ecriture',
  },
  {
    name: 'Copie au clavier',
    slug: 'keyboard-copy',
    description: "Recopie des mots simples lettre par lettre en suivant un modèle.",
    icon: <Keyboard />,
    category: 'Ecriture',
    isFixedLevel: 'A',
  },
  {
    name: 'Construction de phrases',
    slug: 'phrase-construction',
    description: "Utilise les mots fournis pour construire une phrase grammaticalement correcte.",
    icon: <Blocks />,
    category: 'Grammaire',
    allowedLevels: ['B', 'C', 'D'],
  },
  {
    name: 'Le jeu des étiquettes',
    slug: 'label-game',
    description: "Reconstruis la phrase en faisant glisser les mots dans le bon ordre.",
    icon: <Tags />,
    category: 'Grammaire',
    allowedLevels: ['B', 'C', 'D'],
  },
  {
    name: 'Repérer le nom',
    slug: 'reperer-nom',
    description: "Clique sur les noms dans la phrase.",
    icon: <Highlighter />,
    category: 'Grammaire',
    allowedLevels: ['B', 'C', 'D'],
  },
  {
    name: 'Repérer l\'adjectif',
    slug: 'reperer-adjectif',
    description: "Clique sur les adjectifs dans la phrase.",
    icon: <Palette />,
    category: 'Grammaire',
    allowedLevels: ['B', 'C'],
  },
  {
    name: 'Ajouter des adjectifs',
    slug: 'add-adjectives',
    description: "Enrichis la phrase en plaçant les adjectifs au bon endroit.",
    icon: <Sparkles />,
    category: 'Grammaire',
    allowedLevels: ['B', 'C'],
  },
  {
    name: 'Parcours Codé',
    slug: 'coded-path',
    description: "Guidez le personnage jusqu'à la clé en créant une séquence de flèches.",
    icon: <Route />,
    category: 'Espace et géométrie',
    allowedLevels: ['A', 'B', 'C'],
  },
  {
    name: 'Nombre Mystère',
    slug: 'mystery-number',
    description: "Devine le nombre secret en utilisant les indices qui apparaissent un par un.",
    icon: <HelpCircle />,
    category: 'Nombres et calcul',
    allowedLevels: ['B', 'C', 'D'],
  },
  {
    name: 'Lire les nombres',
    slug: 'lire-les-nombres',
    description: "Associer un nombre écrit en chiffres à son énoncé oral.",
    icon: <LireNombresIcon />,
    category: 'Nombres et calcul',
    allowedLevels: ['A', 'B', 'C', 'D'],
  },
  {
    name: 'Tableau de numération',
    slug: 'place-value-table',
    description: "Placer les chiffres d'un nombre dans un tableau de numération.",
    icon: <Table />,
    category: 'Nombres et calcul',
    allowedLevels: ['B', 'C', 'D'],
  },
  {
    name: 'Écoute les nombres',
    slug: 'ecoute-les-nombres',
    description: "Associer un nombre à l'oral < 20 à sa représentation chiffrée.",
    icon: <Ear />,
    category: 'Nombres et calcul',
    isFixedLevel: 'A',
  },
  {
    name: 'Dénombrement',
    slug: 'denombrement',
    description: "Dénombrer une quantité inférieure à 20.",
    icon: <ListOrdered />,
    category: 'Nombres et calcul',
    isFixedLevel: 'A',
  },
  {
    name: 'Comptage au clavier',
    slug: 'keyboard-count',
    description: "Compter les objets et taper la réponse directement sur le clavier.",
    icon: <Keyboard />,
    category: 'Nombres et calcul',
    isFixedLevel: 'A',
  },
  {
    name: 'Somme < 10',
    slug: 'somme-dix',
    description: "Calcule des additions simples dont le résultat est inférieur à 10.",
    icon: <Plus />,
    category: 'Nombres et calcul',
    isFixedLevel: 'A',
  },
  {
    name: 'Compléments à 10',
    slug: 'complement-dix',
    description: "Trouve le complément à 10 le plus vite possible.",
    icon: <div className="h-full w-full rounded-full border-4 border-current flex items-center justify-center text-2xl font-bold">10</div>,
    category: 'Nombres et calcul',
    isFixedLevel: 'B',
  },
  {
    name: "J'écoute entre 60 et 99",
    slug: 'nombres-complexes',
    description: 'Reconnaître les nombres complexes (60-99) à l\'oral et à l\'écrit.',
    icon: <div className="font-numbers font-bold text-5xl">84</div>,
    category: 'Nombres et calcul',
    isFixedLevel: 'B',
  },
  {
    name: 'Familles de mots',
    slug: 'word-families',
    description: "Identifier des mots de la même famille. Utiliser les familles de mots pour mémoriser l'orthographe.",
    icon: <Spline />,
    category: 'Vocabulaire',
    allowedLevels: ['B', 'C', 'D'],
  },
  {
    name: 'Calcul Posé',
    slug: 'long-calculation',
    description: "Additionner/soustraire en colonnes avec ou sans retenue.",
    icon: <SquarePen />,
    category: 'Nombres et calcul',
    allowedLevels: ['B', 'C', 'D'],
  },
  {
    name: 'Entraînement soustraction',
    slug: 'subtraction-training',
    description: "Apprendre la méthode de la soustraction posée étape par étape avec un guide interactif.",
    icon: <GraduationCap />,
    category: 'Nombres et calcul',
    isFixedLevel: 'B',
  },
  {
    name: 'Calcul mental',
    slug: 'mental-calculation',
    description: 'Calculer de tête des additions, soustractions, multiplications et divisions.',
    icon: <BrainCircuit />,
    category: 'Nombres et calcul',
    allowedLevels: ['A', 'B', 'C', 'D'],
  },
  {
    name: 'Calcul mental adaptatif',
    slug: 'adaptive-mental-calculation',
    description: "Un entraînement qui s'adapte à ton niveau pour progresser à ton rythme.",
    icon: <Wand />,
    category: 'Nombres et calcul',
  },
  {
    name: 'La Monnaie',
    slug: 'currency',
    description: 'Apprendre à utiliser les pièces et les billets en euros.',
    icon: <PiggyBank />,
    category: 'Grandeurs et mesures',
  },
  {
    name: 'Rendre la Monnaie',
    slug: 'change-making',
    description: 'Apprendre à rendre la monnaie en vendant des objets.',
    icon: <Coins />,
    category: 'Grandeurs et mesures',
    allowedLevels: ['B', 'C', 'D'],
  },
  {
    name: 'Calendrier',
    slug: 'calendar',
    description: 'Se repérer dans le temps, lire les dates et les durées.',
    icon: <CalendarDays />,
    category: 'Grandeurs et mesures',
    allowedLevels: ['A', 'B', 'C', 'D'],
  },
  {
    name: 'La Brocante',
    slug: 'flea-market',
    description: "Rends la monnaie exacte au client.",
    icon: <ShoppingBag />,
    category: 'Grandeurs et mesures',
    allowedLevels: ['B', 'C', 'D'],
  },
  {
    name: 'Composition de Somme',
    slug: 'composition-somme',
    description: "Sélectionne les pièces et billets pour composer une somme.",
    icon: <Coins />,
    category: 'Grandeurs et mesures',
    isFixedLevel: 'A',
  },
  {
    name: 'Problèmes de Transformation',
    slug: 'problemes-transformation',
    description: "Résous des problèmes de temps et de chronologie.",
    icon: <Calculator />,
    category: 'Problèmes',
    allowedLevels: ['B', 'C', 'D'],
  },
  {
    name: 'Problèmes de Composition',
    slug: 'problemes-composition',
    description: "Trouve la partie manquante ou le tout.",
    icon: <Calculator />,
    category: 'Problèmes',
    allowedLevels: ['B', 'C', 'D'],
  },
  {
    name: 'Problèmes de Comparaison',
    slug: 'problemes-comparaison',
    description: "Compare des quantités (plus que, moins que).",
    icon: <Calculator />,
    category: 'Problèmes',
    allowedLevels: ['B', 'C', 'D'],
  },
  {
    name: 'Problèmes Complexes',
    slug: 'problemes-composition-transformation',
    description: "Résous des problèmes avec des nombres relatifs et des bilans.",
    icon: <Calculator />,
    category: 'Problèmes',
    allowedLevels: ['C', 'D'],
  },
];

export function getSkillBySlug(slug: string): Skill | undefined {
  return skills.find((skill) => skill.slug === slug);
}


export function difficultyLevelToString(
  skillSlug: string,
  scoreValue: number, // Pass the score value directly
  calcSettings?: CalculationSettings,
  currSettings?: CurrencySettings,
  timeSettings?: TimeSettings,
  calendarSettings?: CalendarSettings,
  numberLevelSettings?: NumberLevelSettings,
  countSettings?: CountSettings,
  readingRaceSettings?: ReadingRaceSettings
): string | null {
  const skill = getSkillBySlug(skillSlug);
  if (skill?.isFixedLevel) {
    return `Niveau ${skill.isFixedLevel}`;
  }

  if (readingRaceSettings?.level) {
    return readingRaceSettings.level;
  }
  if (numberLevelSettings?.level) {
    return `Niveau ${numberLevelSettings.level}`;
  }
  if (calendarSettings?.level) {
    return `Niveau ${calendarSettings.level}`;
  }

  if (skillSlug === 'time' && timeSettings) {
    const difficultyMap: Record<number, SkillLevel> = { 0: 'A', 1: 'B', 2: 'C', 3: 'D' };
    const level = difficultyMap[timeSettings.difficulty] || 'A';
    return `Niveau ${level}`;
  }

  if (skillSlug === 'currency' && currSettings) {
    return `Niveau ${String.fromCharCode(65 + currSettings.difficulty)}`;
  }

  if (skillSlug === 'denombrement') {
    return "Niveau A"; // isFixedLevel handles this, but as a fallback.
  }

  // Fallback for skills that might not have detailed settings but are level-based
  if (skill?.allowedLevels) {
    // Find student level for this skill if available, otherwise make a guess
    if (scoreValue < 50) return `Niveau ${skill.allowedLevels[0]}`;
    if (scoreValue < 80 && skill.allowedLevels.length > 1) return `Niveau ${skill.allowedLevels[1]}`;
    return `Niveau ${skill.allowedLevels[skill.allowedLevels.length - 1]}`;
  }


  // Fallback for any other case where level can't be determined
  return null;
}
