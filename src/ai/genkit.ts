import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { openAI } from 'genkitx-openai';

export const ai = genkit({
  plugins: [
    googleAI(),
    openAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: 'https://api.deepseek.com',
    }),
  ],
  model: 'googleai/gemini-2.5-pro', // Default model remains Gemini, we'll override in story flow
});
