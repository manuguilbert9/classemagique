/* Opt-in integration check using a unique, nonexistent pupil identity.
 * Calls the real application service; removes only its three fixture records.
 * Usage: ALLOW_FIRESTORE_VERIFICATION=1 node scripts/verify-homework-persistence-live.cjs output-directory */
const path=require('node:path');const fs=require('node:fs');const esbuild=require('esbuild');
if(process.env.ALLOW_FIRESTORE_VERIFICATION!=='1')throw Error('Explicit opt-in required.');
const out=path.resolve(process.argv[2]||'.next/homework-live');fs.mkdirSync(out,{recursive:true});
esbuild.buildSync({stdin:{resolveDir:process.cwd(),loader:'ts',contents:`
import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';
import {db} from './src/lib/firebase';import {doc,writeBatch,terminate} from 'firebase/firestore';
import {saveHomeworkFeedbackBatch,getHomeworkFeedback} from './src/services/homework-feedback';
import {recordHomeworkCheck,homeworkQuestion} from './src/lib/homework-correction';
import {createPeriodPlan} from './src/lib/homework-period';
import {buildHomeworkFeedback,responseFields,homeworkSubjectCompleted} from './src/lib/homework-responses';
(async()=>{
 const userId='__homework_verification_'+randomUUID(),date='2026-11-05';
 const subjects=['reading','spelling','maths'] as const;
 const plan=createPeriodPlan(8,4,{reading:'B',spelling:'B',maths:'B',support:'standard'});
 const refs=subjects.map(s=>doc(db,'homeworkFeedback',userId+'_'+date+'_'+s));
 try{
  assert.equal((await getHomeworkFeedback(userId)).length,0);
  const answers=Object.fromEntries(subjects.map(s=>[s,Object.fromEntries(responseFields(plan,s).map(f=>[f.id,homeworkQuestion(plan,s,f.id).answer]))]));
  const reviews=Object.fromEntries(subjects.map(s=>[s,Object.fromEntries(responseFields(plan,s).map(f=>[f.id,recordHomeworkCheck(plan,s,f.id,answers[s][f.id],recordHomeworkCheck(plan,s,f.id,'Premier essai'))]))]));
  await saveHomeworkFeedbackBatch(subjects.map(s=>buildHomeworkFeedback(plan,s,userId,date,answers[s],'help','draft',false,reviews[s])));
  const draft=await getHomeworkFeedback(userId);assert.equal(draft.length,3);assert.ok(draft.every(v=>v.completion==='draft'&&v.responses?.every(r=>r.review?.attempts[0].answer==='Premier essai'&&r.review?.attempts.length===2)));
  await saveHomeworkFeedbackBatch(subjects.map(s=>buildHomeworkFeedback(plan,s,userId,date,answers[s],'help','completed',false,reviews[s])));
  const complete=await getHomeworkFeedback(userId);assert.equal(complete.length,3);assert.ok(complete.every(v=>homeworkSubjectCompleted(plan,v.subject,v)));
 }finally{
  const cleanup=writeBatch(db);refs.forEach(ref=>{assert.ok(ref.id.startsWith(userId+'_'));cleanup.delete(ref);});await cleanup.commit();
  assert.equal((await getHomeworkFeedback(userId)).length,0);await terminate(db);
 }
 console.log(JSON.stringify({passed:true,draftRestored:true,completedRestored:true,attemptHistoryRestored:true,subjects:3,fixtureRecordsRemoved:true,noPupilAccountUsed:true}));
})().catch(e=>{console.error(e);process.exitCode=1;});
`},outfile:path.join(out,'persistence-check.cjs'),bundle:true,platform:'node',format:'cjs',tsconfig:'tsconfig.json',logLevel:'warning'});
require(path.join(out,'persistence-check.cjs'));
