import type { Question } from './questions';
import type { SkillLevel } from './skills';

// Utility functions
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const choice = <T>(arr: T[]): T => arr[randInt(0, arr.length - 1)];

// Define a type for a specific sub-skill/competency
export interface MentalMathCompetency {
    id: string;
    level: SkillLevel;
    description: string;
    generate: () => Omit<Question, 'id' | 'type' | 'level'>;
}

// LEVEL A Competencies
const competencesNiveauA: MentalMathCompetency[] = [
    {
        id: 'A1',
        level: 'A',
        description: 'Comptage simple (1-10)',
        generate: () => {
            const num = randInt(1, 10);
            return {
                question: `Lis ce nombre : ${num}`,
                answer: String(num),
                // This could be enhanced with audio later
            };
        }
    },
    {
        id: 'A2',
        level: 'A',
        description: 'Ajout d\'unités (résultat ≤ 9)',
        generate: () => {
            const a = randInt(1, 5);
            const b = randInt(1, 9 - a);
            return {
                question: `${a} + ${b} = ?`,
                answer: String(a + b),
            };
        }
    },
    {
        id: 'A3',
        level: 'A',
        description: 'Retrait d\'unités (résultat ≥ 0)',
        generate: () => {
            const a = randInt(2, 9);
            const b = randInt(1, a);
            return {
                question: `${a} - ${b} = ?`,
                answer: String(a - b),
            };
        }
    },
    {
        id: 'A4',
        level: 'A',
        description: 'Complément à 5 ou 10',
        generate: () => {
            const target = choice([5, 10]);
            const a = randInt(1, target - 1);
            return {
                question: `De ${a} pour aller à ${target} ?`,
                answer: String(target - a),
            };
        }
    },
];


// We will add other levels here later
export const allCompetencies: MentalMathCompetency[] = [
    ...competencesNiveauA,
    // ...competencesNiveauB,
    // ...competencesNiveauC,
    // ...competencesNiveauD,
];

// Main function to generate an adaptive question
// For now, it will just pick a random question from Level A.
// In the future, this function will take the student's history as an argument.
export function generateAdaptiveMentalMathQuestion(studentHistory: any[] = []): Question {
    // For now, ignore history and use Level A
    const competency = choice(competencesNiveauA);
    const questionData = competency.generate();

    return {
        id: Date.now() + Math.random(),
        type: 'qcm', // For now, all are simple input, we'll model this better later
        level: competency.level,
        ...questionData
    };
}
