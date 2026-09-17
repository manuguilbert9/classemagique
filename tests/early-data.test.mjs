import test from 'node:test';
import assert from 'node:assert/strict';
import { usefulObject, actionPair, pairingCount, addPair, compareCollections, wordChoice, sceneChoice, flowerOrder, trainSequence, MAGIC_OBJECTS } from '../src/lib/progressive/early-data.ts';

test('useful objects progress from two to three unique choices with one answer', () => {
  for (let round = 0; round < 12; round++) {
    const item = usefulObject(round);
    assert.equal(item.choices.length, round % 4 < 2 ? 2 : 3);
    assert.equal(new Set(item.choices.map(c => c.word)).size, item.choices.length);
    assert.equal(item.choices.filter(c => c.word === item.expected).length, 1);
  }
});
test('ordered instructions choose two distinct objects among six', () => {
  assert.equal(MAGIC_OBJECTS.length, 6);
  for (let r = 0; r < 12; r++) {
    const pair = actionPair(r);
    assert.notEqual(pair[0], pair[1]);
    assert.ok(pair.every(word => MAGIC_OBJECTS.some(o => o.word === word)));
  }
});
test('pairing cannot reuse flowers or rabbits and always leaves one excess flower', () => {
  for (let r = 0; r < 4; r++) {
    const count = pairingCount(r);
    assert.ok(count >= 2 && count <= 4);
    let pairs = [];
    for (let i = 0; i < count; i++) pairs = addPair(pairs, i, i, count);
    assert.equal(pairs.length, count);
    assert.equal(addPair(pairs, count, 0, count), pairs);
    assert.equal(addPair(pairs, 0, count - 1, count), pairs);
    assert.equal(addPair([], count + 1, 0, count).length, 0);
    assert.equal(addPair([], 0, -1, count).length, 0);
  }
});
test('comparisons include both directions and equality within 1–4', () => {
  const data = Array.from({length:4}, (_,r) => compareCollections(r));
  assert.deepEqual(new Set(data.map(d => d.expected)), new Set(['gauche', 'droite', 'autant']));
  for (const d of data) assert.ok(d.left >= 1 && d.left <= 4 && d.right >= 1 && d.right <= 4);
});
test('word and scene choices have a unique exact answer', () => {
  for (let r = 0; r < 8; r++) for (const item of [wordChoice(r), sceneChoice(r)]) {
    assert.equal(item.choices.filter(c => c === item.expected).length, 1);
    assert.equal(new Set(item.choices).size, item.choices.length);
  }
});
test('flower orders require a complement, not the target number', () => {
  assert.deepEqual(flowerOrder(0), {target:6, present:4, expected:2, choices:[1,2,3]});
  for (let r = 0; r < 12; r++) {
    const d = flowerOrder(r);
    assert.ok(d.target <= 10 && d.present > 0 && d.present < d.target);
    assert.equal(d.present + d.expected, d.target);
    assert.ok(d.choices.includes(d.expected));
  }
});
test('trains contain an interior gap and valid increasing and decreasing sequences', () => {
  const steps = new Set();
  for (let r = 0; r < 12; r++) {
    const d = trainSequence(r);
    assert.ok(d.gap > 0 && d.gap < d.values.length - 1);
    const step = d.values[1] - d.values[0]; steps.add(step);
    for (let i = 1; i < d.values.length; i++) assert.equal(d.values[i] - d.values[i-1], step);
    assert.ok(d.choices.includes(d.values[d.gap]));
  }
  assert.deepEqual(steps, new Set([1,-1]));
});
