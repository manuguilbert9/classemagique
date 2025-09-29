'use server';
/**
 * @fileOverview An AI flow to provide sentence completion suggestions.
 *
 * - suggestSentenceCompletion - A function that takes a partial sentence and returns completion suggestions.
 * - SentenceCompletionInput - The input type for the suggestSentenceCompletion function.
 * - SentenceCompletionOutput - The return type for the suggestSentenceCompletion function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const SentenceCompletionInputSchema = z.object({
  text: z.string().describe('The beginning of the sentence to complete.'),
});
export type SentenceCompletionInput = z.infer<typeof SentenceCompletionInputSchema>;

const SentenceCompletionOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('An array of short, relevant sentence completions.'),
});
export type SentenceCompletionOutput = z.infer<typeof SentenceCompletionOutputSchema>;

const prompt = ai.definePrompt({
  name: 'sentenceCompletionPrompt',
  input: { schema: SentenceCompletionInputSchema },
  output: { schema: SentenceCompletionOutputSchema },
  prompt: `You are an expert in French grammar and syntax, specializing in helping elementary school children.
Your task is to provide 2 or 3 short, simple, and logical ways to complete the given sentence fragment.
The completions should be natural continuations of the sentence.
Do not repeat the input text in your suggestions. Provide only the part that completes the sentence.
Keep the suggestions concise (a few words).

Sentence fragment to complete: "{{text}}"
`,
});

const sentenceCompletionFlow = ai.defineFlow(
  {
    name: 'sentenceCompletionFlow',
    inputSchema: SentenceCompletionInputSchema,
    outputSchema: SentenceCompletionOutputSchema,
  },
  async (input) => {
    // Ensure we don't send empty requests
    if (!input.text.trim()) {
      return { suggestions: [] };
    }
    const { output } = await prompt(input);
    return output!;
  }
);

export async function suggestSentenceCompletion(input: SentenceCompletionInput): Promise<SentenceCompletionOutput> {
  return await sentenceCompletionFlow(input);
}
