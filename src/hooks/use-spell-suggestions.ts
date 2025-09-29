
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { STARTER_WORDS } from "@/data/dictionaries/fr-dictionary";

export interface UseSpellSuggestionsOptions {
  lang?: string;
  maxVisibleSuggestions?: number;
  minRemoteLength?: number;
  debounceMs?: number;
}

export interface UseSpellSuggestionsResult {
  wordSuggestions: string[];
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

  const [remoteSuggestions, setRemoteSuggestions] = useState<string[]>(STARTER_WORDS);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const [refreshCounter, setRefreshCounter] = useState(0);

  const refresh = () => setRefreshCounter((c) => c + 1);

  const trimmedText = text.trim();

  useEffect(() => {
    if (!trimmedText) {
      setRemoteSuggestions(STARTER_WORDS);
      setIsLoading(false);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (trimmedText.length < resolvedOptions.minRemoteLength) {
      setRemoteSuggestions([]);
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
          setRemoteSuggestions([]);
          return;
        }

        const data = await response.json();
        const suggestions = Array.isArray(data.suggestions)
          ? data.suggestions.filter(
              (suggestion: any): suggestion is string =>
                typeof suggestion === "string" && suggestion.trim().length > 0,
            )
          : [];
        setRemoteSuggestions(suggestions);
      } catch (error) {
        console.error("Error fetching spell suggestions:", error);
        setRemoteSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, resolvedOptions.debounceMs);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [trimmedText, resolvedOptions, refreshCounter]);

  return {
    wordSuggestions: remoteSuggestions.slice(0, resolvedOptions.maxVisibleSuggestions),
    isLoading,
    refresh,
  };
}
