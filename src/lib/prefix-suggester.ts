import { STARTER_WORDS } from "@/data/dictionaries/fr-dictionary";
import { FRENCH_CORE_VOCABULARY } from "@/data/dictionaries/fr-core-vocabulary";

const CURATED_WORDS = [
  "ça va",
  "comment ça va",
  "tu fais quoi",
  "tu viens",
  "tu arrives",
  "tu peux",
  "tu veux",
  "tu as",
  "tu es",
  "je suis",
  "je vais",
  "je viens",
  "je peux",
  "je dois",
  "je veux",
  "je pense",
  "je crois",
  "je comprends",
  "je ne sais pas",
  "je n'ai pas",
  "je n'ai plus",
  "je suis là",
  "je suis prêt",
  "c'est",
  "c'était",
  "c'est bon",
  "c'est noté",
  "c'est parti",
  "c'est super",
  "c'est top",
  "t'es",
  "t'as",
  "t'inquiète",
  "pas de souci",
  "pas de problème",
  "pas grave",
  "pas encore",
  "pas maintenant",
  "ok",
  "d'accord",
  "parfait",
  "super",
  "top",
  "bravo",
  "génial",
  "magnifique",
  "formidable",
  "bien joué",
  "trop bien",
  "trop cool",
  "merci",
  "merci beaucoup",
  "merci d'avance",
  "salut",
  "bonjour",
  "bonsoir",
  "bonne idée",
  "bonne question",
  "bonne soirée",
  "bonne journée",
  "bon week-end",
  "à bientôt",
  "à tout à l'heure",
  "à plus",
  "à plus tard",
  "à demain",
  "à tout de suite",
  "à très vite",
  "à plus !",
  "allez",
  "vas-y",
  "on y va",
  "let's go",
  "au secours",
  "help",
  "bien sûr",
  "évidemment",
  "pas du tout",
  "pas trop",
  "du coup",
  "bref",
  "sinon",
  "ensuite",
  "d'abord",
  "de toute façon",
  "comme tu veux",
  "si tu veux",
  "à voir",
  "on se tient au courant",
  "on se voit",
  "dis-moi",
  "tiens moi au courant",
  "fais moi signe",
  "n'hésite pas",
] as const;

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

const SOURCE_WORDS = Array.from(
  new Set<string>([
    ...CURATED_WORDS,
    ...STARTER_WORDS,
    ...FRENCH_CORE_VOCABULARY,
  ]),
);

const PREFIX_MAP = buildPrefixMap(SOURCE_WORDS);

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
