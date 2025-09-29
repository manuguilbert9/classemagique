import { COMMON_FRENCH_WORDS } from "@/data/dictionaries/fr-common-words";
import { CONTEXTUAL_CONTINUATIONS } from "@/data/dictionaries/fr-contextual-continuations";
import { STARTER_WORDS } from "@/data/dictionaries/fr-dictionary";

const MAX_SUGGESTIONS_PER_PREFIX = 8;
const MAX_CONTEXT_WINDOW = 3;

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
const contextContinuationMap = new Map<string, string[]>();

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

for (const entry of CONTEXTUAL_CONTINUATIONS) {
  const normalizedContextTokens = entry.context
    .map(normalizeForIndex)
    .filter(Boolean);
  if (normalizedContextTokens.length === 0) continue;

  const normalizedContext = normalizedContextTokens.join(" ");
  if (!normalizedContext) continue;

  const existing = contextContinuationMap.get(normalizedContext) ?? [];
  for (const suggestion of entry.suggestions) {
    if (!suggestion) continue;
    if (existing.includes(suggestion)) continue;
    existing.push(suggestion);
  }
  contextContinuationMap.set(normalizedContext, existing);
}

function getContextualMatches(
  normalizedPrefix: string,
  contextWords: string[],
  limit: number,
): string[] {
  if (contextWords.length === 0) return [];

  const normalizedContext = contextWords
    .map(normalizeForIndex)
    .filter(Boolean);
  if (normalizedContext.length === 0) return [];

  const matches: string[] = [];

  const windowSize = Math.min(MAX_CONTEXT_WINDOW, normalizedContext.length);

  for (let size = windowSize; size > 0; size -= 1) {
    const contextKey = normalizedContext.slice(-size).join(" ");
    const suggestions = contextContinuationMap.get(contextKey);
    if (!suggestions) continue;

    for (const suggestion of suggestions) {
      if (matches.includes(suggestion)) continue;
      if (
        normalizedPrefix &&
        !normalizeForIndex(suggestion).startsWith(normalizedPrefix)
      ) {
        continue;
      }
      matches.push(suggestion);
      if (matches.length >= limit) {
        return matches;
      }
    }
  }

  return matches;
}

/**
 * Returns the most frequent French words starting with the provided prefix.
 */
export function getPrefixSuggestions(
  prefix: string,
  limit = MAX_SUGGESTIONS_PER_PREFIX,
  contextWords: string[] = [],
): string[] {
  const normalized = normalizeForIndex(prefix);
  const safeLimit = Math.max(1, limit);
  const contextualMatches = getContextualMatches(
    normalized,
    contextWords,
    safeLimit,
  );

  if (!normalized) {
    return contextualMatches.slice(0, safeLimit);
  }
  const baseMatches = prefixMap.get(normalized) ?? [];

  const merged: string[] = [];
  for (const list of [contextualMatches, baseMatches]) {
    for (const suggestion of list) {
      if (!suggestion) continue;
      if (merged.includes(suggestion)) continue;
      merged.push(suggestion);
      if (merged.length >= safeLimit) {
        return merged;
      }
    }
  }

  return merged.slice(0, safeLimit);
}

export function getContextualContinuations(
  contextWords: string[],
  limit = MAX_SUGGESTIONS_PER_PREFIX,
): string[] {
  return getContextualMatches("", contextWords, Math.max(1, limit));
}

/**
 * A light-weight check to determine whether a prefix has any candidates.
 */
export function hasPrefixSuggestions(prefix: string): boolean {
  const normalized = normalizeForIndex(prefix);
  if (!normalized) return false;
  return prefixMap.has(normalized);
}
