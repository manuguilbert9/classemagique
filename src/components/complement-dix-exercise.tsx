'use client';

import { useState, useEffect, useContext, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VirtualKeyboard } from './virtual-keyboard';
import { UserContext } from '@/context/user-context';
import { addScore, type ScoreDetail } from '@/services/scores';
import Link from 'next/link';

const DURATION = 60;
const LENGTH = 20;
export function ComplementDixExercise() {
  const { student } = useContext(UserContext);
  const [state, setState] = useState<'ready' | 'playing' | 'finished'>('ready');
  const [timed, setTimed] = useState(false);
  const [remaining, setRemaining] = useState(DURATION);
  const [number, setNumber] = useState(1);
  const [details, setDetails] = useState<ScoreDetail[]>([]);
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const deadline = useRef(0);
  const completedDuration = useRef(0);
  const finish = () => { completedDuration.current = Math.max(0, Math.min(DURATION, Math.round((Date.now() - (deadline.current - DURATION * 1000)) / 1000))); setState('finished'); };
  const transition = useRef<ReturnType<typeof setTimeout>>();
  const saved = useRef(false);
  const locked = useRef(false);
  const score = details.filter(d => d.status === 'correct').length;
  const start = () => {
    clearTimeout(transition.current);
    saved.current = false;
    locked.current = false;
    setDetails([]); setFeedback(null); setRemaining(DURATION);
    deadline.current = Date.now() + DURATION * 1000;
    setNumber(1 + Math.floor(Math.random() * 9)); setState('playing');
  };
  useEffect(() => {
    if (state !== 'playing' || !timed) return;
    const tick = () => {
      const seconds = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000));
      setRemaining(seconds);
      if (!seconds) { clearTimeout(transition.current); locked.current = true; finish(); }
    };
    const id = setInterval(tick, 200); tick();
    return () => clearInterval(id);
  }, [state, timed]);
  useEffect(() => () => clearTimeout(transition.current), []);
  const answer = (key: string) => {
    if (state !== 'playing' || locked.current || !/^[0-9]$/.test(key)) return;
    if (timed && Date.now() >= deadline.current) { finish(); return; }
    locked.current = true;
    const correct = number + Number(key) === 10;
    const next = [...details, {question: `${number} + ? = 10`, userAnswer: key, correctAnswer: String(10-number), status: correct ? 'correct' as const : 'incorrect' as const}];
    setDetails(next); setFeedback(correct);
    transition.current = setTimeout(() => {
      setFeedback(null);
      if (!timed && next.length >= LENGTH) { finish(); return; }
      setNumber(1 + Math.floor(Math.random() * 9)); locked.current = false;
    }, 400);
  };
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.ctrlKey || event.metaKey || event.altKey) return; if (/^[0-9]$/.test(event.key)) { event.preventDefault(); answer(event.key); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  useEffect(() => {
    if (state !== 'finished' || !student || saved.current || !details.length) return;
    saved.current = true;
    void addScore({userId: student.id, skill: 'complement-dix', score: timed ? score : Math.round(score / details.length * 100), details,
      metadata: {unit: timed ? 'count' : 'percent', mode: timed ? 'chronométré' : 'sans chrono', durationSeconds: timed ? completedDuration.current : undefined}});
  }, [state, student, details, score, timed]);
  return <Card className="w-full max-w-2xl mx-auto">
    <CardHeader><CardTitle className="text-center text-3xl">Compléments à 10</CardTitle></CardHeader>
    <CardContent className="space-y-5 text-center">
      {state === 'ready' && <>
        <p>Trouve le nombre à ajouter pour faire 10. Réponds avec le clavier ou les touches à l'écran.</p>
        <label className="flex items-center justify-center gap-3 min-h-12"><input type="checkbox" checked={timed} onChange={e => setTimed(e.target.checked)} className="h-6 w-6" />Chronomètre : une minute</label>
        <p>{timed ? 'Trouve le plus de réponses en une minute.' : '20 questions à ton rythme.'}</p>
        <Button onClick={start} size="lg">Démarrer !</Button>
      </>}
      {state === 'playing' && <>
        <p>{timed ? `Temps restant : ${remaining} s` : `Question ${Math.min(details.length + 1, LENGTH)} sur ${LENGTH}`}</p>
        <p className="text-4xl sm:text-6xl font-bold">{number} + ? = 10</p>
        <p role="status" className="min-h-8">{feedback === true ? 'Oui !' : feedback === false ? `Pour faire 10, il faut ajouter ${10-number}.` : 'Choisis un chiffre.'}</p>
        <VirtualKeyboard numericOnly disabled={feedback !== null} onKeyPress={answer} />
        <Button variant="outline" onClick={() => { clearTimeout(transition.current); finish(); }}>Terminer la séance</Button>
      </>}
      {state === 'finished' && <>
        <h2 className="text-2xl">Séance terminée</h2>
        <p>{details.length ? `${score} réponses justes sur ${details.length}${timed ? ' en mode chronométré' : ''}.` : 'Aucune réponse : aucun résultat enregistré.'}</p>
        <div className="flex flex-wrap justify-center gap-3"><Button onClick={start}>Rejouer</Button><Button variant="outline" onClick={() => setState('ready')}>Changer le mode</Button><Button asChild variant="outline"><Link href="/en-classe">Retour en classe</Link></Button></div>
      </>}
    </CardContent>
  </Card>;
}
