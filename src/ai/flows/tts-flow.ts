
'use server';
/**
 * @fileOverview A flow to convert text to speech and store it in Cloud Storage.
 *
 * - generateSpeech - A function that takes a string and returns a public URL for an audio file.
 * - SpeechInput - The input type for the generateSpeech function.
 * - SpeechOutput - The return type for the generateSpeech function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import wav from 'wav';
import { googleAI } from '@genkit-ai/google-genai';
import { uploadDataURI } from '@/services/storage';

const SpeechInputSchema = z.string();
export type SpeechInput = z.infer<typeof SpeechInputSchema>;

const SpeechOutputSchema = z.object({
    audioUrl: z.string().describe("The public Cloud Storage URL for the generated audio in WAV format."),
});
export type SpeechOutput = z.infer<typeof SpeechOutputSchema>;

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const ttsFlow = ai.defineFlow(
  {
    name: 'ttsFlow',
    inputSchema: SpeechInputSchema,
    outputSchema: SpeechOutputSchema,
  },
  async (text) => {
    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          speakingRate: 0.8,
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
      prompt: text,
    });
    if (!media) {
      throw new Error('No audio media returned from the model.');
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );

    const wavBase64 = await toWav(audioBuffer);
    const audioDataUri = 'data:audio/wav;base64,' + wavBase64;
    
    // Upload the WAV data URI to Cloud Storage
    const publicUrl = await uploadDataURI(audioDataUri, 'story-audio');

    return {
      audioUrl: publicUrl,
    };
  }
);

export async function generateSpeech(input: SpeechInput): Promise<SpeechOutput> {
  return ttsFlow(input);
}
