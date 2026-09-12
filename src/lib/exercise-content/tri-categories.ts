/**
 * Les collections de « Tri par catégories » et le tirage d'une séance.
 *
 * Les données restent partagées avec le composant (il en tire les couleurs et
 * les intitulés) ; le tirage, lui, est exécuté côté serveur pour être mémorisé.
 */

export interface Category {
  name: string;
  emoji: string;
  items: string[];
  bgClass: string;
  textClass: string;
  borderClass: string;
}

export interface CategorySet {
  id: string;
  category1: Category;
  category2: Category;
}

export const CATEGORY_SETS: CategorySet[] = [
  {
    id: 'animals-vehicles',
    category1: {
      name: 'Animaux',
      emoji: '🐾',
      items: ['🐶', '🐱', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧'],
      bgClass: 'bg-green-100 hover:bg-green-200',
      textClass: 'text-green-800',
      borderClass: 'border-green-400',
    },
    category2: {
      name: 'Véhicules',
      emoji: '🚗',
      items: ['🚕', '🚙', '🚌', '🏎️', '🚓', '🚑', '🚒', '🚚', '🛵', '✈️', '🚀', '🚁', '⛵', '🚂', '🚜'],
      bgClass: 'bg-blue-100 hover:bg-blue-200',
      textClass: 'text-blue-800',
      borderClass: 'border-blue-400',
    },
  },
  {
    id: 'fruits-clothes',
    category1: {
      name: 'Fruits',
      emoji: '🍓',
      items: ['🍎', '🍌', '🍇', '🍑', '🍒', '🍉', '🥭', '🍊', '🍋', '🍐', '🍏', '🍈', '🫐', '🍅', '🥝'],
      bgClass: 'bg-orange-100 hover:bg-orange-200',
      textClass: 'text-orange-800',
      borderClass: 'border-orange-400',
    },
    category2: {
      name: 'Vêtements',
      emoji: '👕',
      items: ['👖', '🧣', '🧤', '🧦', '👗', '🧥', '👔', '👒', '🎩', '👟', '👠', '🧢', '🩱', '🥾', '🩳'],
      bgClass: 'bg-purple-100 hover:bg-purple-200',
      textClass: 'text-purple-800',
      borderClass: 'border-purple-400',
    },
  },
  {
    id: 'sea-savanna',
    category1: {
      name: 'Mer',
      emoji: '🌊',
      items: ['🐠', '🦈', '🐬', '🐋', '🦑', '🦞', '🦀', '🐡', '🦭', '🐙', '🦐', '🐚', '🐟', '🦟', '🐊'],
      bgClass: 'bg-cyan-100 hover:bg-cyan-200',
      textClass: 'text-cyan-800',
      borderClass: 'border-cyan-400',
    },
    category2: {
      name: 'Savane',
      emoji: '🌿',
      items: ['🦁', '🐘', '🦒', '🦓', '🐆', '🦏', '🐪', '🦛', '🦍', '🦜', '🦘', '🐃', '🦌', '🐆', '🦬'],
      bgClass: 'bg-amber-100 hover:bg-amber-200',
      textClass: 'text-amber-800',
      borderClass: 'border-amber-400',
    },
  },
  {
    id: 'food-sports',
    category1: {
      name: 'Nourriture',
      emoji: '🍽️',
      items: ['🍕', '🍔', '🌮', '🍣', '🍜', '🍞', '🧁', '🍰', '🍦', '🥐', '🧇', '🥞', '🥗', '🍲', '🥙'],
      bgClass: 'bg-red-100 hover:bg-red-200',
      textClass: 'text-red-800',
      borderClass: 'border-red-400',
    },
    category2: {
      name: 'Sports',
      emoji: '⚽',
      items: ['🏀', '🎮', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🥊', '🎣', '🏹', '🛹', '🎽'],
      bgClass: 'bg-indigo-100 hover:bg-indigo-200',
      textClass: 'text-indigo-800',
      borderClass: 'border-indigo-400',
    },
  },
];

/** Une séance : cinq objets de chaque catégorie. */
export const NUM_ITEMS = 10;

// ========================
// HELPERS
// ========================

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export interface GameItem {
  emoji: string;
  correctCategory: 1 | 2;
}

function buildGameData(set: CategorySet): GameItem[] {
  const half = NUM_ITEMS / 2;
  const items1 = shuffle(set.category1.items).slice(0, half).map(e => ({ emoji: e, correctCategory: 1 as const }));
  const items2 = shuffle(set.category2.items).slice(0, half).map(e => ({ emoji: e, correctCategory: 2 as const }));
  return shuffle([...items1, ...items2]);
}

function pickRandomSet(): CategorySet {
  return CATEGORY_SETS[Math.floor(Math.random() * CATEGORY_SETS.length)];
}

export interface SeanceDeTri {
  /** L'identifiant de la collection travaillée. */
  setId: string;
  items: GameItem[];
}

export function generateSeancesDeTri(count: number): SeanceDeTri[] {
  return Array.from({ length: count }, () => {
    const set = pickRandomSet();
    return { setId: set.id, items: buildGameData(set) };
  });
}
