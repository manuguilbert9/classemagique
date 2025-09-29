import { useEffect, useMemo, useRef, useState } from "react";
import { STARTER_WORDS } from "@/data/dictionaries/fr-dictionary";
import {
  getContextualContinuations,
  getPrefixSuggestions,
} from "@/lib/prefix-suggester";

function getLastWord(s: string): string {
  const m = s.match(/([A-Za-zÀ-ÖØ-öø-ÿ'-]+)$/);
  return m?.[1] || "";
}

const MAX_VISIBLE_SUGGESTIONS = 8;
const MAX_CONTEXT_WORDS = 6;
const MIN_REMOTE_LENGTH = 3;
const STARTER_SUGGESTIONS = STARTER_WORDS.slice(0, MAX_VISIBLE_SUGGESTIONS);
const WORD_REGEX = /[A-Za-zÀ-ÖØ-öø-ÿ'-]+/g;

export function useSpellSuggestions(text: string, lang = "fr") {
  const [remoteSuggestions, setRemoteSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceWord = useRef<number>();
  const cacheRef = useRef<Map<string, string[]>>(new Map());
  const controllerRef = useRef<AbortController | null>(null);

  const trimmedText = text.trim();
  const lastWord = useMemo(() => getLastWord(text), [text]);
  const contextWords = useMemo(() => {
    if (!text) return [] as string[];
    const allTokens = text.match(WORD_REGEX) ?? [];

    if (!lastWord) {
      return allTokens.slice(-MAX_CONTEXT_WORDS);
    }

    if (allTokens.length === 0) return [] as string[];
    return allTokens.slice(0, -1).slice(-MAX_CONTEXT_WORDS);
  }, [lastWord, text]);
  const hasTypedContent = trimmedText.length > 0;

  const localSuggestions = useMemo(() => {
    if (!hasTypedContent) {
      return STARTER_SUGGESTIONS;
    }

    if (!lastWord) {
      const contextualContinuations = getContextualContinuations(
        contextWords,
        MAX_VISIBLE_SUGGESTIONS,
      );

      if (contextualContinuations.length > 0) {
        return contextualContinuations;
      }

      return STARTER_SUGGESTIONS;
    }
    const suggestions = getPrefixSuggestions(
      lastWord,
      MAX_VISIBLE_SUGGESTIONS,
      contextWords,
    );
    if (suggestions.length === 0) {
      return STARTER_SUGGESTIONS;
    }
    return suggestions;
  }, [contextWords, hasTypedContent, lastWord]);

  useEffect(() => {
    if (debounceWord.current) window.clearTimeout(debounceWord.current);
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }

    if (!hasTypedContent || !lastWord || lastWord.length < MIN_REMOTE_LENGTH) {
      setIsLoading(false);
      setRemoteSuggestions([]);
      return () => undefined;
    }

    const cacheKey = `${lang}:${lastWord.toLowerCase()}`;
    const cached = cacheRef.current.get(cacheKey);
    if (cached) {
      setRemoteSuggestions(cached);
      setIsLoading(false);
      return () => undefined;
    }

    setIsLoading(true);
    debounceWord.current = window.setTimeout(async () => {
      try {
        controllerRef.current = new AbortController();
        const response = await fetch("/api/spell", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: lastWord, lang }),
          signal: controllerRef.current.signal,
        });
        if (response.ok) {
          const data = await response.json();
          const suggestions = Array.isArray(data.suggestions)
            ? data.suggestions.filter(
                (suggestion): suggestion is string =>
                  typeof suggestion === "string" && suggestion.trim().length > 0,
              )
            : [];
          cacheRef.current.set(cacheKey, suggestions);
          setRemoteSuggestions(suggestions);
        } else {
          setRemoteSuggestions([]);
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Error fetching spell suggestions:", error);
        }
        setRemoteSuggestions([]);
      } finally {
        setIsLoading(false);
        controllerRef.current = null;
      }
    }, 120);

    return () => {
      if (debounceWord.current) window.clearTimeout(debounceWord.current);
      if (controllerRef.current) {
        controllerRef.current.abort();
        controllerRef.current = null;
      }
    };
  }, [hasTypedContent, lang, lastWord]);

  const wordSuggestions = useMemo(() => {
    if (!hasTypedContent) {
      return STARTER_SUGGESTIONS;
    }

    const merged: string[] = [];
    const seen = new Set<string>();

    for (const list of [localSuggestions, remoteSuggestions]) {
      for (const suggestion of list) {
        if (!suggestion) continue;
        const trimmedSuggestion = suggestion.trim();
        if (!trimmedSuggestion) continue;
        if (seen.has(trimmedSuggestion)) continue;
        merged.push(trimmedSuggestion);
        seen.add(trimmedSuggestion);
        if (merged.length >= MAX_VISIBLE_SUGGESTIONS) {
          return merged;
        }
      }
    }

    if (merged.length === 0) {
      return localSuggestions.slice(0, MAX_VISIBLE_SUGGESTIONS);
    }

    return merged;
  }, [hasTypedContent, localSuggestions, remoteSuggestions]);

  return { wordSuggestions, isLoading };
}
