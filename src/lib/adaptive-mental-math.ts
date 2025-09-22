
'use server';

import type { Question } from './questions';
import type { SkillLevel } from './skills';

// Utility functions
const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const choice = <T>(arr: T[]): T => arr[randInt(0, arr.length - 1)];

// Define a type for a specific sub-skill/competency
export interface MentalMathCompetency {
    id: string;
    level: SkillLevel; // A, B, C, D for broad categorization
    description: string;
    generate: () => Omit<Question, 'id' | 'type' | 'level'| 'competencyId'>;
}

export type DisplayableMentalMathCompetency = Omit<MentalMathCompetency, 'generate'>;

export type StudentPerformance = Record<string, {
    attempts: ('success' | 'failure')[];
}>;

// --- New Granular Competencies ---

const allCompetencies: MentalMathCompetency[] = [
    // --- Level A ---
    { id: 'A1', level: 'A', description: 'Compter oralement jusqu\'à 10', generate: () => { const a = randInt(1,9); return { question: `Quel nombre vient après ${a} ?`, answer: String(a + 1) }; } },
    { id: 'A2', level: 'A', description: 'Compter oralement jusqu\'à 30', generate: () => { const a = randInt(1,29); return { question: `Quel nombre vient après ${a} ?`, answer: String(a + 1) }; } },
    { id: 'A3', level: 'A', description: 'Dénombrer des collections jusqu\'à 10', generate: () => { const count = randInt(1,10); return { question: `Combien y a-t-il de cercles ? ${'● '.repeat(count)}`, answer: String(count) }; } },
    { id: 'A4', level: 'A', description: 'Ajouter ou retirer 1 ou 2', generate: () => { const a = randInt(3, 20); const b = choice([1, 2]); return Math.random() > 0.5 ? { question: `${a} + ${b} = ?`, answer: String(a + b) } : { question: `${a} - ${b} = ?`, answer: String(a - b) }; } },
    { id: 'A5', level: 'A', description: 'Maîtriser les compléments à 10', generate: () => { const a = randInt(1, 9); return { question: `${a} + ? = 10`, answer: String(10 - a) } } },
    { id: 'A6', level: 'A', description: 'Maîtriser les compléments à 5', generate: () => { const a = randInt(1, 4); return { question: `${a} + ? = 5`, answer: String(5 - a) } } },
    { id: 'A7', level: 'A', description: 'Ajouter ou retirer 5', generate: () => { const a = randInt(6, 20); return Math.random() > 0.5 ? { question: `${a} + 5 = ?`, answer: String(a + 5) } : { question: `${a} - 5 = ?`, answer: String(a - 5) }; } },
    { id: 'A8', level: 'A', description: 'Ajouter ou retirer 10', generate: () => { const a = randInt(11, 20); return Math.random() > 0.5 ? { question: `${a} + 10 = ?`, answer: String(a + 10) } : { question: `${a} - 10 = ?`, answer: String(a - 10) }; } },

    // --- Level B ---
    { id: 'B1', level: 'B', description: 'Dénombrer jusqu\'à 100', generate: () => { const a = randInt(30,99); return { question: `Quel nombre vient après ${a} ?`, answer: String(a + 1) }; } },
    { id: 'B2', level: 'B', description: 'Valeur de position (unités, dizaines)', generate: () => { const n = randInt(10, 99); const type = choice(['dizaines', 'unités']); const ans = type === 'dizaines' ? Math.floor(n/10) : n % 10; return { question: `Quel est le chiffre des ${type} dans ${n} ?`, answer: String(ans) }; } },
    { id: 'B3', level: 'B', description: 'Ajouter unités à dizaines entières', generate: () => { const a = randInt(1, 9) * 10; const b = randInt(1, 9); return { question: `${a} + ${b} = ?`, answer: String(a+b) }; } },
    { id: 'B4', level: 'B', description: 'Additions simples (< 20)', generate: () => { const a = randInt(1, 18); const b = randInt(1, 19-a); return { question: `${a} + ${b} = ?`, answer: String(a+b) }; } },
    { id: 'B5', level: 'B', description: 'Soustractions simples (résultat >= 0)', generate: () => { const a = randInt(5, 19); const b = randInt(1, a); return { question: `${a} - ${b} = ?`, answer: String(a-b) }; } },
    { id: 'B6', level: 'B', description: 'Tables d\'addition', generate: () => { const a = randInt(1, 10); const b = randInt(1, 10); return { question: `${a} + ${b} = ?`, answer: String(a+b) }; } },
    { id: 'B7', level: 'B', description: 'Doubles des nombres jusqu\'à 10', generate: () => { const a = randInt(1, 10); return { question: `Double de ${a} ?`, answer: String(a*2) }; } },
    { id: 'B8', level: 'B', description: 'Moitiés des nombres pairs jusqu\'à 20', generate: () => { const a = randInt(1, 10) * 2; return { question: `Moitié de ${a} ?`, answer: String(a/2) }; } },
    { id: 'B9', level: 'B', description: 'Ajouter/retirer des dizaines entières', generate: () => { const a = randInt(2, 9) * 10; const b = randInt(1, Math.floor(a/10)) * 10; return Math.random() > 0.5 ? { question: `${a} + ${b} = ?`, answer: String(a+b) } : { question: `${a} - ${b} = ?`, answer: String(a-b) }; } },
    { id: 'B10', level: 'B', description: 'Additions/soustractions sans retenue', generate: () => { let a = randInt(21,98); let b = randInt(11, a-11); if ((a%10) < (b%10) || (a%10)+(b%10) > 9) return allCompetencies.find(c=>c.id==='B10')!.generate(); return Math.random() > 0.5 ? { question: `${a} + ${b} = ?`, answer: String(a+b) } : { question: `${a} - ${b} = ?`, answer: String(a-b) }; } },
    
    // --- Level C ---
    { id: 'C1', level: 'C', description: 'Valeur de position (centaines)', generate: () => { const n = randInt(100, 999); const type = choice(['centaines', 'dizaines']); const ans = type === 'centaines' ? Math.floor(n/100) : Math.floor((n%100)/10); return { question: `Quel est le chiffre des ${type} dans ${n} ?`, answer: String(ans) }; } },
    { id: 'C2', level: 'C', description: 'Dénombrer jusqu\'à 1 000', generate: () => { const a = randInt(100,999); return { question: `Quel nombre vient après ${a} ?`, answer: String(a + 1) }; } },
    { id: 'C3', level: 'C', description: 'Doubles (jusqu\'à 50 et dizaines)', generate: () => { const a = Math.random() > 0.5 ? randInt(11, 50) : randInt(1, 9) * 10; return { question: `Double de ${a} ?`, answer: String(a*2) }; } },
    { id: 'C4', level: 'C', description: 'Moitiés des nombres (< 100)', generate: () => { const a = randInt(1, 50) * 2; return { question: `Moitié de ${a} ?`, answer: String(a/2) }; } },
    { id: 'C5', level: 'C', description: 'Ajouter/retirer des centaines entières', generate: () => { const a = randInt(2, 9) * 100; const b = randInt(1, Math.floor(a/100)) * 100; return Math.random() > 0.5 ? { question: `${a} + ${b} = ?`, answer: String(a+b) } : { question: `${a} - ${b} = ?`, answer: String(a-b) }; } },
    { id: 'C6', level: 'C', description: 'Addition par décomposition', generate: () => { const a = randInt(21, 88); const b = randInt(11, 99-a); return { question: `${a} + ${b} = ?`, answer: String(a+b) }; } },
    { id: 'C7', level: 'C', description: 'Addition par compensation', generate: () => { const a = randInt(21, 88); const b = randInt(1, 9) + (choice([1,2,3,4,5,6,7,8]) * 10); return { question: `${a} + ${b} = ?`, answer: String(a+b) }; } },
    { id: 'C8', level: 'C', description: 'Soustraction par jalonnement', generate: () => { const a = randInt(51, 99); const b = randInt(11, a-20); return { question: `${a} - ${b} = ?`, answer: String(a-b) }; } },
    { id: 'C9', level: 'C', description: 'Compléter à la centaine/millier', generate: () => { const target = choice([100, 1000]); const a = randInt(Math.floor(target/2), target-1); return { question: `${a} + ? = ${target}`, answer: String(target - a) }; } },
    { id: 'C10', level: 'C', description: 'Tables de multiplication (0-10)', generate: () => { const a = randInt(0, 10); const b = randInt(0, 10); return { question: `${a} × ${b} = ?`, answer: String(a * b) }; } },
    { id: 'C11', level: 'C', description: 'Multiplier par 10, 100, 1000', generate: () => { const a = randInt(1, 500); const b = choice([10, 100, 1000]); return { question: `${a} × ${b} = ?`, answer: String(a * b) }; } },
    { id: 'C12', level: 'C', description: 'Divisions exactes (tables)', generate: () => { const b = randInt(2, 10); const quotient = randInt(2, 10); const a = b * quotient; return { question: `${a} ÷ ${b} = ?`, answer: String(quotient) }; } },

    // --- Level D ---
    { id: 'D1', level: 'D', description: 'Multiplier par 5, 25, 50', generate: () => { const b = choice([5, 25, 50]); const a = randInt(2, 40); return { question: `${a} × ${b} = ?`, answer: String(a * b) }; } },
    { id: 'D2', level: 'D', description: 'Calculer 10% d\'un nombre', generate: () => { const a = randInt(1, 100) * 10; return { question: `10% de ${a} ?`, answer: String(a * 0.1) }; } },
    { id: 'D3', level: 'D', description: 'Calculer 25%, 50%, 75% d\'un nombre', generate: () => { const a = randInt(1, 25) * 4; const p = choice([25, 50, 75]); return { question: `${p}% de ${a} ?`, answer: String(a * (p/100)) }; } },
    { id: 'D4', level: 'D', description: 'Calculer une fraction simple d\'un nombre', generate: () => { const d = choice([2, 3, 4, 5]); const n = randInt(1, d-1); const a = randInt(2, 10) * d; return { question: `${n}/${d} de ${a} ?`, answer: String(a*n/d) }; } },
    { id: 'D5', level: 'D', description: 'Addition/soustraction de décimaux simples', generate: () => { const a = randInt(1, 500)/10; const b = randInt(1, 500)/10; return Math.random() > 0.5 ? { question: `${String(a).replace('.',',')} + ${String(b).replace('.',',')} = ?`, answer: String(a+b) } : { question: `${String(Math.max(a,b)).replace('.',',')} - ${String(Math.min(a,b)).replace('.',',')} = ?`, answer: String(Math.max(a,b) - Math.min(a,b)) }; } },
    { id: 'D6', level: 'D', description: 'Carrés parfaits (1-12)', generate: () => { const a = randInt(1, 12); return { question: `${a}² = ?`, answer: String(a*a) }; } },
    { id: 'D7', level: 'D', description: 'Critères de divisibilité', generate: () => { const d = choice([2, 3, 5, 9, 10]); const isDivisible = Math.random() > 0.5; let n; if(isDivisible) { n = randInt(2,100)*d; } else { n = randInt(10, 500); if(n%d===0) n++; } return { question: `${n} est-il divisible par ${d} ?`, answer: isDivisible ? 'oui' : 'non' }; } },
    { id: 'D8', level: 'D', description: 'Multiplier/diviser par 0.1, 0.5', generate: () => { const b = choice([0.1, 0.5]); const a = randInt(10, 200); return Math.random() > 0.5 ? { question: `${a} × ${b} = ?`, answer: String(a*b) } : { question: `${a} ÷ ${b} = ?`, answer: String(a/b) }; } },
];


const levelOrder: SkillLevel[] = ['A', 'B', 'C', 'D'];

const isAcquired = (attempts: ('success' | 'failure')[]): boolean => {
    if (!attempts || attempts.length === 0) return false;

    const lastFailureIndex = attempts.lastIndexOf('failure');
    // Case 1: No failures, need at least 4 successes
    if (lastFailureIndex === -1) {
        return attempts.length >= 4;
    }
    // Case 2: There was a failure, check for 4 consecutive successes after it
    const successesAfterLastFailure = attempts.slice(lastFailureIndex + 1);
    return successesAfterLastFailure.length >= 4 && successesAfterLastFailure.every(a => a === 'success');
};


// This is the core adaptive logic.
function getNextCompetency(performance: StudentPerformance): MentalMathCompetency {
    
    // Find all competencies that are "in progress" (attempted but not yet acquired)
    const inProgressCompetencies = allCompetencies.filter(c => {
        const perf = performance[c.id];
        return perf && perf.attempts && perf.attempts.length > 0 && !isAcquired(perf.attempts);
    });

    if (inProgressCompetencies.length > 0) {
        // Prioritize competencies that are currently being worked on
        return choice(inProgressCompetencies);
    }

    // If no competencies are "in progress", find the first one not yet acquired
    for (const competency of allCompetencies) {
        const perf = performance[competency.id];
        if (!perf || !perf.attempts || !isAcquired(perf.attempts)) {
            return competency;
        }
    }
    
    // If all are mastered, return a random one from the highest level.
    const highestLevelCompetencies = allCompetencies.filter(c => c.level === 'D');
    return choice(highestLevelCompetencies);
}


export async function generateAdaptiveMentalMathQuestion(performance: StudentPerformance): Promise<Question> {
    const competency = getNextCompetency(performance);
    const questionData = competency.generate();

    return {
        id: Date.now() + Math.random(),
        type: 'qcm', // Default type, can be overridden by generator
        level: competency.level,
        competencyId: competency.id,
        ...questionData
    };
}


export async function getAdaptiveMentalMathCompetencies(): Promise<DisplayableMentalMathCompetency[]> {
    // Return all competencies but without the `generate` function, which cannot be sent to the client.
    return allCompetencies.map(({ generate, ...rest }) => rest);
}
