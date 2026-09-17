'use client';

import { useState, type ReactNode } from 'react';
import { Choice, SpeakButton, useRoundFeedback } from './shared';
import type { RoundProps } from './types';
import { BorrowingBoard } from './borrowing-board';
import { MidpointBoard } from './midpoint-board';
import { MeasurementBoard } from './measurement-board';
import { neighbors, operations, estimates } from '@/lib/progressive/math-data';

function Prompt({ children, speech }: { children: ReactNode; speech?: string }) {
  return <div className="space-y-3 text-center"><h2 className="text-2xl font-bold">{children}</h2>{speech && <SpeakButton text={speech} />}</div>;
}
function NumberBox({ label, value, onChange, disabled = false }: { label: string; value: string; onChange: (value: string) => void; disabled?: boolean }) {
  return <label className="flex flex-col items-center gap-2 text-base font-semibold"><span>{label}</span><input disabled={disabled} inputMode="numeric" pattern="[0-9]*" autoComplete="off" value={value} onChange={e => onChange(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))} className="h-16 w-24 rounded-xl border-2 border-slate-300 bg-background text-center text-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/40" /></label>;
}
function Validate({ disabled = false }: { disabled?: boolean }) {
  return <button type="submit" disabled={disabled} className="min-h-14 rounded-xl bg-primary px-6 py-3 text-lg font-bold text-primary-foreground disabled:opacity-40 focus-visible:ring-4 focus-visible:ring-primary/40">Vérifier</button>;
}
export function MathRound({ slug, round, onComplete }: RoundProps & { slug: string }) {
  const feedback = useRoundFeedback(onComplete);
  const [step, setStep] = useState(0);
  const [first, setFirst] = useState('');
  const [second, setSecond] = useState('');
  const [help, setHelp] = useState(false);
  const submitNumber = (value: string, expected: number, success: () => void) => feedback.check(value === '' ? '' : String(Number(value)), String(expected), success);
  let content;
  if (slug === 'voisins-nombre') {
    const n = neighbors[round % neighbors.length];
    content = <><Prompt speech="Écris le nombre juste avant et le nombre juste après.">Le nombre juste avant et juste après</Prompt>
      {round < 2 && <div className="overflow-x-auto rounded-xl bg-sky-50 p-3" aria-label="Droite graduée autour du nombre"><svg viewBox="0 0 390 85" className="w-full" role="img" aria-label="Droite graduée autour du nombre"><path d="M20 28H370" stroke="#334155" strokeWidth="2" />{Array.from({ length: 11 }, (_, j) => { const i = Math.max(0, Math.min(10, n - 5)) + j; return <g key={i}><path d={`M${25 + j * 34} 20v17`} stroke="#334155" /><text x={25 + j * 34} y="62" textAnchor="middle" fill={i === n ? '#1d4ed8' : '#334155'} fontWeight={i === n ? 'bold' : 'normal'} fontSize="17">{i}</text></g>; })}</svg></div>}
      <form className="space-y-5 text-center" onSubmit={e => { e.preventDefault(); feedback.check(`${first === '' ? '' : Number(first)},${second === '' ? '' : Number(second)}`, `${n - 1},${n + 1}`, () => feedback.finish(`${first} < ${n} < ${second}`, `${n - 1} < ${n} < ${n + 1}`)); }}>
        <div className="flex flex-wrap items-end justify-center gap-3"><NumberBox label="Juste avant" value={first} onChange={setFirst} /><span className="pb-4 text-3xl">&lt; {n} &lt;</span><NumberBox label="Juste après" value={second} onChange={setSecond} /></div><Validate disabled={first === '' || second === ''} /></form></>;
  } else if (slug === 'choisir-operation') {
    const q = operations[round % operations.length];
    content = <><Prompt speech={`${q.story} Combien de fleurs y a-t-il maintenant ?`}>{q.story}</Prompt>
      <div className="rounded-2xl border-2 border-sky-200 bg-sky-50 p-4"><h3 className="mb-3 text-center font-bold">Au début : {q.start} fleurs dans le vase</h3><div className="flex flex-wrap justify-center gap-2 text-3xl" aria-label={`${q.start} fleurs, ${q.sign === '−' ? `${q.change} sont retirées` : `${q.change} arrivent ensuite`}`}>{Array.from({ length: q.start }, (_, i) => <span key={i} className={q.sign === '−' && i >= q.start - q.change ? 'relative rounded-lg border-2 border-dashed border-amber-500 bg-amber-50 p-1' : 'p-1'} aria-hidden="true">🌷{q.sign === '−' && i >= q.start - q.change && <span className="absolute inset-0 flex items-center justify-center text-4xl text-slate-700">╱</span>}</span>)}{q.sign === '+' && <span className="flex items-center gap-2 rounded-xl border-2 border-dashed border-amber-500 bg-amber-50 p-1"><span className="text-xl">←</span>{Array.from({ length: q.change }, (_, i) => <span key={i} aria-hidden="true">🌷</span>)}</span>}</div><p className="mt-3 text-center">{q.sign === '+' ? `${q.change} fleurs sont apportées au vase.` : `Les ${q.change} fleurs barrées sont emportées.`}</p></div>

      {step === 0 ? <><p className="text-center text-xl">Quelle opération raconte la situation ?</p><div className="flex justify-center gap-3">{['+', '−', '?'].map(v => <Choice key={v} ariaLabel={v === '+' ? 'Addition' : v === '−' ? 'Soustraction' : 'Je ne sais pas encore'} onClick={() => { if (v === '?') { setHelp(true); feedback.check('Besoin d’aide', q.sign, () => {}); } else feedback.check(v, q.sign, () => setStep(1)); }}>{v}</Choice>)}</div>{help && <p className="rounded-xl bg-sky-50 p-4">Si des fleurs arrivent, la collection augmente. Si des fleurs partent, elle diminue.</p>}</> : <form className="space-y-5 text-center" onSubmit={e => { e.preventDefault(); submitNumber(first, q.result, () => feedback.finish(`${q.start} ${q.sign} ${q.change} = ${first}`, String(q.result))); }}><p className="text-3xl font-bold">{q.start} {q.sign} {q.change} = ?</p><NumberBox label="Nombre de fleurs maintenant" value={first} onChange={setFirst} /><Validate disabled={first === ''} /></form>}</>;
  } else if (slug === 'calcul-raisonnable') {
    const q = estimates[round % estimates.length];
    const proposed = round % 2 === 0 ? q.result + (round === 0 ? 300 : -300) : q.result;
    const plausible = Math.abs(proposed - q.estimate) < 50;
    content = <><Prompt speech={`Avant de calculer ${q.a} plus ${q.b}, choisis le résultat approximatif.`}>D’abord, une estimation</Prompt><p className="text-center text-4xl font-bold">{q.a} + {q.b}</p>
      {step === 0 ? <div className="flex flex-wrap justify-center gap-3">{q.choices.map(n => <Choice key={n} onClick={() => feedback.check(String(n), String(q.estimate), () => setStep(1))}>≈ {n}</Choice>)}</div> : <>
        <div className="rounded-xl bg-sky-50 p-4 text-center"><p>{q.a} ≈ {Math.round(q.a / 100) * 100} et {q.b} ≈ {Math.round(q.b / 100) * 100}</p><p>Mon estimation : environ <strong>{q.estimate}</strong>.</p></div>
        {step === 1 && <div className="space-y-4 text-center"><p className="text-xl">Un camarade trouve <strong>{proposed}</strong>. Ce résultat est-il assez proche de ton estimation ?</p><div className="flex flex-wrap justify-center gap-3">{['Oui, c’est plausible', 'Non, c’est trop éloigné'].map((v, i) => <Choice key={v} onClick={() => feedback.check(String(i === 0), String(plausible), () => setStep(2))}>{v}</Choice>)}</div></div>}
        {step >= 2 && <><p className="text-center">{plausible ? 'Un résultat proche est plausible. Il reste à vérifier le calcul exact.' : `${proposed} est trop éloigné de ${q.estimate} : il faut reprendre le calcul.`}</p><form className="space-y-5 text-center" onSubmit={e => { e.preventDefault(); if (step === 2) submitNumber(first, q.result, () => setStep(3)); }}><NumberBox label="Résultat exact" disabled={step === 3} value={first} onChange={setFirst} />{step === 2 && <Validate disabled={first === ''} />}</form></>}
        {step === 3 && <div className="space-y-4 text-center"><p>{q.result} est à seulement {Math.abs(q.result - q.estimate)} de {q.estimate} : le calcul exact confirme mon estimation.</p><Choice onClick={() => feedback.finish(`Estimation ${q.estimate} ; contrôle de ${proposed} ; résultat ${q.result}`, `≈ ${q.estimate} ; ${q.result}`)}>J’ai vérifié mon résultat</Choice></div>}
      </>}</>;
  } else if (slug === 'mesure-vrai-faux') {
    content = <MeasurementBoard round={round} onComplete={onComplete} />;
  } else if (slug === 'erreur-soustraction') {
    content = <BorrowingBoard round={round} onComplete={onComplete} />;
  } else {
    content = <MidpointBoard round={round} onComplete={onComplete} />;
  }
  return <div className="space-y-6">{content}{feedback.error && <p role="alert" className="rounded-xl bg-amber-50 p-4 text-center font-semibold text-amber-900">{feedback.error}</p>}</div>;
}
