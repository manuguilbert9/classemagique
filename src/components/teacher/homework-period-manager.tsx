'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { HomeworkPlanCard } from '@/components/homework-plan-card';
import { createPeriodPlan, mathsForPlan, parisDate, periodDates, profileForStudent } from '@/lib/homework-period';
import { FEEDBACK_LABELS, type HomeworkFeedback, type HomeworkPlan, type HomeworkProfile, type HomeworkSubject } from '@/lib/homework-plan';
import { publishHomeworkPeriod, saveHomeworkPlanForStudent, type Assignment, type Homework } from '@/services/homework';
import { getHomeworkFeedback } from '@/services/homework-feedback';
import { homeworkActivityKey, homeworkFeedbackLabel } from '@/lib/homework-responses';
import { HOMEWORK_REVIEW_LABELS, homeworkReviewCurrent } from '@/lib/homework-correction';
import type { Student } from '@/services/students';

const profiles: HomeworkProfile[]=['B-','B','B+','C'];
const fields: {key:HomeworkSubject;label:string}[]=[{key:'reading',label:'Lecture'},{key:'spelling',label:'Dyna-Mots'},{key:'maths',label:'Maths'}];

export function HomeworkPeriodManager({students,allHomework,initialStudentId='',initialDate}:{students:Student[];allHomework:Homework[];initialStudentId?:string;initialDate?:string}) {
  const roster=useMemo(()=>students.filter(s=>profileForStudent(s)),[students]);
  const slots=periodDates('2026-11-03');
  const [date,setDate]=useState(()=>initialDate??slots.find(s=>s.date>=parisDate())?.date??slots.at(-1)!.date);
  const [studentId,setStudentId]=useState(initialStudentId);
  const [drafts,setDrafts]=useState<Record<string,HomeworkPlan>>({});
  const [saved,setSaved]=useState<Record<string,HomeworkPlan>>({});
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  const [feedback,setFeedback]=useState<HomeworkFeedback[]>([]);
  const [feedbackError,setFeedbackError]=useState(false);
  const [edit,setEdit]=useState(false);
  const student=roster.find(s=>s.id===studentId)??roster[0];
  const slot=slots.find(s=>s.date===date)!;
  const key=`${date}/${student?.id}`;
  const persisted=student ? saved[key]??allHomework.find(h=>h.id===date)?.assignmentsByStudent?.[student.id]?.plan : null;
  const plan=student ? drafts[key]??persisted??createPeriodPlan(slot.week,slot.day,profileForStudent(student)!) : null;
  const refresh=async()=>{try{setFeedback(await getHomeworkFeedback());setFeedbackError(false);}catch{setFeedbackError(true);}};
  useEffect(()=>{void refresh();},[]);
  const update=(next:HomeworkPlan)=>{setDrafts(prev=>({...prev,[key]:next}));setMessage('');};
  const save=async()=>{
    if(!student||!plan)return;
    setBusy(true);setMessage('');
    const result=await saveHomeworkPlanForStudent(date,student.id,plan);
    if(result.success){setSaved(prev=>({...prev,[key]:plan}));setDrafts(prev=>{const next={...prev};delete next[key];return next;});setMessage(`Devoir du ${date} enregistré pour ${student.name}.`);}
    else setMessage(result.error??'Enregistrement impossible.');
    setBusy(false);
  };
  const publish=async()=>{
    setBusy(true);setMessage('');
    const entries=periodDates(parisDate()).map(s=>({date:s.date,assignments:Object.fromEntries(roster.map(student=>{
      const id=`${s.date}/${student.id}`;
      const value=drafts[id]??saved[id]??allHomework.find(h=>h.id===s.date)?.assignmentsByStudent?.[student.id]?.plan??createPeriodPlan(s.week,s.day,profileForStudent(student)!);
      return [student.id,{francais:null,maths:null,orthographe:null,notes:null,plan:value} satisfies Assignment];
    }))}));
    const result=await publishHomeworkPeriod(entries);
    setMessage(result.success?`${result.written} devoirs ajoutés ; ${result.skipped} affectations existantes conservées.`:result.error??'Programmation incomplète.');
    if(result.success) window.location.reload();
    setBusy(false);
  };
  const changeProfile=(subject:HomeworkSubject,value:HomeworkProfile)=>{
    if(!plan)return;
    const nextProfiles={...plan.profiles,[subject]:value};
    const generated=createPeriodPlan(plan.week,plan.day,nextProfiles);
    const next={...plan,profiles:nextProfiles,[subject]:generated[subject]};
    next.maxMinutes=next.reading.minutes+(next.spelling?.minutes??0)+next.maths.minutes;
    update(next);
  };
  return <section className="space-y-5 rounded-2xl border-2 border-primary/30 bg-card p-4 sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="font-headline text-2xl">Devoirs de novembre et décembre</h2><p className="mt-1 text-muted-foreground">Lecture, Dyna-Mots et maths · S8 à S14 · lundi et jeudi</p></div><Button disabled={busy||!roster.length||!periodDates(parisDate()).length} onClick={publish}>{busy?'Enregistrement…':'Programmer les dates restantes'}</Button></div>
    <p className="text-sm">{roster.length} élèves rattachés aux UE. Les parcours viennent du cadrage P2 et restent réglables par matière. Les affectations existantes sont conservées lors d’une programmation.</p>
    <div className="rounded-lg bg-muted/50 p-3 text-sm">Présente le texte et la démarche avant leur mise à disposition : vendredi pour lundi, mardi à 15 h (heure de Paris) pour jeudi. Les textes de lecture sont des créations originales. Une notion nouvelle de maths reste remplacée par une révision tant que tu ne l’as pas activée ci-dessous.</div>
    {message&&<p role="status" className="rounded-lg border p-3">{message}</p>}
    {!student||!plan?<p>Aucun élève du cadrage P2 n’est rattaché à un groupe.</p>:<>
      <div className="grid gap-4 sm:grid-cols-2"><label className="space-y-2"><span className="block font-medium">Élève</span><select className="h-11 w-full rounded-md border bg-background px-3" value={student.id} onChange={e=>{setStudentId(e.target.value);setMessage('');}}>{roster.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label><label className="space-y-2"><span className="block font-medium">Pour le</span><select className="h-11 w-full rounded-md border bg-background px-3" value={date} onChange={e=>{setDate(e.target.value);setMessage('');}}>{slots.map(s=><option key={s.date} value={s.date}>S{s.week} · {s.day===1?'Lundi':'Jeudi'} {s.date.split('-').reverse().join('/')}</option>)}</select></label></div>
      <div className="flex flex-wrap gap-3 text-sm"><span>{persisted?'Programmé':'Aperçu à programmer'}</span><span>Disponible dès le {plan.availableOn.split('-').reverse().join('/')}{plan.day===4?' à 15 h (Paris)':''}</span>{drafts[key]&&<span className="font-semibold text-amber-800">Modifications non enregistrées</span>}</div>
      <div className="flex flex-wrap items-center gap-3"><Button variant="outline" onClick={()=>setEdit(!edit)}>{edit?'Fermer les réglages':'Adapter ce devoir'}</Button><Button disabled={busy} onClick={save}>{busy?'Enregistrement…':'Enregistrer ce devoir'}</Button><Button variant="ghost" onClick={refresh}>Actualiser les retours</Button></div>
      <div className="flex flex-wrap gap-3">{fields.filter(f=>f.key!=='spelling'||plan.spelling).map(f=>{const result=feedback.find(r=>r.userId===student.id&&r.date===date&&r.subject===f.key);return <span key={f.key} className="rounded-lg bg-muted px-3 py-2 text-sm">{f.label} : {homeworkFeedbackLabel(result)}{result?.listened?' · texte écouté':''}{result?.usedFallback?' · révision':''}</span>;})}</div>
      <details className="rounded-xl border p-4"><summary className="cursor-pointer font-semibold">Réponses enregistrées de {student.name}</summary><div className="mt-4 space-y-4">{fields.filter(f=>f.key!=='spelling'||plan.spelling).map(f=>{const result=feedback.find(r=>r.userId===student.id&&r.date===date&&r.subject===f.key);return <section key={f.key} className="rounded-lg bg-muted/30 p-3"><h3 className="font-semibold">{f.label} · {homeworkFeedbackLabel(result)}</h3>{result?.activityKey&&result.activityKey!==homeworkActivityKey(plan,f.key)&&<p className="text-sm text-amber-900">Ces réponses concernent une version précédente de l’activité.</p>}{result?.responses?.length?<dl className="mt-3 space-y-3">{result.responses.map(r=><div key={r.id}><dt className="text-sm font-medium">{r.prompt}</dt><dd className="mt-1 whitespace-pre-wrap rounded border bg-white p-3 text-slate-900">{r.answer||'Pas encore de réponse'}</dd>{r.review&&<dd className="mt-2 space-y-2 text-sm"><p>{homeworkReviewCurrent(plan,f.key,r.id,r.answer,r.review)?HOMEWORK_REVIEW_LABELS[r.review.outcome]:'Réponse ou corrigé modifié : validation à refaire'} · {r.review.attempts.length} essai{r.review.attempts.length>1?'s':''}{r.review.correctionSeen?' · modèle consulté':''}</p><details className="rounded border p-2"><summary className="cursor-pointer">Voir les essais</summary><ol className="mt-2 list-decimal space-y-2 pl-5">{r.review.attempts.map((attempt,i)=><li key={i}><span className="whitespace-pre-wrap">{attempt.answer}</span><span className="block text-muted-foreground">{HOMEWORK_REVIEW_LABELS[attempt.outcome]}</span></li>)}</ol></details></dd>}</div>)}</dl>:<p className="mt-2 text-sm">Aucune réponse enregistrée.</p>}</section>;})}</div></details>
      {feedbackError&&<p role="alert" className="text-red-700">Impossible de charger les retours. Utilise « Actualiser les retours » pour réessayer.</p>}
      {edit&&<div className="space-y-5 rounded-xl border bg-muted/20 p-4">
        <div className="grid gap-3 sm:grid-cols-3">{fields.map(f=><label key={f.key}><span className="mb-1 block font-medium">Parcours {f.label}</span><select className="h-11 w-full rounded-md border bg-background px-3" value={plan.profiles[f.key]} onChange={e=>changeProfile(f.key,e.target.value as HomeworkProfile)}>{profiles.map(p=><option key={p}>{p}</option>)}</select></label>)}</div>
        <label className="flex items-center gap-3"><input type="checkbox" checked={plan.profiles.support==='syllabes'} onChange={e=>update({...plan,profiles:{...plan.profiles,support:e.target.checked?'syllabes':'standard'}})}/>Lecture phrase par phrase et syllabes colorées</label>
        <label className="block"><span className="mb-2 block font-medium">Texte ou syllabes de lecture (une phrase par ligne)</span><Textarea value={plan.reading.passage.join('\n')} onChange={e=>update({...plan,reading:{...plan.reading,passage:e.target.value.split('\n')}})} rows={6}/></label>
        {plan.reading.adultText!==undefined&&<label className="block"><span className="mb-2 block font-medium">Histoire lue par l’adulte</span><Textarea value={plan.reading.adultText} onChange={e=>update({...plan,reading:{...plan.reading,adultText:e.target.value}})}/></label>}
        {plan.spelling&&<label className="block"><span className="mb-2 block font-medium">Mots ou groupes Dyna-Mots (un par ligne)</span><Textarea value={plan.spelling.words.join('\n')} onChange={e=>update({...plan,spelling:{...plan.spelling!,words:e.target.value.split('\n')}})} rows={5}/></label>}
        {plan.maths.prerequisite&&<label className="flex items-start gap-3 rounded-lg border p-3"><input type="checkbox" className="mt-1" checked={plan.maths.introduced} onChange={e=>update({...plan,maths:{...plan.maths,introduced:e.target.checked}})}/><span><strong>Notion travaillée : {plan.maths.prerequisite}</strong><span className="mt-1 block text-sm">Si décoché : {plan.maths.fallback?.title}. L’élève reçoit cette révision.</span></span></label>}
        {fields.filter(f=>plan[f.key]).map(f=>{
          const activity=plan[f.key]!;
          return <fieldset key={f.key} className="space-y-3 rounded-lg border p-3"><legend className="px-2 font-semibold">Questions {f.label}{f.key==='maths'&&!plan.maths.introduced?' · prévues après introduction':''}</legend>{activity.questions.map((question,index)=><div key={index} className="space-y-2"><label className="block text-sm">Question {index+1}<Textarea value={question.prompt} onChange={e=>update({...plan,[f.key]:{...activity,questions:activity.questions.map((q,i)=>i===index?{...q,prompt:e.target.value}:q)}})}/></label><label className="block text-sm">Aide<Input value={question.hint} onChange={e=>update({...plan,[f.key]:{...activity,questions:activity.questions.map((q,i)=>i===index?{...q,hint:e.target.value}:q)}})}/></label><label className="block text-sm">Réponse attendue<Input value={question.answer} onChange={e=>update({...plan,[f.key]:{...activity,questions:activity.questions.map((q,i)=>i===index?{...q,answer:e.target.value}:q)}})}/></label></div>)}</fieldset>;
        })}
        <p className="text-sm text-muted-foreground">Ces réglages concernent uniquement {student.name} pour cette date. Le changement de parcours remplace le contenu de la matière choisie. Pense à reporter une modification du texte sur l’autre échéance de la semaine.</p>
      </div>}
      <HomeworkPlanCard key={key} date={date} plan={plan}/>
    </>}
  </section>;
}
