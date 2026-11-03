const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');const ts=require('typescript');
function load(file){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,Date,structuredClone,require:n=>n.startsWith('.')?load(path.resolve(path.dirname(file),n+'.ts')):require(n)});return exports;}
const period=load('src/lib/homework-period.ts');const responses=load('src/lib/homework-responses.ts');
const api=fs.existsSync('src/lib/homework-correction.ts')?load('src/lib/homework-correction.ts'):{};
const plan=(profile='B',week=8,day=4)=>period.createPeriodPlan(week,day,{reading:profile,spelling:profile,maths:profile,support:'standard'});
test('spelling feedback checks accents and word endings without penalizing apostrophe typography',()=>{
 assert.equal(typeof api.checkHomeworkAnswer,'function');const p=plan();
 assert.equal(api.checkHomeworkAnswer(p,'spelling','word-1','les enfants joue').outcome,'retry');
 assert.equal(api.checkHomeworkAnswer(p,'spelling','word-1','Les enfants jouent.').outcome,'correct');
 const c=plan('C');assert.equal(api.checkHomeworkAnswer(c,'spelling','word-3','un delicieux gateau').outcome,'retry');
 const city=plan('B+',13);assert.equal(api.checkHomeworkAnswer(city,'spelling','word-0','j’observe').outcome,'correct');
});
test('maths verifies values and labeled quantities, including reversed presentation and zero',()=>{
 assert.equal(typeof api.checkHomeworkAnswer,'function');const p=plan();
 for(const [answer,want]of [['4 dizaines et 2 unités','correct'],['2 unités et 4 dizaines','correct'],['4d 2u','correct'],['4 dizaines et 3 unités','retry'],['42','compare']])assert.equal(api.checkHomeworkAnswer(p,'maths','question-0',answer).outcome,want,answer);
 assert.equal(api.checkHomeworkAnswer(p,'maths','question-1','52').outcome,'correct');
 assert.equal(api.checkHomeworkAnswer(p,'maths','question-1','53').outcome,'retry');
 assert.equal(api.checkHomeworkAnswer(p,'maths','question-1','42 + 10 = 53').outcome,'retry');
 assert.equal(api.checkHomeworkAnswer(plan('B+'),'maths','question-0','3 centaines, 0 dizaine et 6 unités').outcome,'correct');
});
test('open answers get guided comparison instead of a false semantic verdict',()=>{
 assert.equal(typeof api.checkHomeworkAnswer,'function');
 assert.equal(api.checkHomeworkAnswer(plan(),'reading','question-0','Son père.').outcome,'correct');
 assert.equal(api.checkHomeworkAnswer(plan(),'reading','question-0','Ce n’est pas son papa.').outcome,'compare');
 const c=plan('C');assert.equal(api.checkHomeworkAnswer(c,'reading','question-0','Elle le remercie car il a porté les fruits et ils ont pu tout ramener.').outcome,'compare');
 assert.equal(api.checkHomeworkAnswer(c,'reading','question-0','').outcome,'empty');
});
test('attempt history survives correction and editing invalidates a previous check',()=>{
 assert.equal(typeof api.recordHomeworkCheck,'function');const p=plan();
 const first=api.recordHomeworkCheck(p,'maths','question-1','53');
 const second=api.recordHomeworkCheck(p,'maths','question-1','52',first);
 assert.equal(second.attempts.length,2);assert.equal(second.attempts[0].answer,'53');assert.equal(second.outcome,'correct');
 assert.equal(api.homeworkReviewResolved(p,'maths','question-1','52',second),true);
 assert.equal(api.homeworkReviewResolved(p,'maths','question-1','54',second),false);
 const changed=structuredClone(p);changed.maths.questions[1].answer='99';
 assert.equal(api.homeworkReviewResolved(changed,'maths','question-1','52',second),false);
});
test('guided session cannot finish until every current answer has been reviewed',()=>{
 assert.equal(typeof api.recordHomeworkCheck,'function');const p=plan();const answers={'question-0':'4d 2u','question-1':'52'};
 assert.throws(()=>responses.buildHomeworkFeedback(p,'maths','alice','2026-11-05',answers,'alone','completed',false,{}),/valid/i);
 const reviews=Object.fromEntries(Object.entries(answers).map(([id,answer])=>[id,api.recordHomeworkCheck(p,'maths',id,answer)]));
 const saved=responses.buildHomeworkFeedback(p,'maths','alice','2026-11-05',answers,'alone','completed',false,reviews);
 assert.equal(saved.guided,true);assert.equal(saved.responses[1].review.attempts[0].answer,'52');
});

test('every generated item can be checked, saved, and read again across all profiles and dates',()=>{
 for(const profile of ['B-','B','B+','C'])for(let week=8;week<=14;week++)for(const day of [1,4]){
  const p=plan(profile,week,day);
  for(const subject of ['reading',...(p.spelling?['spelling']:[]),'maths']){
   const fields=responses.responseFields(p,subject);
   const answers=Object.fromEntries(fields.map(f=>[f.id,api.homeworkQuestion(p,subject,f.id).answer]));
   const reviews=Object.fromEntries(fields.map(f=>[f.id,api.recordHomeworkCheck(p,subject,f.id,answers[f.id])]));
   const saved=responses.buildHomeworkFeedback(p,subject,'fixture','2026-11-05',answers,'alone','completed',false,reviews);
   responses.validateHomeworkFeedback(saved);
   assert.equal(responses.homeworkSubjectCompleted(p,subject,saved),true,`${profile} S${week} ${day} ${subject}`);
  }
 }
});
test('unknown numeric phrases, negation, and changed or removed questions cannot acquire a false check',()=>{
 const p=plan();
 for(const answer of ['Ce n’est pas 52','52 ou 53','5 2','52 cm','alert(52)'])assert.equal(api.checkHomeworkAnswer(p,'maths','question-1',answer).outcome,'compare',answer);
 assert.equal(api.checkHomeworkAnswer(p,'maths','question-1','42+10=52').outcome,'correct');
 const review=api.recordHomeworkCheck(p,'maths','question-1','52');p.maths.questions.pop();
 assert.equal(api.homeworkReviewResolved(p,'maths','question-1','52',review),false);
});
test('guided completion distinguishes self-review from mastery and retains a request for teacher help',()=>{
 const p=plan();const subject='reading',id='question-0',answer='Il aide Lila.';
 const review=api.recordHomeworkCheck(p,subject,id,answer);
 assert.equal(review.outcome,'compare');
 assert.throws(()=>responses.buildHomeworkFeedback(p,subject,'fixture','2026-11-05',{[id]:answer},'alone','completed',false,{[id]:review}),/valid/i);
 const self=responses.buildHomeworkFeedback(p,subject,'fixture','2026-11-05',{[id]:answer},'alone','completed',false,{[id]:{...review,outcome:'self-reviewed'}});
 assert.equal(self.responses[0].review.outcome,'self-reviewed');
 const help=responses.buildHomeworkFeedback(p,subject,'fixture','2026-11-05',{[id]:answer},'alone','completed',false,{[id]:{...review,outcome:'to-review'}});
 assert.equal(help.status,'retry');assert.equal(responses.homeworkSubjectCompleted(p,subject,help),true);
 const invalid=structuredClone(self);invalid.responses[0].answer='Modifié';assert.throws(()=>responses.validateHomeworkFeedback(invalid),/valid/i);
});
