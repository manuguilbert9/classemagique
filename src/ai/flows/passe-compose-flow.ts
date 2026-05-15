import { z } from 'zod';
import { ai } from '../genkit';

const PasseComposeInputSchema = z.object({
  auxiliaries: z.array(z.enum(['avoir', 'etre'])),
  groups: z.array(z.enum(['1er', '2eme', '3eme'])),
  theme: z.string().optional(),
  count: z.number().default(10),
});

const PasseComposeOutputSchema = z.object({
  questions: z.array(z.object({
    sentence: z.string().describe("La phrase avec un trou pour le verbe (ex: 'Hier, nous _____ une pomme.')"),
    answer: z.string().describe("Le verbe correctement conjugué au passé composé (ex: 'avons mangé')"),
    options: z.array(z.string()).describe("3 options pour le QCM, incluant la bonne réponse et 2 distracteurs plausibles (erreurs d'accord, mauvais auxiliaire, mauvais participe passé)"),
  }))
});

export const passeComposeFlow = ai.defineFlow({
  name: 'passeComposeFlow',
  inputSchema: PasseComposeInputSchema,
  outputSchema: PasseComposeOutputSchema,
}, async (input): Promise<z.infer<typeof PasseComposeOutputSchema>> => {

  const prompt = `
    Génère un exercice de conjugaison au passé composé en français.
    Tu dois générer exactement ${input.count} phrases.

    Contraintes pour les phrases :
    - Auxiliaires autorisés : ${input.auxiliaries.join(', ')}
    - Groupes de verbes autorisés : ${input.groups.join(', ')} (1er = -er, 2eme = -ir avec participe présent en -issant, 3eme = irréguliers).
    ${input.theme ? `- Thème de l'exercice : ${input.theme}` : '- Thème libre, adapté pour des enfants.'}
    - Fais attention à l'accord du participe passé avec l'auxiliaire 'être' (et avec 'avoir' si COD placé avant, mais évite de préférence les cas trop complexes pour des enfants).
    - Varie les pronoms sujets (je, tu, il, elle, on, nous, vous, ils, elles) ou utilise des groupes nominaux (ex: 'Les enfants', 'Marie et Paul').

    Pour chaque phrase, tu dois fournir :
    1. 'sentence': La phrase avec un trou (indiqué par '_____') à la place du verbe conjugué au passé composé.
    2. 'answer': La bonne réponse à insérer dans le trou (ex: 'sont allés', 'a fini').
    3. 'options': Un tableau contenant exactement 3 choix pour un QCM.
       - L'un des choix DOIT être la bonne réponse (identique à 'answer').
       - Les 2 autres choix doivent être des erreurs courantes :
         - Erreur d'auxiliaire (ex: 'ont allés' au lieu de 'sont allés')
         - Erreur d'accord du participe passé (ex: 'sont allé' au lieu de 'sont allés' pour un sujet pluriel)
         - Autre temps (ex: 'allons' au lieu de 'sommes allés')
         - Participe passé mal formé (ex: 'a prendu' au lieu de 'a pris')

    Assure-toi que les distracteurs ont l'air plausibles pour un enfant qui apprend le passé composé.
  `;

  const { output } = await ai.generate({
    prompt: prompt,
    output: {
      schema: PasseComposeOutputSchema,
    },
  });

  if (!output) {
      throw new Error("Failed to generate passe compose questions");
  }

  return output;
});
