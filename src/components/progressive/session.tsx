'use client';

import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { UserContext } from '@/context/user-context';
import { addScore } from '@/services/scores';
import { saveHomeworkResult } from '@/services/homework';
import { getProgressiveExercise } from '@/lib/progressive-exercises';
import { activityDetail, summarizeActivityResults } from '@/lib/progressive-results';
import { AnswerFeedback, ExerciseFinished, ExerciseProgress } from '@/components/exercise/exercise-kit';
import { EarlyRound } from './early-round';
import { FrenchRound } from './french-round';
import { MathRound } from './math-round';
import type { ActivityResult } from './types';
import { SpeakButton } from './shared';

const ROUNDS = 4;

export function ProgressiveSession({ slug }: { slug: string }) {
  const exercise = getProgressiveExercise(slug)!;
  const { student } = useContext(UserContext);
  const params = useSearchParams();
  const homework = params.get('from') === 'devoirs';
  const date = params.get('date');
  const [round, setRound] = useState(0);
  const [ready, setReady] = useState(false);
  const [results, setResults] = useState<ActivityResult[]>([]);
  const [finished, setFinished] = useState(false);
  const [session, setSession] = useState(0);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const completedRound = useRef(-1);
  const saving = useRef(false);
  const saved = useRef(false);
  const feedbackRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const result = results[round];
  const summary = summarizeActivityResults(results);
  const returnHref = homework ? '/devoirs' : '/en-classe';
  useEffect(() => { setReady(true); }, []);
  const save = useCallback(async () => {
    if (!student || !finished || saving.current || saved.current) return;
    saving.current = true;
    setSaveState('saving');
    try {
      // A malformed homework link must never silently save a class score.
      if (homework && !date) throw new Error('Date du devoir manquante');
      const response = homework
        ? await saveHomeworkResult({ userId: student.id, date: date!, skillSlug: slug, score: summarizeActivityResults(results).score,
          details: results.map((r, i) => activityDetail(`${exercise.name} — manche ${i + 1}`, r)) })
        : await addScore({ userId: student.id, skill: slug, score: summarizeActivityResults(results).score,
          details: results.map((r, i) => activityDetail(`${exercise.name} — manche ${i + 1}`, r)) });
      if (!response.success) throw new Error(response.error);
      saved.current = true;
      setSaveState('saved');
    } catch {
      setSaveState('error');
    } finally {
      saving.current = false;
    }
  }, [student, finished, homework, date, slug, results, exercise.name]);
  useEffect(() => { if (finished && saveState === 'idle') void save(); }, [finished, saveState, save]);
  useEffect(() => { if (result) feedbackRef.current?.focus(); }, [result]);
  useEffect(() => { headingRef.current?.focus(); }, [round, session]);
  const complete = (answer: ActivityResult) => {
    if (completedRound.current === round) return;
    completedRound.current = round;
    setResults(prev => [...prev, answer]);
  };
  if (finished) return <ExerciseFinished correct={summary.correct} total={ROUNDS} canRestart={!homework && saveState !== 'saving' && saveState !== 'error'}
    returnHref={returnHref} returnLabel={homework ? 'Retour aux devoirs' : 'Retour en classe'} onRestart={() => {
      setRound(0); setResults([]); setFinished(false); setSaveState('idle');
      setSession(n => n + 1); completedRound.current = -1; saved.current = false;
    }}>
    <p className="mb-3">{summary.corrected > 0 ? `${summary.corrected} réponse(s) trouvée(s) après correction. Tu as terminé toutes les étapes.` : 'Toutes les étapes sont terminées.'}</p>
    <div role="status" className="text-sm">{!student ? 'Mode découverte : aucun résultat enregistré sans profil élève.' : saveState === 'saved' ? 'Résultat enregistré.' : saveState === 'saving' ? 'Enregistrement du résultat…' : null}</div>
    {saveState === 'error' && <div role="alert" className="space-y-3 rounded-xl bg-amber-50 p-4 text-amber-900"><p>Le résultat n’a pas pu être enregistré{homework && !date ? ' : la date du devoir manque dans le lien' : ''}. Garde cette page ouverte pour réessayer.</p><button type="button" onClick={() => void save()} className="min-h-12 rounded-xl border px-4 py-2 font-bold">Réessayer l’enregistrement</button></div>}
  </ExerciseFinished>;
  const Component = exercise.family === 'early' ? EarlyRound : exercise.family === 'french' ? FrenchRound : MathRound;
  return <section className="space-y-6 rounded-2xl bg-card p-4 sm:p-7" aria-label={exercise.name} aria-busy={!ready}>
    <div ref={headingRef} tabIndex={-1} className="space-y-3 outline-none"><p className="text-center text-sm font-semibold text-muted-foreground">Niveau {exercise.level} · {exercise.category}</p><ExerciseProgress current={round} total={ROUNDS} results={results.map(r => r.mistakes.length ? 'corrected' : 'correct')} /></div>
    {/* Keep the final visual proof visible until the pupil explicitly continues. */}
    <fieldset disabled={!ready || !!result} className="min-w-0"><Component key={`${slug}:${session}:${round}`} slug={slug} round={round} onComplete={complete} /></fieldset>
    {result && <div ref={feedbackRef} tabIndex={-1} className="space-y-4 outline-none"><AnswerFeedback status={result.mistakes.length ? 'corrected' : 'correct'} />{result.reviewSpeech && <div className="text-center"><SpeakButton text={result.reviewSpeech} /></div>}<div className="text-center"><button type="button" onClick={() => round === ROUNDS - 1 ? setFinished(true) : setRound(n => n + 1)} className="min-h-14 rounded-xl bg-primary px-6 py-3 text-xl font-bold text-primary-foreground focus-visible:ring-4 focus-visible:ring-primary/40">{round === ROUNDS - 1 ? 'Voir mon bilan' : 'Continuer'}</button></div></div>}
  </section>;
}
