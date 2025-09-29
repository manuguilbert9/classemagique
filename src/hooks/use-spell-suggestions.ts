import { useEffect, useMemo, useRef, useState } from "react";
import { STARTER_WORDS } from "@/data/dictionaries/fr-dictionary";
import { getPrefixSuggestions } from "@/lib/prefix-suggester";

const WORD_PATTERN = /([A-Za-zÀ-ÖØ-öø-ÿ'-]+)/g;
const WORD_CHARACTER_PATTERN = /[A-Za-zÀ-ÖØ-öø-ÿ'-]$/;

function getLastWord(value: string): string {
  const match = value.match(/([A-Za-zÀ-ÖØ-öø-ÿ'-]+)$/);
  return match?.[1] || "";
}

function extractWords(value: string): string[] {
  return value.match(WORD_PATTERN)?.map(word => word.trim()).filter(Boolean) ?? [];
}

export interface UseSpellSuggestionsOptions {
  lang?: string;
  maxVisibleSuggestions?: number;
  minRemoteLength?: number;
  debounceMs?: number;
  contextWindow?: number;
}

export interface UseSpellSuggestionsResult {
  wordSuggestions: string[];
  localSuggestions: string[];
  contextWords: string[];
  isLoading: boolean;
}

const DEFAULT_OPTIONS: Required<UseSpellSuggestionsOptions> = {
  lang: "fr",
  maxVisibleSuggestions: 8,
  minRemoteLength: 3,
  debounceMs: 120,
  contextWindow: 3,
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

  return {
    ...DEFAULT_OPTIONS,
    ...langOrOptions,
    lang: langOrOptions.lang ?? DEFAULT_OPTIONS.lang,
  };
}

export function useSpellSuggestions(
  text: string,
  langOrOptions?: string | UseSpellSuggestionsOptions,
  maybeOptions?: UseSpellSuggestionsOptions,
): UseSpellSuggestionsResult {
  const { lang, maxVisibleSuggestions, minRemoteLength, debounceMs, contextWindow } = resolveOptions(
    langOrOptions,
    maybeOptions,
  );

  const [remoteSuggestions, setRemoteSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceWord = useRef<number>();
  const cacheRef = useRef<Map<string, string[]>>(new Map());
  const controllerRef = useRef<AbortController | null>(null);

  const trimmedText = text.trim();
  const lastWord = useMemo(() => getLastWord(text), [text]);
  const hasTypedContent = trimmedText.length > 0;
  const baseStarterSuggestions = useMemo(
    () => STARTER_WORDS.slice(0, maxVisibleSuggestions),
    [maxVisibleSuggestions],
  );
  const words = useMemo(() => extractWords(text), [text]);
  const contextWords = useMemo(() => {
    if (words.length === 0) return [];

    const isTypingWord = WORD_CHARACTER_PATTERN.test(text);
    const endIndex = isTypingWord ? words.length - 1 : words.length;
    if (endIndex <= 0) return [];

    const startIndex = Math.max(0, endIndex - contextWindow);
    return words.slice(startIndex, endIndex);
  }, [text, words, contextWindow]);

  const localSuggestions = useMemo(() => {
    if (!hasTypedContent || !lastWord) {
      return baseStarterSuggestions;
    }
    const suggestions = getPrefixSuggestions(lastWord, maxVisibleSuggestions);
    if (suggestions.length === 0) {
      return baseStarterSuggestions;
    }
    return suggestions;
  }, [baseStarterSuggestions, hasTypedContent, lastWord, maxVisibleSuggestions]);

  useEffect(() => {
    if (debounceWord.current) window.clearTimeout(debounceWord.current);
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }

    if (!hasTypedContent || !lastWord || lastWord.length < minRemoteLength) {
      setIsLoading(false);
      setRemoteSuggestions([]);
      return () => undefined;
    }

    const normalizedContext = contextWords.map(word => word.toLowerCase()).join(" ");
    const cacheKey = `${lang}:${normalizedContext}:${lastWord.toLowerCase()}`;
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
          body: JSON.stringify({ text: lastWord, lang, contextWords }),
          signal: controllerRef.current.signal,
        });
        if (response.ok) {
          const data = await response.json();
          const rawSuggestions = Array.isArray(data.suggestions)
            ? (data.suggestions as unknown[])
            : [];
          const suggestions = rawSuggestions.filter(
            (suggestion): suggestion is string =>
              typeof suggestion === "string" && suggestion.trim().length > 0,
          );
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
    }, debounceMs);

    return () => {
      if (debounceWord.current) window.clearTimeout(debounceWord.current);
      if (controllerRef.current) {
        controllerRef.current.abort();
        controllerRef.current = null;
      }
    };
  }, [contextWords, debounceMs, hasTypedContent, lang, lastWord, minRemoteLength]);

  const wordSuggestions = useMemo(() => {
    if (!hasTypedContent) {
      return baseStarterSuggestions;
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
        if (merged.length >= maxVisibleSuggestions) {
          return merged;
        }
      }
    }

    if (merged.length === 0) {
      return localSuggestions.slice(0, maxVisibleSuggestions);
    }

    return merged;
  }, [baseStarterSuggestions, hasTypedContent, localSuggestions, maxVisibleSuggestions, remoteSuggestions]);

  return { wordSuggestions, localSuggestions, contextWords, isLoading };
}
