'use client';

import { collection, doc, getDocs, query, writeBatch, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { HomeworkFeedback } from '@/lib/homework-plan';
import { validateHomeworkFeedback } from '@/lib/homework-responses';

export async function getHomeworkFeedback(userId?: string): Promise<HomeworkFeedback[]> {
  const source = collection(db, 'homeworkFeedback');
  const result = await getDocs(userId ? query(source, where('userId', '==', userId)) : source);
  return result.docs.map(d => d.data() as HomeworkFeedback);
}

export async function saveHomeworkFeedback(value: Omit<HomeworkFeedback, 'updatedAt'>): Promise<HomeworkFeedback> {
  return (await saveHomeworkFeedbackBatch([value]))[0];
}

/** Whole-homework completion is atomic: all answers are saved, or none are marked done. */
export async function saveHomeworkFeedbackBatch(values:Omit<HomeworkFeedback,'updatedAt'>[]):Promise<HomeworkFeedback[]>{
  if(!values.length||values.length>3||values.some(v=>v.userId!==values[0].userId||v.date!==values[0].date)||new Set(values.map(v=>v.subject)).size!==values.length)throw new Error('Devoir invalide.');
  values.forEach(validateHomeworkFeedback);
  const updatedAt=new Date().toISOString();
  const feedback=values.map(value=>({...value,updatedAt}));
  const batch=writeBatch(db);
  feedback.forEach(value=>batch.set(doc(db,'homeworkFeedback',`${value.userId}_${value.date}_${value.subject}`),value));
  await batch.commit();
  return feedback;
}
