
'use server';

import type { Question } from './questions';
import { avecDe } from './elision';

export async function generateKeyboardCountQuestion(): Promise<Question> {
  const items = [
    { emoji: '🍎', name: 'pommes' },
    { emoji: '🍌', name: 'bananes' },
    { emoji: '🚗', name: 'voitures' },
    { emoji: '🚜', name: 'tracteurs' },
    { emoji: '🍓', name: 'fraises' },
    { emoji: '🍊', name: 'oranges' },
    { emoji: '🚓', name: 'voitures de police' },
    { emoji: '🚑', name: 'ambulances' }
  ];
  const selectedItem = items[Math.floor(Math.random() * items.length)];
  const count = Math.floor(Math.random() * 9) + 1; // 1-9 for single digit keyboard press

  return {
    id: Date.now(),
    level: 'A',
    type: 'keyboard-count',
    question: `Combien y a-t-il ${avecDe(selectedItem.name)} ?`,
    countEmoji: selectedItem.emoji,
    countNumber: count,
    answer: String(count),
  };
}
