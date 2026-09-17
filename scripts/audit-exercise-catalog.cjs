// Read-only catalogue audit. Only writes the report file; never imports a service.
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
// Icons are not executed by this metadata audit (avoid importing their browser bundle).
const load = Module._load;
Module._load = function (request, ...args) {
  if (request === 'lucide-react') return new Proxy({}, { get: () => () => null });
  return load.call(this, request, ...args);
};
const resolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
  return resolve.call(this, request.startsWith('@/') ? path.join(root, 'src', request.slice(2)) : request, ...args);
};
for (const ext of ['.ts', '.tsx']) require.extensions[ext] = (mod, file) => {
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
    fileName: file,
  }).outputText;
  mod._compile(source, file);
};
const { skills } = require('../src/lib/skills.tsx');
const { PLAGES_PAR_COMPETENCE, ECHELLE_SCOLAIRE, difficultePourNiveau, competencePertinente, competencesSansPlage } = require('../src/lib/niveaux-scolaires.ts');
const route = fs.readFileSync(path.join(root, 'src/app/exercise/[skill]/page.tsx'), 'utf8');
const cases = [...route.matchAll(/case '([^']+)'/g)].map(match => match[1]);
const catalog = skills.filter(skill => !skill.pedagogicalLevel).map(({ icon, ...skill }) => {
  const levels = skill.isFixedLevel ? [skill.isFixedLevel] : skill.allowedLevels ?? ['B', 'C', 'D'];
  const assignment = ECHELLE_SCOLAIRE.filter(n => competencePertinente(skill, n)).map(n => ({ school: n, level: difficultePourNiveau(skill, n) }));
  return { ...skill, declaredLevels: levels, defaultLevelsInferred: !skill.isFixedLevel && !skill.allowedLevels,
    schoolRange: PLAGES_PAR_COMPETENCE[skill.slug] ?? null,
    automaticAssignments: assignment,
    levelsNeverAutoAssignedWithinRange: levels.filter(l => !assignment.some(a => a.level === l)),
    route: cases.includes(skill.slug) ? 'explicit' : 'generic-workspace',
  };
});
const output = {
  generatedAt: new Date().toISOString(),
  scope: 'Catalogue historique : nouveaux exercices progressifs exclus ; niveaux par défaut signalés comme déduits, pas comme contenus prouvés.',
  counts: { total: skills.length, legacy: catalog.length, exercises: catalog.filter(x => !x.isTool).length, tools: catalog.filter(x => x.isTool).length, declaredExerciseLevelPairs: catalog.filter(x => !x.isTool).reduce((n, x) => n + x.declaredLevels.length, 0), freeToolViews: catalog.filter(x => x.isTool).length },
  duplicateSlugs: skills.filter((skill, i) => skills.findIndex(s => s.slug === skill.slug) !== i).map(s => s.slug),
  missingSchoolRanges: competencesSansPlage(),
  routeCasesAbsentFromCatalog: cases.filter(slug => !skills.some(s => s.slug === slug)),
  catalog,
};
const dest = path.join(root, 'docs/audits/2026-09-16-catalogue.json');
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, JSON.stringify(output, null, 2) + '\n');
console.log(JSON.stringify({ ...output, catalog: catalog.map(x => ({ slug: x.slug, levels: x.declaredLevels, unreachable: x.levelsNeverAutoAssignedWithinRange, range: x.schoolRange })) }, null, 2));
