const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function exercise({ homework, type = 'mots' }) {
  const state = [];
  let cursor = 0;
  const session = {
    id: 'S1-J1', type, jour: type === 'bilan' ? 4 : 1, niveau: 1,
    typeLabel: 'Dictée', items: ['chat', 'lapin'],
    semaine: { semaine: 1, periode: 1, corpusTheme: 'Animaux', notion: { titre: 'Animaux' }, regularites: [] },
  };
  const ui = new Proxy({}, { get: (_, name) => String(name) });
  const modules = {
    react: {
      useState(initial) {
        const slot = cursor++;
        if (!(slot in state)) state[slot] = initial;
        return [state[slot], value => { state[slot] = typeof value === 'function' ? value(state[slot]) : value; }];
      },
      useMemo: fn => fn(), useCallback: fn => fn, useEffect() {},
      useContext: () => ({}), useRef: () => ({ current: null }),
    },
    'react/jsx-runtime': require('react/jsx-runtime'),
    'next/navigation': { useSearchParams: () => new URLSearchParams(homework ? 'from=devoirs&date=2026-09-18' : '') },
    '@/services/dictees': {
      getSession: () => session, niveauPourSkillLevel: () => 1,
      getCorpusPourNiveau: () => session.items, libelleNiveau: () => 'Niveau 1',
      comparer: (expected, actual) => ({ correct: expected === actual, totalMots: 1, motsCorrects: +(expected === actual), mots: [] }),
    },
    '@/lib/utils': { cn: (...values) => values.filter(Boolean).join(' ') },
  };
  const source = ts.transpileModule(fs.readFileSync('src/components/dictee-exercise.tsx', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(source, { exports, require: name => modules[name] ?? ui });
  const render = () => { cursor = 0; return exports.DicteeExercise({ sessionId: session.id }); };
  return { render };
}

function nodes(tree) {
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  if (!tree || typeof tree !== 'object') return [];
  return [tree, ...nodes(tree.props?.children)];
}
function text(tree) {
  if (Array.isArray(tree)) return tree.map(text).join('');
  return tree && typeof tree === 'object' ? text(tree.props?.children) : String(tree ?? '');
}
function click(tree, label) {
  const button = nodes(tree).find(node => node.type === 'Button' && text(node).includes(label));
  assert.ok(button, `Button: ${label}`);
  button.props.onClick();
}

for (const scenario of [
  { homework: true, type: 'mots', repetitions: 3 },
  { homework: false, type: 'mots', repetitions: 1 },
  { homework: true, type: 'bilan', repetitions: 1 },
]) {
  test(`dictée ${scenario.type}, homework=${scenario.homework}: ${scenario.repetitions} copies before completion`, () => {
    const { render } = exercise(scenario);
    click(render(), 'Commencer');
    const words = ['chat', 'lapin'].flatMap(word => Array(scenario.repetitions).fill(word));
    words.forEach((word, index) => {
      let tree = render();
      if (scenario.repetitions === 3) {
        assert.ok(text(tree).includes(`Copie ${(index % 3) + 1} / 3`));
        assert.ok(nodes(tree).some(node => node.type === 'p' && text(node) === word));
      }
      const input = nodes(tree).find(node => ['Input', 'Textarea'].includes(node.type));
      assert.equal(input.props.value, '');
      input.props.onChange({ target: { value: word } });
      click(render(), 'Valider');
      tree = render();
      click(tree, index === words.length - 1 ? 'Voir mon résultat' : 'Suivant');
    });
    assert.ok(text(render()).includes(scenario.repetitions === 3 ? 'Copie terminée !' : 'Dictée terminée !'));
  });
}
