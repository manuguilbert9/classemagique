import { useEffect, useRef, useState } from "react";
import { DICTIONARY } from "@/data/dictionaries/fr-dictionary";
import { suggestSentenceCompletion } from "@/ai/flows/sentence-completion-flow";

function getLastWord(s: string): string {
  const m = s.match(/([A-Za-zÀ-ÖØ-öø-ÿ'-]+)$/);
  return m?.[1]?.toLowerCase() || "";
}

export function useSpellSuggestions(text: string, lang = "fr") {
  const [wordSuggestions, setWordSuggestions] = useState<string[]>([]);
  const [phraseSuggestions, setPhraseSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimeout = useRef<number>();

  useEffect(() => {
    // Instant word suggestions
    const lastWord = getLastWord(text);
    if (lastWord) {
      const localSuggestions = DICTIONARY.filter(word => word.startsWith(lastWord));
      localSuggestions.sort((a, b) => a.length - b.length);
      setWordSuggestions(localSuggestions);
    } else {
      setWordSuggestions([]);
    }

    // Debounced phrase suggestions (Smart Compose)
    if (debounceTimeout.current) window.clearTimeout(debounceTimeout.current);

    if (text.trim().length > 5 && text.endsWith(' ')) { // Trigger on space after a few words
      setIsLoading(true);
      debounceTimeout.current = window.setTimeout(async () => {
        try {
          const result = await suggestSentenceCompletion({ text });
          setPhraseSuggestions(result.suggestions ?? []);
        } catch (error) {
          console.error("Smart Compose failed:", error);
          setPhraseSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      }, 500); // 500ms debounce
    } else {
      setPhraseSuggestions([]);
      setIsLoading(false);
    }

    return () => {
      if (debounceTimeout.current) window.clearTimeout(debounceTimeout.current);
    };

  }, [text, lang]);

  return { wordSuggestions, phraseSuggestions, isLoading };
}
