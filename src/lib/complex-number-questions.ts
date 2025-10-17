
'use server';

import type { Question } from './questions';
import { numberToFrench } from './utils';

// Helper function to generate trap numbers for a given answer
function generateTraps(answerNumber: number, count: number): Set<number> {
    const traps = new Set<number>([answerNumber]);
    const tens = Math.floor(answerNumber / 10) * 10;
    const ones = answerNumber % 10;

    // Piège voisin (n-1, n+1)
    if (answerNumber > 0) traps.add(answerNumber - 1);
    if (answerNumber < 99) traps.add(answerNumber + 1);

    // Pièges spécifiques aux nombres complexes (60-99)
    if (answerNumber >= 60) {
        // Piège de dizaine (70 vs 90, 80 vs 90)
        if (tens === 70) traps.add(90 + ones);
        if (tens === 80) traps.add(90 + ones);
        if (tens === 90) {
            traps.add(70 + ones);
            traps.add(80 + ones);
        }
        if (tens === 60) traps.add(70 + ones);

        // Piège de structure morphologique (72 vs 92, 62 vs 72)
        if (ones === 2) {
            if (tens === 70) traps.add(92);
            if (tens === 90) traps.add(72);
            if (tens >= 60) traps.add(62);
        }

        // Piège d'inversion (67 vs 76)
        if (ones > 0 && ones <= 9) {
            const invertedTens = ones * 10;
            const invertedOnes = Math.floor(tens / 10);
            const inverted = invertedTens + invertedOnes;
            if (inverted >= 0 && inverted <= 99 && inverted !== answerNumber) {
                traps.add(inverted);
            }
        }
    }

    // Pièges pour les nombres 20-59
    if (answerNumber >= 20 && answerNumber < 60) {
        // Confusion de dizaine (23 vs 33 vs 43)
        const otherTens = [20, 30, 40, 50].filter(t => t !== tens);
        otherTens.forEach(t => {
            if (ones > 0) traps.add(t + ones);
        });
    }

    // Compléter avec des nombres aléatoires dans la même gamme si nécessaire
    let attempts = 0;
    while (traps.size < count && attempts < 50) {
        let randomNum: number;
        if (answerNumber < 20) {
            randomNum = Math.floor(Math.random() * 21);
        } else if (answerNumber < 60) {
            randomNum = Math.floor(Math.random() * 39) + 21;
        } else {
            randomNum = Math.floor(Math.random() * 40) + 60;
        }
        traps.add(randomNum);
        attempts++;
    }

    return traps;
}

// Generates questions for the "nombres-complexes" skill
// Covers multiple ranges: 0-20 (simple), 21-59 (intermediate), 60-99 (complex)
export async function generateNombresComplexesQuestion(): Promise<Question> {
    const questionType = Math.random();

    // Select number range with weighted probability
    // 20% for 0-20, 30% for 21-59, 50% for 60-99 (most challenging)
    const rangeSelector = Math.random();
    let answerNumber: number;

    if (rangeSelector < 0.2) {
        answerNumber = Math.floor(Math.random() * 21); // 0-20
    } else if (rangeSelector < 0.5) {
        answerNumber = Math.floor(Math.random() * 39) + 21; // 21-59
    } else {
        answerNumber = Math.floor(Math.random() * 40) + 60; // 60-99
    }

    const answerText = String(answerNumber);
    const answerAudio = numberToFrench[answerNumber] || answerText;

    // 1. Dictée de nombres
    if (questionType < 0.25) {
        return {
            id: Date.now(),
            level: 'B',
            type: 'audio-to-text-input',
            question: "Écris en chiffres le nombre que tu entends.",
            textToSpeak: answerAudio,
            answer: answerText,
            answerInWords: answerAudio
        };
    }
    // 2. Écrit vers oral
    else if (questionType < 0.5) {
        const options = generateTraps(answerNumber, 4);

        return {
            id: Date.now(),
            level: 'B',
            type: 'written-to-audio-qcm',
            question: "Comment se prononce ce nombre ?",
            answer: answerText,
            textToSpeak: answerText,
            optionsWithAudio: Array.from(options).sort(() => Math.random() - 0.5).map(num => ({
                text: String(num),
                audio: numberToFrench[num] || String(num)
            }))
        };
    }
    // 3. Oral vers écrit
    else {
        const options = generateTraps(answerNumber, 4);

        return {
            id: Date.now(),
            level: 'B',
            type: 'audio-qcm',
            question: "Clique sur le nombre que tu entends.",
            options: Array.from(options).map(String).sort(() => Math.random() - 0.5),
            answer: answerText,
            textToSpeak: answerAudio,
        };
    }
}
