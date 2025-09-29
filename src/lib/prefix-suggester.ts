import type { FrenchWordEntry } from "@/data/dictionaries/fr-common-words";
import { COMMON_FRENCH_WORDS } from "@/data/dictionaries/fr-common-words";
import { STARTER_WORDS } from "@/data/dictionaries/fr-dictionary";

export interface PrefixWordEntry {
  word: string;
  frequency: number;
}

export const MAX_SUGGESTIONS_PER_PREFIX = 8;

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
] as const;

export function normalizePrefixToken(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]+/g, "");
}

function toEntries(words: readonly string[], baseFrequency: number, step: number): PrefixWordEntry[] {
  return words.map((word, index) => ({
    word,
    frequency: baseFrequency - index * step,
  }));
}

const curatedWordEntries: PrefixWordEntry[] = toEntries(CURATED_WORDS, 10_000_000, 5_000);

const starterWordEntries: PrefixWordEntry[] = STARTER_WORDS.filter(word => !word.includes(" "))
  .map((word, index) => ({
    word,
    frequency: 500_000 - index * 1_000,
  }));

function normalizeDictionary(entries: readonly PrefixWordEntry[]): Array<PrefixWordEntry & { normalized: string }> {
  return entries
    .map(entry => ({
      word: entry.word,
      normalized: normalizePrefixToken(entry.word),
      frequency: entry.frequency,
    }))
    .filter(entry => entry.normalized.length > 0);
}

const dictionarySources: PrefixWordEntry[] = [
  ...curatedWordEntries,
  ...COMMON_FRENCH_WORDS,
  ...starterWordEntries,
];

const sortedEntries = normalizeDictionary(dictionarySources).sort((a, b) => b.frequency - a.frequency);

const prefixMap = new Map<string, string[]>();

function addEntryToMap(entry: { suggestion: string; normalized: string }) {
  const { suggestion, normalized } = entry;
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

for (const entry of sortedEntries) {
  addEntryToMap({ suggestion: entry.word, normalized: entry.normalized });
}

/**
 * Returns the most frequent French words starting with the provided prefix.
 */
export function getPrefixSuggestions(prefix: string, limit = MAX_SUGGESTIONS_PER_PREFIX): string[] {
  const normalized = normalizePrefixToken(prefix);
  if (!normalized) return [];
  const matches = prefixMap.get(normalized);
  if (!matches) return [];
  return matches.slice(0, limit);
}

/**
 * A light-weight check to determine whether a prefix has any candidates.
 */
export function hasPrefixSuggestions(prefix: string): boolean {
  const normalized = normalizePrefixToken(prefix);
  if (!normalized) return false;
  return prefixMap.has(normalized);
}

export type { FrenchWordEntry };
