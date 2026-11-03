'use client';

import { useEffect, useRef, useState } from 'react';
import { BookOpen, BrainCircuit, Calculator, Volume2, Printer, Check, RotateCcw, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SyllableText } from '@/components/syllable-text';
import { FEEDBACK_LABELS, type HomeworkAnswerReview, type HomeworkFeedback, type HomeworkFeedbackStatus, type HomeworkPlan, type HomeworkSubject } from '@/lib/homework-plan';
import { mathsForPlan } from '@/lib/homework-period';
import { homeworkPrintHtml } from '@/lib/homework-print';
import { saveHomeworkFeedbackBatch } from '@/services/homework-feedback';
import { homeworkQuestion, homeworkReviewCurrent, homeworkReviewResolved, recordHomeworkCheck } from '@/lib/homework-correction';
import { buildHomeworkFeedback, homeworkActivityKey, homeworkSubjectCompleted, responseFields } from '@/lib/homework-responses';

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

function Tokens() {
  const [count, setCount] = useState(0);
  return <details className="my-4 rounded-lg border p-3"><summary className="cursor-pointer py-2 font-medium">Mes jetons et ma bande numérique</summary>
    <p className="my-2">Utilise ces jetons ou des objets à la maison. Un adulte peut déplacer les objets selon tes indications.</p>
    <div className="flex flex-wrap gap-2 py-3" aria-label={`${count} jetons`}>{Array.from({length:count}, (_, i) => <span key={i} aria-hidden="true" className="h-7 w-7 rounded-full border-2 border-amber-800 bg-amber-300" />)}</div>
    <div className="flex flex-wrap items-center gap-3"><Button variant="outline" disabled={count===0} onClick={()=>setCount(count-1)}>Retirer 1</Button><output aria-live="polite">{count} jetons</output><Button variant="outline" disabled={count===20} onClick={()=>setCount(count+1)}>Ajouter 1</Button><Button variant="ghost" onClick={()=>setCount(0)} aria-label="Enlever tous les jetons"><RotateCcw className="h-4 w-4" /></Button></div>
    <p className="mt-4 overflow-x-auto whitespace-nowrap font-mono text-lg" aria-label="Bande numérique de zéro à vingt">{Array.from({length:21},(_,i)=>i).join(' · ')}</p>
  </details>;
}

type HomeworkPlanCardProps = {
  plan: HomeworkPlan; date: string; studentId?: string; feedback?: HomeworkFeedback[];
  onFeedback?: (value: HomeworkFeedback) => void; readOnly?: boolean;
};
export function HomeworkPlanCard(props: HomeworkPlanCardProps) {
  return <HomeworkPlanContent key={`${props.studentId}/${props.date}/${props.readOnly}/${JSON.stringify(props.plan)}`} {...props} />;
}

const SESSION_NAMES: Record<HomeworkSubject, string> = { reading: 'Lecture', spelling: 'Mots', maths: 'Maths' };
const SESSION_ICONS = { reading: BookOpen, spelling: BrainCircuit, maths: Calculator };
const SESSION_COLORS = { reading: 'border-sky-200 bg-sky-50 text-sky-950', spelling: 'border-violet-200 bg-violet-50 text-violet-950', maths: 'border-amber-200 bg-amber-50 text-amber-950' };
type Answers = Record<HomeworkSubject, Record<string, string>>;
type Reviews = Record<HomeworkSubject, Record<string, HomeworkAnswerReview>>;

function HomeworkPlanContent({ plan, date, studentId, feedback = [], onFeedback, readOnly = false }: HomeworkPlanCardProps) {
  const subjects: HomeworkSubject[] = plan.spelling ? ['reading', 'spelling', 'maths'] : ['reading', 'maths'];
  const preview = readOnly || !studentId;
  const maths = mathsForPlan(plan);
  const initial = (subject: HomeworkSubject) => feedback.find(f => f.date === date && f.subject === subject && f.userId === studentId);
  const matching = (subject: HomeworkSubject) => initial(subject)?.activityKey === homeworkActivityKey(plan, subject) ? initial(subject)?.responses ?? [] : [];
  const [saved, setSaved] = useState<Partial<Record<HomeworkSubject, HomeworkFeedback>>>(() => Object.fromEntries(subjects.map(s => [s, initial(s)])));
  const [answers, setAnswers] = useState<Answers>(() => Object.fromEntries((['reading', 'spelling', 'maths'] as const).map(s => [s, Object.fromEntries(matching(s).map(r => [r.id, r.answer]))])) as Answers);
  const [reviews, setReviews] = useState<Reviews>(() => Object.fromEntries((['reading', 'spelling', 'maths'] as const).map(s => [s, Object.fromEntries(matching(s).filter(r => r.review).map(r => [r.id, r.review]))])) as Reviews);
  const [statuses, setStatuses] = useState<Record<HomeworkSubject, HomeworkFeedbackStatus>>(() => ({ reading: initial('reading')?.status ?? 'alone', spelling: initial('spelling')?.status ?? 'alone', maths: initial('maths')?.status ?? 'alone' }));
  const [active, setActive] = useState<HomeworkSubject | null>(null);
  const [step, setStep] = useState(-1);
  const [sentence, setSentence] = useState(0);
  const [listened, setListened] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const input = useRef<HTMLTextAreaElement & HTMLInputElement>(null);
  const dirty = (subject: HomeworkSubject) => responseFields(plan, subject).some(f => {
    const old = saved[subject]?.activityKey === homeworkActivityKey(plan, subject) ? saved[subject]?.responses?.find(r => r.id === f.id) : undefined;
    return (answers[subject][f.id] ?? '').trim() !== (old?.answer ?? '') || JSON.stringify(reviews[subject][f.id]) !== JSON.stringify(old?.review);
  }) || (!!saved[subject] && statuses[subject] !== saved[subject]!.status) || (subject === 'reading' && listened && !saved[subject]?.listened);
  const complete = (subject: HomeworkSubject) => homeworkSubjectCompleted(plan, subject, saved[subject]) && !dirty(subject);
  const completeCount = subjects.filter(complete).length;
  const hasChanges = subjects.some(dirty);
  useEffect(() => {
    if (preview || !hasChanges) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [preview, hasChanges]);
  useEffect(() => { heading.current?.focus(); window.speechSynthesis?.cancel(); }, [active, step]);
  useEffect(() => () => { window.speechSynthesis?.cancel(); }, []);

  async function save(subject: HomeworkSubject, completion: 'draft' | 'completed', nextReviews = reviews[subject]): Promise<boolean> {
    setBusy(true); setNotice(null);
    try {
      const value = buildHomeworkFeedback(plan, subject, studentId ?? 'preview', date, answers[subject], statuses[subject], completion,
        subject === 'reading' && (listened || (saved[subject]?.listened === true && (!saved[subject]?.activityKey || saved[subject]?.activityKey === homeworkActivityKey(plan, subject)))), nextReviews);
      if (!preview && !navigator.onLine) throw new Error('offline');
      const result = preview ? { ...value, updatedAt: new Date().toISOString() } : (await saveHomeworkFeedbackBatch([value]))[0];
      setSaved(old => ({ ...old, [subject]: result }));
      setStatuses(old => ({ ...old, [subject]: result.status }));
      if (!preview) onFeedback?.(result);
      setNotice({ text: preview ? 'Simulation : aucune réponse de l’élève n’est modifiée.' : completion === 'completed' ? 'Session terminée : tes réponses sont enregistrées.' : 'Réponse enregistrée. Tu peux reprendre plus tard.' });
      return true;
    } catch {
      setNotice({ text: 'Enregistrement impossible. Tes réponses restent affichées : vérifie la connexion puis réessaie.', error: true });
      return false;
    } finally { setBusy(false); }
  }
  const fields = active ? responseFields(plan, active) : [];
  const field = fields[step];
  const question = active && field ? homeworkQuestion(plan, active, field.id) : null;
  const answer = active && field ? answers[active][field.id] ?? '' : '';
  const review = active && field ? reviews[active][field.id] : undefined;
  const current = !!active && !!field && homeworkReviewCurrent(plan, active, field.id, answer, review);
  const resolved = !!active && !!field && homeworkReviewResolved(plan, active, field.id, answer, review);
  const reviewedCount = active ? fields.filter(f => homeworkReviewResolved(plan, active, f.id, answers[active][f.id] ?? '', reviews[active][f.id])).length : 0;
  const activity = active === 'maths' ? maths : active ? plan[active] : null;
  const move = (next: number) => { setStep(next); setHidden(!!(active && fields[next] && answers[active][fields[next].id])); setNotice(null); };
  const launch = (subject: HomeworkSubject) => {
    const all = responseFields(plan, subject);
    const first = all.findIndex(f => !homeworkReviewResolved(plan, subject, f.id, answers[subject][f.id] ?? '', reviews[subject][f.id]));
    const start = subject === 'reading' && !all.some(f => answers[subject][f.id]?.trim()) ? -1 : first < 0 ? all.length : first;
    setActive(subject); setStep(start); setHidden(!!answers[subject][all[start]?.id]); setNotice(null);
  };
  const commitReview = async (next: HomeworkAnswerReview) => {
    if (!active || !field) return;
    const updated = { ...reviews[active], [field.id]: next };
    setReviews(old => ({ ...old, [active]: updated }));
    await save(active, 'draft', updated);
  };
  const validate = async () => {
    if (!active || !field) return;
    if (!answer.trim()) { setNotice({ text: 'Écris une réponse avant de la valider.', error: true }); input.current?.focus(); return; }
    await commitReview(recordHomeworkCheck(plan, active, field.id, answer, review));
  };
  const quit = async () => {
    if (!active) return;
    if (!dirty(active) || await save(active, 'draft')) setActive(null);
  };
  const print = () => {
    const url = URL.createObjectURL(new Blob([homeworkPrintHtml(plan, date)], { type: 'text/html;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = `Mes-devoirs-${date}.html`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };
  const readingText = <div className="space-y-4">
    <h4 className="font-semibold">{plan.reading.title}</h4>
    <div className="rounded-xl border bg-white p-4 font-exercise text-2xl leading-loose text-slate-900">
      {plan.profiles.support === 'syllabes' ? <><SyllableText text={plan.reading.passage[sentence] ?? ''} /><div className="mt-4 flex flex-wrap items-center gap-3 text-base"><Button variant="outline" disabled={sentence === 0} onClick={() => setSentence(sentence - 1)}>Phrase précédente</Button><span>{sentence + 1}/{plan.reading.passage.length}</span><Button variant="outline" disabled={sentence >= plan.reading.passage.length - 1} onClick={() => setSentence(sentence + 1)}>Phrase suivante</Button></div></> : plan.reading.passage.map((text, i) => <p key={i} className="mb-2">{text}</p>)}
    </div>
    {plan.reading.mode === 'text' && <Speak text={plan.reading.passage.join(' ')} label="Écouter le texte pour m’aider" onListen={() => setListened(true)} />}
    {plan.reading.adultText && <div className="rounded-lg border p-3"><p className="mb-2 font-medium">Petite histoire lue par un adulte</p><p>{plan.reading.adultText}</p><Speak text={plan.reading.adultText} label="Écouter l’histoire" onListen={() => setListened(true)} /></div>}
  </div>;
  return <article className="space-y-5 rounded-2xl border bg-card p-4 sm:p-6" aria-label={`Devoirs du ${date}`}>
    <header className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-headline text-2xl">Pour le {new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Paris' }).format(new Date(`${date}T12:00:00Z`))}</h2><p className="mt-1 text-muted-foreground">{plan.theme} · {plan.maxMinutes} minutes maximum</p></div>{!active && <Button variant="outline" onClick={print}><Printer className="mr-2 h-4 w-4" />Version à imprimer</Button>}</header>
    {preview && <p className="rounded-lg border border-sky-300 bg-sky-50 p-3 text-sm">Mode test : tu peux suivre les sessions et essayer les corrections. Rien ne sera enregistré pour l’élève.</p>}
    {!active ? <>
      <div><h3 ref={heading} tabIndex={-1} className="font-headline text-2xl outline-none">Mon parcours</h3><p className="mt-2">Choisis une session. Tu peux faire une pause entre deux sessions.</p></div>
      <p className="font-semibold" aria-live="polite">{completeCount === subjects.length ? `${preview ? 'Simulation : ' : ''}Devoir terminé` : `${completeCount}/${subjects.length} sessions terminées`}</p>
      <div className="grid gap-4 sm:grid-cols-3">{subjects.map(subject => {
        const Icon = SESSION_ICONS[subject];
        const started = responseFields(plan, subject).some(f => answers[subject][f.id]?.trim());
        const done = complete(subject);
        const minutes = subject === 'maths' ? maths.minutes : plan[subject]!.minutes;
        const action = done ? 'Revoir' : started ? 'Reprendre' : 'Lancer';
        return <section key={subject} className={`grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-1 rounded-2xl border p-4 sm:flex sm:flex-col sm:items-start sm:gap-4 sm:p-5 ${SESSION_COLORS[subject]}`}>
          <Icon className="row-span-2 h-7 w-7 shrink-0" aria-hidden="true" /><div><h4 className="font-headline text-xl sm:text-2xl">{SESSION_NAMES[subject]}</h4><p className="mt-1 text-sm">{subject === 'spelling' ? 'Dyna-Mots · ' : ''}{minutes} min</p></div>
          <p className="col-start-2 row-start-2 text-sm">{done ? saved[subject]?.status === 'retry' ? 'Terminée · à reprendre avec le maître' : 'Session terminée' : started ? dirty(subject) ? 'En cours · à enregistrer' : 'En cours · enregistrée' : 'Prêt à commencer'}</p>
          <Button className="col-start-3 row-span-2 row-start-1 min-h-12 px-3 sm:mt-auto sm:w-full" aria-label={`${action} la session ${SESSION_NAMES[subject]}`} onClick={() => launch(subject)}>{done ? <Check className="mr-1 h-4 w-4" /> : <ArrowRight className="mr-1 h-4 w-4" />}{action}</Button>
        </section>;
      })}</div>
      <p className="text-sm text-muted-foreground">Tu peux dicter tes réponses à un adulte qui les écrit pour toi. Tes réponses sont enregistrées à chaque validation.</p>
    </> : <section className="space-y-5" aria-label={`Session ${SESSION_NAMES[active]}`}>
      <div className={`rounded-xl border p-4 ${SESSION_COLORS[active]}`}><h3 ref={heading} tabIndex={-1} className="font-headline text-2xl outline-none">{SESSION_NAMES[active]} · {step < 0 ? 'Je découvre le texte' : step >= fields.length ? 'Mon bilan' : `Étape ${step + 1} sur ${fields.length}`}</h3><p className="mt-1 text-sm">{reviewedCount}/{fields.length} réponses vérifiées</p></div>
      {step < 0 ? <><p>{plan.reading.instruction}</p><Speak text={plan.reading.instruction} />{readingText}<Button className="min-h-12" onClick={() => move(0)}>J’ai lu, je réponds<ArrowRight className="ml-2 h-4 w-4" /></Button></> : step >= fields.length ? <>
        <p className="text-lg">Tu as vérifié les réponses de cette session.</p>
        {fields.some(f => reviews[active][f.id]?.outcome === 'to-review') && <p className="rounded-lg bg-amber-50 p-3 text-amber-950">Tu as demandé de l’aide pour certaines réponses. Le maître pourra les reprendre avec toi.</p>}
        <p>Comment cela s’est-il passé ?</p><div className="flex flex-wrap gap-2">{(Object.entries(FEEDBACK_LABELS) as [HomeworkFeedbackStatus, string][]).map(([status, label]) => <Button key={status} variant={statuses[active] === status ? 'default' : 'outline'} aria-pressed={statuses[active] === status} disabled={busy} onClick={() => setStatuses(old => ({ ...old, [active]: status }))}>{label}</Button>)}</div>
        <div className="flex flex-wrap gap-3"><Button variant="outline" disabled={busy} onClick={() => move(0)}>Relire mes réponses</Button><Button className="min-h-12" disabled={busy || reviewedCount !== fields.length} onClick={async () => { if (await save(active, 'completed')) setActive(null); }}>{busy ? 'Enregistrement…' : 'Terminer la session'}</Button></div>
      </> : question && <>
        {active === 'reading' && <details className="rounded-lg border p-3"><summary className="cursor-pointer py-1 font-medium">Relire le texte</summary><div className="mt-3">{readingText}</div></details>}
        {step === 0 && active !== 'reading' && <div className="space-y-2"><p>{activity?.instruction}</p><Speak text={activity?.instruction ?? ''} /></div>}
        {question.word && !hidden ? <div className="space-y-4"><p>Observe le mot ou le groupe de mots. Dis-le et mémorise ses lettres.</p><p className="rounded-xl bg-violet-50 p-5 font-exercise text-3xl leading-relaxed text-violet-950">{question.answer}</p><Speak text={question.answer} label="Écouter le mot" /><Button className="min-h-12" onClick={() => { setHidden(true); setTimeout(() => input.current?.focus(), 0); }}>Cacher et écrire</Button></div> : <>
          <p className="font-exercise text-xl leading-relaxed">{question.prompt}</p>
          <Speak text={question.word ? question.answer : question.prompt} label={question.word ? 'Écouter le mot' : 'Écouter la question'} />
          <label className="block font-medium">{question.word ? 'Mon essai' : 'Ma réponse'}{question.word ? <Input ref={input} aria-label="Mon essai" value={answer} onChange={e => { setAnswers(old => ({ ...old, [active]: { ...old[active], [field.id]: e.target.value } })); setNotice(null); }} disabled={busy} maxLength={2000} autoComplete="off" autoCorrect="off" spellCheck={false} className="mt-2 h-12 bg-white text-xl text-slate-900" /> : <Textarea ref={input} aria-label="Ma réponse" value={answer} onChange={e => { setAnswers(old => ({ ...old, [active]: { ...old[active], [field.id]: e.target.value } })); setNotice(null); }} disabled={busy} maxLength={2000} rows={3} className="mt-2 bg-white text-xl text-slate-900" placeholder="Écris ta réponse, ou dicte-la à un adulte." />}</label>
          {!resolved && <Button className="min-h-12" disabled={busy} onClick={validate}>{busy ? 'Enregistrement…' : current ? 'Valider mon nouvel essai' : 'Valider ma réponse'}</Button>}
          {current && review && <div role="status" className={`space-y-3 rounded-xl border p-4 ${review.outcome === 'correct' ? 'border-emerald-300 bg-emerald-50 text-emerald-950' : 'border-amber-300 bg-amber-50 text-amber-950'}`}>
            {review.outcome === 'correct' && <p className="font-semibold">Bravo, ta réponse est juste !</p>}
            {review.outcome === 'retry' && <><p className="font-semibold">Pas encore. Tu peux te corriger.</p><p>{question.hint}</p>{!review.correctionSeen && <Button variant="outline" disabled={busy} onClick={() => commitReview({ ...review, correctionSeen: true })}>Voir le modèle pour m’aider</Button>}{review.correctionSeen && <p><strong>Le modèle : </strong>{question.answer}</p>}{review.correctionSeen && review.attempts.filter(a => a.outcome === 'retry').length >= 2 && <Button variant="outline" className="h-auto min-h-11 whitespace-normal" disabled={busy} onClick={() => commitReview({ ...review, outcome: 'to-review' })}>J’ai encore besoin d’aide : à reprendre avec le maître</Button>}</>}
            {review.outcome === 'compare' && <><p className="font-semibold">Compare les idées de ta réponse.</p><p><strong>Une réponse possible : </strong>{question.answer}</p><p>{question.hint}</p><p className="text-sm">Tu peux avoir utilisé d’autres mots. Vérifie que ta réponse donne les mêmes informations.</p><div className="flex flex-wrap gap-2"><Button variant="outline" disabled={busy} onClick={() => input.current?.focus()}>Je me corrige</Button><Button className="h-auto min-h-11 whitespace-normal" disabled={busy} onClick={() => commitReview({ ...review, outcome: 'self-reviewed' })}>Ma réponse donne ces informations</Button><Button variant="outline" className="h-auto min-h-11 whitespace-normal" disabled={busy} onClick={() => commitReview({ ...review, outcome: 'to-review' })}>J’ai besoin du maître pour vérifier</Button></div></>}
            {review.outcome === 'self-reviewed' && <p>Tu as relu et confirmé ta réponse. Le maître pourra la consulter.</p>}
            {review.outcome === 'to-review' && <p>Ta réponse est conservée. Le maître verra que tu as besoin d’aide.</p>}
          </div>}
          {!current && review && <p className="text-sm">Ta réponse a changé. Valide-la à nouveau.</p>}
          {!resolved && <><details className="rounded-lg bg-muted/40 p-3"><summary className="cursor-pointer py-1 font-medium">Un coup de pouce</summary><p className="mt-2">{question.hint}</p></details>{active === 'maths' && plan.maths.tokens && <Tokens />}</>}
          <div className="flex flex-wrap gap-3">{step > 0 && <Button variant="outline" disabled={busy} onClick={() => move(step - 1)}><ArrowLeft className="mr-2 h-4 w-4" />Étape précédente</Button>}<Button disabled={busy || !resolved} className="min-h-12" onClick={() => move(step + 1)}>{step === fields.length - 1 ? 'Voir mon bilan' : 'Étape suivante'}<ArrowRight className="ml-2 h-4 w-4" /></Button></div>
        </>}
      </>}
      <div className="border-t pt-4"><Button variant="ghost" disabled={busy} className="h-auto min-h-11 whitespace-normal" onClick={quit}><ArrowLeft className="mr-2 h-4 w-4 shrink-0" />Enregistrer et revenir au parcours</Button></div>
    </section>}
    {notice && <p role={notice.error ? 'alert' : 'status'} className={`rounded-lg border p-3 text-sm ${notice.error ? 'border-red-300 text-red-800' : 'text-muted-foreground'}`}>{notice.text}</p>}
  </article>;
}
