
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { STARTER_WORDS } from "@/data/dictionaries/fr-dictionary";
import { COMMON_FRENCH_WORDS } from "@/data/dictionaries/fr-common-words";
import { CONTEXTUAL_CONTINUATIONS } from "@/data/dictionaries/fr-contextual-continuations";
import { FRENCH_CORE_VOCABULARY } from "@/data/dictionaries/fr-core-vocabulary";
import { getPrefixSuggestions } from "@/lib/prefix-suggester";


const WORD_PATTERN = /([A-Za-zÀ-ÖØ-öø-ÿ'-]+)/g;

function normalizeWord(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z']+/g, "");
}

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

  const [remoteSuggestions, setRemoteSuggestions] = useState<string[]>(STARTER_WORDS);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const [refreshCounter, setRefreshCounter] = useState(0);

  const refresh = () => setRefreshCounter((c) => c + 1);

  const trimmedText = text.trim();
  const hasTrailingSpace = /\s$/.test(text);

  const words = useMemo(() => extractWords(trimmedText), [trimmedText]);
  const contextWords = useMemo(() => {
    if (!words.length) return [];
    return hasTrailingSpace ? words : words.slice(0, -1);
  }, [hasTrailingSpace, words]);

  const activePrefix = useMemo(() => {
    if (!words.length || hasTrailingSpace) return "";
    return words[words.length - 1] ?? "";
  }, [hasTrailingSpace, words]);

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

  const prefixSuggestions = useMemo(() => {
    if (!activePrefix) return [];
    return getPrefixSuggestions(activePrefix, resolvedOptions.maxVisibleSuggestions);
  }, [activePrefix, resolvedOptions.maxVisibleSuggestions]);

  const contextualBuckets = useMemo(() => {
    if (!contextWords.length) return [];

    return CONTEXTUAL_CONTINUATIONS.reduce<SuggestionBucket[]>((acc, entry) => {
      if (!entry.context.length) return acc;
      if (entry.context.length > contextWords.length) return acc;

      const contextSlice = contextWords.slice(-entry.context.length);
      const matches = contextSlice.every((word, index) => normalizeWord(word) === normalizeWord(entry.context[index]));
      if (!matches) return acc;

      const id = `context-${entry.context.join("-")}`;
      const label = entry.context.length === 1
        ? `Après "${entry.context[0]}"`
        : `Suite pour "${entry.context.join(" ")}"`;

      acc.push({
        id,
        label,
        description: "Idées pour continuer ta phrase",
        suggestions: entry.suggestions.slice(0, resolvedOptions.maxVisibleSuggestions),
      });
      return acc;
    }, []);
  }, [contextWords, resolvedOptions.maxVisibleSuggestions]);

  const fallbackFrequentWords = useMemo(() => {
    const prefix = normalizeWord(activePrefix);
    const candidates = COMMON_FRENCH_WORDS.map(({ word }) => word).filter(Boolean);
    const filtered = prefix
      ? candidates.filter((word) => normalizeWord(word).startsWith(prefix))
      : candidates;

    return filtered.slice(0, resolvedOptions.maxVisibleSuggestions * 2);
  }, [activePrefix, resolvedOptions.maxVisibleSuggestions]);

  const buildWordSuggestions = useMemo(() => {
    const limit = resolvedOptions.maxVisibleSuggestions;
    const seen = new Set<string>();
    const items: string[] = [];

    const pushMany = (values: Iterable<string>, perSourceLimit = limit) => {
      let remaining = perSourceLimit;
      for (const value of values) {
        if (!value) continue;
        const clean = value.trim();
        if (!clean) continue;
        const key = normalizeWord(clean);
        if (!key) continue;
        if (seen.has(key)) continue;
        seen.add(key);
        items.push(clean);
        remaining -= 1;
        if (items.length >= limit || remaining <= 0) break;
      }
    };

    if (!trimmedText) {
      pushMany(STARTER_WORDS);
      pushMany(FRENCH_CORE_VOCABULARY);
      return items.slice(0, limit);
    }

    pushMany(remoteSuggestions);
    pushMany(prefixSuggestions);

    for (const bucket of contextualBuckets) {
      pushMany(bucket.suggestions, 3);
      if (items.length >= limit) break;
    }

    if (items.length < limit) {
      pushMany(fallbackFrequentWords);
    }

    if (items.length < limit) {
      pushMany(FRENCH_CORE_VOCABULARY);
    }

    if (items.length < limit) {
      pushMany(STARTER_WORDS);
    }

    return items.slice(0, limit);
  }, [
    contextualBuckets,
    fallbackFrequentWords,
    prefixSuggestions,
    remoteSuggestions,
    resolvedOptions.maxVisibleSuggestions,
    trimmedText,
  ]);

  const primarySuggestionSet = useMemo(
    () => new Set(buildWordSuggestions.map((value) => normalizeWord(value))),
    [buildWordSuggestions],
  );

  const supplementaryBuckets = useMemo(() => {
    const buckets: SuggestionBucket[] = [];

    if (!trimmedText) {
      buckets.push({
        id: "starter",
        label: "Idées pour commencer",
        description: "Expressions utiles pour lancer la discussion",
        suggestions: STARTER_WORDS.slice(0, resolvedOptions.maxVisibleSuggestions * 2),
      });
    }

    if (fallbackFrequentWords.length) {
      const filtered = fallbackFrequentWords.filter((word) => !primarySuggestionSet.has(normalizeWord(word))).slice(
        0,
        resolvedOptions.maxVisibleSuggestions,
      );

      if (filtered.length) {
        buckets.push({
          id: "frequent",
          label: "Mots fréquents",
          description: "Les mots les plus utilisés en français",
          suggestions: filtered,
        });
      }
    }

    const curated = FRENCH_CORE_VOCABULARY.filter((word) => !primarySuggestionSet.has(normalizeWord(word))).slice(
      0,
      resolvedOptions.maxVisibleSuggestions,
    );

    if (curated.length) {
      buckets.push({
        id: "curated",
        label: "Mots essentiels",
        description: "Petit vocabulaire pour enrichir ton message",
        suggestions: curated,
      });
    }

    return [...contextualBuckets, ...buckets];
  }, [
    contextualBuckets,
    fallbackFrequentWords,
    primarySuggestionSet,
    resolvedOptions.maxVisibleSuggestions,
    trimmedText,
  ]);

  return {
    wordSuggestions: buildWordSuggestions,
    suggestionBuckets: supplementaryBuckets,
    isLoading,
    refresh,
  };
}
