import test from 'node:test';
import assert from 'node:assert/strict';
import { detectives, messages, agreements, pronouns, proofs, chronologies, repairMessage, moveEvent, isChronological } from '../src/lib/progressive/french-data.ts';

test('capital and final full stop must both be placed correctly', () => {
  assert.equal(repairMessage('le chat dort', 0, 2), 'Le chat dort.');
  assert.notEqual(repairMessage('le chat dort', 1, 2), 'Le chat dort.');
  assert.notEqual(repairMessage('le chat dort', 0, 1), 'Le chat dort.');
});
test('chronology moves preserve every event and reject incomplete answers', () => {
  assert.deepEqual(moveEvent([2, 0, 1, 3], 0, 1), [0, 2, 1, 3]);
  assert.deepEqual(moveEvent([0, 1, 2, 3], 0, -1), [0, 1, 2, 3]);
  assert.equal(isChronological([0, 1, 2, 3]), true);
  for (const order of [[0, 1, 2], [0, 1, 1, 3], [1, 0, 2, 3]]) assert.equal(isChronological(order), false);
});
test('each activity has four distinct complete rounds with reachable answers', () => {
  for (const bank of [detectives, messages, agreements, pronouns, proofs, chronologies]) assert.ok(bank.length >= 4);
  assert.ok(detectives.some(x => x.truth) && detectives.some(x => !x.truth));
  for (const x of detectives) { assert.ok(x.sentences.length >= 3); assert.ok(x.sentences[x.evidence]); }
  for (const x of messages) assert.equal(repairMessage(x, 0, x.split(' ').length - 1), x[0].toUpperCase() + x.slice(1) + '.');
  for (const x of agreements) { assert.equal(x.words.length, 3); assert.ok(x.words.some(w => w.initial !== w.correct)); for (const w of x.words) assert.ok(w.choices.includes(w.correct)); }
  for (const x of pronouns) { assert.equal(x.sentences.length, 3); assert.ok(x.people.includes(x.answer)); assert.ok(x.sentences[x.evidence].includes(x.answer)); }
  for (const x of proofs) { assert.ok(x.answers.includes(x.answer)); for (const option of x.evidenceOptions) for (const index of option) assert.ok(x.sentences[index]); }
  for (const x of chronologies) { assert.equal(x.events.length, 4); assert.ok(x.events[x.cause]); assert.ok(x.links.includes(x.link)); }
});

test('chronology cards paraphrase a separate narrative and vary the causal event', () => {
  assert.ok(chronologies.filter(x => x.narrativeOrder.some((value, index) => value !== index)).length >= 2);
  assert.ok(new Set(chronologies.map(x => x.cause)).size >= 3);
  for (const story of chronologies) {
    assert.equal(story.narrativeOrder.length, story.events.length);
    assert.deepEqual([...story.narrativeOrder].sort(), story.events.map((_, index) => index));
    assert.ok(story.events.every(event => !story.story.includes(event)));
    assert.ok(story.links.length >= 3);
    assert.ok(story.links.includes(story.link));
  }
});

test('reading evidence always points to complete clickable sentences', () => {
  for (const item of detectives) {
    assert.ok(item.sentences.length >= 3);
    assert.ok(Number.isInteger(item.evidence));
    assert.ok(item.sentences[item.evidence].endsWith('.'));
  }
  for (const item of proofs) {
    assert.ok(item.sentences.length >= 3);
    assert.ok(item.evidenceOptions.length >= 1);
    for (const option of item.evidenceOptions) {
      assert.ok(option.length >= 1);
      assert.equal(new Set(option).size, option.length);
      for (const index of option) assert.ok(item.sentences[index].endsWith('.'));
    }
  }
  assert.deepEqual(proofs[0].evidenceOptions, [[1], [2], [1, 2]]);
  assert.deepEqual(proofs[3].evidenceOptions, [[1, 3], [1, 2, 3]]);
});

test('every agreement word remains a meaningful editable choice', () => {
  for (const item of agreements) {
    for (const itemWord of item.words) {
      assert.ok(itemWord.choices.length >= 2);
      assert.ok(itemWord.choices.includes(itemWord.correct));
      assert.ok(itemWord.choices.includes(itemWord.initial));
    }
  }
});
