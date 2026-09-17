import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeActivityResults, activityDetail } from '../src/lib/progressive-results.ts';

test('une correction ne rapporte pas un point de première réussite', () => {
  const results = [
    { answer: '2', expected: '2', mistakes: [] },
    { answer: '3', expected: '3', mistakes: ['1'] },
    { answer: '4', expected: '4', mistakes: [] },
    { answer: '5', expected: '5', mistakes: ['6', '7'] },
  ];
  assert.deepEqual(summarizeActivityResults(results), { correct: 2, corrected: 2, total: 4, score: 50 });
});

test('une séance vide ne produit pas de score invalide', () => {
  assert.deepEqual(summarizeActivityResults([]), { correct: 0, corrected: 0, total: 0, score: 0 });
});

test('le bilan conserve les erreurs et la justification libre', () => {
  const detail = activityDetail('Preuve', { answer: 'Lina ; parce que le texte le dit.', expected: 'Lina', mistakes: ['Nolan'] });
  assert.deepEqual(detail, { question: 'Preuve', userAnswer: 'Lina ; parce que le texte le dit.', correctAnswer: 'Lina', status: 'corrected', mistakes: ['Nolan'] });
});
