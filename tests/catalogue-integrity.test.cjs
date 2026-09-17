const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const cache = new Map();
function load(file) {
  const full = path.resolve(file);
  if (cache.has(full)) return cache.get(full).exports;
  const mod = {exports:{}}; cache.set(full, mod);
  const code = ts.transpileModule(fs.readFileSync(full, 'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS, jsx:ts.JsxEmit.ReactJSX, target:ts.ScriptTarget.ES2022}}).outputText;
  const localRequire = name => {
    if (name === 'lucide-react') return new Proxy({}, {get: () => () => null});
    if (!name.startsWith('.') && !name.startsWith('@/')) return require(name);
    let target = name.startsWith('@/') ? path.resolve('src', name.slice(2)) : path.resolve(path.dirname(full), name);
    target = [target, target+'.ts', target+'.tsx'].find(p => fs.existsSync(p) && fs.statSync(p).isFile());
    return load(target);
  };
  new Function('require','module','exports',code)(localRequire, mod, mod.exports);
  return mod.exports;
}
test('all legacy difficulty levels can be reached within their school ranges', () => {
  const {skills} = load('src/lib/skills.tsx');
  const {ECHELLE_SCOLAIRE, difficultePourNiveau, competencePertinente} = load('src/lib/niveaux-scolaires.ts');
  for (const skill of skills.filter(s => !s.isTool && !s.pedagogicalLevel && !s.isFixedLevel && !s.progressionLabel)) {
    const reached = new Set(ECHELLE_SCOLAIRE.filter(n => competencePertinente(skill,n)).map(n => difficultePourNiveau(skill,n)));
    for (const level of skill.allowedLevels ?? ['B','C','D']) assert.ok(reached.has(level), `${skill.slug} ${level}`);
  }
});
test('a high score cannot manufacture a historical difficulty', () => {
  const {difficultyLevelToString} = load('src/lib/skills.tsx');
  for (const score of [0,49,50,79,80,100]) assert.equal(difficultyLevelToString('problemes-composition',score), 'Niveau non renseigné');
  assert.equal(difficultyLevelToString('problemes-composition',100,undefined,undefined,undefined,undefined,{level:'B'}), 'Niveau B');
});
test('catalogue slugs are unique and all school ranges exist', () => {
  const {skills} = load('src/lib/skills.tsx');
  const {competencesSansPlage} = load('src/lib/niveaux-scolaires.ts');
  assert.equal(new Set(skills.map(s => s.slug)).size, skills.length);
  assert.deepEqual(competencesSansPlage(), []);
});

test('custom progressions do not manufacture profile levels and free tools cannot be assigned', () => {
 const {skills,canAssignHomework} = load('src/lib/skills.tsx');
 const {difficultesDuDomaine} = load('src/lib/niveaux-scolaires.ts');
 for (const skill of skills.filter(s=>s.progressionLabel)) assert.equal(difficultesDuDomaine(skill.category,'CE2-fin')[skill.slug],undefined);
 for (const slug of ['syllable-table','reading-direction','writing-notebook']) assert.equal(canAssignHomework(skills.find(s=>s.slug===slug)),false);
 assert.equal(canAssignHomework(skills.find(s=>s.slug==='word-families')),true);
});
