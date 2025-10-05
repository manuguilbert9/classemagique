
'use server';
/**
 * @fileOverview An AI flow to generate stories for children.
 *
 * - generateStory - A function that takes emojis, length, and tone to create a story.
 * - StoryInput - The input type for the generateStory function.
 * - StoryOutput - The return type for the generateStory function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const StoryInputSchema = z.object({
  emojis: z.array(z.string()).optional().describe('An array of emojis to inspire the story. Up to 6.'),
  description: z.string().optional().describe('A vocal description of the story to generate.'),
  length: z.enum(['extra-courte', 'courte', 'moyenne', 'longue']).describe('The desired length of the story.'),
  tone: z.enum(['aventure', 'comique', 'effrayante', 'terrifiante', 'cauchemardesque']).describe('The tone of the story.'),
});
export type StoryInput = z.infer<typeof StoryInputSchema>;

const StoryOutputSchema = z.object({
  title: z.string().describe('A creative and fitting title for the story.'),
  story: z.string().describe('The generated story text.'),
  moral: z.string().describe('A short, clear moral for the story.'),
});
export type StoryOutput = z.infer<typeof StoryOutputSchema>;


const lengthInstructionMap = {
    'extra-courte': 'moins de 60 mots au total, avec des phrases très courtes et simples. Idéal pour un enfant qui apprend à lire.',
    courte: 'entre 6 et 10 phrases',
    moyenne: 'entre 10 et 20 phrases',
    longue: 'd\'environ une page A4, soit à peu près 400-500 mots',
};

const toneInstructionMap = {
    aventure: 'un ton d\'aventure, avec du suspense et de l\'action.',
    comique: 'un ton comique et humoristique, avec des situations amusantes et des personnages rigolos.',
    effrayante: 'un ton effrayant mais adapté aux enfants de 12 ans (PEGI 12). Concentre-toi sur le suspense et l\'atmosphère inquiétante. INTERDICTIONS : pas de violence graphique, pas de gore, pas de mort explicite, pas de torture. Privilégie les bruits étranges, les ombres mystérieuses, et les situations angoissantes mais sans danger réel.',
    terrifiante: 'un ton terrífiant mais strictement adapté aux 12 ans et plus (PEGI 12). Crée une atmosphère très angoissante avec des menaces implicites. INTERDICTIONS ABSOLUES : pas de violence explicite, pas de sang/gore, pas de scènes de mort détaillées, pas de contenu traumatisant. Utilise la suggestion, le non-dit, les bruits inquiétants, les présences invisibles, et les mystères troublants.',
    cauchemardesque: 'un ton cauchemardesque dans l\'esprit de Coraline (Neil Gaiman) ou des films de Tim Burton (Noces Funèbres, Frankenweenie, L\'Étrange Noël de Mr Jack). Crée une atmosphère gothique, macabre et surréaliste avec des éléments visuellement dérangeants mais poétiques. AUTORISÉ : personnages morts mais présentés de façon fantastique (squelettes qui parlent, fantômes attachants, créatures cousues), univers parallèles inquiétants, transformations corporelles étranges, ambiances sombres et mélancoliques, esthétique du grotesque poétique. INTERDIT : violence graphique réaliste, gore sanguin, torture, souffrance explicite. L\'horreur doit être esthétique, onirique et fascinante plutôt que dégoûtante. Pense "beau mais étrange", "mort mais charmant", "effrayant mais captivant".',
}

const promptForKids = ai.definePrompt({
  name: 'storyPromptForKids',
  input: { schema: StoryInputSchema },
  output: { schema: StoryOutputSchema },
  prompt: `Tu es un conteur pour enfants, spécialisé dans l'écriture d'histoires créatives, engageantes et adaptées à un jeune public (environ 8-12 ans).

Ta mission est de rédiger une histoire originale en français.

Voici les instructions à suivre :

1.  **Inspiration** : Inspire-toi des thèmes, personnages ou objets décrits ci-dessous.
{{#if description}}
    **Idée de l'enfant :** {{{description}}}
{{else}}
    **Emojis choisis :** {{#each emojis}}{{this}} {{/each}}
{{/if}}
Ne mentionne pas les emojis ou la description directement dans le texte, utilise-les comme source d'inspiration.

2.  **Longueur** : L'histoire doit être de longueur "{{length}}", c'est-à-dire {{lookup ../lengthInstructionMap length}}.

3.  **Ton** : L'histoire doit adopter {{lookup ../toneInstructionMap tone}}.

4.  **Structure** : L'histoire doit avoir un début, un développement et une fin claire.

5.  **Prénoms des personnages** : IMPORTANT - Varie les prénoms des personnages principaux. Ne pas toujours utiliser "Léo". Utilise une grande variété de prénoms français modernes et classiques : Emma, Lucas, Chloé, Nathan, Inès, Hugo, Manon, Arthur, Zoé, Louis, Camille, Gabriel, Léa, Tom, Sarah, Maxime, etc. Change de prénom à chaque histoire.

6.  **Morale** : À la fin de l'histoire, rédige une morale claire et simple en rapport avec les événements du récit. Ne la mélange pas avec l'histoire, mais présente-la séparément.

7.  **Titre** : Donne un titre court et accrocheur à l'histoire.

Réponds uniquement avec la structure de sortie demandée (titre, histoire, morale). N'ajoute aucun commentaire ou texte supplémentaire.`,
  context: {
    lengthInstructionMap,
    toneInstructionMap,
  }
});

const promptForTeens = ai.definePrompt({
  name: 'storyPromptForTeens',
  input: { schema: StoryInputSchema },
  output: { schema: StoryOutputSchema },
  prompt: `Tu es un conteur pour ados, spécialisé dans l'écriture d'histoires créatives, engageantes et adaptées à un public jeune (pas de détails sordides).

Ta mission est de rédiger une histoire originale en français.

Voici les instructions à suivre :

1.  **Inspiration** : Inspire-toi des thèmes, personnages ou objets décrits ci-dessous.
{{#if description}}
    **Idée de l'enfant :** {{{description}}}
{{else}}
    **Emojis choisis :** {{#each emojis}}{{this}} {{/each}}
{{/if}}
Ne mentionne pas les emojis ou la description directement dans le texte, utilise-les comme source d'inspiration.

2.  **Longueur** : L'histoire doit être de longueur "{{length}}", c'est-à-dire {{lookup ../lengthInstructionMap length}}.

3.  **Ton** : L'histoire doit adopter {{lookup ../toneInstructionMap tone}}.

4.  **Structure** : L'histoire doit avoir un début, un développement et une fin claire.

5.  **Prénoms des personnages** : IMPORTANT - Varie les prénoms des personnages principaux. Ne pas toujours utiliser "Léo". Utilise une grande variété de prénoms français modernes et classiques : Emma, Lucas, Chloé, Nathan, Inès, Hugo, Manon, Arthur, Zoé, Louis, Camille, Gabriel, Léa, Tom, Sarah, Maxime, etc. Change de prénom à chaque histoire.

6.  **Morale** : À la fin de l'histoire, rédige une morale claire et simple en rapport avec les événements du récit. Ne la mélange pas avec l'histoire, mais présente-la séparément.

7.  **Titre** : Donne un titre court et accrocheur à l'histoire.

Réponds uniquement avec la structure de sortie demandée (titre, histoire, morale). N'ajoute aucun commentaire ou texte supplémentaire.`,
  context: {
    lengthInstructionMap,
    toneInstructionMap,
  }
});


const storyFlow = ai.defineFlow(
  {
    name: 'storyFlow',
    inputSchema: StoryInputSchema,
    outputSchema: StoryOutputSchema,
  },
  async (input) => {
    // Use teen prompt for cauchemardesque, kids prompt for others
    const selectedPrompt = input.tone === 'cauchemardesque' ? promptForTeens : promptForKids;
    const { output } = await selectedPrompt(input);
    return output!;
  }
);


export async function generateStory(input: StoryInput): Promise<StoryOutput> {
  return await storyFlow(input);
}
