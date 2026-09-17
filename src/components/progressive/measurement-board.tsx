'use client';

import { useState } from 'react';
import { measures } from '@/lib/progressive/math-data';
import { Choice, SpeakButton, useRoundFeedback } from './shared';
import type { RoundProps } from './types';

export function MeasurementBoard({ round, onComplete }: RoundProps) {
  const q = measures[round % measures.length];
  const length = q.end - q.start;
  const feedback = useRoundFeedback(onComplete);
  const [step, setStep] = useState(0);
  const [offset, setOffset] = useState(0);
  const [answer, setAnswer] = useState('');
  const [verdict, setVerdict] = useState('');
  const aligned = offset === q.start;
  const prompt = step === 0 ? `Camille dit : « Il mesure ${q.claim} cm. » Vrai ou faux ?` : step === 1 ? 'Déplace la règle pour placer le zéro au début du segment.' : step === 2 ? 'Lis maintenant la longueur à partir du zéro.' : 'Tu as vérifié la longueur à partir du zéro.';
  return <div className="space-y-5">
    <div className="space-y-3 text-center"><h2 className="text-2xl font-bold">{prompt}</h2><SpeakButton text={prompt} /></div>
    {step > 0 && <p className="text-center">Mon avis : <strong>{verdict}</strong>. Je le vérifie avec la règle.</p>}
    <svg viewBox="0 0 620 230" role="img" aria-label={`Segment fixe. Début à ${q.start - offset}, fin à ${q.end - offset} sur la règle en centimètres.`} className="mx-auto w-full max-w-2xl">
      <path d={`M${40 + q.start * 32} 42H${40 + q.end * 32}`} stroke="#1d4ed8" strokeWidth="6" />
      {[q.start, q.end].map(v => <path key={v} d={`M${40 + v * 32} 30v92`} stroke="#1d4ed8" strokeWidth="2" strokeDasharray="4 4" />)}
      <g transform={`translate(${offset * 32},0)`} className="motion-safe:transition-transform motion-safe:duration-300">
        <rect x="27" y="78" width="410" height="82" rx="5" fill="#fef3c7" stroke="#a16207" />
        {Array.from({ length: 61 }, (_, i) => <path key={i} d={`M${40 + i * 6.4} 78v${i % 5 === 0 ? 30 : 12}`} stroke="#854d0e" strokeWidth={i % 5 === 0 ? 2 : 1} />)}
        {Array.from({ length: 13 }, (_, i) => <text key={i} x={40 + i * 32} y="145" textAnchor="middle" fontSize="23" fill="#422006" fontWeight={i === 0 ? 'bold' : undefined}>{i}</text>)}
        <text x="440" y="150" fontSize="20">cm</text>
      </g>
      {step > 1 && <><path d={`M${40 + q.start * 32} 192H${40 + q.end * 32}`} stroke="#047857" strokeWidth="2" /><text x={40 + (q.start + q.end) * 16} y="220" textAnchor="middle" fontSize="22" fill="#065f46">{step === 3 ? `${length} cm` : '? cm'}</text></>}
    </svg>
    {step === 0 && <div className="flex justify-center gap-3">{['Vrai', 'Faux'].map(v => <Choice key={v} onClick={() => { setVerdict(v); setStep(1); }}>{v}</Choice>)}</div>}
    {step === 1 && <div className="space-y-4 text-center"><p>Le segment reste à sa place. C’est la règle que tu déplaces.</p><div className="flex justify-center gap-3"><Choice ariaLabel="Déplacer la règle à gauche" disabled={offset === 0} onClick={() => setOffset(n => n - 1)}>←</Choice><Choice ariaLabel="Déplacer la règle à droite" disabled={offset === 4} onClick={() => setOffset(n => n + 1)}>→</Choice></div><Choice onClick={() => feedback.check(aligned ? 'zéro aligné' : 'zéro décalé', 'zéro aligné', () => setStep(2))}>Le zéro est au début</Choice></div>}
    {step === 2 && <form className="space-y-4 text-center" onSubmit={e => { e.preventDefault(); feedback.check(answer, String(length), () => { feedback.check(verdict, q.claim === length ? 'Vrai' : 'Faux', () => {}, 'Ta mesure est correcte. Elle ne confirme pas ton premier avis : compare-la aux centimètres annoncés par Camille.'); setStep(3); }); }}><label className="block font-semibold">Longueur en cm<input inputMode="numeric" value={answer} onChange={e => setAnswer(e.target.value.replace(/\D/g, '').slice(0, 2))} className="mx-auto mt-2 block h-14 w-24 rounded-xl border-2 text-center text-2xl" /></label><button type="submit" disabled={!answer} className="min-h-12 rounded-xl bg-primary px-5 py-3 font-bold text-primary-foreground disabled:opacity-40">Vérifier la longueur</button></form>}
    {step === 3 && <div className="space-y-3 text-center"><p>Le segment mesure <strong>{length} cm</strong>. À partir de zéro, on compte {length} intervalles de 1 cm.</p><p>Camille annonçait {q.claim} cm. Après vérification, son affirmation est…</p><div className="flex justify-center gap-3">{['Vrai', 'Faux'].map(v => <Choice key={v} onClick={() => feedback.check(v, q.claim === length ? 'Vrai' : 'Faux', () => feedback.finish(`Avis initial : ${verdict} ; avis vérifié : ${v} ; zéro aligné ; ${answer} cm`, `${q.claim === length ? 'Vrai' : 'Faux'} ; ${length} cm`))}>{v}</Choice>)}</div></div>}
    {feedback.error && <p role="alert" className="rounded-xl bg-amber-50 p-4 text-center text-amber-900">{feedback.error}</p>}
  </div>;
}
