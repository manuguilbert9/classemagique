

'use server';

import { currency as allCurrency, euroPiecesAndBillets, formatCurrency } from './currency';
import type { Question, CurrencySettings } from './questions';
import { numberToWords } from './utils';

// Helper to get a random subset of an array
function getRandomSubset<T>(arr: T[], size: number): T[] {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, size);
}

// Helper to get random integer
function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper to round to nearest cent
function roundToCent(value: number): number {
    return Math.round(value * 100) / 100;
}

/**
 * Generates a Level A currency recognition question (Maternelle/CP).
 * Multiple varied question types for better engagement.
 */
const generateLevelA = (): Question => {
    const questionType = randomInt(0, 4);

    switch(questionType) {
        case 0: {
            // Type 1: Reconnaissance simple d'une pièce/billet
            const optionsItems = getRandomSubset(allCurrency, 3);
            const correctItem = optionsItems[randomInt(0, optionsItems.length - 1)];
            const questionText = `Trouve ${correctItem.type === 'pièce' ? 'la pièce de' : 'le billet de'} ${correctItem.name}.`;
            const textToSpeak = `Trouve ${correctItem.type === 'pièce' ? 'la pièce de' : 'le billet de'} ${numberToWords(correctItem.value)}`;

            return {
                id: Date.now(),
                level: 'A',
                type: 'image-qcm',
                question: questionText,
                textToSpeak: textToSpeak,
                imageOptions: optionsItems.map(item => ({
                    value: item.name,
                    src: item.image,
                    alt: item.name,
                    hint: `${item.name} ${item.type}`
                })),
                answer: correctItem.name,
                currencySettings: { difficulty: 0 }
            };
        }
        case 1: {
            // Type 2: Quelle est la plus petite/grande valeur ?
            const optionsItems = getRandomSubset(allCurrency, 3);
            const sortedByValue = [...optionsItems].sort((a, b) => a.value - b.value);
            const isSmallest = Math.random() > 0.5;
            const correctItem = isSmallest ? sortedByValue[0] : sortedByValue[sortedByValue.length - 1];

            return {
                id: Date.now(),
                level: 'A',
                type: 'image-qcm',
                question: `Quelle est ${isSmallest ? 'la plus petite' : 'la plus grande'} valeur ?`,
                textToSpeak: `Quelle est ${isSmallest ? 'la plus petite' : 'la plus grande'} valeur ?`,
                imageOptions: optionsItems.map(item => ({
                    value: item.name,
                    src: item.image,
                    alt: item.name,
                    hint: `${item.name}`
                })),
                answer: correctItem.name,
                currencySettings: { difficulty: 0 }
            };
        }
        case 2: {
            // Type 3: Combien vaut cette pièce/ce billet ?
            const item = allCurrency[randomInt(0, allCurrency.length - 1)];
            const correctAnswer = formatCurrency(item.value);
            const options = new Set<string>();
            options.add(correctAnswer);

            while(options.size < 4) {
                const distractor = allCurrency[randomInt(0, allCurrency.length - 1)];
                options.add(formatCurrency(distractor.value));
            }

            return {
                id: Date.now(),
                level: 'A',
                type: 'qcm',
                question: `Combien vaut ${item.type === 'pièce' ? 'cette pièce' : 'ce billet'} ?`,
                items: [item],
                options: Array.from(options).sort(() => Math.random() - 0.5),
                answer: correctAnswer,
                currencySettings: { difficulty: 0 }
            };
        }
        case 3: {
            // Type 4: Trouve toutes les pièces (filter par type)
            const isPiece = Math.random() > 0.5;
            const filtered = allCurrency.filter(c => c.type === (isPiece ? 'pièce' : 'billet'));
            const optionsItems = getRandomSubset(allCurrency, 3);
            const correctItem = filtered[randomInt(0, filtered.length - 1)];

            // S'assurer que correctItem est dans les options
            if (!optionsItems.find(o => o.name === correctItem.name)) {
                optionsItems[0] = correctItem;
            }

            return {
                id: Date.now(),
                level: 'A',
                type: 'image-qcm',
                question: `Trouve ${isPiece ? 'une pièce' : 'un billet'}.`,
                textToSpeak: `Trouve ${isPiece ? 'une pièce' : 'un billet'}.`,
                imageOptions: optionsItems.map(item => ({
                    value: item.name,
                    src: item.image,
                    alt: item.name,
                    hint: `${item.name}`
                })),
                answer: correctItem.name,
                currencySettings: { difficulty: 0 }
            };
        }
        default: {
            // Type 5: Compte combien il y a de pièces/billets
            const count = randomInt(2, 5);
            const item = allCurrency[randomInt(0, allCurrency.length - 1)];
            const items = Array(count).fill(item);

            const options = [count.toString(), (count - 1).toString(), (count + 1).toString(), (count + 2).toString()]
                .filter(o => parseInt(o) > 0)
                .slice(0, 4);

            return {
                id: Date.now(),
                level: 'A',
                type: 'qcm',
                question: `Combien y a-t-il de ${item.type === 'pièce' ? 'pièces' : 'billets'} ?`,
                items: items,
                options: options.sort(() => Math.random() - 0.5),
                answer: count.toString(),
                currencySettings: { difficulty: 0 }
            };
        }
    }
};

/**
 * Generates a Level B question (CP/CE1).
 * Faire des sommes, additions simples, comparer des montants.
 */
const generateLevelB = (): Question => {
    const questionType = randomInt(0, 3);

    switch(questionType) {
        case 0: {
            // Type 1: Faire une somme exacte (compose-sum)
            const cents = [0, 5, 10, 20, 50][randomInt(0, 4)];
            const euros = randomInt(1, 15);
            const targetAmount = euros + cents / 100;

            return {
                id: Date.now(),
                level: 'B',
                type: 'compose-sum',
                question: `Utilise les pièces et les billets pour faire exactement ${formatCurrency(targetAmount)}.`,
                targetAmount: targetAmount,
                currencySettings: { difficulty: 1 },
            };
        }
        case 1: {
            // Type 2: Addition de 2 pièces/billets
            const item1 = euroPiecesAndBillets[randomInt(0, euroPiecesAndBillets.length - 1)];
            const item2 = euroPiecesAndBillets[randomInt(0, euroPiecesAndBillets.length - 1)];
            const total = roundToCent(item1.value + item2.value);

            const options = new Set<string>();
            options.add(formatCurrency(total));

            while(options.size < 4) {
                const variation = roundToCent((Math.random() - 0.5) * 3);
                const distractor = roundToCent(Math.max(0.01, total + variation));
                options.add(formatCurrency(distractor));
            }

            return {
                id: Date.now(),
                level: 'B',
                type: 'qcm',
                question: `Combien font ces deux pièces/billets ensemble ?`,
                items: [item1, item2],
                options: Array.from(options).sort(() => Math.random() - 0.5),
                answer: formatCurrency(total),
                currencySettings: { difficulty: 1 },
            };
        }
        case 2: {
            // Type 3: Comparer deux montants (quel côté a plus d'argent ?)
            const numItems1 = randomInt(1, 3);
            const numItems2 = randomInt(1, 3);
            const items1: typeof euroPiecesAndBillets = [];
            const items2: typeof euroPiecesAndBillets = [];
            let total1 = 0;
            let total2 = 0;

            for(let i = 0; i < numItems1; i++) {
                const item = euroPiecesAndBillets[randomInt(0, euroPiecesAndBillets.length - 1)];
                items1.push(item);
                total1 += item.value;
            }

            for(let i = 0; i < numItems2; i++) {
                const item = euroPiecesAndBillets[randomInt(0, euroPiecesAndBillets.length - 1)];
                items2.push(item);
                total2 += item.value;
            }

            // S'assurer qu'ils ne sont pas égaux
            if (total1 === total2) {
                total2 += 0.50;
                items2.push(euroPiecesAndBillets.find(e => e.value === 0.50)!);
            }

            const answer = total1 > total2 ? "Gauche" : "Droite";

            return {
                id: Date.now(),
                level: 'B',
                type: 'qcm',
                question: `Quel côté a le plus d'argent ?`,
                items: [...items1, ...items2], // Pour l'affichage côte à côte
                options: ["Gauche", "Droite"],
                answer: answer,
                currencySettings: { difficulty: 1 },
            };
        }
        default: {
            // Type 4: Faire une somme avec contrainte (utilise exactement X pièces/billets)
            const numCoins = randomInt(2, 4);
            const possibleValues = [0.05, 0.10, 0.20, 0.50, 1, 2];
            const targetAmount = roundToCent(possibleValues[randomInt(0, possibleValues.length - 1)] * numCoins);

            return {
                id: Date.now(),
                level: 'B',
                type: 'compose-sum',
                question: `Fais exactement ${formatCurrency(targetAmount)} en utilisant ${numCoins} pièces ou billets.`,
                targetAmount: targetAmount,
                currencySettings: { difficulty: 1 },
            };
        }
    }
};

/**
 * Generates a Level C question (CE2/CM1).
 * Calculs plus complexes, achats multiples, notion de budget.
 */
const generateLevelC = (): Question => {
    const questionType = randomInt(0, 4);

    switch(questionType) {
        case 0: {
            // Type 1: Calculer le total de plusieurs pièces/billets
            const numItems = randomInt(4, 8);
            let total = 0;
            const itemsToShow: typeof euroPiecesAndBillets = [];

            for (let i = 0; i < numItems; i++) {
                const item = euroPiecesAndBillets[randomInt(0, euroPiecesAndBillets.length - 1)];
                itemsToShow.push(item);
                total += item.value;
            }
            total = roundToCent(total);

            const options = new Set<string>();
            options.add(formatCurrency(total));

            while(options.size < 4) {
                const variation = roundToCent((Math.random() - 0.5) * 6);
                const distractorValue = roundToCent(Math.max(0.10, total + variation));
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
            };
        }
        case 1: {
            // Type 2: Problème d'achat (Tu achètes X objets, combien ça coûte ?)
            const numItems = randomInt(2, 4);
            const prices: number[] = [];
            let total = 0;

            for(let i = 0; i < numItems; i++) {
                const price = roundToCent(randomInt(1, 10) + [0, 0.50, 0.99][randomInt(0, 2)]);
                prices.push(price);
                total += price;
            }
            total = roundToCent(total);

            const itemNames = ["un livre", "un crayon", "une gomme", "un cahier", "une règle", "un stylo"];
            const selectedItems = getRandomSubset(itemNames, numItems);
            const itemList = selectedItems.map((item, i) => `${item} (${formatCurrency(prices[i])})`).join(", ");

            const options = new Set<string>();
            options.add(formatCurrency(total));

            while(options.size < 4) {
                const variation = roundToCent((Math.random() - 0.5) * 5);
                const distractor = roundToCent(Math.max(0.50, total + variation));
                options.add(formatCurrency(distractor));
            }

            return {
                id: Date.now(),
                level: 'C',
                type: 'qcm',
                question: `Tu achètes ${itemList}. Combien vas-tu payer en tout ?`,
                options: Array.from(options).sort(() => Math.random() - 0.5),
                answer: formatCurrency(total),
                currencySettings: { difficulty: 2 },
            };
        }
        case 2: {
            // Type 3: As-tu assez d'argent pour acheter ?
            const itemPrice = roundToCent(randomInt(5, 25) + [0, 0.50, 0.99][randomInt(0, 2)]);
            const numCoins = randomInt(3, 6);
            let wallet = 0;
            const walletItems: typeof euroPiecesAndBillets = [];

            for(let i = 0; i < numCoins; i++) {
                const item = euroPiecesAndBillets[randomInt(0, euroPiecesAndBillets.length - 1)];
                walletItems.push(item);
                wallet += item.value;
            }
            wallet = roundToCent(wallet);

            const hasEnough = wallet >= itemPrice;
            const answer = hasEnough ? "Oui" : "Non";

            return {
                id: Date.now(),
                level: 'C',
                type: 'qcm',
                question: `Tu veux acheter un objet qui coûte ${formatCurrency(itemPrice)}. Voici l'argent que tu as. As-tu assez ?`,
                items: walletItems,
                options: ["Oui", "Non"],
                answer: answer,
                currencySettings: { difficulty: 2 },
            };
        }
        case 3: {
            // Type 4: Combien te manque-t-il pour acheter ?
            const itemPrice = roundToCent(randomInt(10, 30) + 0.99);
            const wallet = roundToCent(randomInt(5, itemPrice - 1) + [0, 0.50][randomInt(0, 1)]);
            const missing = roundToCent(itemPrice - wallet);

            const options = new Set<string>();
            options.add(formatCurrency(missing));

            while(options.size < 4) {
                const variation = roundToCent((Math.random() - 0.5) * 4);
                const distractor = roundToCent(Math.max(0.01, missing + variation));
                options.add(formatCurrency(distractor));
            }

            return {
                id: Date.now(),
                level: 'C',
                type: 'qcm',
                question: `Un objet coûte ${formatCurrency(itemPrice)}. Tu as ${formatCurrency(wallet)}. Combien te manque-t-il ?`,
                options: Array.from(options).sort(() => Math.random() - 0.5),
                answer: formatCurrency(missing),
                currencySettings: { difficulty: 2 },
            };
        }
        default: {
            // Type 5: Faire une somme exacte plus difficile (montant plus grand)
            const euros = randomInt(10, 50);
            const cents = [0, 5, 10, 20, 50, 99][randomInt(0, 5)];
            const targetAmount = roundToCent(euros + cents / 100);

            return {
                id: Date.now(),
                level: 'C',
                type: 'compose-sum',
                question: `Compose exactement ${formatCurrency(targetAmount)} avec les pièces et billets disponibles.`,
                targetAmount: targetAmount,
                currencySettings: { difficulty: 2 },
            };
        }
    }
};

/**
 * Generates a Level D question (CM2/6ème).
 * Rendre la monnaie, problèmes complexes, optimisation.
 */
const generateLevelD = (): Question => {
    const questionType = randomInt(0, 4);

    switch(questionType) {
        case 0: {
            // Type 1: Rendre la monnaie (compose-sum)
            const cost = roundToCent(randomInt(5, 30) + [0, 0.50, 0.99][randomInt(0, 2)]);
            const possiblePayments = [5, 10, 20, 50, 100].filter(p => p > cost);
            const payment = possiblePayments[randomInt(0, possiblePayments.length - 1)];
            const paymentItem = allCurrency.find(c => c.value === payment);
            const change = roundToCent(payment - cost);

            return {
                id: Date.now(),
                level: 'D',
                type: 'compose-sum',
                question: `Un article coûte ${formatCurrency(cost)}. Tu paies avec ${paymentItem ? `un billet de ${paymentItem.name}` : formatCurrency(payment)}. Compose la monnaie à rendre.`,
                targetAmount: change,
                cost: cost,
                paymentImages: paymentItem ? [{ name: paymentItem.name, image: paymentItem.image }] : [],
                currencySettings: { difficulty: 3 },
            };
        }
        case 1: {
            // Type 2: Calculer la monnaie à rendre (QCM)
            const cost = roundToCent(randomInt(10, 45) + [0, 0.25, 0.50, 0.75, 0.99][randomInt(0, 4)]);
            const possiblePayments = [20, 50, 100].filter(p => p > cost);
            const payment = possiblePayments[randomInt(0, possiblePayments.length - 1)];
            const change = roundToCent(payment - cost);

            const options = new Set<string>();
            options.add(formatCurrency(change));

            while(options.size < 4) {
                const variation = roundToCent((Math.random() - 0.5) * 5);
                const distractor = roundToCent(Math.max(0.01, change + variation));
                options.add(formatCurrency(distractor));
            }

            return {
                id: Date.now(),
                level: 'D',
                type: 'qcm',
                question: `Un client achète pour ${formatCurrency(cost)} et donne un billet de ${formatCurrency(payment)}. Combien lui rends-tu ?`,
                options: Array.from(options).sort(() => Math.random() - 0.5),
                answer: formatCurrency(change),
                currencySettings: { difficulty: 3 },
            };
        }
        case 2: {
            // Type 3: Achats multiples avec budget limité
            const budget = roundToCent(randomInt(20, 50));
            const numItems = randomInt(3, 5);
            const prices: number[] = [];
            let total = 0;

            for(let i = 0; i < numItems; i++) {
                const price = roundToCent(randomInt(2, 15) + [0, 0.50, 0.99][randomInt(0, 2)]);
                prices.push(price);
                total += price;
            }
            total = roundToCent(total);

            const itemNames = ["un livre", "un jeu", "un ballon", "des crayons", "une trousse", "un sac"];
            const selectedItems = getRandomSubset(itemNames, numItems);
            const itemList = selectedItems.map((item, i) => `${item} (${formatCurrency(prices[i])})`).join(", ");

            const remaining = roundToCent(budget - total);
            const canAfford = total <= budget;

            if (canAfford) {
                const options = new Set<string>();
                options.add(formatCurrency(remaining));

                while(options.size < 4) {
                    const variation = roundToCent((Math.random() - 0.5) * 8);
                    const distractor = roundToCent(Math.max(0, remaining + variation));
                    options.add(formatCurrency(distractor));
                }

                return {
                    id: Date.now(),
                    level: 'D',
                    type: 'qcm',
                    question: `Tu as ${formatCurrency(budget)}. Tu achètes ${itemList}. Combien te reste-t-il ?`,
                    options: Array.from(options).sort(() => Math.random() - 0.5),
                    answer: formatCurrency(remaining),
                    currencySettings: { difficulty: 3 },
                };
            } else {
                const deficit = roundToCent(total - budget);
                const options = new Set<string>();
                options.add(formatCurrency(deficit));

                while(options.size < 4) {
                    const variation = roundToCent((Math.random() - 0.5) * 6);
                    const distractor = roundToCent(Math.max(0.01, deficit + variation));
                    options.add(formatCurrency(distractor));
                }

                return {
                    id: Date.now(),
                    level: 'D',
                    type: 'qcm',
                    question: `Tu veux acheter ${itemList}. Tu as ${formatCurrency(budget)}. Combien te manque-t-il ?`,
                    options: Array.from(options).sort(() => Math.random() - 0.5),
                    answer: formatCurrency(deficit),
                    currencySettings: { difficulty: 3 },
                };
            }
        }
        case 3: {
            // Type 4: Problème de partage équitable
            const totalMoney = roundToCent(randomInt(10, 50));
            const numPeople = randomInt(2, 4);
            const perPerson = roundToCent(totalMoney / numPeople);

            const options = new Set<string>();
            options.add(formatCurrency(perPerson));

            while(options.size < 4) {
                const variation = roundToCent((Math.random() - 0.5) * 5);
                const distractor = roundToCent(Math.max(0.10, perPerson + variation));
                options.add(formatCurrency(distractor));
            }

            return {
                id: Date.now(),
                level: 'D',
                type: 'qcm',
                question: `${numPeople} amis se partagent équitablement ${formatCurrency(totalMoney)}. Combien reçoit chaque personne ?`,
                options: Array.from(options).sort(() => Math.random() - 0.5),
                answer: formatCurrency(perPerson),
                currencySettings: { difficulty: 3 },
            };
        }
        default: {
            // Type 5: Optimisation - composer avec le moins de pièces/billets possible
            const euros = randomInt(15, 75);
            const cents = [0, 50][randomInt(0, 1)];
            const targetAmount = roundToCent(euros + cents / 100);

            return {
                id: Date.now(),
                level: 'D',
                type: 'compose-sum',
                question: `Compose exactement ${formatCurrency(targetAmount)} en utilisant le MOINS de pièces et billets possible.`,
                targetAmount: targetAmount,
                currencySettings: { difficulty: 3 },
            };
        }
    }
};


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

