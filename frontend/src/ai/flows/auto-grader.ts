'use server';

/**
 * @fileOverview Auto-grading flow for evaluating student assignments and providing feedback.
 *
 * - autoGrade - A function that takes student assignment and answer key as input and returns a grade and feedback.
 * - AutoGradeInput - The input type for the autoGrade function.
 * - AutoGradeOutput - The return type for the autoGrade function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutoGradeInputSchema = z.object({
  assignmentText: z
    .string()
    .describe('The text of the student assignment.'),
  answerKey: z.string().describe('The answer key for the assignment.'),
  maxScore: z.number().describe('The maximum possible score for the assignment.'),
});
export type AutoGradeInput = z.infer<typeof AutoGradeInputSchema>;

const AutoGradeOutputSchema = z.object({
  grade: z.number().describe('The grade the student received on the assignment.'),
  feedback: z.string().describe('Feedback for the student on their assignment.'),
});
export type AutoGradeOutput = z.infer<typeof AutoGradeOutputSchema>;

export async function autoGrade(input: AutoGradeInput): Promise<AutoGradeOutput> {
  return autoGradeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'autoGradePrompt',
  input: {schema: AutoGradeInputSchema},
  output: {schema: AutoGradeOutputSchema},
  prompt: `You are an AI auto-grader. You will grade the student's assignment based on the answer key and provide feedback.

  The assignment is worth a total of {{maxScore}} points.

  Answer Key: {{{answerKey}}}

  Student Assignment: {{{assignmentText}}}

  Grade the assignment and provide feedback to the student.
  Be sure to include the grade the student received and the feedback in the output.
`,
});

const autoGradeFlow = ai.defineFlow(
  {
    name: 'autoGradeFlow',
    inputSchema: AutoGradeInputSchema,
    outputSchema: AutoGradeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
