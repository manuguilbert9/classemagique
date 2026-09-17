'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ActivityResult } from './types';

export function Choice({ children, onClick, disabled = false, selected = false, ariaLabel }: {
  children: ReactNode; onClick: () => void; disabled?: boolean; selected?: boolean; ariaLabel?: string;
}) {
  return <button type="button" disabled={disabled} onClick={onClick} aria-label={ariaLabel}
    aria-pressed={selected} className={cn(
      'min-h-16 min-w-16 max-w-full rounded-2xl border-2 px-4 py-3 text-xl font-bold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-60',
      selected ? 'border-primary bg-primary/10 text-foreground' : 'border-slate-200 bg-white text-slate-900 hover:border-primary hover:bg-primary/5',
    )}>{children}</button>;
}

export function SpeakButton({ text }: { text: string }) {
  const [available, setAvailable] = useState(false);
  useEffect(() => {
    setAvailable('speechSynthesis' in window);
    return () => { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); };
  }, []);
  return <button type="button" disabled={!available} onClick={() => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  }} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border bg-background px-4 py-2 font-semibold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/50 disabled:opacity-50"
    aria-label={`Écouter : ${text}`} title={available ? 'Écouter la consigne' : 'Lecture vocale indisponible dans ce navigateur'}>
    <Volume2 className="h-5 w-5" aria-hidden="true" /> Écouter
  </button>;
}

export function useRoundFeedback(onComplete: (result: ActivityResult) => void) {
  const [error, setError] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState<string[]>([]);
  const mistakesRef = useRef<string[]>([]);
  const finished = useRef(false);
  function check(answer: string, expected: string, onSuccess: () => void, errorMessage = 'Ce n’est pas encore ça. Observe à nouveau et réessaie.'): boolean {
    if (finished.current) return false;
    if (answer !== expected) {
      mistakesRef.current = [...mistakesRef.current, answer];
      setMistakes(mistakesRef.current);
      setError(errorMessage);
      return false;
    }
    setError(null);
    onSuccess();
    return true;
  }
  function finish(answer: string, expected: string, reviewSpeech?: string) {
    if (finished.current) return;
    finished.current = true;
    onComplete({ answer, expected, mistakes: [...mistakesRef.current], ...(reviewSpeech ? { reviewSpeech } : {}) });
  }
  return { error, mistakes, check, finish };
}
