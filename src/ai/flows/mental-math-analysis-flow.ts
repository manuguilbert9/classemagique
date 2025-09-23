
'use server';
/**
 * @fileOverview An AI flow to analyze a student's mental math performance.
 *
 * - analyzeMentalMathPerformance: Takes performance data and returns a prose analysis.
 * - MentalMathPerformanceInput - The input type for the analysis function.
 * - MentalMathAnalysisOutput - The return type for the analysis function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getAdaptiveMentalMathCompetencies, type MentalMathCompetency } from '@/lib/adaptive-mental-math';

const CompetencyPerformanceSchema = z.object({
  id: z.string(),
  description: z.string(),
  successes: z.number(),
  failures: z.number(),
});
export type CompetencyPerformance = z.infer<typeof CompetencyPerformanceSchema>;

const MentalMathPerformanceInputSchema = z.object({
  performance: z.array(CompetencyPerformanceSchema).describe("An array of the student's performance on various mental math competencies."),
});
export type MentalMathPerformanceInput = z.infer<typeof MentalMathPerformanceInputSchema>;

const MentalMathAnalysisOutputSchema = z.object({
    analysis: z.string().describe("A short, encouraging, and descriptive analysis of the student's mental math skills, written in prose for the student. En français.")
});
export type MentalMathAnalysisOutput = z.infer<typeof MentalMathAnalysisOutputSchema>;

const prompt = ai.definePrompt({
  name: 'mentalMathAnalysisPrompt',
  input: { schema: MentalMathPerformanceInputSchema },
  output: { schema: MentalMathAnalysisOutputSchema },
  prompt: `Tu es un professeur de mathématiques bienveillant et expert en pédagogie. Ton rôle est d'analyser les résultats d'un élève à un exercice de calcul mental adaptatif et de lui fournir un court bilan encourageant.

Voici les données de performance de l'élève pour la session en cours. Chaque ligne représente une compétence, avec le nombre de réussites et d'échecs.

{{#each performance}}
- Compétence : {{{description}}} (ID: {{{id}}})
  - Réussites : {{{successes}}}
  - Échecs : {{{failures}}}
{{/each}}

Basé sur ces données, rédige une courte analyse (2-3 phrases) pour l'élève.
- Commence par souligner un ou deux points forts clairs (par exemple, "Bravo, tu es très rapide pour les additions !" ou "Tu commences à bien maîtriser les moitiés.").
- Ensuite, mentionne gentiment un point à travailler, sans être décourageant (par exemple, "Continue de t'entraîner sur les soustractions avec retenue pour devenir encore plus fort." ou "Le prochain défi sera de bien mémoriser les tables de multiplication.").
- Termine par une phrase d'encouragement général.
- Sois positif, simple et utilise un langage que peut comprendre un enfant de 7 à 11 ans.
- Ne mentionne PAS les ID des compétences, seulement leur description.`,
});

const mentalMathAnalysisFlow = ai.defineFlow(
  {
    name: 'mentalMathAnalysisFlow',
    inputSchema: MentalMathPerformanceInputSchema,
    outputSchema: MentalMathAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

export async function analyzeMentalMathPerformance(input: MentalMathPerformanceInput): Promise<MentalMathAnalysisOutput> {
  return mentalMathAnalysisFlow(input);
}

    