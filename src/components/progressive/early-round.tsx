'use client';

import { useEffect, useState } from 'react';
import { Choice, SpeakButton, useRoundFeedback } from './shared';
import type { RoundProps } from './types';
import { usefulObject, MAGIC_OBJECTS, actionPair, pairingCount, addPair, compareCollections, wordChoice, sceneChoice, flowerOrder, trainSequence, type Pair, type SceneAction } from '@/lib/progressive/early-data';

function Prompt({ text }: { text: string }) {
  return <div className="space-y-3 text-center"><h2 className="text-2xl font-bold">{text}</h2><SpeakButton text={text} /></div>;
}
function Icons({ count, icon = '🌷' }: { count: number; icon?: string }) {
  return <div className="flex flex-wrap justify-center gap-3 text-4xl" aria-label={`${count} objets`}>{Array.from({ length: count }, (_, i) => <span aria-hidden="true" key={i}>{icon}</span>)}</div>;
}

/** Une scène d'action locale : ni texte de réponse visible, ni image distante. */
function RabbitScene({ action, description }: { action: SceneAction; description: string }) {
  const asleep = action === 'sleep';
  return <svg viewBox="0 0 400 240" role="img" aria-label={description} className="mx-auto w-full max-w-md rounded-2xl bg-sky-50">
    <path d="M0 207H400" stroke="#86a873" strokeWidth="6" />
    {asleep && <><rect x="80" y="157" width="245" height="44" rx="12" fill="#9bb7d4" /><path d="M90 196V217M313 196V217" stroke="#765c49" strokeWidth="9" /><text x="265" y="75" fontSize="34" fill="#496080">Z z</text></>}
    <g transform={action === 'jump' ? 'translate(0,-40)' : asleep ? 'translate(0,15) rotate(80 190 150)' : undefined}>
      <ellipse cx="185" cy="156" rx="52" ry="38" fill="#ddd6d0" stroke="#665b54" strokeWidth="3" />
      <ellipse cx="200" cy="55" rx="12" ry="37" fill="#eee7e2" stroke="#665b54" strokeWidth="3" />
      <ellipse cx="225" cy="56" rx="11" ry="34" fill="#eee7e2" stroke="#665b54" strokeWidth="3" />
      <circle cx="216" cy="109" r="34" fill="#eee7e2" stroke="#665b54" strokeWidth="3" />
      {asleep ? <path d="M221 100q7 8 14 0" stroke="#36312c" strokeWidth="3" fill="none" /> : <circle cx="231" cy="101" r="4" fill="#36312c" />}
      <circle cx="246" cy="114" r="5" fill="#e3969d" /><ellipse cx="157" cy="186" rx="28" ry="10" fill="#eee7e2" />
      <circle cx="132" cy="147" r="14" fill="white" />
      {action === 'eat' && <><path d="M250 124l52-15-30 37z" fill="#f58933" stroke="#8b4a20" strokeWidth="2" /><path d="M296 115l22-18m-19 17 27 0" stroke="#479a46" strokeWidth="7" /><path d="M242 125l9 6" stroke="#665b54" strokeWidth="2" /></>}
      {action === 'read' && <><path d="M208 140l37 12 40-12v48l-40 12-37-12z" fill="#e8bc62" stroke="#81652d" strokeWidth="3" /><path d="M245 154v43M216 153l20 7m-20 3 20 7m18-10 23-7m-23 17 23-7" stroke="#81652d" strokeWidth="2" /></>}
    </g>
    {action === 'jump' && <><path d="M133 177l-12 17m36-13-5 17" stroke="#64748b" strokeWidth="3" /><ellipse cx="185" cy="205" rx="45" ry="5" fill="#64748b" opacity=".2" /></>}
  </svg>;
}

export function EarlyRound({ slug, round, onComplete }: RoundProps & { slug: string }) {
  const feedback = useRoundFeedback(onComplete);
  const [step, setStep] = useState(0);
  const [answer, setAnswer] = useState('');
  const [notice, setNotice] = useState('');
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [flower, setFlower] = useState<number | null>(null);
  const [comparison, setComparison] = useState(false);
  const [revealed, setRevealed] = useState(0);
  const comparisonData = compareCollections(round);
  const distributionComplete = slug === 'donne-a-chacun' && pairs.length === pairingCount(round);
  useEffect(() => {
    if (!distributionComplete || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance('Chaque lapin a une fleur.');
    speech.lang = 'fr-FR';
    speech.rate = 0.85;
    window.speechSynthesis.speak(speech);
    return () => window.speechSynthesis.cancel();
  }, [distributionComplete]);
  useEffect(() => {
    if (!comparison || revealed >= Math.max(comparisonData.left, comparisonData.right)) return;
    const timer = setTimeout(() => setRevealed(n => n + 1), 650);
    return () => clearTimeout(timer);
  }, [comparison, revealed, comparisonData.left, comparisonData.right]);
  const choose = (answer: string, expected: string, reviewSpeech?: string) => feedback.check(answer, expected, () => { setAnswer(answer); feedback.finish(answer, expected, reviewSpeech); });
  let content;
  if (slug === 'objet-utile') {
    const q = usefulObject(round);
    content = <><Prompt text={q.prompt} /><div className="flex flex-wrap justify-center gap-4">{q.choices.map(o => <Choice key={o.word} ariaLabel={o.word} selected={answer === o.word} onClick={() => choose(o.word, q.expected, q.explanation)}><span className="block text-7xl" aria-hidden="true">{o.icon}</span></Choice>)}</div>{answer && <div className="space-y-3 rounded-xl bg-emerald-50 p-4 text-center"><p>{q.explanation}</p></div>}</>;
  } else if (slug === 'deux-actions') {
    const targets = actionPair(round);
    const article = (word: string) => word === 'étoile' ? 'l’' : ['baguette', 'carte', 'fleur'].includes(word) ? 'la ' : 'le ';
    content = <><Prompt text={`Touche ${article(targets[0])}${targets[0]}, puis ${article(targets[1])}${targets[1]}.`} />
      <div className="flex items-center justify-center gap-4" aria-live="polite" aria-label={`${step} action(s) effectuée(s) sur deux`}>{[0, 1].map(i => <div key={i} className="flex min-h-16 items-center gap-2 rounded-xl border-2 p-3"><span>{i + 1}.</span><span className="text-4xl" aria-hidden="true">{step > i ? MAGIC_OBJECTS.find(o => o.word === targets[i])?.icon : '…'}</span>{step > i && <span>✓</span>}</div>)}</div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{MAGIC_OBJECTS.map(o => <Choice key={o.word} ariaLabel={o.word} selected={step > 0 && o.word === targets[0] || step === 2 && o.word === targets[1]} onClick={() => feedback.check(o.word, targets[Math.min(step, 1)], () => { if (step === 0) setStep(1); else { setStep(2); feedback.finish(targets.join(' puis '), targets.join(' puis ')); } })}><span className="text-6xl" aria-hidden="true">{o.icon}</span></Choice>)}</div></>;
  } else if (slug === 'donne-a-chacun') {
    const count = pairingCount(round);
    const done = pairs.length === count;
    content = <><Prompt text={done ? 'Chaque lapin a une fleur.' : 'Touche une fleur, puis un lapin. Donne une fleur à chacun.'} />
      <div className="flex flex-wrap justify-center gap-3">{Array.from({ length: count + 1 }, (_, i) => <Choice key={i} ariaLabel={`Fleur ${i + 1}`} selected={flower === i} disabled={done || pairs.some(p => p.flower === i)} onClick={() => { setFlower(i); setNotice(''); }}><span className="text-5xl" aria-hidden="true">{pairs.some(p => p.flower === i) ? <span className="inline-block w-12 text-slate-300">·</span> : '🌷'}</span></Choice>)}</div>
      <div className="flex flex-wrap justify-center gap-3">{Array.from({ length: count }, (_, i) => <Choice key={i} ariaLabel={`Lapin ${i + 1}${pairs.some(p => p.rabbit === i) ? ', a une fleur' : ''}`} disabled={done || pairs.some(p => p.rabbit === i)} onClick={() => {
        if (flower === null) { setNotice('Touche d’abord une fleur, puis le lapin qui la recevra.'); return; }
        const next = addPair(pairs, flower, i, count);
        feedback.check(String(next.length), String(pairs.length + 1), () => { setPairs(next); setFlower(null); setNotice(''); });
      }}><span className="text-5xl" aria-hidden="true">🐇{pairs.some(p => p.rabbit === i) ? '🌷' : ''}</span></Choice>)}</div>
      <p className="text-center" role="status">{notice || (flower !== null ? 'Fleur choisie : touche un lapin.' : '')}</p><p className="text-center" aria-live="polite">{pairs.length} lapin{pairs.length > 1 ? 's' : ''} servi{pairs.length > 1 ? 's' : ''} sur {count}</p>
      {done && <div className="text-center"><p className="mb-3">Il reste une fleur. Tous les lapins sont servis.</p><Choice onClick={() => feedback.finish(`${count} paires`, `${count} paires`)}>J’ai terminé</Choice></div>}</>;
  } else if (slug === 'comparer-collections') {
    const q = comparisonData;
    content = <><Prompt text="Touche la collection qui a le plus de fleurs. S’il y en a autant, touche le signe égal." /><div className="grid grid-cols-2 gap-4">{[['gauche', q.left], ['droite', q.right]].map(([side, count]) => <button type="button" key={side} aria-label={side === 'gauche' ? 'À gauche' : 'À droite'} disabled={comparison} onClick={() => feedback.check(String(side), q.expected, () => setComparison(true))} className="space-y-4 rounded-2xl border-2 border-slate-300 bg-sky-50 p-3 focus-visible:ring-4 focus-visible:ring-primary/40"><h3 className="text-center font-bold">{side === 'gauche' ? 'À gauche' : 'À droite'}</h3><Icons count={Number(count)} /></button>)}</div>
      {!comparison ? <div className="text-center"><Choice ariaLabel="Autant" onClick={() => feedback.check('autant', q.expected, () => setComparison(true))}><span className="block text-3xl">=</span>Autant</Choice></div> : <div className="space-y-3 text-center"><p>Associons les fleurs une par une.</p><div aria-label="Correspondance terme à terme">{Array.from({ length: revealed }, (_, i) => <div key={i} className={`flex items-center justify-center gap-8 rounded-lg py-1 text-3xl motion-safe:animate-in motion-safe:fade-in ${i >= Math.min(q.left, q.right) ? 'border-2 border-amber-400 bg-amber-50' : ''}`}><span>{i < q.left ? '🌷' : '—'}</span><span className="text-lg">{i < Math.min(q.left, q.right) ? '↔' : 'reste'}</span><span>{i < q.right ? '🌷' : '—'}</span></div>)}</div>{revealed >= Math.max(q.left, q.right) && <><p>{q.expected === 'autant' ? 'Chaque fleur a une partenaire : il y en a autant.' : `Il reste ${Math.abs(q.left - q.right)} fleur${Math.abs(q.left - q.right) > 1 ? 's' : ''} à ${q.expected} : il y en a plus.`}</p><div className="flex flex-wrap justify-center gap-3"><Choice onClick={() => setRevealed(0)}>Revoir les paires</Choice><Choice onClick={() => feedback.finish(q.expected, q.expected)}>J’ai compris</Choice></div></>}</div>}</>;
  } else if (slug === 'mot-correct') {
    const q = wordChoice(round);
    content = <><Prompt text="Regarde l’image. Touche le mot exact." /><div role="img" aria-label={q.label} className="text-center text-8xl">{q.icon}</div><div className="flex flex-wrap justify-center gap-3">{q.choices.map(word => <Choice key={word} selected={answer === word} onClick={() => choose(word, q.expected, q.label)}>{word}</Choice>)}</div>{answer && <div className="space-y-2 rounded-xl bg-emerald-50 p-4 text-center"><p className="text-2xl font-bold tracking-widest">{q.expected.split('').join(' · ')}</p><p>Je regarde toutes les lettres, dans leur ordre.</p></div>}</>;
  } else if (slug === 'phrase-image') {
    const q = sceneChoice(round);
    content = <><Prompt text="Choisis la phrase qui raconte l’image." /><RabbitScene action={q.action} description={q.description} /><div className="grid gap-3">{q.choices.map(sentence => <Choice key={sentence} selected={answer === sentence} onClick={() => choose(sentence, q.expected, q.description)}>{sentence}</Choice>)}</div>{answer && <div className="space-y-2 rounded-xl bg-emerald-50 p-4 text-center"><p>{q.description}</p></div>}</>;
  } else if (slug === 'commande-incomplete') {
    const q = flowerOrder(round);
    const added = Number(answer || 0);
    content = <><Prompt text={`Il faut ${q.target} fleurs. Il y en a déjà ${q.present} dans le panier. Combien faut-il ajouter ?`} />
      <div className="space-y-3 rounded-2xl border-2 border-amber-300 bg-amber-50 p-4"><h3 className="text-center text-xl font-bold">🧺 Commande : {q.target} fleurs</h3><p className="text-center">Déjà dans le panier : {q.present}</p><div className="mx-auto grid w-fit grid-cols-5 gap-2" aria-label={`${q.present} fleurs déjà présentes et ${added} fleurs ajoutées`}>{Array.from({length: Math.max(q.target, q.present + added)}, (_,i) => <span key={i} className={`flex h-11 w-10 items-center justify-center rounded-lg border-2 text-2xl ${i < q.present ? 'border-amber-300 bg-white' : i < q.present + added ? 'border-blue-500 bg-blue-50' : 'border-dashed border-slate-300'}`} aria-hidden="true">{i < q.present + added ? '🌷' : '·'}</span>)}</div>{answer && <p className="text-center text-blue-800">J’ajoute {added} fleur{added > 1 ? 's' : ''} : le panier contient maintenant {q.present + added} fleurs.</p>}</div>
      {step === 0 && <><p className="text-center">Choisis combien de fleurs ajouter.</p><div className="flex justify-center gap-3">{q.choices.map(n => <Choice key={n} selected={answer === String(n)} onClick={() => setAnswer(String(n))}>{n}</Choice>)}</div><div className="text-center"><Choice disabled={!answer} onClick={() => feedback.check(answer, String(q.expected), () => { setStep(1); feedback.finish(`${q.present} + ${answer} = ${q.target}`, String(q.expected)); }, q.present + added < q.target ? 'Il manque encore des fleurs. Change la quantité ajoutée.' : 'Il y a trop de fleurs. Change la quantité ajoutée.')}>Vérifier la commande</Choice></div></>}
      {step === 1 && <p className="rounded-xl bg-emerald-50 p-4 text-center text-xl font-bold">{q.present} + {added} = {q.target} : la commande est complète.</p>}</>;
  } else {
    const q = trainSequence(round);
    const direction = q.values[1] - q.values[0];
    content = <><Prompt text="Quel nombre manque dans le train ?" /><div className="flex items-start justify-center gap-1">{q.values.map((n, i) => { const visible = i !== q.gap || !!answer; return <div key={i} className={`relative mb-4 min-w-0 flex-1 rounded-xl border-2 px-1 py-3 text-center ${i === q.gap ? 'border-blue-600 bg-blue-50' : 'border-slate-300 bg-sky-50'}`}><strong className="text-2xl">{visible ? n : '?'}</strong><div className="mx-auto mt-2 grid w-fit grid-cols-2 gap-0.5 text-[9px] leading-3 text-sky-700" aria-hidden="true">{visible ? Array.from({length:n},(_,j)=><span key={j}>●</span>) : <span>…</span>}</div><span className="absolute -bottom-4 left-1 right-1 flex justify-between text-lg" aria-hidden="true"><span>●</span><span>●</span></span>{i < q.values.length - 1 && <span className="absolute -right-2 top-5 text-xs" aria-hidden="true">━</span>}</div>; })}</div>
      {!answer ? <div className="flex justify-center gap-3">{q.choices.map(n => <Choice key={n} onClick={() => choose(String(n), String(q.values[q.gap]), direction > 0 ? 'On avance de un en un.' : 'On recule de un en un.')}>{n}</Choice>)}</div> : <div className="space-y-2 rounded-xl bg-emerald-50 p-4 text-center"><p className="text-xl font-bold">{direction > 0 ? '+ 1 à chaque wagon' : '− 1 à chaque wagon'}</p><p>{q.values[q.gap - 1]} → {answer} → {q.values[q.gap + 1]}</p></div>}</>;

  }
  return <div className="space-y-6">{content}{feedback.error && <p role="alert" className="rounded-xl bg-amber-50 p-4 text-center font-semibold text-amber-900">{feedback.error}</p>}</div>;
}
