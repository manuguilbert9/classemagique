'use client';

import { useEffect, useState } from 'react';
import { BookOpen, BrainCircuit, Calculator, Volume2, Printer, Check, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SyllableText } from '@/components/syllable-text';
import { FEEDBACK_LABELS, type HomeworkActivity, type HomeworkFeedback, type HomeworkFeedbackStatus, type HomeworkPlan, type HomeworkSubject } from '@/lib/homework-plan';
import { mathsForPlan } from '@/lib/homework-period';
import { homeworkPrintHtml } from '@/lib/homework-print';
import { saveHomeworkFeedbackBatch } from '@/services/homework-feedback';
import { buildHomeworkFeedback, homeworkActivityKey, homeworkSubjectCompleted, responseFields, HOMEWORK_SUBJECT_LABELS } from '@/lib/homework-responses';

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

function Questions({ activity,subject,answers,onAnswer,disabled }: { activity: HomeworkActivity;subject:HomeworkSubject;answers:Record<string,string>;onAnswer:(id:string,value:string)=>void;disabled:boolean }) {
  return <ol className="space-y-5">{activity.questions.map((q, index) => <li key={`${index}-${q.prompt}`} className="space-y-2">
    <p className="font-exercise text-xl leading-relaxed">{q.prompt}</p>
    <Speak text={q.prompt} label="Écouter la question" />
    <label className="block font-medium">Ma réponse<Textarea aria-label={`${HOMEWORK_SUBJECT_LABELS[subject]} — réponse ${index+1}`} value={answers[`question-${index}`]??''} onChange={e=>onAnswer(`question-${index}`,e.target.value)} disabled={disabled} maxLength={2000} rows={3} className="mt-2 bg-white text-xl text-slate-900" placeholder="Écris ta réponse, ou dicte-la à un adulte qui la saisit." /></label>
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

type HomeworkPlanCardProps={
  plan: HomeworkPlan; date: string; studentId?: string; feedback?: HomeworkFeedback[]; onFeedback?: (value: HomeworkFeedback)=>void; readOnly?:boolean;
};
export function HomeworkPlanCard(props:HomeworkPlanCardProps){
  return <HomeworkPlanContent key={`${props.studentId}/${props.date}/${props.readOnly}/${JSON.stringify(props.plan)}`} {...props}/>;
}
function HomeworkPlanContent({plan,date,studentId,feedback=[],onFeedback,readOnly=false}:HomeworkPlanCardProps) {
  const [sentence,setSentence] = useState(0);
  const [listened,setListened] = useState(false);
  const [word,setWord] = useState(0);
  const [hidden,setHidden] = useState(false);
  const maths=mathsForPlan(plan);
  const subjects:HomeworkSubject[]=plan.spelling?['reading','spelling','maths']:['reading','maths'];
  const preview=readOnly||!studentId;
  const initial=(subject:HomeworkSubject)=>feedback.find(f=>f.date===date&&f.subject===subject&&f.userId===studentId);
  const [saved,setSaved]=useState<Partial<Record<HomeworkSubject,HomeworkFeedback>>>(()=>Object.fromEntries(subjects.map(s=>[s,initial(s)])));
  const [answers,setAnswers]=useState<Record<HomeworkSubject,Record<string,string>>>(()=>Object.fromEntries((['reading','spelling','maths'] as const).map(s=>[s,initial(s)?.activityKey===homeworkActivityKey(plan,s)?Object.fromEntries((initial(s)?.responses??[]).map(r=>[r.id,r.answer])):{}])) as Record<HomeworkSubject,Record<string,string>>);
  const [statuses,setStatuses]=useState<Record<HomeworkSubject,HomeworkFeedbackStatus>>(()=>({reading:initial('reading')?.status??'alone',spelling:initial('spelling')?.status??'alone',maths:initial('maths')?.status??'alone'}));
  const [busy,setBusy]=useState(false);
  const [notice,setNotice]=useState<{subject:HomeworkSubject|'all';text:string;error?:boolean}|null>(null);
  const dirty=(s:HomeworkSubject)=>responseFields(plan,s).some(f=>(answers[s][f.id]??'').trim()!==(saved[s]?.activityKey===homeworkActivityKey(plan,s)?saved[s]?.responses?.find(r=>r.id===f.id)?.answer??'':''))||(saved[s]&&statuses[s]!==saved[s]!.status);
  const complete=(s:HomeworkSubject)=>homeworkSubjectCompleted(plan,s,saved[s])&&!dirty(s);
  const completeCount=subjects.filter(complete).length;
  const hasChanges=subjects.some(dirty);
  useEffect(()=>{
    if(preview||!hasChanges)return;
    const warn=(e:BeforeUnloadEvent)=>{e.preventDefault();e.returnValue='';};
    window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);
  },[preview,hasChanges]);
  const onAnswer=(subject:HomeworkSubject,id:string,value:string)=>{setAnswers(previous=>({...previous,[subject]:{...previous[subject],[id]:value}}));setNotice(null);};
  const save=async(target:HomeworkSubject|'all',completion:'draft'|'completed')=>{
    const selected=target==='all'?subjects:[target];
    let values:Omit<HomeworkFeedback,'updatedAt'>[];
    try{values=selected.map(s=>buildHomeworkFeedback(plan,s,studentId??'preview',date,answers[s],statuses[s],completion,s==='reading'&&(listened||(saved[s]?.listened===true&&(!saved[s]?.activityKey||saved[s]?.activityKey===homeworkActivityKey(plan,s))))));}
    catch(error){setNotice({subject:target,text:(error as Error).message,error:true});return;}
    setBusy(true);setNotice(null);
    try{
      if(!preview&&!navigator.onLine)throw new Error('offline');
      const results=preview?values.map(v=>({...v,updatedAt:new Date().toISOString()})):await saveHomeworkFeedbackBatch(values);
      setSaved(previous=>({...previous,...Object.fromEntries(results.map(v=>[v.subject,v]))}));
      if(!preview)results.forEach(v=>onFeedback?.(v));
      setNotice({subject:target,text:preview?'Simulation réussie. Aucune réponse ni réalisation de l’élève n’a été modifiée.':completion==='completed'?(target==='all'?'Devoir terminé : toutes tes réponses sont enregistrées.':'Activité terminée : tes réponses sont enregistrées.'):'Réponses enregistrées. Tu peux reprendre ton travail plus tard.'});
    }catch{setNotice({subject:target,text:'Enregistrement impossible. Tes réponses restent affichées : vérifie la connexion puis réessaie.',error:true});}
    finally{setBusy(false);}
  };
  useEffect(()=>{setSentence(0);setWord(0);setHidden(false);setListened(false);},[date,plan]);
  useEffect(()=>()=>{window.speechSynthesis?.cancel();},[]);
  const print = () => {
    const blob=new Blob([homeworkPrintHtml(plan,date)],{type:'text/html;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const link=document.createElement('a');link.href=url;link.download=`Mes-devoirs-${date}.html`;link.click();
    setTimeout(()=>URL.revokeObjectURL(url),10000);
  };
  const noticeFor=(subject:HomeworkSubject|'all')=>notice?.subject===subject&&<p role={notice.error?'alert':'status'} className={`mt-3 rounded-lg border p-3 ${notice.error?'text-red-800':'text-emerald-900'}`}>{notice.text}</p>;
  const footer=(subject:HomeworkSubject)=><div className="mt-6 space-y-3 border-t pt-4">
    {saved[subject]?.activityKey&&saved[subject]?.activityKey!==homeworkActivityKey(plan,subject)&&<p className="text-amber-900">L’activité a changé. Les anciennes réponses restent consultables par le maître ; complète cette nouvelle activité.</p>}
    <p className="font-medium">{complete(subject)?'Activité terminée':dirty(subject)?'Réponses à enregistrer':saved[subject]?.completion==='draft'?'Travail en cours enregistré':'À compléter'} · {responseFields(plan,subject).filter(f=>answers[subject][f.id]?.trim()).length}/{responseFields(plan,subject).length} réponses</p>
    <p>Comment cela s’est-il passé ?</p><div className="flex flex-wrap gap-2">{(Object.entries(FEEDBACK_LABELS) as [HomeworkFeedbackStatus,string][]).map(([status,label])=><Button key={status} disabled={busy} variant={statuses[subject]===status?'default':'outline'} aria-pressed={statuses[subject]===status} onClick={()=>{setStatuses(v=>({...v,[subject]:status}));setNotice(null);}}>{statuses[subject]===status&&<Check className="mr-2 h-4 w-4"/>}{label}</Button>)}</div>
    <div className="flex flex-wrap gap-2"><Button disabled={busy} variant="outline" onClick={()=>save(subject,'draft')}>Enregistrer mes réponses</Button><Button disabled={busy} onClick={()=>save(subject,'completed')}>Terminer cette activité</Button></div>{noticeFor(subject)}
  </div>;
  return <article className="space-y-4 rounded-2xl border bg-card p-4 sm:p-6" aria-label={`Devoirs du ${date}`}>
    <header className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-headline text-2xl">Pour le {new Intl.DateTimeFormat('fr-FR',{weekday:'long',day:'numeric',month:'long',timeZone:'Europe/Paris'}).format(new Date(`${date}T12:00:00Z`))}</h2><p className="mt-1 text-muted-foreground">{plan.theme} · {plan.maxMinutes} minutes maximum</p></div><Button variant="outline" onClick={print}><Printer className="mr-2 h-4 w-4" />Version à imprimer</Button></header>
    {preview&&<p className="rounded-lg border border-sky-300 bg-sky-50 p-3">Mode test : tu peux saisir des réponses et simuler l’enregistrement. Rien ne sera enregistré pour l’élève.</p>}
    <p className="rounded-lg bg-muted/50 p-3">Je saisis mes réponses ici. Je peux aussi répondre à voix haute ou manipuler, puis dicter ma réponse à un adulte qui la saisit. Je peux enregistrer et reprendre plus tard.</p>
    <p className="font-semibold" aria-live="polite">{completeCount===subjects.length?`${preview?'Simulation : ':''}Devoir terminé`:`${completeCount}/${subjects.length} activités terminées`}</p>
    <details open className="rounded-xl border-l-4 border-l-sky-600 bg-sky-50/40 p-4 sm:p-5"><summary className="cursor-pointer font-headline text-2xl"><BookOpen className="mr-2 inline h-6 w-6 text-sky-700" />Je lis <span className="text-base font-normal">· {plan.reading.minutes} min</span></summary>
      <div className="mt-4 space-y-4"><p>{plan.reading.instruction}</p><Speak text={plan.reading.instruction} />
        <h3 className="font-semibold">{plan.reading.title}</h3>
        <div className="rounded-xl bg-white p-4 font-exercise text-2xl leading-loose text-slate-900">
          {plan.profiles.support==='syllabes' ? <><SyllableText text={plan.reading.passage[sentence]??''} /><div className="mt-4 flex items-center gap-3 text-base"><Button variant="outline" disabled={sentence===0} onClick={()=>setSentence(sentence-1)}>Précédente</Button><span>{sentence+1}/{plan.reading.passage.length}</span><Button variant="outline" disabled={sentence>=plan.reading.passage.length-1} onClick={()=>setSentence(sentence+1)}>Suivante</Button></div></> : plan.reading.passage.map((text,i)=><p key={i} className="mb-2">{text}</p>)}
        </div>
        {plan.reading.mode==='text' && <><Speak text={plan.reading.passage.join(' ')} label="Écouter le texte pour m’aider" onListen={()=>setListened(true)} />{listened&&<p className="text-sm text-muted-foreground">Tu as écouté le texte. Tu peux maintenant essayer de le lire.</p>}</>}
        {plan.reading.adultText && <div className="rounded-lg border p-3"><p className="mb-2 font-medium">Petite histoire lue par un adulte</p><p>{plan.reading.adultText}</p><Speak text={plan.reading.adultText} label="Écouter l’histoire" /></div>}
        <Questions activity={plan.reading} subject="reading" answers={answers.reading} onAnswer={(id,value)=>onAnswer('reading',id,value)} disabled={busy}/>{footer('reading')}
      </div>
    </details>
    {plan.spelling && <details className="rounded-xl border-l-4 border-l-violet-600 bg-violet-50/40 p-4 sm:p-5"><summary className="cursor-pointer font-headline text-2xl"><BrainCircuit className="mr-2 inline h-6 w-6 text-violet-700" />Je prépare mes mots <span className="text-base font-normal">· {plan.spelling.minutes} min</span></summary>
      <div className="mt-4 space-y-4"><p>{plan.spelling.instruction}</p><Speak text={plan.spelling.instruction}/>
        <p className="text-sm">Dyna-Mots S{plan.week} · Groupe de mots {word+1}/{plan.spelling.words.length}</p>
        <p className="min-h-24 rounded-xl bg-white p-5 font-exercise text-2xl leading-relaxed text-slate-900" aria-live="polite">{hidden?'Retrouve le mot ou le groupe de mots de mémoire.':plan.spelling.words[word]}</p>
        <div className="flex flex-wrap gap-2"><Button variant="outline" disabled={word===0} onClick={()=>{setWord(word-1);setHidden(false);}}>Précédent</Button><Button onClick={()=>setHidden(!hidden)}>{hidden?'Vérifier':'Cacher et essayer'}</Button><Button variant="outline" disabled={word>=plan.spelling.words.length-1} onClick={()=>{setWord(word+1);setHidden(false);}}>Suivant</Button></div>
        <Speak text={plan.spelling.words[word]} label="Écouter le mot" />
        <label className="block font-medium">Mon essai — mot {word+1}<Input aria-label={`Mon essai — mot ${word+1}`} value={answers.spelling[`word-${word}`]??''} onChange={e=>onAnswer('spelling',`word-${word}`,e.target.value)} disabled={busy} maxLength={2000} autoComplete="off" autoCorrect="off" spellCheck={false} className="mt-2 h-12 bg-white text-xl text-slate-900" /></label>
        <Questions activity={plan.spelling} subject="spelling" answers={answers.spelling} onAnswer={(id,value)=>onAnswer('spelling',id,value)} disabled={busy}/>{footer('spelling')}
      </div>
    </details>}
    <details className="rounded-xl border-l-4 border-l-amber-600 bg-amber-50/40 p-4 sm:p-5"><summary className="cursor-pointer font-headline text-2xl"><Calculator className="mr-2 inline h-6 w-6 text-amber-800" />Je m’entraîne en maths <span className="text-base font-normal">· {maths.minutes} min</span></summary>
      <div className="mt-4 space-y-4"><h3 className="font-semibold">{maths.title}</h3><p>{maths.instruction}</p><Speak text={maths.instruction}/>{plan.maths.tokens&&<Tokens/>}<Questions activity={maths} subject="maths" answers={answers.maths} onAnswer={(id,value)=>onAnswer('maths',id,value)} disabled={busy}/>{footer('maths')}</div>
    </details>
    <footer className="space-y-3 rounded-xl border bg-muted/30 p-4"><p>Quand j’ai répondu dans chaque activité :</p><Button className="min-h-12 whitespace-normal" disabled={busy} onClick={()=>save('all','completed')}>{busy?'Enregistrement…':'Enregistrer et terminer mon devoir'}</Button>{noticeFor('all')}</footer>
  </article>;
}
