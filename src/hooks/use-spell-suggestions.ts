import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { STARTER_WORDS } from "@/data/dictionaries/fr-dictionary";
import { CONTEXTUAL_CONTINUATIONS } from "@/data/dictionaries/fr-contextual-continuations";
import { getPrefixSuggestions } from "@/lib/prefix-suggester";

const WORD_PATTERN = /([A-Za-zÀ-ÖØ-öø-ÿ'-]+)/g;

function extractWords(value: string): string[] {
  return value
    .toLowerCase()
    .match(WORD_PATTERN)
    ?.map(word => word.trim())
    .filter(Boolean) ?? [];
}

export interface UseSpellSuggestionsOptions {
  lang?: string;
  maxVisibleSuggestions?: number;
  minRemoteLength?: number;
  debounceMs?: number;
  contextWindow?: number;
}

export type SuggestionSource = "starter" | "context" | "prefix" | "remote";

export interface SuggestionBucket {
  id: SuggestionSource;
  label: string;
  suggestions: string[];
  description?: string;
}

export interface UseSpellSuggestionsResult {
  wordSuggestions: string[];
  localSuggestions: string[];
  contextWords: string[];
  suggestionBuckets: SuggestionBucket[];
  isLoading: boolean;
  refresh: () => void;
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

function collectContextualSuggestions(contextWords: string[]): string[] {
  if (!contextWords.length) return [];

  const matches: string[] = [];
  for (const continuation of CONTEXTUAL_CONTINUATIONS) {
    const expected = continuation.context.map(part => part.toLowerCase());
    if (expected.length > contextWords.length) continue;

    const slice = contextWords.slice(-expected.length);
    let isMatch = true;
    for (let i = 0; i < expected.length; i += 1) {
      if (slice[i] !== expected[i]) {
        isMatch = false;
        break;
      }
    }

    if (isMatch) {
      matches.push(...continuation.suggestions);
    }
  }

  return matches;
}

function mergeSuggestionLists(lists: string[][], maxSuggestions: number): string[] {
  const merged: string[] = [];
  const seen = new Set<string>();

  for (const list of lists) {
    for (const suggestion of list) {
      const trimmed = suggestion.trim();
      if (!trimmed) continue;
      const key = trimmed.toLowerCase();
      if (seen.has(key)) continue;

      seen.add(key);
      merged.push(trimmed);
      if (merged.length >= maxSuggestions) {
        return merged.slice(0, maxSuggestions);
      }
    }
  }

  return merged.slice(0, maxSuggestions);
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

  const [remoteSuggestions, setRemoteSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const cacheRef = useRef<Map<string, string[]>>(new Map());
  const controllerRef = useRef<AbortController | null>(null);
  const latestTrimmedTextRef = useRef<string>("");

  const trimmedText = text.trim();
  const hasTrailingWhitespace = /\s$/.test(text);

  const words = useMemo(() => extractWords(text), [text]);

  const activeWord = useMemo(() => {
    if (hasTrailingWhitespace) return "";
    return words[words.length - 1] ?? "";
  }, [words, hasTrailingWhitespace]);

  const contextWords = useMemo(() => {
    if (!words.length) return [];
    const base = hasTrailingWhitespace ? words : words.slice(0, -1);
    return base.slice(-resolvedOptions.contextWindow);
  }, [words, hasTrailingWhitespace, resolvedOptions.contextWindow]);

  const contextSuggestions = useMemo(
    () => collectContextualSuggestions(contextWords),
    [contextWords],
  );

  const prefixSuggestions = useMemo(() => {
    if (!activeWord) return [];
    return getPrefixSuggestions(activeWord, resolvedOptions.maxVisibleSuggestions);
  }, [activeWord, resolvedOptions.maxVisibleSuggestions]);

  const starterSuggestions = useMemo(() => {
    return trimmedText ? [] : STARTER_WORDS;
  }, [trimmedText]);

  useEffect(() => {
    latestTrimmedTextRef.current = trimmedText;
  }, [trimmedText]);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = undefined;
    }
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }

    if (!trimmedText || trimmedText.length < resolvedOptions.minRemoteLength) {
      setIsLoading(false);
      setRemoteSuggestions([]);
      return;
    }

    const cacheKey = `${resolvedOptions.lang}:${trimmedText.toLowerCase()}`;
    const cached = cacheRef.current.get(cacheKey);
    if (cached) {
      setRemoteSuggestions(cached);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        controllerRef.current = new AbortController();
        const response = await fetch("/api/spell", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: trimmedText, lang: resolvedOptions.lang }),
          signal: controllerRef.current.signal,
        });

        if (!response.ok) {
          setRemoteSuggestions([]);
          return;
        }

        const data = await response.json();
        const suggestions = Array.isArray(data?.suggestions)
          ? data.suggestions.filter((entry: unknown): entry is string => typeof entry === "string")
          : [];

        cacheRef.current.set(cacheKey, suggestions);
        setRemoteSuggestions(suggestions);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Error fetching spell suggestions:", error);
        }
        setRemoteSuggestions([]);
      } finally {
        setIsLoading(false);
        controllerRef.current = null;
      }
    }, resolvedOptions.debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = undefined;
      }
      if (controllerRef.current) {
        controllerRef.current.abort();
        controllerRef.current = null;
      }
    };
  }, [trimmedText, resolvedOptions, refreshNonce]);

  const filteredRemoteSuggestions = useMemo(() => {
    if (!activeWord) return remoteSuggestions;
    const normalized = activeWord.toLowerCase();
    return remoteSuggestions.filter(suggestion => suggestion.toLowerCase().startsWith(normalized));
  }, [remoteSuggestions, activeWord]);

  const remoteRankedSuggestions = useMemo(() => {
    if (!filteredRemoteSuggestions.length) return filteredRemoteSuggestions;

    const normalize = (value: string) => value.toLowerCase();
    const base = normalize(activeWord);

    const score = (suggestion: string) => {
      if (!base) return suggestion.length;
      const normalized = normalize(suggestion);
      const maxLength = Math.max(normalized.length, base.length);
      let penalty = Math.abs(normalized.length - base.length);

      for (let i = 0; i < Math.min(normalized.length, base.length); i += 1) {
        if (normalized[i] !== base[i]) {
          penalty += 1;
        }
      }

      return penalty / Math.max(maxLength, 1);
    };

    return [...filteredRemoteSuggestions].sort((a, b) => score(a) - score(b));
  }, [filteredRemoteSuggestions, activeWord]);

  const localSuggestions = useMemo(() => {
    const lists: string[][] = [];
    if (activeWord) lists.push(prefixSuggestions);
    if (contextSuggestions.length) lists.push(contextSuggestions);
    if (!trimmedText) lists.push(starterSuggestions);

    const merged = mergeSuggestionLists(lists, resolvedOptions.maxVisibleSuggestions);
    if (merged.length === 0 && trimmedText) {
      return mergeSuggestionLists([starterSuggestions], resolvedOptions.maxVisibleSuggestions);
    }

    return merged;
  }, [
    activeWord,
    contextSuggestions,
    starterSuggestions,
    prefixSuggestions,
    trimmedText,
    resolvedOptions.maxVisibleSuggestions,
  ]);

  const wordSuggestions = useMemo(() => {
    const lists: string[][] = [];
    if (localSuggestions.length) lists.push(localSuggestions);
    if (remoteRankedSuggestions.length) lists.push(remoteRankedSuggestions);
    if (!lists.length) lists.push(starterSuggestions);

    return mergeSuggestionLists(lists, resolvedOptions.maxVisibleSuggestions);
  }, [
    localSuggestions,
    remoteRankedSuggestions,
    starterSuggestions,
    resolvedOptions.maxVisibleSuggestions,
  ]);

  const suggestionBuckets = useMemo<SuggestionBucket[]>(() => {
    const buckets: SuggestionBucket[] = [];

    if (!trimmedText && starterSuggestions.length) {
      buckets.push({
        id: "starter",
        label: "Mots fréquents",
        description: "Idées pour démarrer la discussion",
        suggestions: starterSuggestions.slice(0, resolvedOptions.maxVisibleSuggestions),
      });
    }

    if (contextSuggestions.length) {
      buckets.push({
        id: "context",
        label: contextWords.length
          ? `Après "${contextWords.slice(-resolvedOptions.contextWindow).join(" ")}"`
          : "Continuer la phrase",
        description: "Complétions adaptées au contexte",
        suggestions: mergeSuggestionLists(
          [contextSuggestions],
          resolvedOptions.maxVisibleSuggestions,
        ),
      });
    }

    if (activeWord && prefixSuggestions.length) {
      buckets.push({
        id: "prefix",
        label: `Compléter "${activeWord}"`,
        description: "Finir le mot en cours de saisie",
        suggestions: mergeSuggestionLists(
          [prefixSuggestions],
          resolvedOptions.maxVisibleSuggestions,
        ),
      });
    }

    if (remoteRankedSuggestions.length) {
      buckets.push({
        id: "remote",
        label: "Suggestions intelligentes",
        description: "Propositions générées automatiquement",
        suggestions: remoteRankedSuggestions.slice(0, resolvedOptions.maxVisibleSuggestions),
      });
    }

    return buckets;
  }, [
    trimmedText,
    starterSuggestions,
    contextSuggestions,
    contextWords,
    resolvedOptions.contextWindow,
    resolvedOptions.maxVisibleSuggestions,
    activeWord,
    prefixSuggestions,
    remoteRankedSuggestions,
  ]);

  const refresh = useCallback(() => {
    const currentTrimmed = latestTrimmedTextRef.current;
    if (!currentTrimmed) return;

    const cacheKey = `${resolvedOptions.lang}:${currentTrimmed.toLowerCase()}`;
    cacheRef.current.delete(cacheKey);
    setRefreshNonce((value) => value + 1);
  }, [resolvedOptions.lang]);

  return {
    wordSuggestions,
    localSuggestions,
    contextWords,
    suggestionBuckets,
    isLoading,
    refresh,
  };
}
