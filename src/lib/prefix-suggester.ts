

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

  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]+/g, "");
}


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


}

/**
 * Returns the most frequent French words starting with the provided prefix.
 */

}

/**
 * A light-weight check to determine whether a prefix has any candidates.
 */
export function hasPrefixSuggestions(prefix: string): boolean {

