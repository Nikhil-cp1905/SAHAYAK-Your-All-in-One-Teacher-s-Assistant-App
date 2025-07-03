'use server';

/**
 * @fileOverview Explains complex concepts in a clear and concise manner, tailored to the user's learning level.
 *
 * - explainConcept - A function that handles the concept explanation process.
 * - ExplainConceptInput - The input type for the explainConcept function.
 * - ExplainConceptOutput - The return type for the explainConcept function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainConceptInputSchema = z.object({
  topic: z.string().describe('The complex topic to explain.'),
  learningLevel: z
    .string()
    .describe(
      'The learning level of the student (e.g., elementary, middle school, high school, college).' // Ensure example values are given
    ),
});
export type ExplainConceptInput = z.infer<typeof ExplainConceptInputSchema>;

const ExplainConceptOutputSchema = z.object({
  explanation: z.string().describe('A clear and concise explanation of the topic.'),
});
export type ExplainConceptOutput = z.infer<typeof ExplainConceptOutputSchema>;

export async function explainConcept(input: ExplainConceptInput): Promise<ExplainConceptOutput> {
  return explainConceptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainConceptPrompt',
  input: {schema: ExplainConceptInputSchema},
  output: {schema: ExplainConceptOutputSchema},
  prompt: `Explain the following complex topic in a clear and concise manner, tailored to the learning level of the student.

Topic: {{{topic}}}
Learning Level: {{{learningLevel}}}

Explanation:`, // Use Handlebars syntax for prompt formatting and variables
});

const explainConceptFlow = ai.defineFlow(
  {
    name: 'explainConceptFlow',
    inputSchema: ExplainConceptInputSchema,
    outputSchema: ExplainConceptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
