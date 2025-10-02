'use server';
/**
 * @fileOverview AI flow for validating agreement path exercises.
 * Validates if a constructed sentence has correct grammatical agreements.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ValidateAccordInputSchema = z.object({
  userSentence: z.string().describe('The sentence constructed by the student by selecting words.'),
  level: z.enum(['B', 'C']).describe('The difficulty level (B: simple sentences, C: complex sentences).'),
});
export type ValidateAccordInput = z.infer<typeof ValidateAccordInputSchema>;

const ValidateAccordOutputSchema = z.object({
  isCorrect: z.boolean().describe('True if the sentence has correct grammatical agreements, otherwise false.'),
  feedback: z.string().describe('Short, encouraging feedback explaining why the sentence is correct or what agreement error was made. En français.'),
  errors: z.array(z.string()).optional().describe('List of specific agreement errors found (e.g., "Le verbe doit s\'accorder avec le sujet pluriel").'),
});
export type ValidateAccordOutput = z.infer<typeof ValidateAccordOutputSchema>;

const validateAccordPrompt = ai.definePrompt({
  name: 'validateAccordPrompt',
  input: { schema: ValidateAccordInputSchema },
  output: { schema: ValidateAccordOutputSchema },
  prompt: `Tu es un professeur de français expert en grammaire. Tu évalues les accords grammaticaux dans une phrase construite par un élève.

Niveau : {{level}}
Phrase de l'élève : "{{userSentence}}"

Évalue UNIQUEMENT les accords grammaticaux :
1. **Accords dans le groupe nominal (GN)** : déterminant, nom, adjectif doivent s'accorder en genre et en nombre
2. **Accords sujet-verbe** : le verbe doit s'accorder avec son sujet

Critères de validation :
- **isCorrect** : 'true' SEULEMENT si TOUS les accords sont parfaits
- **feedback** : Une phrase courte et bienveillante
  - Si correct: "Bravo ! Tous les accords sont parfaits." ou "Excellent travail, la phrase est bien accordée !"
  - Si incorrect: Explique simplement l'erreur (ex: "Le verbe doit s'accorder avec le sujet pluriel." ou "L'adjectif doit s'accorder avec le nom féminin.")
- **errors** : Liste des erreurs d'accord spécifiques trouvées

Note : Ignore la ponctuation, la cohérence sémantique, ou l'orthographe des mots. Concentre-toi UNIQUEMENT sur les accords.`,
});

const validateAccordFlow = ai.defineFlow(
  {
    name: 'validateAccordFlow',
    inputSchema: ValidateAccordInputSchema,
    outputSchema: ValidateAccordOutputSchema,
  },
  async (input) => {
    const { output } = await validateAccordPrompt(input);
    return output!;
  }
);

export async function validateAccordSentence(input: ValidateAccordInput): Promise<ValidateAccordOutput> {
  return validateAccordFlow(input);
}
