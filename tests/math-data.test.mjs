import test from 'node:test';
import assert from 'node:assert/strict';
import { neighbors, operations, estimates, measures, subtractions, midpoints, subtractionSteps, borrowingCells } from '../src/lib/progressive/math-data.ts';

test('neighbors remain on the 0–20 line, then remove the visual support', () => {
  assert.ok(neighbors.length >= 4);
  for (const n of neighbors) assert.ok(n > 0 && n < 20);
});
test('operations cover joining and removing with positive totals', () => {
  assert.deepEqual(new Set(operations.map(x => x.sign)), new Set(['+', '−']));
  for (const x of operations) assert.equal(x.result, x.sign === '+' ? x.start + x.change : x.start - x.change);
});
test('estimates have a unique nearest hundred and exact arithmetic', () => {
  for (const x of estimates) {
    assert.equal(x.result, x.a + x.b);
    assert.equal(x.estimate, Math.round(x.result / 100) * 100);
    assert.equal(x.choices.filter(y => y === x.estimate).length, 1);
  }
});
test('ruler readings include true, false, and offset origins', () => {
  assert.ok(measures.some(x => x.start > 0));
  assert.ok(measures.some(x => x.claim === x.end - x.start));
  assert.ok(measures.some(x => x.claim !== x.end - x.start));
  for (const x of measures) assert.ok(x.end > x.start && x.end <= 12);
});
test('borrowing examples contain exactly one incorrect stage and no propagated errors', () => {
  for (const x of subtractions) {
    const stages = subtractionSteps(x);
    assert.equal(stages.filter(s => s.shown !== s.correct).length, 1);
    assert.equal(stages.at(-1).correct, x.a - x.b);
    assert.ok(x.a % 10 < x.b % 10);
    assert.equal(stages[0].correct, Math.floor(x.a / 10) - 1);
    assert.equal(stages[1].correct, 10 + x.a % 10 - x.b % 10);
  }
});
test('midpoint candidates uniquely bisect each segment in cm and mm', () => {
  assert.deepEqual(new Set(midpoints.map(x => x.unit)), new Set(['cm', 'mm']));
  for (const x of midpoints) {
    assert.equal(x.points.filter(p => p.position === x.length / 2).length, 1);
    for (const p of x.points) assert.ok(p.position > 0 && p.position < x.length);
  }
});

test('the written calculation conserves value when a ten is exchanged and contains one editable error', () => {
  for (const q of subtractions) {
    const cells = borrowingCells(q);
    const get = id => cells.find(cell => cell.id === id).correct;
    assert.equal(10 * get('borrow-tens') + get('borrow-units'), q.a);
    assert.equal(get('borrow-units') - q.b % 10, get('result-units'));
    assert.equal(get('borrow-tens') - Math.floor(q.b / 10), get('result-tens'));
    assert.equal(10 * get('result-tens') + get('result-units'), q.a - q.b);
    assert.equal(cells.filter(c => c.shown !== c.correct).length, 1);
  }
});
