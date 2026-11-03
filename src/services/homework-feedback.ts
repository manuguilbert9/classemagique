'use client';

import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { HomeworkFeedback } from '@/lib/homework-plan';

export async function getHomeworkFeedback(userId?: string): Promise<HomeworkFeedback[]> {
  const source = collection(db, 'homeworkFeedback');
  const result = await getDocs(userId ? query(source, where('userId', '==', userId)) : source);
  return result.docs.map(d => d.data() as HomeworkFeedback);
}

export async function saveHomeworkFeedback(value: Omit<HomeworkFeedback, 'updatedAt'>): Promise<HomeworkFeedback> {
  if (!value.userId || !/^\d{4}-\d{2}-\d{2}$/.test(value.date) ||
      !['reading', 'spelling', 'maths'].includes(value.subject) || !['alone', 'help', 'retry'].includes(value.status)) {
    throw new Error('Retour de devoir invalide.');
  }
  const feedback = { ...value, updatedAt: new Date().toISOString() };
  await setDoc(doc(db, 'homeworkFeedback', `${value.userId}_${value.date}_${value.subject}`), feedback);
  return feedback;
}
