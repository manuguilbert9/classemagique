
import { useEffect, useMemo, useRef, useState } from "react";
import { STARTER_WORDS } from "@/data/dictionaries/fr-dictionary";

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

export interface UseSpellSuggestionsResult {
  suggestions: string[];
  isLoading: boolean;
}

const DEFAULT_OPTIONS: Required<UseSpellSuggestionsOptions> = {
  lang: "fr",
  maxVisibleSuggestions: 12,
  minRemoteLength: 3,
  debounceMs: 250,
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

  const [suggestions, setSuggestions] = useState<string[]>(STARTER_WORDS);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const trimmedText = text.trim();

  useEffect(() => {
    if (!trimmedText) {
      setSuggestions(STARTER_WORDS);
      setIsLoading(false);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (trimmedText.length < resolvedOptions.minRemoteLength) {
      setSuggestions([]);
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
          setSuggestions([]);
          return;
        }

        const data = await response.json();
        const suggestions = Array.isArray(data.suggestions)
          ? data.suggestions.filter(
              (suggestion: any): suggestion is string =>
                typeof suggestion === "string" && suggestion.trim().length > 0,
            )
          : [];
        setSuggestions(suggestions);
      } catch (error) {
        console.error("Error fetching spell suggestions:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, resolvedOptions.debounceMs);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [trimmedText, resolvedOptions]);

  return { suggestions, isLoading };
}
