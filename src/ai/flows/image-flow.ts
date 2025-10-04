'use server';
/**
 * @fileOverview A flow to generate images using Imagen 3.
 *
 * - generateImage - A function that generates an image from a text prompt.
 * - ImageInput - The input type for the generateImage function.
 * - ImageOutput - The return type for the generateImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { imagen3 } from '@genkit-ai/googleai';

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
  effrayante: 'style Halloween artistique, atmosphère mystérieuse mais pas choquante, adapté littérature jeunesse',
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
    const imagePrompt = `Illustration pour une histoire intitulée "${input.storyTitle}".

Style visuel: ${styleInstruction}

Scène à illustrer: Une scène représentative de cette histoire - ${input.storyContent.substring(0, 500)}

Qualité: Haute qualité, composition artistique, adapté pour de la littérature jeunesse/ado. Pas de texte dans l'image.`;

    const { media } = await ai.generate({
      model: imagen3,
      config: {
        numberOfImages: 1,
        aspectRatio: '3:4', // Portrait format, good for book illustrations
      },
      output: {
        format: 'media',
      },
      prompt: imagePrompt,
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
