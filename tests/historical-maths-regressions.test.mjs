import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const ts = require('typescript');
const dateFns = require('date-fns');
const dateLocale = require('date-fns/locale');
function load(file, random = Math.random, cache = new Map()) {
  const absolute = path.resolve(file);
  if (cache.has(absolute)) return cache.get(absolute);
  const module = { exports: {} }; cache.set(absolute, module.exports);
  const source = ts.transpileModule(fs.readFileSync(absolute, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const math = Object.create(Math); math.random = random;
  const localRequire = spec => {
    if (spec.endsWith('.png')) return { default: { src: spec, width: 100, height: 100 } };
    if (spec === 'date-fns') return dateFns;
    if (spec === 'date-fns/locale') return dateLocale;
    if (spec === '@/services/teacher') return { getCurrentSchoolYear: async () => '2026' };
    if (spec.startsWith('.') || spec.startsWith('@/')) {
      const target = spec.startsWith('@/') ? path.resolve('src', spec.slice(2)) : path.resolve(path.dirname(absolute), spec);
      return load(target + '.ts', random, cache);
    }
    return require(spec);
  };
  vm.runInNewContext(source, { exports: module.exports, module, require: localRequire, Math: math, Date, console, Set, Map, Number, String }, { timeout: 10000, filename: absolute });
  return module.exports;
}
function seeded() { let n=42; return () => ((n = (Math.imul(n,1664525)+1013904223) >>> 0) / 4294967296); }

test('reading upper bounds always return four distinct bounded choices', async () => {
  for (const [level,max] of [['A',10],['B',1000],['C',100000],['D',1000000]]) {
    let call=0; const random=()=> ++call===2 ? .999999999 : 0;
    const api=load('src/lib/reading-number-questions.ts',random);
    const q=await api.generateLireLesNombresQuestion({level});
    assert.equal(Number(q.answer),max);
    const choices=q.options || q.optionsWithAudio.map(x=>x.text);
    assert.equal(new Set(choices).size,4);
    assert.ok(choices.every(x=>Number(x)<=max));
  }
});
test('coded path terminates with all four corners blocked', () => {
 const seq=[0,0,0,.99,0,0,.99,.99,.99,.5,.5,.5,.5]; const next=seeded();
 const api=load('src/lib/exercise-content/chemin-code.ts',()=>seq.length?seq.shift():next());
 for(const level of ['A','B']) {const [q]=api.generateCheminsCodes(level,1); assert.equal(q.grid[q.playerStart.y][q.playerStart.x],'empty');assert.equal(q.grid[q.keyPos.y][q.keyPos.x],'empty');}
});
test('complex number choices stay in 60–99 and contain exactly four choices', async () => {
 const api=load('src/lib/complex-number-questions.ts',seeded());
 for(let i=0;i<150;i++) { const q=await api.generateNombresComplexesQuestion(); assert.ok(+q.answer>=60&&+q.answer<=99); const choices=q.options||q.optionsWithAudio?.map(x=>x.text); if(choices){assert.equal(new Set(choices).size,4);assert.ok(choices.includes(q.answer));}}
});
test('French thousands lose plural s, decimal input never yields undefined', () => {
 const {numberToWords}=load('src/lib/utils.ts'); assert.equal(numberToWords(80000),'quatre-vingt mille'); assert.equal(numberToWords(200000),'deux cent mille'); assert.ok(!numberToWords(.01).includes('undefined'));
});
test('count settings are validated at the boundary', async()=>{const api=load('src/lib/count-questions.ts',()=>.99);for(const maxNumber of [-5,0,1,2,NaN,Infinity,3.5]) {const q=await api.generateDénombrementQuestion({maxNumber});assert.ok(q.countNumber>=3 && q.countNumber<=100);assert.ok(q.countSettings.maxNumber >= q.countNumber, "rendered choices include the answer");}});
test('deterministic correction rejects code and wrong operands and accepts signed arithmetic',()=>{
 const {validSchoolCalculation,normalizeMarketPrice}=load('src/lib/word-problem-math.ts');
 assert.equal(validSchoolCalculation('5 - 2 = 3',3,[5,2],'subtraction'),true);
 assert.equal(validSchoolCalculation('2 - 5',-3,[2,5],'subtraction'),true);
 assert.equal(validSchoolCalculation('3',3,[5,2]),false);
 for(const bad of ['3abc','alert(3)','2+1','5-2=4']) assert.equal(validSchoolCalculation(bad,3,[5,2]),false);
 assert.equal(normalizeMarketPrice(30.5,'B'),19);assert.equal(normalizeMarketPrice(-1,'C'),1);assert.equal(normalizeMarketPrice(Infinity,'D'),1);assert.equal(normalizeMarketPrice(120,'D'),99.99);
});
test('problem stock temperature and generated C/D mathematical correction',async()=>{
 const api=load('src/ai/flows/word-problems-flow.ts',seeded());
 const stock=load('src/lib/word-problems-data.ts').PROBLEM_STOCK;
 const temp=stock['problemes-composition-transformation'].find(p=>p.text.includes('température'));assert.equal(temp.expectedResult,3);assert.equal(temp.expectedOperation,'subtraction');
 for(const difficulty of ['medium','hard']) for(const category of Object.keys(stock)) {
  const q=await api.generateProblem(category,difficulty);assert.ok(q.data.some(n=>n>=20));
  const calculation=q.data.join(q.expectedOperation==='addition'?'+':'-');
  const corrected=await api.correctProblem({problemText:q.text,expectedResult:q.expectedResult,expectedData:q.data,expectedOperation:q.expectedOperation,studentCalculation:calculation,studentResult:q.expectedResult,studentSentence:''});assert.equal(corrected.isCorrect,true);
  if(difficulty==='hard'&&category==='problemes-composition-transformation')assert.ok(q.expectedResult<0);
 }
});
test('calendar A provides reference month and D really spans months',async()=>{
 const api=load('src/lib/calendar-questions.ts',seeded());
 for(const q of await api.generateCalendarQuestions('A',20))assert.ok(q.month);
 for(const q of await api.generateCalendarQuestions('D',20)){assert.equal(q.level,'D');assert.ok(q.answerNumber>=7);assert.ok(q.description.includes('zéro'));}
});

test('adaptive numeric answers normalize decimal notation and history concatenates without mutation',()=>{
 const {sameSchoolAnswer,mergeMathPerformance}=load('src/lib/word-problem-math.ts');
 assert.equal(sameSchoolAnswer('0,3','0.30000000000000004'),true);
 assert.equal(sameSchoolAnswer('3,0','3'),true);
 assert.equal(sameSchoolAnswer('3abc','3'),false);
 assert.equal(sameSchoolAnswer('OUI','oui'),true);
 const history={D5:{attempts:['success','success','success']}};
 const session={D5:{attempts:['success']},D8:{attempts:['failure']}};
 const combined=mergeMathPerformance(history,session);
 assert.equal(combined.D5.attempts.length,4);assert.equal(history.D5.attempts.length,3);assert.equal(session.D5.attempts.length,1);assert.equal(combined.D8.attempts[0],'failure');
});
test('adaptive D5 and D8 generator answers have no floating tail',async()=>{
 let values=[];const api=load('src/lib/adaptive-mental-math.ts',()=>values.length?values.shift():.5);
 const comps=await api.getAdaptiveMentalMathCompetencies();
 for(const id of ['D5','D8']) {
  const history=Object.fromEntries(comps.filter(c=>c.id!==id).map(c=>[c.id,{attempts:['success','success','success','success']}]));
  values=id==='D5'?[.9,0,.002,.9,.5]:[.9,0,.01,.9,.5];
  const q=await api.generateAdaptiveMentalMathQuestion(history);assert.equal(q.competencyId,id);assert.ok(q.answer.length<8);if(id==='D5')assert.equal(q.answer,'0.3');
 }
});

test('currency recognition speaks centimes/euros and B totals stay under 16 euros',async()=>{
 const api=load('src/lib/currency-questions.ts',seeded());let audioCount=0;
 for(let i=0;i<100;i++) {const q=await api.generateCurrencyQuestion({difficulty:0});if(q.textToSpeak){audioCount++;assert.ok(!q.textToSpeak.includes('undefined'));assert.match(q.textToSpeak,/centime|euro/);} const b=await api.generateCurrencyQuestion({difficulty:1});if(b.items)assert.ok(b.items.reduce((s,x)=>s+x.value,0)<=15);}
 assert.ok(audioCount>0);
});
function tableHandler(name, bindings) {
 const source=fs.readFileSync('src/components/multiplication-tables-exercise.tsx','utf8');
 const start=source.indexOf(`    const ${name} =`); const end=source.indexOf('\n    };',start)+7;
 assert.ok(start>=0&&end>start);
 const compiled=ts.transpileModule(source.slice(start,end)+`;globalThis.handler=${name};`,{compilerOptions:{target:ts.ScriptTarget.ES2020}}).outputText;
 const context={...bindings};vm.runInNewContext(compiled,context);return context.handler;
}
test('tables replay clears answer/feedback and submission rejects duplicate and late attempts',()=>{
 const changes=[]; const env={selectedTables:[3],transitionRef:{current:null},sessionRef:{current:0},pendingAnswerRef:{current:true},deadlineRef:{current:0},lastQuestionRef:{current:null},GAME_DURATION_S:60,timerEnabled:false,generateQuestion:()=>({a:3,b:1})};
 for(const key of ['Feedback','UserInput','GameState','TimeLeft','Score','HasBeenSaved','SessionDetails','QuestionCount','CurrentQuestion'])env['set'+key]=value=>changes.push([key,value]);
 tableHandler('startGame',env)();assert.ok(changes.some(([key,value])=>key==='Feedback'&&value===null));assert.ok(changes.some(([key,value])=>key==='UserInput'&&value===''));assert.equal(env.pendingAnswerRef.current,false);
 let writes=0;const submitEnv={...env,currentQuestion:{a:3,b:1},gameState:'playing',feedback:null,questionCount:0,setTimeout:()=>1,setSessionDetails:()=>writes++,setScore:()=>{},setFeedback:()=>{},setQuestionCount:()=>{}};
 const submit=tableHandler('submitAnswer',submitEnv);submit('3.9',true);submit('3e1',true);assert.equal(writes,0);submit('3',true);submit('3',true);assert.equal(writes,1);
 submitEnv.pendingAnswerRef.current=false;submitEnv.timerEnabled=true;submitEnv.deadlineRef.current=Date.now()-1;
 tableHandler('submitAnswer',submitEnv)('3',true);assert.equal(writes,1);
});
