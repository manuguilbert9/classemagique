'use client';

import { useState } from 'react';
import { borrowingCells, subtractions } from '@/lib/progressive/math-data';
import { Choice, SpeakButton, useRoundFeedback } from './shared';
import type { RoundProps } from './types';

/** Same place-value convention as subtraction-training: red tens, blue units. */
export function BorrowingBoard({ round, onComplete }: RoundProps) {
  const q = subtractions[round % subtractions.length];
  const cells = borrowingCells(q);
  const errorCell = cells.find(cell => cell.shown !== cell.correct)!;
  const feedback = useRoundFeedback(onComplete);
  const [selected, setSelected] = useState<string | null>(null);
  const [value, setValue] = useState('');
  const [corrected, setCorrected] = useState(false);
  const editable = (id: string) => {
    const cell = cells.find(c => c.id === id)!;
    return selected === id && !corrected
      ? <input autoFocus aria-label={`Corriger : ${cell.label}`} inputMode="numeric" autoComplete="off" value={value} onChange={e => setValue(e.target.value.replace(/\D/g, '').slice(0, 2))} className="h-16 w-20 rounded-lg border-2 border-primary bg-white text-center text-3xl font-bold text-slate-900 focus-visible:ring-4 focus-visible:ring-primary/40" />
      : <button type="button" aria-label={`${cell.label} : ${corrected ? cell.correct : cell.shown}`} disabled={corrected} onClick={() => feedback.check(cell.label, errorCell.label, () => { setSelected(id); setValue(''); })} className={`h-16 w-20 rounded-lg border-2 border-current bg-white text-3xl font-bold focus-visible:ring-4 focus-visible:ring-primary/40 ${corrected && id === errorCell.id ? 'ring-2 ring-emerald-600' : ''}`}>{corrected ? cell.correct : cell.shown}</button>;
  };
  const prompt = corrected ? 'Le calcul est réparé. Observe ce qui a changé.' : 'Un nombre est faux dans ce calcul. Touche-le et corrige-le dans le gabarit.';
  return <div className="space-y-5">
    <div className="space-y-3 text-center"><h2 className="text-2xl font-bold">{prompt}</h2><SpeakButton text={prompt} /></div>
    <p className="text-center text-lg">{q.a} − {q.b}</p>
    <form onSubmit={e => { e.preventDefault(); if (selected && !corrected) feedback.check(value, String(errorCell.correct), () => setCorrected(true)); }} className="space-y-4">
      <div className="mx-auto grid w-fit grid-cols-[2rem_6rem_6rem] gap-x-2 gap-y-3 rounded-2xl border-2 border-slate-200 bg-white p-3 text-center" role="group" aria-label="Soustraction posée avec emprunt">
        <span /><strong className="text-red-700">Dizaines</strong><strong className="text-blue-700">Unités</strong>
        <span /><div className="text-red-700">{editable('borrow-tens')}</div><div className="text-blue-700">{editable('borrow-units')}</div>
        <span /><div className="text-red-700"><span className="text-3xl line-through decoration-2" aria-label={`${Math.floor(q.a / 10)} dizaines barrées`}>{Math.floor(q.a / 10)}</span></div><div className="text-blue-700"><span className="text-3xl line-through decoration-2" aria-label={`${q.a % 10} unités barrées`}>{q.a % 10}</span></div>
        <span className="self-center text-3xl">−</span><div className="rounded-lg bg-red-50 py-3 text-3xl text-red-700">{Math.floor(q.b / 10)}</div><div className="rounded-lg bg-blue-50 py-3 text-3xl text-blue-700">{q.b % 10}</div>
        <span className="col-span-3 border-t-4 border-slate-600" />
        <span /><div className="text-red-700">{editable('result-tens')}</div><div className="text-blue-700">{editable('result-units')}</div>
      </div>
      <p className="text-center text-sm text-slate-600">Les nombres du haut remplacent les chiffres barrés.</p>
      {selected && !corrected && <div className="text-center"><button type="submit" disabled={!value} className="min-h-12 rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground disabled:opacity-40">Vérifier la correction</button></div>}
    </form>
    {corrected && <>
      <div className="rounded-xl bg-sky-50 p-4 text-center text-slate-900"><p className="font-semibold">Une dizaine échangée, c’est dix unités de plus.</p><p className="mt-2 text-xl"><span className="text-red-700">{Math.floor(q.a / 10)} D</span> + <span className="text-blue-700">{q.a % 10} U</span> = <span className="text-red-700">{Math.floor(q.a / 10) - 1} D</span> + <span className="text-blue-700">{q.a % 10 + 10} U</span></p><p>La quantité reste {q.a}.</p></div>
      <div className="space-y-3 text-center"><p className="text-2xl font-bold">{q.a} − {q.b} = {q.a - q.b}</p><Choice onClick={() => feedback.finish(`${errorCell.label} : ${value} ; ${q.a} − ${q.b} = ${q.a - q.b}`, `${errorCell.label} : ${errorCell.correct} ; ${q.a - q.b}`)}>J’ai corrigé l’emprunt</Choice></div>

    </>}
    {feedback.error && <p role="alert" className="rounded-xl bg-amber-50 p-4 text-center text-amber-900">{feedback.error}</p>}
  </div>;
}
