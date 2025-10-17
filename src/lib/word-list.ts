
export interface WordWithEmoji {
  word: string;
  emoji: string;
}

const simpleWords: WordWithEmoji[] = [
  // Articles et déterminants (pas d'emoji spécifique)
  { word: 'le', emoji: '📝' },
  { word: 'la', emoji: '📝' },
  { word: 'un', emoji: '📝' },
  { word: 'une', emoji: '📝' },
  { word: 'ma', emoji: '📝' },
  { word: 'sa', emoji: '📝' },
  { word: 'ta', emoji: '📝' },
  { word: 'mon', emoji: '📝' },
  { word: 'son', emoji: '📝' },
  { word: 'ton', emoji: '📝' },
  // Pronoms
  { word: 'il', emoji: '👦' },
  { word: 'elle', emoji: '👧' },
  { word: 'a', emoji: '🔤' },
  // Noms avec emojis correspondants
  { word: 'ami', emoji: '🧑‍🤝‍🧑' },
  { word: 'papa', emoji: '👨' },
  { word: 'papi', emoji: '👴' },
  { word: 'lune', emoji: '🌙' },
  { word: 'robe', emoji: '👗' },
  { word: 'école', emoji: '🏫' },
  { word: 'livre', emoji: '📖' },
  { word: 'tasse', emoji: '☕' },
  { word: 'moto', emoji: '🏍️' },
  { word: 'vélo', emoji: '🚲' },
  { word: 'rat', emoji: '🐀' },
  { word: 'riz', emoji: '🍚' },
  { word: 'sac', emoji: '👜' },
  { word: 'sol', emoji: '🌍' },
  { word: 'mur', emoji: '🧱' },
  { word: 'lit', emoji: '🛏️' },
  { word: 'bus', emoji: '🚌' },
  { word: 'dame', emoji: '👩' },
  { word: 'rue', emoji: '🛣️' },
  { word: 'niche', emoji: '🏠' },
  { word: 'page', emoji: '📄' },
  { word: 'neige', emoji: '❄️' },
  { word: 'fille', emoji: '👧' },
  { word: 'roi', emoji: '👑' },
  { word: 'loi', emoji: '⚖️' },
  { word: 'plat', emoji: '🍽️' },
  { word: 'train', emoji: '🚂' },
  { word: 'fleur', emoji: '🌸' },
  { word: 'chat', emoji: '🐈' },
  { word: 'chien', emoji: '🐕' },
  { word: 'table', emoji: '🪑' }, // Note: utilise l'emoji chaise car pas d'emoji table distinct
  { word: 'chaise', emoji: '🪑' },
  { word: 'pomme', emoji: '🍎' },
  { word: 'poire', emoji: '🍐' },
  { word: 'banane', emoji: '🍌' },
  { word: 'sucre', emoji: '🍬' },
  { word: 'café', emoji: '☕' },
  { word: 'lettre', emoji: '✉️' },
  { word: 'chou', emoji: '🥬' },
  { word: 'feu', emoji: '🔥' },
  { word: 'jeu', emoji: '🎲' },
  { word: 'balle', emoji: '⚽' },
  { word: 'os', emoji: '🦴' },
  { word: 'jus', emoji: '🧃' },
  { word: 'lait', emoji: '🥛' },
  { word: 'vin', emoji: '🍷' },
  { word: 'fort', emoji: '💪' },
  { word: 'doux', emoji: '🧸' },
  { word: 'bébé', emoji: '👶' },
  // Mots simples supplémentaires (sans sons complexes)
  { word: 'lac', emoji: '🏞️' },
  { word: 'mer', emoji: '🌊' },
  { word: 'pic', emoji: '⛰️' },
  { word: 'ski', emoji: '⛷️' },
  { word: 'bar', emoji: '🐟' },
  { word: 'cap', emoji: '🧭' },
  { word: 'dos', emoji: '🔙' },
  { word: 'pas', emoji: '👣' },
  { word: 'sel', emoji: '🧂' },
  { word: 'vie', emoji: '🌱' },
  { word: 'fil', emoji: '🧵' },
  { word: 'été', emoji: '☀️' },
  { word: 'star', emoji: '⭐' },
  { word: 'porte', emoji: '🚪' },
  { word: 'gare', emoji: '🚉' },
  { word: 'date', emoji: '📅' },
  { word: 'note', emoji: '🎵' },
  { word: 'code', emoji: '💻' },
  { word: 'pile', emoji: '🔋' },
  { word: 'zone', emoji: '🗺️' },
  { word: 'vase', emoji: '🏺' },
  { word: 'bec', emoji: '🦆' },
  { word: 'thé', emoji: '🍵' },
  { word: 'île', emoji: '🏝️' },
  { word: 'nid', emoji: '🪺' },
  { word: 'arc', emoji: '🏹' },
  { word: 'lime', emoji: '🍋' },
  { word: 'rame', emoji: '🚣' },
  { word: 'sage', emoji: '🧘' },
  { word: 'vide', emoji: '⭕' },
  { word: 'cube', emoji: '🧊' },
  { word: 'tape', emoji: '✋' },
  { word: 'cave', emoji: '🍷' },
  { word: 'base', emoji: '📊' }
];


/**
 * Gets a specified number of unique, randomly selected simple words with their emojis.
 * @param count The number of words to get.
 * @returns An array of simple word objects with emojis.
 */
export function getSimpleWords(count: number): WordWithEmoji[] {
  // Shuffle the array
  const shuffled = simpleWords.sort(() => 0.5 - Math.random());
  // Get the first `count` elements
  return shuffled.slice(0, count);
}
