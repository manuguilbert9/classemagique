import { persistResult } from './scores-server';
import { enqueueResult } from '@/lib/result-outbox';
import type { Score } from './scores-server';
export type { Score, ScoreDetail, CalculationState } from './scores-server';
export { getScoresForUser, getAllScores, deleteScore, deleteDummyScores } from './scores-server';
export type HomeworkResultInput = Omit<Score, 'id' | 'createdAt' | 'skill'> & {date: string; skillSlug: string};
export async function addScore(data: Omit<Score, 'id' | 'createdAt'>) {
  if (data.skill === 'decoding') data = {...data, metadata: {...data.metadata, unit:'completion', mode:'atelier'}, details:data.details?.length ? data.details : [{question:'Atelier de décodage',userAnswer:'Parcours terminé',correctAnswer:'',status:'completed'}]};
  const params = typeof window === 'undefined' ? null : new URLSearchParams(window.location.search);
  const homeworkDate = data.homeworkDate || (params?.get('from') === 'devoirs' ? params.get('date') : null);
  return enqueueResult({...data, ...(homeworkDate ? {homeworkDate, context:'homework' as const} : {context:'classroom' as const})}, persistResult);
}
export async function saveHomeworkResult(data: HomeworkResultInput) {
  const {date, skillSlug, ...score} = data;
  return addScore({...score, skill:skillSlug, homeworkDate:date, context:'homework'});
}
