import test from 'node:test';
import assert from 'node:assert/strict';
import { readCompletedLevels, recordCompletedLevel } from '../src/lib/miaoudoku-progress.ts';

const ids = ['easy-1', 'easy-2', 'normal-1'];
function memoryStorage() {
  const data = new Map();
  return { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
}

test('deux sessions ne remplacent pas leurs réussites respectives', () => {
  const storage = memoryStorage();
  // Both sessions start with the same empty snapshot.
  assert.deepEqual(readCompletedLevels(storage, 'student-a', ids), []);
  assert.deepEqual(readCompletedLevels(storage, 'student-a', ids), []);
  recordCompletedLevel(storage, 'student-a', 'easy-1');
  recordCompletedLevel(storage, 'student-a', 'easy-2');
  assert.deepEqual(readCompletedLevels(storage, 'student-a', ids), ['easy-1', 'easy-2']);
  recordCompletedLevel(storage, 'student-a', 'easy-1');
  assert.deepEqual(readCompletedLevels(storage, 'student-a', ids), ['easy-1', 'easy-2']);
  assert.deepEqual(readCompletedLevels(storage, 'student-b', ids), []);
});

test('le stockage invalide ou indisponible ne bloque pas le jeu', () => {
  const storage = memoryStorage();
  storage.setItem('a:level:easy-1', '{invalid');
  recordCompletedLevel(storage, 'a', 'missing-level');
  assert.deepEqual(readCompletedLevels(storage, 'a', ids), []);
  const unavailable = { getItem() { throw new Error('Blocked'); }, setItem() { throw new Error('Quota'); } };
  assert.deepEqual(readCompletedLevels(unavailable, 'a', ids), []);
  assert.equal(recordCompletedLevel(unavailable, 'a', 'easy-1'), false);
});
