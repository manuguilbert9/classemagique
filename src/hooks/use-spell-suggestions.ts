import { useEffect, useRef, useState } from "react";
import { STARTER_WORDS } from "@/data/dictionaries/fr-dictionary";

function getLastWord(s: string): string {
  const m = s.match(/([A-Za-zÀ-ÖØ-öø-ÿ'-]+)$/);
  return m?.[1] || "";
}

export function useSpellSuggestions(text: string, lang = "fr") {
  const [wordSuggestions, setWordSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceWord = useRef<number>();

  useEffect(() => {
    if (debounceWord.current) window.clearTimeout(debounceWord.current);
    
    if (text.trim() === '') {
        // If input is empty, show starter words
        setWordSuggestions(STARTER_WORDS);
        setIsLoading(false);
        return;
    }

    const lastWord = getLastWord(text);

    if (lastWord.length > 0) {
      setIsLoading(true);
      debounceWord.current = window.setTimeout(async () => {
        try {
          const response = await fetch("/api/spell", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: lastWord, lang }),
          });
          if (response.ok) {
            const data = await response.json();
            setWordSuggestions(data.suggestions ?? []);
          } else {
             setWordSuggestions([]);
          }
        } catch (error) {
           console.error("Error fetching spell suggestions:", error);
           setWordSuggestions([]);
        } finally {
            setIsLoading(false);
        }
      }, 250); // Debounce to avoid spamming the API
    } else {
        // This case might be reached if the text ends with a space.
        // We can show the starter words again.
        setWordSuggestions(STARTER_WORDS);
        setIsLoading(false);
    }

    return () => {
      if (debounceWord.current) window.clearTimeout(debounceWord.current);
    };

  }, [text, lang]);

  return { wordSuggestions, isLoading };
}
