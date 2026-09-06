
'use server';

import type { Question, CountSettings } from './questions';
import { avecDe } from './elision';

export async function generateDénombrementQuestion(settings: CountSettings): Promise<Question> {
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
  const max = settings.maxNumber || 19;
  const count = Math.floor(Math.random() * (max - 3 + 1)) + 3; 

  return {
    id: Date.now(),
    level: 'A',
    type: 'count',
    question: `Combien y a-t-il ${avecDe(selectedItem.name)} ?`,
    countEmoji: selectedItem.emoji,
    countNumber: count,
    answer: String(count),
    // Pass settings for result analysis
    countSettings: settings,
  };
}
