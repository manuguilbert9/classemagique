const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const vm=require('node:vm');const ts=require('typescript');const path=require('node:path');
function read(file,stubs={}){const exports={};const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;vm.runInNewContext(code,{exports,Date,structuredClone,require:n=>n in stubs?stubs[n]:n.startsWith('.')?read(path.resolve(path.dirname(file),n+'.ts')):require(n)});return exports;}
const period=read('src/lib/homework-period.ts');
function fixture(){
 const records=new Map();
 const firestore={doc:(_db,c,id)=>`${c}/${id}`,FieldPath:class{constructor(...parts){this.parts=parts;}},runTransaction:async(_db,fn)=>fn({get:async ref=>({data:()=>records.get(ref)}),set:(ref,value,options)=>{const current=records.get(ref)??{};for(const field of options.mergeFields){assert.equal(field.parts.length,2);const [parent,id]=field.parts;current[parent]??={};current[parent][id]=value[parent][id];}records.set(ref,current);}})};
 const service=read('src/services/homework-period-server.ts',{'@/lib/firebase':{db:{}},'firebase/firestore':firestore,'@/lib/homework-period':{...period,parisDate:()=> '2026-11-03'}});
 return {records,service};
}
const plan=()=>period.createPeriodPlan(8,4,{reading:'B',spelling:'B',maths:'B',support:'standard'});
test('saving one pupil replaces its full plan but preserves peers, group assignments and notes',async()=>{
 const {records,service}=fixture();records.set('homework/2026-11-05',{assignments:{group:{maths:'count'}},assignmentsByStudent:{alice:{notes:'Cahier',plan:{old:true}},bob:{maths:'keep'}}});
 assert.equal((await service.saveHomeworkPlanForStudent('2026-11-05','alice',plan())).success,true);
 const record=records.get('homework/2026-11-05');assert.equal(record.assignmentsByStudent.bob.maths,'keep');assert.equal(record.assignments.group.maths,'count');assert.equal(record.assignmentsByStudent.alice.notes,'Cahier');assert.equal(record.assignmentsByStudent.alice.plan.old,undefined);assert.equal(record.assignmentsByStudent.alice.maths,null);
});
test('repeat publishing preserves manual assignments and past dates and adds only missing pupils',async()=>{
 const {records,service}=fixture();records.set('homework/2026-11-05',{assignmentsByStudent:{alice:{notes:'retouche'}}});
 const entries=[{date:'2026-11-02',assignments:{bob:{plan:plan()}}},{date:'2026-11-05',assignments:{alice:{plan:plan()},bob:{plan:plan()}}}];
 const first=await service.publishHomeworkPeriod(entries);assert.equal(first.written,1);assert.equal(first.skipped,1);assert.equal(records.has('homework/2026-11-02'),false);assert.equal(records.get('homework/2026-11-05').assignmentsByStudent.alice.notes,'retouche');
 const second=await service.publishHomeworkPeriod(entries);assert.equal(second.written,0);assert.equal(second.skipped,2);
});
test('invalid empty plan cannot replace an existing assignment',async()=>{
 const {records,service}=fixture();const invalid=plan();invalid.reading.passage=[];
 assert.equal((await service.saveHomeworkPlanForStudent('2026-11-05','alice',invalid)).success,false);
 assert.equal(records.size,0);
});
