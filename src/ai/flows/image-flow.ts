
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
import { uploadDataURI } from '@/services/storage';

const ImageInputSchema = z.object({
  storyTitle: z.string().describe('The title of the story'),
  storyContent: z.string().describe('The content of the story to illustrate'),
  tone: z.enum(['aventure', 'comique', 'effrayante', 'terrifiante', 'cauchemardesque']).describe('The tone of the story'),
});
export type ImageInput = z.infer<typeof ImageInputSchema>;

const ImageOutputSchema = z.object({
  imageUrl: z.string().describe('The generated image as a public Cloud Storage URL'),
});
export type ImageOutput = z.infer<typeof ImageOutputSchema>;

const styleMap = {
  aventure: 'style illustration de livre pour enfants, coloré et dynamique, aventureux, personnages expressifs et attachants',
  comique: 'style cartoon humoristique, couleurs vives, expressions comiques et exagérées, personnages sympathiques et drôles',
  effrayante: 'style conte de fées légèrement inquiétant, ambiance mystérieuse mais pas choquante, adapté littérature jeunesse, personnages fantastiques bienveillants',
  terrifiante: 'style gothique doux, ambiance inquiétante mais stylisée pour jeune public, personnages mystérieux mais jamais monstrueux ou violents',
  cauchemardesque: 'style Tim Burton et Coraline adapté pour enfants, gothique poétique, esthétique fantastique douce, personnages étranges mais charmants et non effrayants',
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
    const imagePrompt = `Illustration de haute qualité pour une histoire destinée aux enfants.
Sujet : ${input.storyContent.substring(0, 200)}.
INSTRUCTIONS STRICTES :
1.  **Style Artistique** : Le style doit être mystérieux et atmosphérique, inspiré par l'ambiance des illustrations de Chris Van Allsburg (comme dans "Les Mystères de Harris Burdick"), mais en couleurs riches et évocatrices. Utilise un éclairage dramatique, des ombres marquées et des angles de vue inhabituels pour créer une scène énigmatique.
2.  **Contenu** : L'illustration peut contenir des personnages (humains ou créatures). Si des personnages sont présents, ils doivent avoir un design ADAPTÉ AUX ENFANTS, avec des traits doux et stylisés, jamais effrayants, violents ou cauchemardesque. Les personnages peuvent être mystérieux ou fantastiques, mais toujours bienveillants et accessibles pour un jeune public.
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

    console.log('📸 Genkit Media Response:', JSON.stringify(media, null, 2));

    let publicUrl: string;

    // Check if it's a data URI
    if (media.url.startsWith('data:')) {
      console.log('📦 Uploading Data URI...');
      publicUrl = await uploadDataURI(media.url, 'story-images');
    } else {
      // It's likely a remote URL (e.g. from Google Cloud Storage temporary link)
      console.log('🌐 Model returned remote URL:', media.url);

      // Fetch the image data
      try {
        const response = await fetch(media.url);
        if (!response.ok) throw new Error(`Failed to fetch image from remote URL: ${response.statusText}`);

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        const mimeType = media.contentType || 'image/png'; // Default to png if unknown

        const dataUri = `data:${mimeType};base64,${base64}`;

        console.log('📦 Converted to Data URI, uploading...');
        publicUrl = await uploadDataURI(dataUri, 'story-images');
      } catch (fetchError: any) {
        console.error('❌ Error processing remote URL:', fetchError);
        // Fallback: try to return the remote URL directly if it's accessible (though it might expire)
        // But for now, let's throw to see the error
        throw new Error(`Failed to process remote image URL: ${fetchError.message}`);
      }
    }

    console.log('✅ Image uploaded successfully:', publicUrl);

    return {
      imageUrl: publicUrl,
    };
  }
);

export async function generateImage(input: ImageInput): Promise<ImageOutput> {
  return imageFlow(input);
}
