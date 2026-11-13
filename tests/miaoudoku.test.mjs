import test from 'node:test';
import assert from 'node:assert/strict';
import { createBoard, cycleCell, getConflicts, isSolved, getHint, applyMove, undoMove } from '../src/lib/miaoudoku.ts';
import { MIAOUDOKU_LEVELS } from '../src/lib/miaoudoku-levels.ts';
import * as miaoudoku from '../src/lib/miaoudoku.ts';

const level = {
  id: 'fixture', difficulty: 'easy', size: 4,
  regions: [0,0,1,1, 0,0,1,1, 2,2,3,3, 2,2,3,3],
  solution: [1,7,8,14],
};
const boardWith = (...cats) => Array.from({ length: 16 }, (_, i) => cats.includes(i) ? 'cat' : 'empty');

test('une croix sur la place attendue d’un chat est signalée immédiatement', () => {
  const board = createBoard(level);
  board[1] = 'mark';
  assert.deepEqual(miaoudoku.getMistakes(level, board), [{ index: 1, value: 'mark' }]);
  board[1] = 'cat';
  assert.deepEqual(miaoudoku.getMistakes(level, board), []);
});

test('un chat mal placé est signalé même sans conflit avec un autre chat', () => {
  const board = boardWith(0);
  assert.deepEqual(getConflicts(level, board), []);
  assert.deepEqual(miaoudoku.getMistakes(level, board), [{ index: 0, value: 'cat' }]);
  board[0] = 'empty';
  assert.deepEqual(miaoudoku.getMistakes(level, board), []);
});

test('les bonnes croix, les bons chats et les cases vides ne sont pas des erreurs', () => {
  const board = boardWith(1, 7);
  board[0] = 'mark';
  board[2] = 'mark';
  assert.deepEqual(miaoudoku.getMistakes(level, board), []);
});

test('les erreurs suivent le plateau après une annulation ou un indice', () => {
  const initial = { board: createBoard(level), history: [] };
  const wrong = applyMove(initial, 1, 'mark');
  const corrected = applyMove(wrong, 1, 'cat');
  assert.deepEqual(miaoudoku.getMistakes(level, undoMove(corrected).board), [{ index: 1, value: 'mark' }]);
  assert.deepEqual(miaoudoku.getMistakes(level, undoMove(wrong).board), []);
  const hint = getHint(level, wrong.board);
  assert.deepEqual(miaoudoku.getMistakes(level, applyMove(wrong, hint.index, hint.value).board), []);
});

test('le cycle tactile passe par une croix, un chat puis une case vide', () => {
  assert.equal(cycleCell('empty'), 'mark');
  assert.equal(cycleCell('mark'), 'cat');
  assert.equal(cycleCell('cat'), 'empty');
  assert.deepEqual(createBoard(level), Array(16).fill('empty'));
});

test('chaque règle signale les deux chats en conflit', () => {
  for (const [a, b, rule] of [[0,3,'row'], [0,12,'column'], [0,5,'region'], [3,6,'touching']]) {
    const conflicts = getConflicts(level, boardWith(a,b));
    assert.ok(conflicts.some(c => c.rule === rule && c.cells.includes(a) && c.cells.includes(b)), rule);
  }
  assert.deepEqual(getConflicts(level, boardWith(1,7,8,14)), []);
  // Cats on a distant diagonal are allowed.
  assert.equal(getConflicts(level, boardWith(0,10)).some(c => c.rule === 'touching'), false);
});

test('seule une grille complète et valide gagne', () => {
  assert.equal(isSolved(level, boardWith(1,7,8,14)), true);
  assert.equal(isSolved(level, boardWith(1,7,8)), false);
  assert.equal(isSolved(level, boardWith(0,5,10,15)), false);
  assert.equal(isSolved(level, boardWith(1,7,8,14,15)), false);
});

test('un indice corrige un chat faux avant de révéler un chat manquant', () => {
  const correction = getHint(level, boardWith(0,7));
  assert.equal(correction.index, 0);
  assert.equal(correction.value, 'empty');
  const reveal = getHint(level, boardWith(7));
  assert.ok([1,8,14].includes(reveal.index));
  assert.equal(reveal.value, 'cat');
  assert.ok(reveal.message.length > 0);
  assert.equal(getHint(level, boardWith(1,7,8,14)), null);
});

test('les croix erronées ne bloquent pas les indices', () => {
  const board = boardWith(7,8,14);
  board[1] = 'mark';
  const hint = getHint(level, board);
  assert.equal(hint.index, 1);
  assert.equal(hint.value, 'cat');
});

test('annuler restaure les marques et les chats sans modifier les états précédents', () => {
  const initial = { board: createBoard(level), history: [] };
  const marked = applyMove(initial, 1, 'mark');
  const placed = applyMove(marked, 1, 'cat');
  assert.equal(initial.board[1], 'empty');
  assert.equal(undoMove(placed).board[1], 'mark');
  assert.deepEqual(undoMove(undoMove(placed)), initial);
  assert.equal(undoMove(initial), initial);
  assert.equal(applyMove(initial, -1, 'cat'), initial);
  assert.equal(applyMove(initial, 16, 'cat'), initial);
});

// Independent solver: it does not call the game's validator or use its stored solution.
function solve(level) {
  const solutions = [];
  function visit(cells, columns, regions) {
    const row = cells.length;
    if (row === level.size) { solutions.push(cells); return; }
    for (let col = 0; col < level.size; col++) {
      const cell = row * level.size + col, region = level.regions[cell];
      if (columns.includes(col) || regions.includes(region)) continue;
      if (row > 0 && Math.abs(columns[row - 1] - col) === 1) continue;
      visit([...cells, cell], [...columns, col], [...regions, region]);
    }
  }
  visit([], [], []);
  return solutions;
}

test('le catalogue comporte 24 grilles distinctes et trois tailles progressives', () => {
  assert.equal(MIAOUDOKU_LEVELS.length, 24);
  assert.equal(new Set(MIAOUDOKU_LEVELS.map(l => l.id)).size, 24);
  assert.equal(new Set(MIAOUDOKU_LEVELS.map(l => l.regions.join())).size, 24);
  for (const [difficulty, size] of [['easy', 5], ['normal', 6], ['hard', 8]]) {
    const levels = MIAOUDOKU_LEVELS.filter(l => l.difficulty === difficulty);
    assert.equal(levels.length, 8);
    assert.ok(levels.every(l => l.size === size));
  }
});

for (const level of MIAOUDOKU_LEVELS) {
  test(`${level.id} : zones connexes et exactement une solution valide`, () => {
    assert.equal(level.regions.length, level.size ** 2);
    assert.equal(new Set(level.regions).size, level.size);
    assert.deepEqual(solve(level), [level.solution]);
    assert.equal(isSolved(level, createBoard(level).map((v, i) => level.solution.includes(i) ? 'cat' : v)), true);
    for (let region = 0; region < level.size; region++) {
      const cells = level.regions.flatMap((r,i) => r === region ? [i] : []);
      assert.ok(cells.length > 0);
      const seen = new Set([cells[0]]), pending = [cells[0]];
      while (pending.length) {
        const cell = pending.pop();
        for (const neighbor of cells) {
          const distance = Math.abs(Math.floor(cell / level.size) - Math.floor(neighbor / level.size)) + Math.abs(cell % level.size - neighbor % level.size);
          if (distance === 1 && !seen.has(neighbor)) { seen.add(neighbor); pending.push(neighbor); }
        }
      }
      assert.equal(seen.size, cells.length, `zone ${region}`);
    }
  });
}
