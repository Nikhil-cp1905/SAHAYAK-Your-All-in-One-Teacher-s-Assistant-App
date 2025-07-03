'use server';
/**
 * @fileOverview A bilingual worksheet generator AI agent.
 *
 * - bilingualWorksheetGenerator - A function that handles the worksheet generation process.
 * - BilingualWorksheetGeneratorInput - The input type for the bilingualWorksheetGenerator function.
 * - BilingualWorksheetGeneratorOutput - The return type for the bilingualWorksheetGenerator function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BilingualWorksheetGeneratorInputSchema = z.object({
  topic: z.string().describe('The topic of the worksheet.'),
  primaryLanguage: z.string().describe('The primary language of the worksheet.'),
  secondaryLanguage: z.string().describe('The secondary language of the worksheet.'),
  gradeLevel: z.string().describe('The grade level of the worksheet.'),
  worksheetType: z.string().describe('The type of worksheet to generate (e.g., math, reading, science).'),
});
export type BilingualWorksheetGeneratorInput = z.infer<typeof BilingualWorksheetGeneratorInputSchema>;

const BilingualWorksheetGeneratorOutputSchema = z.object({
  primaryLanguageWorksheet: z.string().describe('The generated worksheet in the primary language.'),
  secondaryLanguageWorksheet: z.string().describe('The generated worksheet in the secondary language.'),
});
export type BilingualWorksheetGeneratorOutput = z.infer<typeof BilingualWorksheetGeneratorOutputSchema>;

export async function bilingualWorksheetGenerator(input: BilingualWorksheetGeneratorInput): Promise<BilingualWorksheetGeneratorOutput> {
  return bilingualWorksheetGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'bilingualWorksheetGeneratorPrompt',
  input: {schema: BilingualWorksheetGeneratorInputSchema},
  output: {schema: BilingualWorksheetGeneratorOutputSchema},
  prompt: `You are an expert educator specializing in creating bilingual worksheets.

You will generate a worksheet on the given topic, in both the primary and secondary languages.
The worksheet should be appropriate for the given grade level and worksheet type.

Topic: {{{topic}}}
Primary Language: {{{primaryLanguage}}}
Secondary Language: {{{secondaryLanguage}}}
Grade Level: {{{gradeLevel}}}
Worksheet Type: {{{worksheetType}}}

Generate two distinct worksheets, one for each language. Ensure the content is pedagogically sound and relevant to the specified topic and grade level.

{{#each questions}}
  Question: {{{this}}}
{{/each}}
`,
});

const bilingualWorksheetGeneratorFlow = ai.defineFlow(
  {
    name: 'bilingualWorksheetGeneratorFlow',
    inputSchema: BilingualWorksheetGeneratorInputSchema,
    outputSchema: BilingualWorksheetGeneratorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
