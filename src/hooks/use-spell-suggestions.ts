import { useEffect, useState } from "react";
import { DICTIONARY } from "@/data/dictionaries/fr-dictionary";

function getLastToken(s: string) {
  const m = s.match(/([A-Za-zÀ-ÖØ-öø-ÿ'-]+)$/);
  return m?.[1]?.toLowerCase() || "";
}

export function useSpellSuggestions(text: string, lang = "fr") {
  const [sugg, setSugg] = useState<string[]>([]);

  useEffect(() => {
    const last = getLastToken(text);
    if (last.length < 1) {
      setSugg([]);
      return;
    }

    // Perform a local search in the dictionary
    const suggestions = DICTIONARY.filter(word => word.startsWith(last));
    
    // Sort suggestions to prioritize shorter, more common words first
    suggestions.sort((a, b) => a.length - b.length);

    setSugg(suggestions);

  }, [text, lang]);

  return sugg;
}
