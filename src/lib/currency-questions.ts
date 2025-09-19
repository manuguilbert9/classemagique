

'use server';

import { currency as allCurrency, euroPiecesAndBillets, formatCurrency } from './currency';
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
 * Generates a Level B question: make an exact sum.
 */
const generateLevelB = (): Question => {
    // Generate a target amount between 1 and 20 euros.
    const cents = [0, 5, 10, 20, 50][Math.floor(Math.random() * 5)];
    const euros = Math.floor(Math.random() * 20);
    let targetAmount = euros + cents / 100;
    if (targetAmount === 0) targetAmount = 1.50; // fallback

    return {
        id: Date.now(),
        level: 'B',
        type: 'compose-sum',
        question: `Utilise les pièces et les billets pour faire exactement ${formatCurrency(targetAmount)}.`,
        targetAmount: targetAmount,
        currencySettings: { difficulty: 1 },
    }
}

/**
 * Generates a Level C question: calculate the total of a set of coins/bills.
 */
const generateLevelC = (): Question => {
    const numItems = Math.floor(Math.random() * 5) + 3; // 3 to 7 items
    let total = 0;
    const itemsToShow: {name: string, image: string, value: number, type: 'pièce' | 'billet' }[] = [];
    
    for (let i = 0; i < numItems; i++) {
        const item = euroPiecesAndBillets[Math.floor(Math.random() * euroPiecesAndBillets.length)];
        itemsToShow.push(item);
        total += item.value;
    }
    
    // Create distractor options
    const options = new Set<string>();
    options.add(formatCurrency(total));
    
    while(options.size < 4) {
        const variation = (Math.random() - 0.5) * 5; // +/- 2.5
        const distractorValue = Math.max(0.1, total + variation);
        options.add(formatCurrency(distractorValue));
    }

    return {
        id: Date.now(),
        level: 'C',
        type: 'qcm',
        question: `Combien y a-t-il d'argent au total ?`,
        items: itemsToShow,
        options: Array.from(options).sort(() => Math.random() - 0.5),
        answer: formatCurrency(total),
        currencySettings: { difficulty: 2 },
    }
}

/**
 * Generates a Level D question: calculate change.
 */
const generateLevelD = (): Question => {
    // Generate an item cost (e.g., 3.50€)
    const cost = parseFloat((Math.random() * 15 + 1).toFixed(2));
    
    // Generate a payment amount that is higher than the cost
    const possiblePayments = [5, 10, 20, 50].filter(p => p > cost);
    const payment = possiblePayments[Math.floor(Math.random() * possiblePayments.length)] || Math.ceil(cost) + 5;
    const paymentItem = allCurrency.find(c => c.value === payment);
    
    const change = parseFloat((payment - cost).toFixed(2));

    const options = new Set<string>();
    options.add(formatCurrency(change));

    // Distractors
    while(options.size < 4) {
        const variation = (Math.random() - 0.5) * 2;
        const distractor = Math.max(0, change + variation);
        options.add(formatCurrency(distractor));
    }

    return {
        id: Date.now(),
        level: 'D',
        type: 'compose-sum',
        question: `Cet article coûte ${formatCurrency(cost)}. Si tu paies avec ${paymentItem ? `un billet de ${paymentItem.name}` : `${formatCurrency(payment)}`}, combien doit-on te rendre ?`,
        targetAmount: change,
        cost: cost,
        paymentImages: paymentItem ? [{ name: paymentItem.name, image: paymentItem.image }] : [],
        currencySettings: { difficulty: 3 },
    }
}


/**
 * Generates a currency question based on the provided settings.
 */
export async function generateCurrencyQuestion(settings: CurrencySettings): Promise<Question> {
    switch (settings.difficulty) {
        case 0:
            return generateLevelA();
        case 1:
            return generateLevelB();
        case 2:
            return generateLevelC();
        case 3:
            return generateLevelD();
        default:
            return generateLevelA();
    }
}

