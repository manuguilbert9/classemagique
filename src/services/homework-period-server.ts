'use server';
import { doc, runTransaction, FieldPath } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { HomeworkPlan } from '@/lib/homework-plan';
import type { Assignment } from './homework-server';
import { periodDates, parisDate, validHomeworkPlan } from '@/lib/homework-period';

/** Remplace une affectation individuelle entière, jamais celles de ses camarades. */
export async function saveHomeworkPlanForStudent(dateId: string, studentId: string, plan: HomeworkPlan): Promise<{success: boolean; error?: string}> {
  if (!validHomeworkPlan(plan) || !periodDates('2026-11-02').some(slot=>slot.date===dateId&&slot.week===plan.week&&slot.day===plan.day) || !studentId) return {success:false,error:'Vérifie le contenu : texte, mots, questions, aides et réponses doivent être renseignés, avec une durée totale de 15 minutes maximum.'};
  try {
    await runTransaction(db, async transaction => {
      const ref=doc(db,'homework',dateId);
      const snapshot=await transaction.get(ref);
      const previous=snapshot.data()?.assignmentsByStudent?.[studentId];
      const assignment: Assignment={francais:null,maths:null,orthographe:null,notes:previous?.notes??null,plan};
      transaction.set(ref,{assignmentsByStudent:{[studentId]:assignment}},{mergeFields:[new FieldPath('assignmentsByStudent',studentId)]});
    });
    return {success:true};
  } catch {return {success:false,error:'Le devoir n’a pas été enregistré. Réessaie après avoir vérifié la connexion.'};}
}

/** Ajoute uniquement les affectations absentes ; une relance conserve les retouches. */
export async function publishHomeworkPeriod(entries: {date:string; assignments:Record<string,Assignment>}[]): Promise<{success:boolean; written:number; skipped:number; error?:string}> {
  let written=0,skipped=0;
  const allowed=new Set(periodDates(parisDate()).map(slot=>slot.date));
  try {
    for(const entry of entries) {
      if(!allowed.has(entry.date)) continue;
      if(!Object.values(entry.assignments).every(value=>validHomeworkPlan(value.plan)&&periodDates().some(slot=>slot.date===entry.date&&slot.week===value.plan!.week&&slot.day===value.plan!.day)))return {success:false,written,skipped,error:'Un devoir est incomplet ou ne correspond pas à sa date. Les devoirs précédemment enregistrés sont conservés.'};
      const counts=await runTransaction(db,async transaction=>{
        const ref=doc(db,'homework',entry.date);
        const snapshot=await transaction.get(ref);
        const existing=snapshot.data()?.assignmentsByStudent??{};
        const additions=Object.fromEntries(Object.entries(entry.assignments).filter(([id,value])=>!existing[id]&&!!value.plan));
        const ids=Object.keys(additions);
        if(ids.length) transaction.set(ref,{assignmentsByStudent:additions},{mergeFields:ids.map(id=>new FieldPath('assignmentsByStudent',id))});
        return {written:ids.length,skipped:Object.keys(entry.assignments).length-ids.length};
      });
      written+=counts.written;skipped+=counts.skipped;
    }
    return {success:true,written,skipped};
  } catch {return {success:false,written,skipped,error:'Programmation interrompue. Les affectations déjà enregistrées sont conservées ; tu peux relancer.'};}
}
