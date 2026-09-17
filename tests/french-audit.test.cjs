const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const cache = new Map();
function load(file) {
 const full = path.resolve(file); if (cache.has(full)) return cache.get(full).exports;
 const module = { exports: {} }; cache.set(full, module);
 const code = ts.transpileModule(fs.readFileSync(full, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
 function localRequire(name) {
  if (!name.startsWith('.') && !name.startsWith('@/')) return require(name);
  let target = name.startsWith('@/') ? path.resolve('src', name.slice(2)) : path.resolve(path.dirname(full), name);
  if (!fs.existsSync(target) || fs.statSync(target).isDirectory()) target = [target+'.ts', target+'.tsx', path.join(target,'index.ts')].find(p => fs.existsSync(p));
  return load(target);
 }
 new Function('require', 'module', 'exports', code)(localRequire, module, module.exports); return module.exports;
}
test('oral syllables use existing images and unique distractors', async () => {
 const { ORAL_ATTACK_WORDS } = load('src/lib/oral-attack-data.ts');
 assert.equal(ORAL_ATTACK_WORDS.find(w => w.word === 'ballon').syllable, 'ba');
 for (const row of ORAL_ATTACK_WORDS) assert.ok(fs.existsSync('public'+row.image), row.image);
 const { generateSyllabeAttaqueQuestion } = load('src/lib/syllabe-questions.ts');
 for (let i=0;i<100;i++) { const q = await generateSyllabeAttaqueQuestion(); assert.equal(new Set(q.imageOptions.map(o => o.value)).size,3); assert.equal(q.imageOptions.filter(o => ORAL_ATTACK_WORDS.find(w=>w.word===o.value).syllable===q.syllable).length,1); }
});
test('every GN/NI gap reconstructs the reference word', () => {
 const { generateGnNiQuestions } = load('src/lib/gn-ni-questions.ts');
 for (const q of generateGnNiQuestions()) assert.equal(q.question.replace('Complète le mot : ', '').replace('___', q.answer),q.hint);
 assert.equal(generateGnNiQuestions(5).length,5);
});
test('dictée insertion alignment and strict spelling cannot score 100 with extra words', () => {
 const { comparer } = load('src/services/dictees.ts');
 for (const input of ['Le chat noir','Oh Le chat']) { const result=comparer('Le chat',input,true); assert.equal(result.correct,false); assert.equal(result.motsCorrects,2); assert.equal(result.totalMots,3); }
 assert.equal(comparer('Le petit chat','Le chat',true).motsCorrects,2);
 assert.equal(comparer('été','ete',true).correct,false);
 assert.equal(comparer('été','ete',false).correct,true);
});
test('construction D never falls back to a short sentence; noun D differs from C', () => {
 const { generatePhrasesAConstruire } = load('src/lib/exercise-content/phrases.ts');
 for (const q of generatePhrasesAConstruire('D',30)) assert.ok(q.phrase.split(/\s+/).length>10);
 const { generatePhrasesNom } = load('src/lib/exercise-content/grammaire.ts');
 const c = new Set(load('src/data/grammaire/nouns-sentences.ts').NOUN_SENTENCES);
 for (const q of generatePhrasesNom('D',20)) assert.ok(!c.has(q.phrase));
});
test('adjective levels, alternatives and elision are reviewed', () => {
 const { generatePhrasesAEnrichir } = load('src/lib/exercise-content/phrases.ts');
 const { ADJECTIVE_ENRICHMENT_SENTENCES, formatEnrichedSentence } = load('src/data/grammaire/adjective-enrichment-sentences.ts');
 for(const level of ['B','C']) assert.ok(generatePhrasesAEnrichir(10,level).every(q=>q.level===level));
 assert.equal(formatEnrichedSentence(['Le','épais','livre','tombe.']), "L'épais livre tombe.");
 assert.ok(ADJECTIVE_ENRICHMENT_SENTENCES.find(q=>q.baseSentence==='Le chat dort sur le canapé.').validSentences.includes('Le chat dort sur le petit canapé.'));
 assert.ok(!JSON.stringify(ADJECTIVE_ENRICHMENT_SENTENCES).includes('Le épais'));
});
test('passé composé respects all level metadata and rejects malformed QCM', async () => {
 const { generatePasseComposeQuestions } = load('src/lib/passe-compose-questions.ts');
 const { validPasseComposeQuestion } = load('src/lib/passe-compose-bank.ts');
 for(const level of ['B','C','D']) {
  const qs=await generatePasseComposeQuestions({auxiliaries:['avoir','etre'],groups:['1er','2eme','3eme'],answerMode:'qcm'},20,level);
  assert.ok(qs.every(q=>q.level===level && validPasseComposeQuestion({sentence:q.question,answer:q.answer,options:q.options})));
 }
 assert.equal(validPasseComposeQuestion({sentence:'Les joueurs se _____ entraînés.',answer:'sont entraînés',options:['sont entraînés','ont entraîné','a entraîné']}),false);
 assert.equal(validPasseComposeQuestion({sentence:'Il _____ dehors.',answer:'a joué',options:['a joué','a joué','joue']}),false);
});
test('word family output collisions and unknown originals are removed', () => {
 const { sanitizeWordPairs }=load('src/lib/word-family-validation.ts');
 assert.deepEqual(sanitizeWordPairs([{original:'dent',familyMember:'dentiste'},{original:'dent',familyMember:'dentaire'},{original:'jardin',familyMember:'dentiste'},{original:'inconnu',familyMember:'autre'}],['dent','jardin']),[{original:'dent',familyMember:'dentiste'}]);
});
test('MBP includes the bonbon exception at its target position', () => {
 const qs=load('src/lib/exercise-content/regle-mbp.ts').generateMbpQuestions(1000);
 assert.ok(qs.some(q=>q.word==='bonbon' && q.missingPart==='bo___bon' && q.correctLetter==='n'));
 for(const q of qs) assert.equal(q.missingPart.replace('___',q.correctLetter),q.word.toLowerCase());
});
