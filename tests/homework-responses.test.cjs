const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');const ts=require('typescript');
function load(file,stubs={}){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,Date,structuredClone,require:n=>n in stubs?stubs[n]:n.startsWith('.')?load(path.resolve(path.dirname(file),n+'.ts'),stubs):require(n)});return exports;}
const period=load('src/lib/homework-period.ts');
const api=fs.existsSync('src/lib/homework-responses.ts')?load('src/lib/homework-responses.ts'):{};
const plan=()=>period.createPeriodPlan(8,4,{reading:'B',spelling:'B',maths:'B',support:'standard'});
test('each question and each spelling item gets a saved answer, using the active maths revision',()=>{
 assert.equal(typeof api.responseFields,'function');const p=plan();
 assert.equal(api.responseFields(p,'reading').length,1);
 assert.equal(api.responseFields(p,'spelling').length,p.spelling.words.length+1);
 const c=period.createPeriodPlan(12,4,{reading:'C',spelling:'C',maths:'C',support:'standard'});
 assert.equal(api.responseFields(c,'maths')[0].prompt,c.maths.fallback.questions[0].prompt);
});
test('unfinished responses can be saved but cannot be marked completed, and zero is a valid answer',()=>{
 assert.equal(typeof api.buildHomeworkFeedback,'function');const p=plan();const fields=api.responseFields(p,'maths');
 assert.throws(()=>api.buildHomeworkFeedback(p,'maths','alice','2026-11-05',{},'alone','completed'),/réponse/);
 const answers=Object.fromEntries(fields.map(f=>[f.id,'0']));
 const value=api.buildHomeworkFeedback(p,'maths','alice','2026-11-05',answers,'help','completed');
 assert.equal(value.responses[0].answer,'0');assert.equal(value.completion,'completed');assert.equal(value.status,'help');
 assert.equal(api.buildHomeworkFeedback(p,'maths','alice','2026-11-05',{},'alone','draft').completion,'draft');
});
test('a changed task cannot inherit completed status from answers to the previous task',()=>{
 assert.equal(typeof api.responseFields,'function');const p=plan();const answers=Object.fromEntries(api.responseFields(p,'reading').map(f=>[f.id,'Un panier.']));
 const saved=api.buildHomeworkFeedback(p,'reading','alice','2026-11-05',answers,'alone','completed');
 assert.equal(api.homeworkSubjectCompleted(p,'reading',saved),true);
 p.reading.questions[0].prompt='Une autre question ?';
 assert.equal(api.homeworkSubjectCompleted(p,'reading',saved),false);
 assert.equal(saved.responses[0].answer,'Un panier.');
});
test('response saving commits all subjects together and propagates failure without a false saved result',async()=>{
 assert.equal(typeof api.buildHomeworkFeedback,'function');const records=new Map();let fail=false;
 const firestore={doc:(_db,c,id)=>`${c}/${id}`,writeBatch:()=>{const writes=[];return {set:(ref,value)=>writes.push([ref,value]),commit:async()=>{if(fail)throw Error('offline');for(const [ref,value]of writes)records.set(ref,value);}};}};
 const service=load('src/services/homework-feedback.ts',{'@/lib/firebase':{db:{}},'firebase/firestore':firestore,'@/lib/homework-responses':api});
 assert.equal(typeof service.saveHomeworkFeedbackBatch,'function');const p=plan();
 const values=['reading','maths'].map(subject=>api.buildHomeworkFeedback(p,subject,'alice','2026-11-05',Object.fromEntries(api.responseFields(p,subject).map(f=>[f.id,'Ma réponse'])),'alone','completed'));
 fail=true;await assert.rejects(service.saveHomeworkFeedbackBatch(values),/offline/);assert.equal(records.size,0);
 fail=false;const saved=await service.saveHomeworkFeedbackBatch(values);assert.equal(records.size,2);assert.equal(saved[0].responses[0].answer,'Ma réponse');assert.ok(saved[0].updatedAt);
 await assert.rejects(service.saveHomeworkFeedbackBatch([{...values[0],responses:[{id:'q0',prompt:'?',answer:''}]}]),/réponse/);
 assert.equal(records.get('homeworkFeedback/alice_2026-11-05_reading').responses[0].answer,'Ma réponse');
});
