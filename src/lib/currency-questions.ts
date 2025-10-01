

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

// Counter to ensure unique IDs
let questionIdCounter = 0;

/**
 * Generates a Level A currency recognition question (Maternelle/CP).
 * Questions claires et directes pour les jeunes élèves.
 */
const generateLevelA = (): Question => {
    const questionType = randomInt(0, 3);

    switch(questionType) {
        case 0: {
            // Type 1: Reconnaissance simple d'une pièce/billet par sa valeur
            const correctItem = allCurrency[randomInt(0, allCurrency.length - 1)];
            const optionsItems = getRandomSubset(allCurrency.filter(c => c.name !== correctItem.name), 2);
            optionsItems.push(correctItem);

            const questionText = `Clique sur ${correctItem.type === 'pièce' ? 'la pièce de' : 'le billet de'} ${correctItem.name}.`;
            const textToSpeak = `Clique sur ${correctItem.type === 'pièce' ? 'la pièce de' : 'le billet de'} ${numberToWords(correctItem.value)}`;

            return {
                id: Date.now() + questionIdCounter++,
                level: 'A',
                type: 'image-qcm',
                question: questionText,
                textToSpeak: textToSpeak,
                imageOptions: optionsItems.sort(() => Math.random() - 0.5).map(item => ({
                    value: item.name,
                    src: item.image,
                    alt: item.name,
                    hint: `${item.name}`
                })),
                answer: correctItem.name,
                currencySettings: { difficulty: 0 }
            };
        }
        case 1: {
            // Type 2: Reconnaissance d'une pièce (seulement pièces)
            const pieces = allCurrency.filter(c => c.type === 'pièce');
            const correctItem = pieces[randomInt(0, pieces.length - 1)];
            const optionsItems = getRandomSubset(pieces.filter(p => p.name !== correctItem.name), 2);
            optionsItems.push(correctItem);

            return {
                id: Date.now() + questionIdCounter++,
                level: 'A',
                type: 'image-qcm',
                question: `Clique sur la pièce de ${correctItem.name}.`,
                textToSpeak: `Clique sur la pièce de ${numberToWords(correctItem.value)}`,
                imageOptions: optionsItems.sort(() => Math.random() - 0.5).map(item => ({
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
            // Type 3: Reconnaissance d'un billet (seulement billets)
            const billets = allCurrency.filter(c => c.type === 'billet');
            const correctItem = billets[randomInt(0, billets.length - 1)];
            const optionsItems = getRandomSubset(billets.filter(b => b.name !== correctItem.name), 2);
            optionsItems.push(correctItem);

            return {
                id: Date.now() + questionIdCounter++,
                level: 'A',
                type: 'image-qcm',
                question: `Clique sur le billet de ${correctItem.name}.`,
                textToSpeak: `Clique sur le billet de ${numberToWords(correctItem.value)}`,
                imageOptions: optionsItems.sort(() => Math.random() - 0.5).map(item => ({
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
            // Type 4: Compter des pièces/billets identiques
            const count = randomInt(2, 4);
            const item = allCurrency[randomInt(0, allCurrency.length - 1)];
            const items = Array(count).fill(item);

            const options = [count.toString(), (count - 1).toString(), (count + 1).toString(), (count + 2).toString()]
                .filter(o => parseInt(o) > 0 && parseInt(o) <= 5)
                .slice(0, 4);

            return {
                id: Date.now() + questionIdCounter++,
                level: 'A',
                type: 'qcm',
                question: `Combien y a-t-il de ${item.type === 'pièce' ? 'pièces' : 'billets'} de ${item.name} ?`,
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
 * Additions simples et composer des sommes.
 */
const generateLevelB = (): Question => {
    const questionType = randomInt(0, 2);

    switch(questionType) {
        case 0: {
            // Type 1: Composer une petite somme (jusqu'à 5€)
            const cents = [0, 50][randomInt(0, 1)];
            const euros = randomInt(1, 5);
            const targetAmount = euros + cents / 100;

            return {
                id: Date.now() + questionIdCounter++,
                level: 'B',
                type: 'compose-sum',
                question: `Compose exactement ${formatCurrency(targetAmount)} avec les pièces et billets.`,
                targetAmount: targetAmount,
                currencySettings: { difficulty: 1 },
            };
        }
        case 1: {
            // Type 2: Calculer le total de 2-3 pièces/billets
            const numItems = randomInt(2, 3);
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

            // Générer des distracteurs plausibles basés sur des erreurs de calcul courantes
            const errors = [1, -1, 2, -2, 3, -3];
            for(const error of errors.sort(() => Math.random() - 0.5)) {
                if(options.size >= 4) break;
                const distractor = roundToCent(Math.max(1, total + error));
                // Arrondir au même type de centimes que le total (0 ou 50 centimes uniquement pour niveau B)
                const hasCents = total % 1 !== 0;
                if(!hasCents && distractor % 1 !== 0) {
                    // Si le total est entier, garder les distracteurs entiers
                    continue;
                }
                options.add(formatCurrency(distractor));
            }

            return {
                id: Date.now() + questionIdCounter++,
                level: 'B',
                type: 'qcm',
                question: `Calcule le total de ces ${numItems === 2 ? 'deux' : 'trois'} pièces ou billets.`,
                items: itemsToShow,
                options: Array.from(options).sort(() => Math.random() - 0.5),
                answer: formatCurrency(total),
                currencySettings: { difficulty: 1 },
            };
        }
        default: {
            // Type 3: Composer une somme moyenne (5-15€)
            const euros = randomInt(5, 15);
            const cents = [0, 50][randomInt(0, 1)];
            const targetAmount = roundToCent(euros + cents / 100);

            return {
                id: Date.now() + questionIdCounter++,
                level: 'B',
                type: 'compose-sum',
                question: `Compose exactement ${formatCurrency(targetAmount)} avec les pièces et billets.`,
                targetAmount: targetAmount,
                currencySettings: { difficulty: 1 },
            };
        }
    }
};

/**
 * Generates a Level C question (CE2/CM1).
 * Problèmes concrets et gestion de petits budgets.
 */
const generateLevelC = (): Question => {
    const questionType = randomInt(0, 3);

    switch(questionType) {
        case 0: {
            // Type 1: Calculer le total de plusieurs pièces/billets (4-6 items)
            const numItems = randomInt(4, 6);
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

            // Générer des distracteurs plausibles basés sur des erreurs de calcul courantes
            const errors = [1, -1, 2, -2, 5, -5, 10, -10];
            for(const error of errors.sort(() => Math.random() - 0.5)) {
                if(options.size >= 4) break;
                const distractor = roundToCent(Math.max(1, total + error));
                const hasCents = total % 1 !== 0;
                if(!hasCents && distractor % 1 !== 0) {
                    continue;
                }
                options.add(formatCurrency(distractor));
            }

            return {
                id: Date.now() + questionIdCounter++,
                level: 'C',
                type: 'qcm',
                question: `Calcule le total de toutes ces pièces et billets.`,
                items: itemsToShow,
                options: Array.from(options).sort(() => Math.random() - 0.5),
                answer: formatCurrency(total),
                currencySettings: { difficulty: 2 },
            };
        }
        case 1: {
            // Type 2: Achat d'un objet - combien ça coûte ?
            const price = roundToCent(randomInt(3, 20) + [0, 0.50, 0.95][randomInt(0, 2)]);

            const options = new Set<string>();
            options.add(formatCurrency(price));

            // Générer des distracteurs plausibles
            const errors = [0.50, -0.50, 1, -1, 2, -2, 5, -5];
            for(const error of errors.sort(() => Math.random() - 0.5)) {
                if(options.size >= 4) break;
                const distractor = roundToCent(Math.max(0.50, price + error));
                options.add(formatCurrency(distractor));
            }

            const items = ["livre", "jeu", "ballon", "peluche", "puzzle"];
            const item = items[randomInt(0, items.length - 1)];

            return {
                id: Date.now() + questionIdCounter++,
                level: 'C',
                type: 'qcm',
                question: `Tu veux acheter un ${item} qui coûte ${formatCurrency(price)}. Combien vas-tu payer ?`,
                options: Array.from(options).sort(() => Math.random() - 0.5),
                answer: formatCurrency(price),
                currencySettings: { difficulty: 2 },
            };
        }
        case 2: {
            // Type 3: Composer une somme de difficulté moyenne (10-30€)
            const euros = randomInt(10, 30);
            const cents = [0, 50][randomInt(0, 1)];
            const targetAmount = roundToCent(euros + cents / 100);

            return {
                id: Date.now() + questionIdCounter++,
                level: 'C',
                type: 'compose-sum',
                question: `Compose exactement ${formatCurrency(targetAmount)} avec les pièces et billets.`,
                targetAmount: targetAmount,
                currencySettings: { difficulty: 2 },
            };
        }
        default: {
            // Type 4: Addition de 3-4 montants simples
            const numPrices = randomInt(3, 4);
            const prices: number[] = [];
            let total = 0;

            for(let i = 0; i < numPrices; i++) {
                const price = roundToCent(randomInt(2, 8) + [0, 0.50][randomInt(0, 1)]);
                prices.push(price);
                total += price;
            }
            total = roundToCent(total);

            const priceList = prices.map(p => formatCurrency(p)).join(" + ");

            const options = new Set<string>();
            options.add(formatCurrency(total));

            // Générer des distracteurs plausibles
            const errors = [0.50, -0.50, 1, -1, 2, -2, 5, -5];
            for(const error of errors.sort(() => Math.random() - 0.5)) {
                if(options.size >= 4) break;
                const distractor = roundToCent(Math.max(1, total + error));
                const hasCents = total % 1 !== 0;
                if(!hasCents && distractor % 1 !== 0) {
                    continue;
                }
                options.add(formatCurrency(distractor));
            }

            return {
                id: Date.now() + questionIdCounter++,
                level: 'C',
                type: 'qcm',
                question: `Calcule : ${priceList} = ?`,
                options: Array.from(options).sort(() => Math.random() - 0.5),
                answer: formatCurrency(total),
                currencySettings: { difficulty: 2 },
            };
        }
    }
};

/**
 * Generates a Level D question (CM2/6ème).
 * Rendre la monnaie et calculs complexes.
 */
const generateLevelD = (): Question => {
    const questionType = randomInt(0, 2);

    switch(questionType) {
        case 0: {
            // Type 1: Calculer la monnaie à rendre (QCM)
            const cost = roundToCent(randomInt(5, 35) + [0.25, 0.50, 0.75, 0.95][randomInt(0, 3)]);
            const possiblePayments = [10, 20, 50].filter(p => p > cost);
            const payment = possiblePayments[randomInt(0, possiblePayments.length - 1)];
            const change = roundToCent(payment - cost);

            const options = new Set<string>();
            options.add(formatCurrency(change));

            // Générer des distracteurs plausibles (erreurs courantes : oublier des centimes, se tromper dans la soustraction)
            const errors = [0.05, -0.05, 0.25, -0.25, 0.50, -0.50, 1, -1, 5, -5];
            for(const error of errors.sort(() => Math.random() - 0.5)) {
                if(options.size >= 4) break;
                const distractor = roundToCent(Math.max(0.05, change + error));
                options.add(formatCurrency(distractor));
            }

            return {
                id: Date.now() + questionIdCounter++,
                level: 'D',
                type: 'qcm',
                question: `Un objet coûte ${formatCurrency(cost)}. Tu paies avec un billet de ${formatCurrency(payment)}. Combien te rend-on ?`,
                options: Array.from(options).sort(() => Math.random() - 0.5),
                answer: formatCurrency(change),
                currencySettings: { difficulty: 3 },
            };
        }
        case 1: {
            // Type 2: Composer la monnaie à rendre
            const cost = roundToCent(randomInt(5, 25) + [0.50, 0.75, 0.95][randomInt(0, 2)]);
            const possiblePayments = [10, 20, 50].filter(p => p > cost);
            const payment = possiblePayments[randomInt(0, possiblePayments.length - 1)];
            const paymentItem = allCurrency.find(c => c.value === payment);
            const change = roundToCent(payment - cost);

            return {
                id: Date.now() + questionIdCounter++,
                level: 'D',
                type: 'compose-sum',
                question: `Un article coûte ${formatCurrency(cost)}. Le client paie avec un billet de ${formatCurrency(payment)}. Compose la monnaie à lui rendre.`,
                targetAmount: change,
                cost: cost,
                paymentImages: paymentItem ? [{ name: paymentItem.name, image: paymentItem.image }] : [],
                currencySettings: { difficulty: 3 },
            };
        }
        default: {
            // Type 3: Composer une grande somme
            const euros = randomInt(30, 100);
            const cents = [0, 50][randomInt(0, 1)];
            const targetAmount = roundToCent(euros + cents / 100);

            return {
                id: Date.now() + questionIdCounter++,
                level: 'D',
                type: 'compose-sum',
                question: `Compose exactement ${formatCurrency(targetAmount)} avec les pièces et billets.`,
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

