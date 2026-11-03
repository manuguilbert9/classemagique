const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const vm = require('node:vm');
const cache = new Map();
function load(file) {
  file = path.resolve(file);
  if (cache.has(file)) return cache.get(file);
  const exports = {};
  cache.set(file, exports);
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  vm.runInNewContext(code, {exports, Date, structuredClone, require: name => name.startsWith('.') ? load(path.resolve(path.dirname(file), name.replace(/\.ts$/, '') + '.ts')) : require(name)});
  return exports;
}
const api = fs.existsSync('src/lib/homework-period.ts') ? load('src/lib/homework-period.ts') : {};
test('P2 starts Thursday Nov 5, releases in advance and ends Dec 17 without holiday homework', () => {
  assert.equal(typeof api.periodDates, 'function');
  const dates = api.periodDates('2026-11-03');
  assert.equal(dates.length,13);
  assert.equal(dates[0].date,'2026-11-05');
  assert.equal(dates[0].availableOn,'2026-11-03');
  assert.equal(dates[1].date,'2026-11-09');
  assert.equal(dates[1].availableOn,'2026-11-06');
  assert.equal(dates.at(-1).date,'2026-12-17');
  assert.equal(api.periodDates('2026-12-18').length,0);
});
test('roster excludes departed student and unassigned duplicates; brief profiles override stale global levels', () => {
  assert.equal(typeof api.profileForStudent,'function');
  assert.equal(api.profileForStudent({name:'Léandre',groupId:'old'}),null);
  assert.equal(api.profileForStudent({name:'Stélina'}),null);
  assert.equal(api.profileForStudent({name:'M. Manu',groupId:'UE'}),null);
  assert.equal(api.profileForStudent({name:'Inconnu',groupId:'UE'}),null);
  assert.equal(api.profileForStudent({name:'Nolan',groupId:'UE'}).maths,'B+');
  assert.equal(api.profileForStudent({name:'Léo',groupId:'UE'}).support,'syllabes');
});
test('same weekly passage, different recall questions, and three bounded tasks for readers', () => {
  assert.equal(typeof api.createPeriodPlan,'function');
  for(const profile of ['B','B+','C']) for(let week=9;week<=14;week++) {
    const mon=api.createPeriodPlan(week,1,{reading:profile,spelling:profile,maths:profile,support:'standard'});
    const thu=api.createPeriodPlan(week,4,{reading:profile,spelling:profile,maths:profile,support:'standard'});
    assert.equal(JSON.stringify(mon.reading.passage),JSON.stringify(thu.reading.passage));
    assert.notEqual(mon.reading.questions[0].prompt,thu.reading.questions[0].prompt);
    assert.ok(mon.spelling.words.length>0);
    assert.ok(mon.reading.minutes+mon.spelling.minutes+mon.maths.minutes<=mon.maxMinutes);
    assert.ok(thu.maths.questions.length<=3);
    for(const q of thu.maths.questions) assert.ok(q.answer && q.hint);
  }
});
test('Matteo gets controlled code, no handwriting and no automatic consonant introduction', () => {
  assert.equal(typeof api.createPeriodPlan,'function');
  for(let week=8;week<=14;week++) {
    const plan=api.createPeriodPlan(week,4,{reading:'B-',spelling:'B-',maths:'B-',support:'standard'});
    assert.equal(plan.spelling,null);
    assert.equal(plan.reading.mode,'code');
    assert.ok(plan.reading.passage.every(s=>/^[LMAIOUÉ\s]+$/.test(s)));
    assert.ok(plan.reading.adultText);
  }
});
test('unintroduced maths uses an actual revision fallback; teacher can activate the planned task', () => {
  assert.equal(typeof api.mathsForPlan,'function');
  const plan=api.createPeriodPlan(12,4,{reading:'C',spelling:'C',maths:'C',support:'standard'});
  assert.equal(plan.maths.introduced,false);
  assert.notEqual(api.mathsForPlan(plan).questions[0].prompt,plan.maths.questions[0].prompt);
  plan.maths.introduced=true;
  assert.equal(api.mathsForPlan(plan).questions[0].prompt,plan.maths.questions[0].prompt);
});
test('plans are independent across pupils and spelling retains the adapted S8 corpus', () => {
  assert.equal(typeof api.createPeriodPlan,'function');
  const profile={reading:'B',spelling:'B',maths:'B',support:'standard'};
  const a=api.createPeriodPlan(8,4,profile), b=api.createPeriodPlan(8,4,profile);
  a.reading.passage[0]='modification';
  assert.notEqual(b.reading.passage[0],'modification');
  assert.ok(b.spelling.words.includes('les enfants jouent'));
});
test('printable homework contains the actual text, safe HTML and the active maths fallback', () => {
  const printer = fs.existsSync('src/lib/homework-print.ts') ? load('src/lib/homework-print.ts') : {};
  assert.equal(typeof printer.homeworkPrintHtml,'function');
  const plan=api.createPeriodPlan(12,4,{reading:'C',spelling:'C',maths:'C',support:'standard'});
  plan.reading.passage[0]='<script>alert(1)</script>';
  const html=printer.homeworkPrintHtml(plan,'2026-12-03');
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(!html.includes('<script>alert(1)</script>'));
  assert.ok(html.includes('Je consolide mes calculs'));
  assert.ok(!html.includes('Partage 12 jetons'));
  assert.ok(!/https?:\/\//.test(html));
});
test('print keeps syllable colour support and still contains the complete reading text',()=>{
  const printer=load('src/lib/homework-print.ts');
  const plan=api.createPeriodPlan(8,4,{reading:'B',spelling:'B',maths:'B',support:'syllabes'});
  const html=printer.homeworkPrintHtml(plan,'2026-11-05');
  assert.ok(html.includes('class="syllable-blue"'));
  assert.ok(html.includes('class="syllable-red"'));
  const plain=html.replace(/<[^>]+>/g,'');
  assert.ok(plain.includes('Lila ramasse des pommes.'));
});
test('only M. Manu can select another homework identity, always read-only',()=>{
  assert.equal(typeof api.homeworkViewer,'function');
  const teacher=api.homeworkViewer({id:'manu',name:'M. Manu'},'pupil');
  assert.equal(teacher.studentId,'pupil');assert.equal(teacher.readOnly,true);
  const pupil=api.homeworkViewer({id:'alice',name:'Alice'},'bob');
  assert.equal(pupil.studentId,'alice');assert.equal(pupil.readOnly,false);
  assert.equal(api.homeworkViewer({id:'manu',name:'M. Manu'},'').studentId,'manu');
});
test('Thursday homework opens Tuesday at 15:00 Paris time, with an exact boundary each week',()=>{
  const profiles={reading:'B',spelling:'B',maths:'B',support:'standard'};
  for(const slot of api.periodDates().filter(s=>s.day===4)){
    const plan=api.createPeriodPlan(slot.week,slot.day,profiles);
    assert.equal(api.planIsAvailable(plan,new Date(slot.availableOn+'T13:59:59Z')),false);
    assert.equal(api.planIsAvailable(plan,new Date(slot.availableOn+'T14:00:00Z')),true);
    assert.equal(api.planIsAvailable(plan,new Date(slot.date+'T08:00:00Z')),true);
  }
  const monday=api.createPeriodPlan(9,1,profiles);
  assert.equal(api.planIsAvailable(monday,new Date('2026-11-05T22:59:59Z')),false);
  assert.equal(api.planIsAvailable(monday,new Date('2026-11-05T23:00:00Z')),true);
});
