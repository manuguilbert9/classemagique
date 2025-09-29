import { COMMON_FRENCH_WORDS } from "@/data/dictionaries/fr-common-words";
import { STARTER_WORDS } from "@/data/dictionaries/fr-dictionary";

const MAX_SUGGESTIONS_PER_PREFIX = 8;

const CURATED_WORDS = [
  "c'est",
  "c'était",
  "coucou",
  "d'accord",
  "j'adore",
  "j'arrive",
  "j'attends",
  "j'espère",
  "j'ai",
  "j'aime",
  "j'aimerais",
  "j'étais",
  "j'avais",
  "j'aurai",
  "t'es",
  "t'as",
  "t'étais",
  "t'inquiète",
  "ok",
  "parfait",
  "super",
  "top",
  "bravo",
  "génial",
  "merci",
  "salut",
  "bonjour",
  "à bientôt",
  "à tout à l'heure",
  "à demain",
  "à plus",
];

function normalizeForIndex(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]+/g, "");
}

const curatedWordEntries = CURATED_WORDS.map((word, index) => ({
  word,
  frequency: 10000000 - index * 5000,
}));

const starterWordEntries = STARTER_WORDS.filter(word => !word.includes(" "))
  .map((word, index) => ({
    word,
    frequency: 500000 - index * 1000,
  }));

const sortedEntries = [
  ...curatedWordEntries,
  ...COMMON_FRENCH_WORDS,
  ...starterWordEntries,
]
  .map(entry => ({
    word: entry.word,
    normalized: normalizeForIndex(entry.word),
    frequency: entry.frequency,
  }))
  .filter(entry => entry.normalized.length > 0)
  .sort((a, b) => b.frequency - a.frequency);

const prefixMap = new Map<string, string[]>();

for (const entry of sortedEntries) {
  const suggestion = entry.word;
  const normalized = entry.normalized;
  for (let i = 1; i <= normalized.length; i += 1) {
    const prefix = normalized.slice(0, i);
    const existing = prefixMap.get(prefix);
    if (!existing) {
      prefixMap.set(prefix, [suggestion]);
      continue;
    }
    if (existing.includes(suggestion)) continue;
    if (existing.length >= MAX_SUGGESTIONS_PER_PREFIX) continue;
    existing.push(suggestion);
  }
}

/**
 * Returns the most frequent French words starting with the provided prefix.
 */
export function getPrefixSuggestions(
  prefix: string,
  limit = MAX_SUGGESTIONS_PER_PREFIX,
): string[] {
  const normalized = normalizeForIndex(prefix);
  if (!normalized) return [];
  const matches = prefixMap.get(normalized);
  if (!matches) return [];
  return matches.slice(0, limit);
}

/**
 * A light-weight check to determine whether a prefix has any candidates.
 */
export function hasPrefixSuggestions(prefix: string): boolean {
  const normalized = normalizeForIndex(prefix);
  if (!normalized) return false;
  return prefixMap.has(normalized);
}
