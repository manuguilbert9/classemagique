import { useEffect, useRef, useState } from "react";
import { suggestSentenceCompletion } from "@/ai/flows/sentence-completion-flow";

function getLastWord(s: string): string {
  const m = s.match(/([A-Za-zÀ-ÖØ-öø-ÿ'-]+)$/);
  return m?.[1] || "";
}

export function useSpellSuggestions(text: string, lang = "fr") {
  const [wordSuggestions, setWordSuggestions] = useState<string[]>([]);
  const [phraseSuggestions, setPhraseSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceWord = useRef<number>();
  const debouncePhrase = useRef<number>();

  useEffect(() => {
    // LanguageTool word suggestions (debounced)
    if (debounceWord.current) window.clearTimeout(debounceWord.current);
    const lastWord = getLastWord(text);

    if (lastWord.length > 0) {
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
        }
      }, 250); // Debounce to avoid spamming the API
    } else {
        setWordSuggestions([]);
    }

    // Debounced phrase suggestions (Smart Compose)
    if (debouncePhrase.current) window.clearTimeout(debouncePhrase.current);
    if (text.trim().length > 5 && text.endsWith(' ')) {
      setIsLoading(true);
      debouncePhrase.current = window.setTimeout(async () => {
        try {
          const result = await suggestSentenceCompletion({ text });
          setPhraseSuggestions(result.suggestions ?? []);
        } catch (error) {
          console.error("Smart Compose failed:", error);
          setPhraseSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      }, 500);
    } else {
      setPhraseSuggestions([]);
      if (!lastWord) { // Only set loading to false if not waiting for word suggestions
        setIsLoading(false);
      }
    }

    return () => {
      if (debounceWord.current) window.clearTimeout(debounceWord.current);
      if (debouncePhrase.current) window.clearTimeout(debouncePhrase.current);
    };

  }, [text, lang]);

  return { wordSuggestions, phraseSuggestions, isLoading };
}
