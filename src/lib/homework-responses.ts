import { FEEDBACK_LABELS, type HomeworkAnswerReview, type HomeworkFeedback, type HomeworkFeedbackStatus, type HomeworkPlan, type HomeworkSubject } from './homework-plan';
import { mathsForPlan } from './homework-period';
import { homeworkReviewResolved } from './homework-correction';

export const HOMEWORK_SUBJECT_LABELS:Record<HomeworkSubject,string>={reading:'Lecture',spelling:'Dyna-Mots',maths:'Maths'};
export function responseFields(plan:HomeworkPlan,subject:HomeworkSubject):{id:string;prompt:string}[]{
  const activity=subject==='maths'?mathsForPlan(plan):plan[subject];
  if(!activity)return [];
  const words=subject==='spelling'?(plan.spelling?.words??[]).map((word,i)=>({id:`word-${i}`,prompt:`Mot ${i+1} : ${word}`})):[];
  return [...words,...activity.questions.map((q,i)=>({id:`question-${i}`,prompt:q.prompt}))];
}
export function homeworkActivityKey(plan:HomeworkPlan,subject:HomeworkSubject):string{
  return JSON.stringify({subject,fields:responseFields(plan,subject),passage:subject==='reading'?plan.reading.passage:[],adultText:subject==='reading'?plan.reading.adultText??'':''});
}
export function homeworkSubjectCompleted(plan:HomeworkPlan,subject:HomeworkSubject,saved?:HomeworkFeedback):boolean{
  return saved?.completion==='completed'&&saved.activityKey===homeworkActivityKey(plan,subject)&&responseFields(plan,subject).every(field=>saved.responses?.some(r=>r.id===field.id&&r.answer.trim().length>0&&(!saved.guided||homeworkReviewResolved(plan,subject,r.id,r.answer,r.review))));
}
export function homeworkFeedbackLabel(saved?:HomeworkFeedback):string{
  if(!saved)return 'pas de retour';
  return saved.completion==='draft'?'En cours':saved.completion==='completed'?`Terminé · ${FEEDBACK_LABELS[saved.status]}`:FEEDBACK_LABELS[saved.status];
}
export function buildHomeworkFeedback(plan:HomeworkPlan,subject:HomeworkSubject,userId:string,date:string,answers:Record<string,string>,status:HomeworkFeedbackStatus,completion:'draft'|'completed',listened=false,reviews?:Record<string,HomeworkAnswerReview>):Omit<HomeworkFeedback,'updatedAt'>{
  const responses=responseFields(plan,subject).map(field=>({...field,answer:(answers[field.id]??'').trim(),...(reviews?.[field.id]?{review:reviews[field.id]}:{})}));
  if(completion==='completed'&&responses.some(r=>!r.answer))throw new Error(`${HOMEWORK_SUBJECT_LABELS[subject]} : complète chaque réponse avant de terminer. Tu peux enregistrer ton travail en cours.`);
  if(completion==='completed'&&reviews&&responses.some(r=>!homeworkReviewResolved(plan,subject,r.id,r.answer,r.review)))throw new Error('Valide chaque réponse avant de terminer la session.');
  const needsHelp=responses.some(r=>r.review?.outcome==='to-review');
  return {userId,date,subject,status:needsHelp?'retry':status,completion,responses,...(reviews?{guided:true}:{}),activityKey:homeworkActivityKey(plan,subject),listened,usedFallback:subject==='maths'&&!plan.maths.introduced&&!!plan.maths.fallback};
}
export function validateHomeworkFeedback(value:Omit<HomeworkFeedback,'updatedAt'>):void{
  if(!value.userId||value.userId.includes('/')||!/^\d{4}-\d{2}-\d{2}$/.test(value.date)||!['reading','spelling','maths'].includes(value.subject)||!['alone','help','retry'].includes(value.status))throw new Error('Retour de devoir invalide.');
  if(value.completion!==undefined){
    if(!['draft','completed'].includes(value.completion)||!value.activityKey||!Array.isArray(value.responses)||!value.responses.length||value.responses.length>60||value.responses.some(r=>!r.id||!r.prompt||typeof r.answer!=='string'||r.answer.length>2000)||new Set(value.responses.map(r=>r.id)).size!==value.responses.length)throw new Error('Réponses de devoir invalides.');
    if(value.completion==='completed'&&value.responses.some(r=>!r.answer.trim()))throw new Error('Complète chaque réponse avant de terminer.');
    for(const response of value.responses){
      const review=response.review;
      if(review&&(!review.questionKey||typeof review.checkedAnswer!=='string'||review.checkedAnswer.length>2000||typeof review.correctionSeen!=='boolean'||!['correct','retry','compare','self-reviewed','to-review'].includes(review.outcome)||!Array.isArray(review.attempts)||!review.attempts.length||review.attempts.length>20||review.attempts.some(a=>typeof a.answer!=='string'||!a.answer.trim()||a.answer.length>2000||!['correct','retry','compare'].includes(a.outcome))))throw new Error('Validation de réponse invalide.');
      if(value.guided&&value.completion==='completed'&&(!review||review.checkedAnswer!==response.answer.trim()||!['correct','self-reviewed','to-review'].includes(review.outcome)))throw new Error('Valide chaque réponse avant de terminer.');
    }
  }
}
