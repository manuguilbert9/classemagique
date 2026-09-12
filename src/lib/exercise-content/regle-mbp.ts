/**
 * Tirage des mots de la règle « m devant m, b, p ».
 *
 * Remonté du composant client vers le serveur pour que la sélection de mots
 * soit mémorisée et partagée entre les élèves.
 */

import { MBP_WORDS } from '@/data/orthographe/mbp-words';

export interface MbpQuestion {
    word: string;
    missingPart: string;
    correctLetter: 'n' | 'm';
}

const findMbpPattern = (word: string): { base: string, missing: string, correct: 'n' | 'm' } | null => {
    const lowerWord = word.toLowerCase();
    
    // Find 'm' before m, b, p
    let match = lowerWord.match(/(.*)m([mbp].*)/);
    if (match) {
        return { base: match[1], missing: match[2], correct: 'm' };
    }
    
    // Find 'n' not before m, b, p
    match = lowerWord.match(/(.*)n([^mbp\s].*)/);
    if (match) {
        return { base: match[1], missing: match[2], correct: 'n' };
    }

    // Find 'om' 'am' 'em' 'im' not followed by m,b,p (should be n) - less common but good for traps
    match = lowerWord.match(/(.*)(a|e|o|i)m([^mbp\s].*)/);
     if (match) {
         // This is a trap, the rule would say 'n'. This logic is complex.
         // Let's stick to simpler cases for now.
    }

    return null;
}

const generateQuestion = (): MbpQuestion => {
    let question: MbpQuestion | null = null;
    let attempts = 0;
    while (!question && attempts < 50) {
        const randomWord = MBP_WORDS[Math.floor(Math.random() * MBP_WORDS.length)];
        const pattern = findMbpPattern(randomWord);
        if (pattern) {
            question = {
                word: randomWord,
                missingPart: pattern.base + '___' + pattern.missing,
                correctLetter: pattern.correct
            };
        }
        attempts++;
    }
    
    // Fallback if no suitable word found
    if (!question) {
        return { word: "CHAMBRE", missingPart: "cha___bre", correctLetter: 'm' };
    }
    
    return question;
};

export function generateMbpQuestions(count: number): MbpQuestion[] {
  return Array.from({ length: count }, generateQuestion);
}
