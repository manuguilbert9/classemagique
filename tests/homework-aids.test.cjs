const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const cache=new Map();function load(file){file=path.resolve(file);if(cache.has(file))return cache.get(file);const exports={};cache.set(file,exports);vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,Date,structuredClone,require:n=>n.startsWith('.')?load(path.resolve(path.dirname(file),n+'.ts')):require(n)});return exports;}
const period=load('src/lib/homework-period.ts');const aids=fs.existsSync('src/lib/homework-aids.ts')?load('src/lib/homework-aids.ts'):{};const correction=load('src/lib/homework-correction.ts');
const plan=(profile='B',week=8,day=4)=>period.createPeriodPlan(week,day,{reading:profile,spelling:profile,maths:profile,support:'standard'});
test('Ismael gets an aid for the actual operation, covering its start and possible arrival',()=>{
 assert.equal(typeof aids.homeworkAid,'function');const p=plan();
 const place=aids.homeworkAid(p,'maths','question-0');assert.equal(place.support.kind,'place-value');
 const line=aids.homeworkAid(p,'maths','question-1');assert.equal(line.support.kind,'number-line');
 assert.equal(line.support.start,42);assert.ok(line.support.min<42&&line.support.max>52);assert.match(line.support.instruction,/42/);assert.match(line.support.instruction,/10/);
 assert.equal(line.support.result,undefined);assert.equal(line.model,undefined);
});
test('supports follow the current question and active revision rather than the pupil token flag',()=>{
 assert.equal(typeof aids.homeworkAid,'function');const c=plan('C',12);const a=aids.homeworkAid(c,'maths','question-0');
 assert.equal(a.support.kind,'place-value');assert.match(a.hint,/groupes/);assert.ok(!JSON.stringify(a).includes('250'));
 c.maths.introduced=true;assert.equal(aids.homeworkAid(c,'maths','question-0').support.kind,'counters');
 const fraction=plan('C',11);fraction.maths.introduced=true;assert.equal(aids.homeworkAid(fraction,'maths','question-0').support.parts,4);
 const custom=plan();custom.maths.questions=[{prompt:'Explique ton choix.',answer:'Réponse secrète',hint:'Réfléchis au choix.'}];
 assert.equal(aids.homeworkAid(custom,'maths','question-0').support,undefined);
});
test('aids and printable homework do not contain a worked answer, including old published hints',()=>{
 assert.equal(typeof aids.homeworkAid,'function');const p=plan('B+',12,1);p.maths.introduced=true;
 p.maths.questions[0].hint='5 dizaines et 2 unités valent autant que 4 dizaines et 12 unités.';
 assert.ok(!aids.homeworkAid(p,'maths','question-0').hint.includes('4 dizaines et 12 unités'));
 const c=plan('C');c.maths.questions[0].hint='Sépare 204 et 006.';
 assert.ok(!aids.homeworkAid(c,'maths','question-0').hint.includes('204 et 006'));
 const html=load('src/lib/homework-print.ts').homeworkPrintHtml(c,'2026-11-05');
 assert.ok(!html.includes('204 milliers entiers.'));assert.ok(!html.includes('Une réponse possible'));assert.ok(!html.includes('Aide et vérification'));
 const check=correction.checkHomeworkAnswer(plan(),'maths','question-1','53');assert.equal(check.model,undefined);assert.equal(check.outcome,'retry');
 assert.equal(correction.recordHomeworkCheck(plan(),'reading','question-0','Autre formulation').correctionSeen,false);
});
test('Axelle has a separate maths profile while her reading and spelling stay at C',()=>{
 const profile=period.profileForStudent({name:'Axelle',groupId:'ue'});assert.equal(profile.maths,'B+');assert.equal(profile.reading,'C');assert.equal(profile.spelling,'C');
 for(const slot of period.periodDates()){
  const p=period.createPeriodPlan(slot.week,slot.day,profile);const activity=period.mathsForPlan(p);
  assert.ok(!activity.questions.some(q=>/fraction|milliers|× 12|quotient/i.test(q.prompt)));
 }
});

test('teacher-authored hints stay authoritative while known old answer-giving hints are repaired',()=>{
 const p=plan();p.maths.questions[1].hint='Utilise le matériel présenté mardi en classe.';
 assert.equal(aids.homeworkAid(p,'maths','question-1').hint,p.maths.questions[1].hint);
});
