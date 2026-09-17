import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { resolveAssignment } from '../src/lib/homework-assignment.ts';
import { formatScore } from '../src/lib/score-display.ts';
function load(file, stubs={}, globals={}) {
 const source=ts.transpileModule(readFileSync(new URL('../'+file,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const exports={}; vm.runInNewContext(source,{exports,require:name=>{if (!(name in stubs)) throw Error(name);return stubs[name];},console,crypto:globalThis.crypto,...globals}); return exports;
}
test('group save preserves individual assignments, effective assignment respects null override',async()=>{
 const record={assignments:{g:{francais:'old',maths:'count'}},assignmentsByStudent:{s:{francais:'personal',maths:null}}};
 const firestore={doc:()=> 'date',setDoc:async(_ref,data,options)=>{assert.deepEqual(Array.from(options.mergeFields),['assignments']);Object.assign(record,data);}};
 const service=load('src/services/homework-server.ts',{'@/lib/firebase':{db:{}},'firebase/firestore':firestore,'@/lib/homework-assignment':{resolveAssignment}});
 await service.saveHomework('2026-09-16',{g:{francais:'new',maths:'count'}});
 assert.deepEqual(resolveAssignment(record,'s','g'),{francais:'personal',maths:null});
 assert.deepEqual(resolveAssignment(record,'s'),{francais:'personal',maths:null});
});
test('homework transaction awards once and stores identical detailed score, including zero',async()=>{
 const records=new Map([['students/s',{nuggets:5}]]);
 const firestore={doc:(_db,c,id)=>c+'/'+id,Timestamp:{now:()=>42},runTransaction:async(_db,fn)=>{
 const staged=new Map();await fn({get:async ref=>({exists:()=>records.has(ref),data:()=>records.get(ref)}),set:(ref,data)=>staged.set(ref,data),update:(ref,data)=>staged.set(ref,{...records.get(ref),...data})});for(const [k,v] of staged)records.set(k,v);
 }};
 const service=load('src/services/scores-server.ts',{'@/lib/firebase':{db:{}},'firebase/firestore':firestore,'@/lib/nuggets':{calculateNuggets:()=>2}});
 const payload={sessionId:'one',userId:'s',skill:'fluence',score:0,homeworkDate:'2026-09-16',details:[{status:'completed',question:'text',userAnswer:'0',correctAnswer:'0'}],readingRaceSettings:{level:'Niveau B'}};
 assert.equal((await service.persistResult(payload)).success,true);
 assert.equal((await service.persistResult(payload)).success,true);
 assert.equal(records.get('students/s').nuggets,7);
 assert.equal(records.get('scores/one').score,0);
 assert.equal(records.get('homeworkResults/one').details[0].status,'completed');
 assert.equal(records.get('homeworkResults/one').readingRaceSettings.level,'Niveau B');
});
test('outbox retains failure, scopes retries, survives reload and reuses session id',async()=>{
 const storage=new Map();const localStorage={get length(){return storage.size;},key:i=>[...storage.keys()][i],getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
 let outbox=load('src/lib/result-outbox.ts',{}, {window:{},localStorage});
 const ids=[];const fail=async data=>{ids.push(data.sessionId);throw Error('offline');};
 await outbox.enqueueResult({userId:'a',skill:'x',score:0},fail);
 await outbox.enqueueResult({userId:'b',skill:'x',score:100},fail);
 outbox=load('src/lib/result-outbox.ts',{}, {window:{},localStorage});
 await outbox.retryResults('a',async data=>{assert.equal(data.sessionId,ids[0]);return {success:true};});
 assert.equal(outbox.getPendingResults('a')[0].state,'saved');
 assert.equal(outbox.getPendingResults('b')[0].state,'pending');
 assert.equal(storage.size,1);
});
test('units remain distinct',()=>{
 assert.equal(formatScore({skill:'fluence',score:55}),'55 MCLM');
 assert.equal(formatScore({skill:'tables',score:12,metadata:{unit:'count'}}),'12 réponses');
 assert.equal(formatScore({skill:'tables',score:80,metadata:{unit:'percent'}}),'80%');
});

import { attemptMetadata } from '../src/lib/attempt-metadata.ts';
import { calculateMCLM, readingSeconds } from '../src/lib/fluence-metrics.ts';
test('attempt metadata distinguishes correction with and without help, without inventing missing first response',()=>{
 assert.deepEqual(attemptMetadata('4',['3','2'],2,true),{firstAnswer:'3',attempts:3,hintUsed:true});
 assert.deepEqual(attemptMetadata('4',['3'],1,false),{firstAnswer:'3',attempts:2,hintUsed:false});
 assert.equal(attemptMetadata('4',[],2,false).firstAnswer,undefined);
});
test('fluence uses actual words and final errors including zero',()=>{
 assert.equal(calculateMCLM(60,60,5),55);
 assert.equal(calculateMCLM(15,60,5),10);
 assert.equal(calculateMCLM(5,60,5),0);
 assert.equal(calculateMCLM(0,60,0),0);
 assert.equal(calculateMCLM(60,0,0),0);
});
test('decoding completion is not displayed as mastery percentage',()=>{
 assert.equal(formatScore({skill:'decoding',score:100}), 'Atelier achev\u00e9');
});

test('independent tabs never overwrite another pending session',async()=>{
 const storage=new Map();const localStorage={get length(){return storage.size;},key:i=>[...storage.keys()][i],getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)};
 const a=load('src/lib/result-outbox.ts',{}, {window:{},localStorage});
 const b=load('src/lib/result-outbox.ts',{}, {window:{},localStorage});
 a.getPendingResults('a');b.getPendingResults('b');
 const fail=async()=>({success:false});
 await a.enqueueResult({userId:'a',skill:'x',score:0,sessionId:'sessionA'},fail);
 await b.enqueueResult({userId:'b',skill:'x',score:0,sessionId:'sessionB'},fail);
 assert.equal(storage.size,2);
 await b.retryResults('b',async()=>({success:true}));
 assert.equal(storage.size,1);
 assert.equal(JSON.parse([...storage.values()][0]).data.sessionId,'sessionA');
});

test('historical count units remain counts and mixed tables stay unknown',()=>{
 assert.equal(formatScore({skill:'complement-dix',score:12}), '12 r\u00e9ponses');
 assert.equal(formatScore({skill:'soustraction-mentale',score:8}), '8 r\u00e9ponses');
 assert.equal(formatScore({skill:'tables-multiplication',score:90}), '90 (unit\u00e9 non renseign\u00e9e)');
});

test('reading stopwatch uses elapsed clock time despite throttled ticks and excludes pauses',()=>{
 assert.equal(readingSeconds(0,1000,61000),60);
 assert.equal(readingSeconds(60000,null,3600000),60);
 assert.equal(readingSeconds(60000,3600000,3630000),90);
 assert.equal(calculateMCLM(60,readingSeconds(0,1000,61000),0),60);
});
