
'use server';
/**
 * @fileOverview A flow to generate images using Gemini with image generation.
 *
 * - generateImage - A function that generates an image from a text prompt.
 * - ImageInput - The input type for the generateImage function.
 * - ImageOutput - The return type for the generateImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/google-genai';

const ImageInputSchema = z.object({
  storyTitle: z.string().describe('The title of the story'),
  storyContent: z.string().describe('The content of the story to illustrate'),
  tone: z.enum(['aventure', 'comique', 'effrayante', 'terrifiante', 'cauchemardesque']).describe('The tone of the story'),
});
export type ImageInput = z.infer<typeof ImageInputSchema>;

const ImageOutputSchema = z.object({
  imageUrl: z.string().describe('The generated image as a data URI'),
});
export type ImageOutput = z.infer<typeof ImageOutputSchema>;

const styleMap = {
  aventure: 'style illustration de livre pour enfants, coloré et dynamique, aventureux',
  comique: 'style cartoon humoristique, couleurs vives, expression comique',
  effrayante: 'style conte de fées légèrement inquiétant, ambiance mystérieuse mais pas choquante, adapté littérature jeunesse',
  terrifiante: 'style gothique sombre, ambiance inquiétante mais stylisée, illustration de roman pour adolescents',
  cauchemardesque: 'style Tim Burton et Coraline, gothique poétique, macabre esthétique, grotesque charmant, illustration de littérature ado fantastique sombre',
};

const imageFlow = ai.defineFlow(
  {
    name: 'imageFlow',
    inputSchema: ImageInputSchema,
    outputSchema: ImageOutputSchema,
  },
  async (input) => {
    const styleInstruction = styleMap[input.tone];

    // Extract key elements from the story for the prompt
    const imagePrompt = `Illustration de haute qualité pour une histoire. 
Sujet : ${input.storyContent.substring(0, 200)}.
INSTRUCTIONS STRICTES :
1.  **Style Artistique** : Le style doit être mystérieux et atmosphérique, inspiré par l'ambiance des illustrations de Chris Van Allsburg (comme dans "Les Mystères de Harris Burdick"), mais en couleurs riches et évocatrices. Utilise un éclairage dramatique, des ombres marquées et des angles de vue inhabituels pour créer une scène énigmatique.
2.  **Contenu** : L'illustration ne doit contenir **AUCUN PERSONNAGE**, aucune personne, ni aucune créature. L'image doit se concentrer uniquement sur un lieu, un objet ou une scène qui laisse place à l'imagination.
3.  **Format** : Format portrait (3:4).
4.  **Texte** : Pas de texte, de lettres ou de chiffres dans l'image.
5.  **Ton** : Applique ce ton général : ${styleInstruction}.`;

    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-image-preview'),
      prompt: imagePrompt,
      config: {
        responseModalities: ['IMAGE'],
      },
    });

    if (!media) {
      throw new Error('No image media returned from the model.');
    }

    return {
      imageUrl: media.url,
    };
  }
);

export async function generateImage(input: ImageInput): Promise<ImageOutput> {
  return imageFlow(input);
}
