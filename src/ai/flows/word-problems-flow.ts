'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// --- Input/Output Schemas ---

export const ProblemCategorySchema = z.enum([
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

// --- Prompts ---

const generateProblemPrompt = ai.definePrompt({
    name: 'generateProblemPrompt',
    input: { schema: GenerateProblemInputSchema },
    output: { schema: GeneratedProblemSchema },
    prompt: `You are a primary school teacher specializing in mathematics.
Your task is to generate a word problem for a student based on Vergnaud's classification.
The problem should be suitable for a child (6-10 years old).

Category: {{category}}
Difficulty: {{difficulty}}

Guidelines per category:
- problemes-transformation: Transformation of a state (Time/Chronology, finding initial state, final state, or transformation).
- problemes-composition: Whole/Parts (finding the whole or a missing part).
- problemes-comparaison: Comparison (Gap/Difference, "more than"/"less than").
- problemes-composition-transformation: Composition of transformations (Balance of actions, relative numbers).

Output requirements:
- The text must be in French.
- Keep the numbers simple (integers).
- The context should be familiar to a child (school, toys, fruits, money, etc.).
`,
});

const correctProblemPrompt = ai.definePrompt({
    name: 'correctProblemPrompt',
    input: { schema: CorrectProblemInputSchema },
    output: { schema: CorrectionFeedbackSchema },
    prompt: `You are a primary school teacher correcting a student's answer to a word problem.

Problem: {{problemText}}
Expected Result: {{expectedResult}}

Student Answer:
- Calculation: {{studentCalculation}}
- Result: {{studentResult}}
- Sentence: {{studentSentence}}

Your task:
1. Verify if the calculation is relevant to the problem and mathematically correct.
2. Verify if the result matches the expected result.
3. Verify if the sentence is complete, grammatically correct, and contains the answer with the unit.

Provide specific feedback for each part.
- If the calculation is wrong, explain why (e.g., "Tu as fait une addition mais il fallait une soustraction").
- If the result is wrong, check if it's a calculation error or a logic error.
- If the sentence is incomplete (missing verb, capital letter, unit), point it out.
- 'isCorrect' should be true ONLY if everything is correct.

Feedback must be in French, encouraging, and suitable for a child.
`,
});

// --- Flows ---

export const generateProblemFlow = ai.defineFlow(
    {
        name: 'generateProblemFlow',
        inputSchema: GenerateProblemInputSchema,
        outputSchema: GeneratedProblemSchema,
    },
    async (input) => {
        const { output } = await generateProblemPrompt(input);
        return output!;
    }
);

export const correctProblemFlow = ai.defineFlow(
    {
        name: 'correctProblemFlow',
        inputSchema: CorrectProblemInputSchema,
        outputSchema: CorrectionFeedbackSchema,
    },
    async (input) => {
        const { output } = await correctProblemPrompt(input);
        return output!;
    }
);

// --- Server Actions ---

export async function generateProblem(category: ProblemCategory, difficulty: 'easy' | 'medium' | 'hard' = 'easy'): Promise<GeneratedProblem> {
    return await generateProblemFlow({ category, difficulty });
}

export async function correctProblem(input: CorrectProblemInput): Promise<CorrectionFeedback> {
    return await correctProblemFlow(input);
}
