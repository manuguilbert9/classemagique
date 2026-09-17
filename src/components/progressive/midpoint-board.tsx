'use client';

import { useState } from 'react';
import { midpoints } from '@/lib/progressive/math-data';
import { Choice, SpeakButton, useRoundFeedback } from './shared';
import type { RoundProps } from './types';

export function MidpointBoard({ round, onComplete }: RoundProps) {
  const q = midpoints[round % midpoints.length];
  const midpoint = q.points.find(p => p.position === q.length / 2)!;
  const feedback = useRoundFeedback(onComplete);
  const [point, setPoint] = useState('');
  const [first, setFirst] = useState('');
  const [second, setSecond] = useState('');
  const [verified, setVerified] = useState(false);
  const prompt = `AB mesure ${q.length} ${q.unit}. Touche le point qui partage le segment en deux parties égales.`;
  return <div className="space-y-5">
    <div className="space-y-3 text-center"><h2 className="text-2xl font-bold">{prompt}</h2><SpeakButton text={prompt} /></div>
    <div className="relative mx-auto h-64 w-full max-w-2xl" role="group" aria-label="Segment AB : touche un point">
      <svg viewBox="0 0 560 256" preserveAspectRatio="none" aria-hidden="true" className="h-full w-full">
        <path d="M35 128H525" stroke="#475569" strokeWidth="4" />
        {[0, q.length].map((v, i) => <path key={i} d={`M${35 + v / q.length * 490} 118v20`} stroke="#334155" strokeWidth="3" />)}
        {q.points.slice().sort((a,b) => a.position-b.position).map((p,i) => <g key={p.name}><path d={`M${35 + p.position / q.length * 490} 128V${i % 2 === 0 ? 73 : 183}`} stroke="#2563eb" strokeWidth="2" strokeDasharray="3 3" /><circle cx={35 + p.position / q.length * 490} cy="128" r="5" fill={point === p.name ? '#047857' : '#2563eb'} /></g>)}
        {verified && <path d="M35 225v10h245v-10m0 0v10h245v-10" fill="none" stroke="#047857" strokeWidth="3" />}
      </svg>
      <span className="absolute left-[6.25%] top-24 -translate-x-1/2 text-xl font-bold">A</span><span className="absolute right-[6.25%] top-24 translate-x-1/2 text-xl font-bold">B</span>
      {q.points.slice().sort((a,b) => a.position-b.position).map((p,i) => <button key={p.name} type="button" disabled={!!point} aria-label={`Point ${p.name}, à ${p.position} ${q.unit} de A`} aria-pressed={point === p.name} onClick={() => feedback.check(p.name, midpoint.name, () => setPoint(p.name))} style={{ left: `${(35 + p.position / q.length * 490) / 560 * 100}%`, top: i % 2 === 0 ? 49 : 183 }} className={`absolute flex min-h-12 min-w-12 -translate-x-1/2 flex-col items-center justify-center rounded-xl border-2 font-bold focus-visible:ring-4 focus-visible:ring-primary/40 ${point === p.name ? 'border-emerald-600 bg-emerald-50 text-emerald-900' : 'border-blue-500 bg-white text-blue-800'}`}><span>{p.name}</span><span className="text-xs">{p.position} {q.unit}</span></button>)}
      {verified && <><span className="absolute bottom-0 left-1/4 -translate-x-1/2 font-bold text-emerald-800">{first} {q.unit}</span><span className="absolute bottom-0 left-3/4 -translate-x-1/2 font-bold text-emerald-800">{second} {q.unit}</span></>}
    </div>
    <p className="text-center">Depuis A : {q.points.slice().sort((a, b) => a.position - b.position).map(p => `${p.name} à ${p.position} ${q.unit}`).join(' ; ')}.</p>
    {point && !verified && <form className="space-y-4 text-center" onSubmit={e => { e.preventDefault(); feedback.check(`${first},${second}`, `${q.length / 2},${q.length / 2}`, () => setVerified(true)); }}><p>Vérifie les deux longueurs : elles doivent être égales.</p><div className="flex flex-wrap justify-center gap-5">{[[`A${point}`, first, setFirst], [`${point}B`, second, setSecond]].map(([label, value, set]) => <label key={String(label)} className="font-semibold">{String(label)} en {q.unit}<input inputMode="numeric" value={String(value)} onChange={e => (set as (v: string) => void)(e.target.value.replace(/\D/g, '').slice(0, 3))} className="mx-auto mt-2 block h-14 w-24 rounded-xl border-2 text-center text-2xl" /></label>)}</div><button type="submit" disabled={!first || !second} className="min-h-12 rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground disabled:opacity-40">Vérifier</button></form>}
    {verified && <div className="space-y-3 text-center"><p className="text-xl font-bold">A{point} = {point}B = {first} {q.unit}</p><p>Les deux parties ont la même longueur : {point} est bien le milieu.</p><Choice onClick={() => feedback.finish(`${point} ; ${first} ${q.unit} = ${second} ${q.unit}`, `${midpoint.name} ; ${q.length / 2} ${q.unit} de chaque côté`)}>J’ai vérifié les deux parties</Choice></div>}
    {feedback.error && <p role="alert" className="rounded-xl bg-amber-50 p-4 text-center text-amber-900">{feedback.error}</p>}
  </div>;
}
