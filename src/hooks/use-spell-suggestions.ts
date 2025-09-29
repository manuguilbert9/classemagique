
"use client"

import { useEffect, useMemo, useRef, useState } from "react";
import { STARTER_WORDS } from "@/data/dictionaries/fr-dictionary";
import { COMMON_FRENCH_WORDS } from "@/data/dictionaries/fr-common-words";
import { CONTEXTUAL_CONTINUATIONS } from "@/data/dictionaries/fr-contextual-continuations";
import { FRENCH_CORE_VOCABULARY } from "@/data/dictionaries/fr-core-vocabulary";
import { getPrefixSuggestions, hasPrefixSuggestions } from "@/lib/prefix-suggester";


const WORD_PATTERN = /([A-Za-zÀ-ÖØ-öø-ÿ'-]+)/g;

function extractWords(value: string): string[] {
  return (
    value
      .toLowerCase()
      .match(WORD_PATTERN)
      ?.map((word) => word.trim())
      .filter(Boolean) ?? []
  );
}

export interface UseSpellSuggestionsOptions {
  lang?: string;
  maxVisibleSuggestions?: number;
  minRemoteLength?: number;
  debounceMs?: number;
}

export interface SuggestionBucket {
    id: string;
    label: string;
    description?: string;
    suggestions: string[];
}

export interface UseSpellSuggestionsResult {
  wordSuggestions: string[];
  suggestionBuckets: SuggestionBucket[];
  isLoading: boolean;
  refresh: () => void;
}

const DEFAULT_OPTIONS: Required<UseSpellSuggestionsOptions> = {
  lang: "fr",
  maxVisibleSuggestions: 12,
  minRemoteLength: 1,
  debounceMs: 150,
};

function resolveOptions(
  langOrOptions: string | UseSpellSuggestionsOptions | undefined,
  options: UseSpellSuggestionsOptions | undefined,
): Required<UseSpellSuggestionsOptions> {
  if (typeof langOrOptions === "string" || langOrOptions === undefined) {
    return {
      ...DEFAULT_OPTIONS,
      ...options,
      lang: langOrOptions ?? options?.lang ?? DEFAULT_OPTIONS.lang,
    };
  }
  return { ...DEFAULT_OPTIONS, ...langOrOptions };
}

export function useSpellSuggestions(
  text: string,
  langOrOptions?: string | UseSpellSuggestionsOptions,
  options?: UseSpellSuggestionsOptions,
): UseSpellSuggestionsResult {
  const resolvedOptions = useMemo(
    () => resolveOptions(langOrOptions, options),
    [langOrOptions, options],
  );

  const [wordSuggestions, setWordSuggestions] = useState<string[]>(STARTER_WORDS);
  const [suggestionBuckets, setSuggestionBuckets] = useState<SuggestionBucket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const [refreshCounter, setRefreshCounter] = useState(0);

  const refresh = () => setRefreshCounter((c) => c + 1);

  const trimmedText = text.trim();

  useEffect(() => {
    if (!trimmedText) {
      setWordSuggestions(STARTER_WORDS);
      setSuggestionBuckets([]);
      setIsLoading(false);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (trimmedText.length < resolvedOptions.minRemoteLength) {
      setWordSuggestions([]);
      setSuggestionBuckets([]);
      return;
    }

    setIsLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const response = await fetch("/api/spell", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: trimmedText,
            lang: resolvedOptions.lang,
          }),
        });

        if (!response.ok) {
          setWordSuggestions([]);
          setSuggestionBuckets([]);
          return;
        }

        const data = await response.json();
        const suggestions = Array.isArray(data.suggestions)
          ? data.suggestions.filter(
              (suggestion: any): suggestion is string =>
                typeof suggestion === "string" && suggestion.trim().length > 0,
            )
          : [];
        setWordSuggestions(suggestions);
      } catch (error) {
        console.error("Error fetching spell suggestions:", error);
        setWordSuggestions([]);
        setSuggestionBuckets([]);
      } finally {
        setIsLoading(false);
      }
    }, resolvedOptions.debounceMs);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [trimmedText, resolvedOptions, refreshCounter]);

  return { wordSuggestions, suggestionBuckets, isLoading, refresh };
}
