
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
    generate: () => Omit<Question, 'id' | 'type' | 'level'| 'competencyId'>;
}

// --- LEVEL A Competencies ---
const competencesNiveauA: MentalMathCompetency[] = [
    {
        id: 'A1', level: 'A', description: 'Comptage simple (1-10)',
        generate: () => ({ question: `Lis ce nombre : ${randInt(1, 10)}`, answer: String(randInt(1, 10)) })
    },
    {
        id: 'A2', level: 'A', description: 'Ajout d’unités (résultat ≤ 9)',
        generate: () => { const a = randInt(1, 5); const b = randInt(1, 9 - a); return { question: `${a} + ${b} = ?`, answer: String(a + b) }; }
    },
    {
        id: 'A3', level: 'A', description: 'Retrait d’unités (résultat ≥ 0)',
        generate: () => { const a = randInt(2, 9); const b = randInt(1, a); return { question: `${a} - ${b} = ?`, answer: String(a - b) }; }
    },
    {
        id: 'A4', level: 'A', description: 'Complément à 5 ou 10',
        generate: () => { const target = choice([5, 10]); const a = randInt(1, target - 1); return { question: `De ${a} pour aller à ${target} ?`, answer: String(target - a) }; }
    },
];

// --- LEVEL B Competencies ---
const competencesNiveauB: MentalMathCompetency[] = [
    {
        id: 'B1', level: 'B', description: 'Additions sans retenue (< 30)',
        generate: () => { let a = randInt(1, 28); let b = randInt(1, 29 - a); if ((a % 10) + (b % 10) >= 10) { a = 11; b = 12; } return { question: `${a} + ${b} = ?`, answer: String(a + b) }; }
    },
    {
        id: 'B2', level: 'B', description: 'Additions avec retenue (< 100)',
        generate: () => { let a = randInt(10, 89); let b = randInt(10, 99 - a); if ((a % 10) + (b % 10) < 10) { a = 15; b = 16; } return { question: `${a} + ${b} = ?`, answer: String(a + b) }; }
    },
    {
        id: 'B3', level: 'B', description: 'Soustractions sans retenue (< 30)',
        generate: () => { let a = randInt(11, 30); let b = randInt(1, a); if (String(a).length === 2 && String(b).length === 2 && (a % 10) < (b % 10)) { a = 25; b = 12; } return { question: `${a} - ${b} = ?`, answer: String(a - b) }; }
    },
    {
        id: 'B4', level: 'B', description: 'Soustractions avec retenue (< 100)',
        generate: () => { let a = randInt(20, 99); let b = randInt(1, a); if (String(a).length === 2 && (a % 10) >= (b % 10)) { a = 42; b = 17; } return { question: `${a} - ${b} = ?`, answer: String(a - b) }; }
    },
    {
        id: 'B5', level: 'B', description: 'Tables d’addition (0-10)',
        generate: () => { const a = randInt(0, 10); const b = randInt(0, 10); return { question: `${a} + ${b} = ?`, answer: String(a + b) }; }
    },
    {
        id: 'B6', level: 'B', description: 'Tables de multiplication (0-10)',
        generate: () => { const a = randInt(0, 10); const b = randInt(0, 10); return { question: `${a} × ${b} = ?`, answer: String(a * b) }; }
    },
    {
        id: 'B7', level: 'B', description: 'Double (< 50)',
        generate: () => { const n = randInt(1, 50); return { question: `Double de ${n} ?`, answer: String(n * 2) }; }
    },
    {
        id: 'B8', level: 'B', description: 'Moitié (< 100)',
        generate: () => { const n = randInt(1, 50) * 2; return { question: `Moitié de ${n} ?`, answer: String(n / 2) }; }
    },
];

// --- LEVEL C Competencies ---
const competencesNiveauC: MentalMathCompetency[] = [
    {
        id: 'C1', level: 'C', description: 'Additions/soustractions jusqu’à 1 000',
        generate: () => { const a = randInt(100, 900); const b = randInt(100, 999 - a); return Math.random() > 0.5 ? { question: `${a} + ${b} = ?`, answer: String(a + b) } : { question: `${a + b} - ${a} = ?`, answer: String(b) }; }
    },
    {
        id: 'C2', level: 'C', description: 'Multiplication par 10, 100, 1 000',
        generate: () => { const a = randInt(1, 1000); const b = choice([10, 100, 1000]); return { question: `${a} × ${b} = ?`, answer: String(a * b) }; }
    },
    {
        id: 'C3', level: 'C', description: 'Divisions exactes',
        generate: () => { const divisor = randInt(2, 10); const quotient = randInt(10, 20); const dividend = divisor * quotient; return { question: `${dividend} ÷ ${divisor} = ?`, answer: String(quotient) }; }
    },
    {
        id: 'C4', level: 'C', description: 'Compléments à la centaine/millier',
        generate: () => { const target = choice([100, 1000]); const a = randInt(1, target - 1); return { question: `De ${a} pour aller à ${target} ?`, answer: String(target - a) }; }
    },
    {
        id: 'C5', level: 'C', description: 'Double/Moitié (< 1 000)',
        generate: () => { const isDouble = Math.random() > 0.5; if (isDouble) { const n = randInt(1, 500); return { question: `Double de ${n} ?`, answer: String(n * 2) }; } else { const n = randInt(1, 500) * 2; return { question: `Moitié de ${n} ?`, answer: String(n / 2) }; } }
    },
    {
        id: 'C6', level: 'C', description: 'Stratégie de décomposition (add)',
        generate: () => { const a = randInt(20, 80); const b = randInt(20, 80); return { question: `(Stratégie) ${a} + ${b} = ?`, answer: String(a + b) }; }
    },
];

// --- LEVEL D Competencies ---
const competencesNiveauD: MentalMathCompetency[] = [
    {
        id: 'D1', level: 'D', description: 'Opérations sur grands nombres',
        generate: () => { const a = randInt(1000, 10000); const b = randInt(1000, 10000); return { question: `${a} + ${b} = ?`, answer: String(a + b) }; }
    },
    {
        id: 'D2', level: 'D', description: 'Multiplication par décimaux simples',
        generate: () => { const a = randInt(10, 1000); const b = choice([0.5, 0.1, 10, 100]); return { question: `${a} × ${b} = ?`, answer: String(a * b) }; }
    },
    {
        id: 'D3', level: 'D', description: 'Division décimale simple',
        generate: () => { const divisor = choice([2, 4, 5, 10]); const a = randInt(1, 20) * divisor; return { question: `${a} ÷ ${divisor} = ?`, answer: String(a / divisor) }; }
    },
    {
        id: 'D4', level: 'D', description: 'Quart/Triple',
        generate: () => { const isTriple = Math.random() > 0.5; if (isTriple) { const n = randInt(10, 300); return { question: `Triple de ${n} ?`, answer: String(n * 3) }; } else { const n = randInt(10, 250) * 4; return { question: `Quart de ${n} ?`, answer: String(n / 4) }; } }
    },
    {
        id: 'D5', level: 'D', description: 'Fraction d\'un nombre',
        generate: () => { const divisor = choice([2, 3, 4, 5, 10]); const number = randInt(5, 50) * divisor; const numerator = randInt(1, divisor - 1); return { question: `${numerator}/${divisor} de ${number} ?`, answer: String((number * numerator) / divisor) }; }
    },
    {
        id: 'D6', level: 'D', description: 'Opérations sur décimaux',
        generate: () => { const a = randInt(1, 100) / 10; const b = randInt(1, 100) / 10; return { question: `${a} + ${b} = ?`.replace('.', ','), answer: String(a + b) }; }
    }
];


export const allCompetencies: MentalMathCompetency[] = [ ...competencesNiveauA, ...competencesNiveauB, ...competencesNiveauC, ...competencesNiveauD, ];
export const competenciesByLevel: Record<SkillLevel, MentalMathCompetency[]> = {
    'A': competencesNiveauA,
    'B': competencesNiveauB,
    'C': competencesNiveauC,
    'D': competencesNiveauD,
};
const levelOrder: SkillLevel[] = ['A', 'B', 'C', 'D'];

export type StudentPerformance = Record<string, { successes: number, failures: number }>;

// This is the core adaptive logic.
function getNextCompetency(lastCompetencyId: string | null, wasCorrect: boolean, performance: StudentPerformance): MentalMathCompetency {
    
    // On first question, start with the easiest
    if (!lastCompetencyId) {
        return competenciesByLevel['A'][0];
    }

    const lastCompetency = allCompetencies.find(c => c.id === lastCompetencyId);
    if (!lastCompetency) return competenciesByLevel['A'][0]; // Fallback

    const currentLevel = lastCompetency.level;
    const currentLevelIndex = levelOrder.indexOf(currentLevel);

    if (wasCorrect) {
        // SUCCESS: Try something harder
        const rand = Math.random();
        if (rand < 0.6) {
            // 60% chance to stay at the same level, different competency
            const otherCompetencies = competenciesByLevel[currentLevel].filter(c => c.id !== lastCompetencyId);
            return choice(otherCompetencies.length > 0 ? otherCompetencies : [lastCompetency]);
        } else if (rand < 0.9) {
            // 30% chance to move up a level (if not at max level)
            if (currentLevelIndex < levelOrder.length - 1) {
                const nextLevel = levelOrder[currentLevelIndex + 1];
                return choice(competenciesByLevel[nextLevel]);
            }
        }
        // 10% chance to repeat the same competency for reinforcement
        return lastCompetency;

    } else {
        // FAILURE: Try something easier
        const rand = Math.random();
        if (rand < 0.7) {
            // 70% chance to go down one level (if not at min level)
            if (currentLevelIndex > 0) {
                 const prevLevel = levelOrder[currentLevelIndex - 1];
                 return choice(competenciesByLevel[prevLevel]);
            }
        }
        // 30% chance to stay at the same level, different competency
        const otherCompetencies = competenciesByLevel[currentLevel].filter(c => c.id !== lastCompetencyId);
        return choice(otherCompetencies.length > 0 ? otherCompetencies : [lastCompetency]);
    }
}


export function generateAdaptiveMentalMathQuestion(lastCompetencyId: string | null, wasCorrect: boolean, performance: StudentPerformance): Question {
    const competency = getNextCompetency(lastCompetencyId, wasCorrect, performance);
    const questionData = competency.generate();

    return {
        id: Date.now() + Math.random(),
        type: 'qcm',
        level: competency.level,
        competencyId: competency.id,
        ...questionData
    };
}
