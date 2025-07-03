'use server';

/**
 * @fileOverview A multilingual translation AI agent.
 *
 * - multilingualTranslation - A function that handles the translation process.
 * - MultilingualTranslationInput - The input type for the multilingualTranslation function.
 * - MultilingualTranslationOutput - The return type for the multilingualTranslation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MultilingualTranslationInputSchema = z.object({
  text: z.string().describe('The text to translate.'),
  targetLanguage: z.string().describe('The target language for the translation.'),
});
export type MultilingualTranslationInput = z.infer<typeof MultilingualTranslationInputSchema>;

const MultilingualTranslationOutputSchema = z.object({
  translatedText: z.string().describe('The translated text.'),
});
export type MultilingualTranslationOutput = z.infer<typeof MultilingualTranslationOutputSchema>;

export async function multilingualTranslation(input: MultilingualTranslationInput): Promise<MultilingualTranslationOutput> {
  return multilingualTranslationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'multilingualTranslationPrompt',
  input: {schema: MultilingualTranslationInputSchema},
  output: {schema: MultilingualTranslationOutputSchema},
  prompt: `Translate the following text into {{targetLanguage}}:\n\n{{text}}`,
});

const multilingualTranslationFlow = ai.defineFlow(
  {
    name: 'multilingualTranslationFlow',
    inputSchema: MultilingualTranslationInputSchema,
    outputSchema: MultilingualTranslationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
