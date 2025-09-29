import { STARTER_WORDS } from "@/data/dictionaries/fr-dictionary";

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

const MAX_SUGGESTIONS_PER_PREFIX = 12;

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]+/g, "");
}

function buildPrefixMap(words: string[]): Map<string, string[]> {
  const prefixMap = new Map<string, string[]>();
  const seenWords = new Set<string>();

  for (const rawWord of words) {
    const word = rawWord.trim();
    if (!word) continue;

    const normalized = normalize(word);
    if (!normalized) continue;

    const dedupeKey = normalized;
    if (seenWords.has(dedupeKey)) continue;
    seenWords.add(dedupeKey);

    for (let i = 1; i <= normalized.length; i += 1) {
      const prefix = normalized.slice(0, i);
      const existing = prefixMap.get(prefix);
      if (!existing) {
        prefixMap.set(prefix, [word]);
        continue;
      }

      if (existing.some(entry => normalize(entry) === normalized)) continue;
      if (existing.length >= MAX_SUGGESTIONS_PER_PREFIX) continue;

      existing.push(word);
    }
  }

  return prefixMap;
}

const PREFIX_MAP = buildPrefixMap([
  ...CURATED_WORDS,
  ...STARTER_WORDS,
]);

export function getPrefixSuggestions(prefix: string, limit = 8): string[] {
  const normalizedPrefix = normalize(prefix);
  if (!normalizedPrefix) return [];

  const exactMatch = PREFIX_MAP.get(normalizedPrefix);
  if (exactMatch && exactMatch.length) {
    return exactMatch.slice(0, limit);
  }

  for (let i = normalizedPrefix.length - 1; i > 0; i -= 1) {
    const fallback = PREFIX_MAP.get(normalizedPrefix.slice(0, i));
    if (fallback && fallback.length) {
      return fallback.slice(0, limit);
    }
  }

  return [];
}

export function hasPrefixSuggestions(prefix: string): boolean {
  return getPrefixSuggestions(prefix, 1).length > 0;
}
