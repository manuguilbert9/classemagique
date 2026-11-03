'use client';

import { useEffect, useState } from 'react';
import { BookOpen, BrainCircuit, Calculator, Volume2, Printer, Check, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SyllableText } from '@/components/syllable-text';
import { FEEDBACK_LABELS, type HomeworkActivity, type HomeworkFeedback, type HomeworkFeedbackStatus, type HomeworkPlan, type HomeworkSubject } from '@/lib/homework-plan';
import { mathsForPlan } from '@/lib/homework-period';
import { homeworkPrintHtml } from '@/lib/homework-print';
import { saveHomeworkFeedback } from '@/services/homework-feedback';

function Speak({ text, label = 'Écouter la consigne', onListen }: { text: string; label?: string; onListen?: () => void }) {
  const [supported, setSupported] = useState(false);
  useEffect(() => { setSupported('speechSynthesis' in window); }, []);
  if (!supported) return null;
  return <Button variant="outline" size="sm" className="min-h-11 whitespace-normal" onClick={() => {
    window.speechSynthesis.cancel();
    const voice = new SpeechSynthesisUtterance(text);
    voice.lang = 'fr-FR'; voice.rate = 0.85;
    window.speechSynthesis.speak(voice); onListen?.();
  }}><Volume2 className="mr-2 h-4 w-4" />{label}</Button>;
}

function Questions({ activity }: { activity: HomeworkActivity }) {
  return <ol className="space-y-5">{activity.questions.map((q, index) => <li key={`${index}-${q.prompt}`} className="space-y-2">
    <p className="font-exercise text-xl leading-relaxed">{q.prompt}</p>
    <Speak text={q.prompt} label="Écouter la question" />
    <details className="rounded-lg bg-muted/50 p-3"><summary className="min-h-8 cursor-pointer font-medium">Un coup de pouce</summary><p className="mt-2">{q.hint}</p></details>
    <details className="rounded-lg border p-3"><summary className="min-h-8 cursor-pointer font-medium">Vérifier après mon essai</summary><p className="mt-2">{q.answer}</p></details>
  </li>)}</ol>;
}

function Tokens() {
  const [count, setCount] = useState(0);
  return <details className="my-4 rounded-lg border p-3"><summary className="cursor-pointer py-2 font-medium">Mes jetons et ma bande numérique</summary>
    <p className="my-2">Utilise ces jetons ou des objets à la maison. Un adulte peut déplacer les objets selon tes indications.</p>
    <div className="flex flex-wrap gap-2 py-3" aria-label={`${count} jetons`}>{Array.from({length:count}, (_, i) => <span key={i} aria-hidden="true" className="h-7 w-7 rounded-full border-2 border-amber-800 bg-amber-300" />)}</div>
    <div className="flex flex-wrap items-center gap-3"><Button variant="outline" disabled={count===0} onClick={()=>setCount(count-1)}>Retirer 1</Button><output aria-live="polite">{count} jetons</output><Button variant="outline" disabled={count===20} onClick={()=>setCount(count+1)}>Ajouter 1</Button><Button variant="ghost" onClick={()=>setCount(0)} aria-label="Enlever tous les jetons"><RotateCcw className="h-4 w-4" /></Button></div>
    <p className="mt-4 overflow-x-auto whitespace-nowrap font-mono text-lg" aria-label="Bande numérique de zéro à vingt">{Array.from({length:21},(_,i)=>i).join(' · ')}</p>
  </details>;
}

function FeedbackButtons({ date, subject, studentId, saved, listened, usedFallback, onSaved, readOnly }: {
  date: string; subject: HomeworkSubject; studentId?: string; saved?: HomeworkFeedback;
  listened: boolean; usedFallback: boolean; onSaved?: (value: HomeworkFeedback) => void; readOnly?:boolean;
}) {
  const [saving,setSaving] = useState(false);
  const [error,setError] = useState('');
  const [local,setLocal] = useState(saved);
  useEffect(()=>{setLocal(saved);},[saved]);
  if (!studentId) return null;
  if (readOnly) return <p className="mt-5 border-t pt-3 text-sm text-muted-foreground">Consultation : {saved?`retour de l’élève « ${FEEDBACK_LABELS[saved.status]} »`:'aucun retour enregistré par l’élève'}. Aucun résultat ne sera enregistré.</p>;
  const save = async (status: HomeworkFeedbackStatus) => {
    setSaving(true);setError('');
    try {
      const value=await saveHomeworkFeedback({userId:studentId,date,subject,status,listened:listened||local?.listened===true,usedFallback});
      setLocal(value); onSaved?.(value);
    } catch {setError('Ton retour n’a pas été enregistré. Vérifie la connexion et réessaie.');}
    finally {setSaving(false);}
  };
  return <div className="mt-6 border-t pt-4"><p className="mb-3 font-medium">Comment cela s’est-il passé ?</p>
    <div className="flex flex-wrap gap-2">{(Object.entries(FEEDBACK_LABELS) as [HomeworkFeedbackStatus,string][]).map(([status,label]) => <Button key={status} disabled={saving} variant={local?.status===status?'default':'outline'} aria-pressed={local?.status===status} onClick={()=>save(status)}>{local?.status===status && <Check className="mr-2 h-4 w-4" />}{label}</Button>)}</div>
    {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
    {local && !error && <p role="status" className="mt-2 text-sm text-muted-foreground">Retour enregistré. Tu peux t’arrêter ici.</p>}
  </div>;
}

export function HomeworkPlanCard({ plan, date, studentId, feedback = [], onFeedback, readOnly=false }: {
  plan: HomeworkPlan; date: string; studentId?: string; feedback?: HomeworkFeedback[]; onFeedback?: (value: HomeworkFeedback)=>void; readOnly?:boolean;
}) {
  const [sentence,setSentence] = useState(0);
  const [listened,setListened] = useState(false);
  const [word,setWord] = useState(0);
  const [hidden,setHidden] = useState(false);
  const maths=mathsForPlan(plan);
  const fallback=!plan.maths.introduced && !!plan.maths.fallback;
  useEffect(()=>{setSentence(0);setWord(0);setHidden(false);setListened(false);},[date,plan]);
  useEffect(()=>()=>{window.speechSynthesis?.cancel();},[]);
  const print = () => {
    const blob=new Blob([homeworkPrintHtml(plan,date)],{type:'text/html;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const link=document.createElement('a');link.href=url;link.download=`Mes-devoirs-${date}.html`;link.click();
    setTimeout(()=>URL.revokeObjectURL(url),10000);
  };
  const footer = (subject:HomeworkSubject) => <FeedbackButtons key={`${date}-${subject}`} date={date} subject={subject} studentId={studentId}
    saved={feedback.find(f=>f.date===date&&f.subject===subject&&f.userId===studentId)} listened={subject==='reading'&&listened} usedFallback={subject==='maths'&&fallback} onSaved={onFeedback} readOnly={readOnly} />;
  return <article className="space-y-4 rounded-2xl border bg-card p-4 sm:p-6" aria-label={`Devoirs du ${date}`}>
    <header className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-headline text-2xl">Pour le {new Intl.DateTimeFormat('fr-FR',{weekday:'long',day:'numeric',month:'long',timeZone:'Europe/Paris'}).format(new Date(`${date}T12:00:00Z`))}</h2><p className="mt-1 text-muted-foreground">{plan.theme} · {plan.maxMinutes} minutes maximum</p></div><Button variant="outline" onClick={print}><Printer className="mr-2 h-4 w-4" />Version à imprimer</Button></header>
    <p className="rounded-lg bg-muted/50 p-3">Je peux répondre à voix haute, montrer ou manipuler. Je m’arrête si je suis fatigué.</p>
    <details open className="rounded-xl border-l-4 border-l-sky-600 bg-sky-50/40 p-4 sm:p-5"><summary className="cursor-pointer font-headline text-2xl"><BookOpen className="mr-2 inline h-6 w-6 text-sky-700" />Je lis <span className="text-base font-normal">· {plan.reading.minutes} min</span></summary>
      <div className="mt-4 space-y-4"><p>{plan.reading.instruction}</p><Speak text={plan.reading.instruction} />
        <h3 className="font-semibold">{plan.reading.title}</h3>
        <div className="rounded-xl bg-white p-4 font-exercise text-2xl leading-loose text-slate-900">
          {plan.profiles.support==='syllabes' ? <><SyllableText text={plan.reading.passage[sentence]??''} /><div className="mt-4 flex items-center gap-3 text-base"><Button variant="outline" disabled={sentence===0} onClick={()=>setSentence(sentence-1)}>Précédente</Button><span>{sentence+1}/{plan.reading.passage.length}</span><Button variant="outline" disabled={sentence>=plan.reading.passage.length-1} onClick={()=>setSentence(sentence+1)}>Suivante</Button></div></> : plan.reading.passage.map((text,i)=><p key={i} className="mb-2">{text}</p>)}
        </div>
        {plan.reading.mode==='text' && <><Speak text={plan.reading.passage.join(' ')} label="Écouter le texte pour m’aider" onListen={()=>setListened(true)} />{listened&&<p className="text-sm text-muted-foreground">Tu as écouté le texte. Tu peux maintenant essayer de le lire.</p>}</>}
        {plan.reading.adultText && <div className="rounded-lg border p-3"><p className="mb-2 font-medium">Petite histoire lue par un adulte</p><p>{plan.reading.adultText}</p><Speak text={plan.reading.adultText} label="Écouter l’histoire" /></div>}
        <Questions activity={plan.reading}/>{footer('reading')}
      </div>
    </details>
    {plan.spelling && <details className="rounded-xl border-l-4 border-l-violet-600 bg-violet-50/40 p-4 sm:p-5"><summary className="cursor-pointer font-headline text-2xl"><BrainCircuit className="mr-2 inline h-6 w-6 text-violet-700" />Je prépare mes mots <span className="text-base font-normal">· {plan.spelling.minutes} min</span></summary>
      <div className="mt-4 space-y-4"><p>{plan.spelling.instruction}</p><Speak text={plan.spelling.instruction}/>
        <p className="text-sm">Dyna-Mots S{plan.week} · Groupe de mots {word+1}/{plan.spelling.words.length}</p>
        <p className="min-h-24 rounded-xl bg-white p-5 font-exercise text-2xl leading-relaxed text-slate-900" aria-live="polite">{hidden?'Retrouve le mot ou le groupe de mots de mémoire.':plan.spelling.words[word]}</p>
        <div className="flex flex-wrap gap-2"><Button variant="outline" disabled={word===0} onClick={()=>{setWord(word-1);setHidden(false);}}>Précédent</Button><Button onClick={()=>setHidden(!hidden)}>{hidden?'Vérifier':'Cacher et essayer'}</Button><Button variant="outline" disabled={word>=plan.spelling.words.length-1} onClick={()=>{setWord(word+1);setHidden(false);}}>Suivant</Button></div>
        <Speak text={plan.spelling.words[word]} label="Écouter le mot" />
        <Questions activity={plan.spelling}/>{footer('spelling')}
      </div>
    </details>}
    <details className="rounded-xl border-l-4 border-l-amber-600 bg-amber-50/40 p-4 sm:p-5"><summary className="cursor-pointer font-headline text-2xl"><Calculator className="mr-2 inline h-6 w-6 text-amber-800" />Je m’entraîne en maths <span className="text-base font-normal">· {maths.minutes} min</span></summary>
      <div className="mt-4 space-y-4"><h3 className="font-semibold">{maths.title}</h3><p>{maths.instruction}</p><Speak text={maths.instruction}/>{plan.maths.tokens&&<Tokens/>}<Questions activity={maths}/>{footer('maths')}</div>
    </details>
  </article>;
}
