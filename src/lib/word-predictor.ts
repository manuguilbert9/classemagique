
import { PHRASES_RAW } from '@/data/grammaire/phrases';

let dictionary: string[] = [];

// This function should be called once when the application loads.
export function initializeDictionary() {
  if (dictionary.length > 0) return;

  const words = PHRASES_RAW
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[.,'!?]/g, '') // Remove basic punctuation
    .split(/\s+/) // Split by whitespace
    .filter(word => word.length > 2); // Keep words with more than 2 letters

  // Create a unique, sorted list of words
  dictionary = [...new Set(words)].sort();
}

/**
 * Gets word suggestions based on a prefix.
 * @param prefix The beginning of a word.
 * @returns An array of up to 3 word suggestions.
 */
export function getWordSuggestions(prefix: string): string[] {
  if (!prefix || dictionary.length === 0) {
    return [];
  }

  const lowerPrefix = prefix.toLowerCase();
  
  const suggestions = dictionary.filter(word => word.startsWith(lowerPrefix));

  // Return the first 3 suggestions
  return suggestions.slice(0, 3);
}
