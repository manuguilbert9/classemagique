'use server';

import { validSchoolCalculation } from '@/lib/word-problem-math';
import { z } from 'zod';
import { PROBLEM_STOCK } from '@/lib/word-problems-data';

// --- Input/Output Schemas ---

const ProblemCategorySchema = z.enum([
    'problemes-transformation',
    'problemes-composition',
    'problemes-comparaison',
    'problemes-composition-transformation'
]);

export type ProblemCategory = z.infer<typeof ProblemCategorySchema>;

const GenerateProblemInputSchema = z.object({
    category: ProblemCategorySchema,
    difficulty: z.enum(['easy', 'medium', 'hard']).default('easy'),
});

export type GenerateProblemInput = z.infer<typeof GenerateProblemInputSchema>;

const GeneratedProblemSchema = z.object({
    text: z.string().describe('The text of the word problem.'),
    data: z.array(z.number()).describe('The numbers involved in the problem.'),
    expectedOperation: z.enum(['addition', 'subtraction']).describe('The operation expected to solve the problem.'),
    expectedResult: z.number().describe('The correct numerical result.'),
    unit: z.string().describe('The unit of the answer (e.g., "pommes", "euros", "billes").'),
});

export type GeneratedProblem = z.infer<typeof GeneratedProblemSchema>;

const CorrectProblemInputSchema = z.object({
    problemText: z.string(),
    studentCalculation: z.string().describe('The calculation written by the student (e.g., "5 + 3").'),
    studentResult: z.number().describe('The result found by the student.'),
    studentSentence: z.string().describe('The answer sentence written by the student.'),
    expectedResult: z.number(),
    expectedData: z.array(z.number()).optional(),
    expectedOperation: z.enum(['addition', 'subtraction']).optional(),
});

export type CorrectProblemInput = z.infer<typeof CorrectProblemInputSchema>;

const CorrectionFeedbackSchema = z.object({
    isCorrect: z.boolean().describe('True if the student solved the problem correctly (calculation, result, and sentence).'),
    calculationFeedback: z.string().describe('Feedback on the calculation. Empty if correct.'),
    resultFeedback: z.string().describe('Feedback on the numerical result. Empty if correct.'),
    sentenceFeedback: z.string().describe('Feedback on the answer sentence. Empty if correct.'),
    generalFeedback: z.string().describe('Encouraging feedback or explanation of the error.'),
});

export type CorrectionFeedback = z.infer<typeof CorrectionFeedbackSchema>;

// --- Server Actions ---

export async function generateProblem(category: ProblemCategory, difficulty: 'easy' | 'medium' | 'hard' = 'easy'): Promise<GeneratedProblem> {
    if (difficulty === 'easy' && category !== 'problemes-composition-transformation') {
        const stock = PROBLEM_STOCK[category];
        return stock[Math.floor(Math.random() * stock.length)];
    }
    const a = difficulty === 'hard' ? 100 + Math.floor(Math.random() * 800) : 20 + Math.floor(Math.random() * 70);
    const b = difficulty === 'hard' ? 30 + Math.floor(Math.random() * 150) : 10 + Math.floor(Math.random() * 30);
    const subtract = category === 'problemes-comparaison' || Math.random() < 0.5;
    if (category === 'problemes-composition-transformation') {
        const gain = difficulty === 'hard' ? b : a;
        const loss = difficulty === 'hard' ? a + b : b;
        return { text: `Une équipe gagne ${gain} points puis perd ${loss} points. Quel est son bilan net ? Écris un nombre négatif si elle a perdu des points au total.`, data: [gain, loss], expectedOperation: 'subtraction', expectedResult: gain - loss, unit: 'points' };
    }
    const high = Math.max(a, b), low = Math.min(a, b);
    const text = category === 'problemes-transformation'
      ? (subtract ? `La bibliothèque avait ${high} livres. Elle en prête ${low}. Combien en reste-t-il ?` : `La bibliothèque avait ${a} livres. Elle en reçoit ${b}. Combien en a-t-elle maintenant ?`)
      : category === 'problemes-comparaison'
      ? `Lina a ${high} cartes et Sami en a ${low}. Combien de cartes Lina a-t-elle de plus que Sami ?`
      : (subtract ? `Il y a ${high} élèves, dont ${low} filles. Combien y a-t-il de garçons ?` : `Un club compte ${a} filles et ${b} garçons. Combien y a-t-il d'élèves en tout ?`);
    return { text, data: subtract ? [high, low] : [a, b], expectedOperation: subtract ? 'subtraction' : 'addition', expectedResult: subtract ? high-low : a+b, unit: category === 'problemes-transformation' ? 'livres' : category === 'problemes-comparaison' ? 'cartes' : 'élèves' };
}

export async function correctProblem(input: CorrectProblemInput): Promise<CorrectionFeedback> {
    const parsed = CorrectProblemInputSchema.parse(input);
    const calculationCorrect = validSchoolCalculation(parsed.studentCalculation, parsed.expectedResult, parsed.expectedData, parsed.expectedOperation);
    const resultCorrect = Number.isFinite(parsed.studentResult) && Math.abs(parsed.studentResult - parsed.expectedResult) < 1e-8;
    return {
        isCorrect: calculationCorrect && resultCorrect,
        calculationFeedback: calculationCorrect ? '' : "Vérifie les nombres de l'énoncé et les signes de ton calcul.",
        resultFeedback: resultCorrect ? '' : 'Vérifie le résultat de ton calcul.',
        sentenceFeedback: parsed.studentSentence.trim() ? '' : "Tu peux compléter ta réponse avec une phrase et l'unité. Cela ne change pas ta réussite en mathématiques.",
        generalFeedback: calculationCorrect && resultCorrect ? 'Ton raisonnement numérique et ton résultat sont corrects !' : 'Reprends les données du problème et essaie encore.',
    };
}
