

'use server';

import { currency as allCurrency, formatCurrency } from './currency';
import type { Question, CurrencySettings } from './questions';
import { numberToWords } from './utils';

// Helper to get a random subset of an array
function getRandomSubset<T>(arr: T[], size: number): T[] {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, size);
}

/**
 * Generates a Level A currency recognition question.
 * The student is asked to find a specific coin or bill among three choices.
 */
const generateLevelA = (): Question => {
    // Select 3 unique items for the options
    const optionsItems = getRandomSubset(allCurrency, 3);
    
    // Choose one of them as the correct answer
    const correctItem = optionsItems[Math.floor(Math.random() * optionsItems.length)];

    const questionText = `Trouve ${correctItem.type === 'pièce' ? 'la pièce de' : 'le billet de'} ${correctItem.name}.`;
    
    // The question will also be read out loud
    const textToSpeak = `Trouve ${correctItem.type === 'pièce' ? 'la pièce de' : 'le billet de'} ${numberToWords(correctItem.value)}`;

    return {
        id: Date.now(),
        level: 'A',
        type: 'image-qcm', // Correct type is 'image-qcm'
        question: questionText,
        textToSpeak: textToSpeak,
        // The options are now image-based
        imageOptions: optionsItems.map(item => ({
            value: item.name, // The value we check against the answer
            src: item.image,
            alt: item.name,
            hint: `${item.name} ${item.type}`
        })),
        answer: correctItem.name,
        currencySettings: { difficulty: 0 }
    };
};

/**
 * Generates a currency question based on the provided settings.
 * Currently, only Level A (difficulty 0) is implemented.
 */
export async function generateCurrencyQuestion(settings: CurrencySettings): Promise<Question> {
    // For now, we only implement difficulty 0 (Level A)
    return generateLevelA();
}
