'use server';

/**
 * @fileOverview Worksheet generator flow.
 *
 * - generateWorksheet - A function that generates a worksheet on a specific topic with varied question types.
 * - WorksheetGeneratorInput - The input type for the generateWorksheet function.
 * - WorksheetGeneratorOutput - The return type for the generateWorksheet function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const WorksheetGeneratorInputSchema = z.object({
  topic: z.string().describe('The topic of the worksheet.'),
  gradeLevel: z.string().describe('The grade level of the worksheet.'),
  questionTypes: z
    .array(z.string())
    .describe('The types of questions to include in the worksheet.'),
  numberQuestions: z.number().describe('The number of questions to generate'),
});
export type WorksheetGeneratorInput = z.infer<typeof WorksheetGeneratorInputSchema>;

const WorksheetGeneratorOutputSchema = z.object({
  worksheet: z.string().describe('The generated worksheet.'),
});
export type WorksheetGeneratorOutput = z.infer<typeof WorksheetGeneratorOutputSchema>;

export async function generateWorksheet(input: WorksheetGeneratorInput): Promise<WorksheetGeneratorOutput> {
  return worksheetGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'worksheetGeneratorPrompt',
  input: {schema: WorksheetGeneratorInputSchema},
  output: {schema: WorksheetGeneratorOutputSchema},
  prompt: `You are an expert teacher, skilled at creating worksheets for students.

  Please generate a worksheet on the following topic for the specified grade level:

  Topic: {{{topic}}}
  Grade Level: {{{gradeLevel}}}

  Include the following types of questions:
  {{#each questionTypes}}
  - {{{this}}}
  {{/each}}

  Generate {{{numberQuestions}}} questions.

  The worksheet should be well-formatted and easy to read.
  `,
});

const worksheetGeneratorFlow = ai.defineFlow(
  {
    name: 'worksheetGeneratorFlow',
    inputSchema: WorksheetGeneratorInputSchema,
    outputSchema: WorksheetGeneratorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
