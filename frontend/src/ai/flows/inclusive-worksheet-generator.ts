// src/ai/flows/inclusive-worksheet-generator.ts
'use server';

/**
 * @fileOverview AI-powered Inclusive Worksheet Generator.
 *
 * This file exports:
 * - `generateInclusiveWorksheet` - A function to generate inclusive worksheets with adjustable font sizes, color contrast, and simplified language.
 * - `InclusiveWorksheetInput` - The input type for the `generateInclusiveWorksheet` function.
 * - `InclusiveWorksheetOutput` - The output type for the `generateInclusiveWorksheet` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InclusiveWorksheetInputSchema = z.object({
  topic: z.string().describe('The topic of the worksheet.'),
  gradeLevel: z.string().describe('The grade level of the worksheet.'),
  learningObjectives: z.string().describe('The learning objectives of the worksheet.'),
  fontSize: z.string().describe('The font size for the worksheet (e.g., small, medium, large).'),
  colorContrast: z.string().describe('The color contrast for the worksheet (e.g., normal, high).'),
  simplifiedLanguage: z.boolean().describe('Whether to use simplified language in the worksheet.'),
});
export type InclusiveWorksheetInput = z.infer<typeof InclusiveWorksheetInputSchema>;

const InclusiveWorksheetOutputSchema = z.object({
  worksheetContent: z.string().describe('The generated inclusive worksheet content.'),
});
export type InclusiveWorksheetOutput = z.infer<typeof InclusiveWorksheetOutputSchema>;

export async function generateInclusiveWorksheet(input: InclusiveWorksheetInput): Promise<InclusiveWorksheetOutput> {
  return inclusiveWorksheetGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'inclusiveWorksheetPrompt',
  input: {schema: InclusiveWorksheetInputSchema},
  output: {schema: InclusiveWorksheetOutputSchema},
  prompt: `You are an AI assistant designed to generate inclusive worksheets for teachers.

  Based on the following input, generate a worksheet that is appropriate for the specified grade level and learning objectives.
  Adjust the font size, color contrast, and language complexity as requested.

  Topic: {{{topic}}}
  Grade Level: {{{gradeLevel}}}
  Learning Objectives: {{{learningObjectives}}}
  Font Size: {{{fontSize}}}
  Color Contrast: {{{colorContrast}}}
  Simplified Language: {{#if simplifiedLanguage}}Yes{{else}}No{{/if}}

  Worksheet Content:`,
});

const inclusiveWorksheetGeneratorFlow = ai.defineFlow(
  {
    name: 'inclusiveWorksheetGeneratorFlow',
    inputSchema: InclusiveWorksheetInputSchema,
    outputSchema: InclusiveWorksheetOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
