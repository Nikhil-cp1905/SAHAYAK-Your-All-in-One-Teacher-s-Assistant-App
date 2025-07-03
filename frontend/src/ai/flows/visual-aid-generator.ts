'use server';

/**
 * @fileOverview An AI agent for generating visual aids.
 *
 * - generateVisualAid - A function that generates an image based on a prompt.
 * - VisualAidInput - The input type for the generateVisualAid function.
 * - VisualAidOutput - The return type for the generateVisualAid function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VisualAidInputSchema = z.object({
  prompt: z.string().describe('A descriptive prompt for the visual aid.'),
});
export type VisualAidInput = z.infer<typeof VisualAidInputSchema>;

const VisualAidOutputSchema = z.object({
  imageUrl: z.string().describe('The URL of the generated image.'),
});
export type VisualAidOutput = z.infer<typeof VisualAidOutputSchema>;

export async function generateVisualAid(input: VisualAidInput): Promise<VisualAidOutput> {
  return generateVisualAidFlow(input);
}

const generateVisualAidFlow = ai.defineFlow(
  {
    name: 'generateVisualAidFlow',
    inputSchema: VisualAidInputSchema,
    outputSchema: VisualAidOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [{text: input.prompt}],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    return {
      imageUrl: media?.url ?? '',
    };
  }
);
