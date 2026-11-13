const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function rewards(nuggets, spend) {
  const state = [], calls = [], notifications = [];
  let cursor = 0;
  const ui = new Proxy({}, { get: (_, name) => String(name) });
  const modules = {
    react: {
      useContext: () => ({ student: { id: 'local-test', nuggets }, refreshStudent() {} }),
      useState(initial) {
        const slot = cursor++;
        if (!(slot in state)) state[slot] = initial;
        return [state[slot], value => { state[slot] = value; }];
      },
      useRef(initial) {
        const slot = cursor++;
        if (!(slot in state)) state[slot] = { current: initial };
        return state[slot];
      },
    },
    'react/jsx-runtime': require('react/jsx-runtime'),
    '@/hooks/use-toast': { useToast: () => ({ toast: notification => notifications.push(notification) }) },
    '@/services/students': { spendNuggets: async (...args) => { calls.push(args); return spend(); } },
  };
  const source = ts.transpileModule(fs.readFileSync('src/app/rewards/page.tsx', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(source, { exports, require: name => modules[name] ?? ui });
  const render = () => { cursor = 0; return exports.default(); };
  const nodes = tree => Array.isArray(tree) ? tree.flatMap(nodes) : tree && typeof tree === 'object' ? [tree, ...nodes(tree.props?.children)] : [];
  const card = () => nodes(render()).find(node => node.type === 'RewardCard' && node.props.title === 'Miaoudoku');
  return { render, card, calls, notifications };
}

test('une session attend un seul débit de 2 pépites, même avec un double clic', async () => {
  let resolve;
  const app = rewards(2, () => new Promise(done => { resolve = done; }));
  assert.equal(app.card().props.cost, 2);
  const pending = app.card().props.onAction();
  await app.card().props.onAction();
  assert.equal(app.render().type, 'PageShell');
  assert.deepEqual(app.calls, [['local-test', 2]]);
  resolve({ success: true });
  await pending;
  const game = app.render();
  assert.equal(game.type, 'MiaoudokuGame');
  assert.equal(game.props.studentId, 'local-test');
  game.props.onExit();
  assert.equal(app.render().type, 'PageShell');
});

test('un solde insuffisant ne débite rien et ne lance pas de partie', async () => {
  const app = rewards(1, () => ({ success: true }));
  await app.card().props.onAction();
  assert.equal(app.calls.length, 0);
  assert.equal(app.render().type, 'PageShell');
  assert.equal(app.notifications.length, 1);
});

test('un échec de paiement garde le catalogue et autorise une nouvelle tentative', async () => {
  let attempt = 0;
  const app = rewards(2, () => { if (++attempt === 1) throw new Error('Network'); return { success: false }; });
  await app.card().props.onAction();
  assert.equal(app.render().type, 'PageShell');
  await app.card().props.onAction();
  assert.equal(app.calls.length, 2);
  assert.equal(app.render().type, 'PageShell');
  assert.equal(app.notifications.length, 2);
});
