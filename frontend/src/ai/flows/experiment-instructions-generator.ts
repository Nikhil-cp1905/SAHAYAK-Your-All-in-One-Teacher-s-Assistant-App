'use server';

/**
 * @fileOverview An AI agent for generating simple and safe scientific experiment instructions for students.
 *
 * - generateExperimentInstructions - A function that handles the experiment instruction generation process.
 * - GenerateExperimentInstructionsInput - The input type for the generateExperimentInstructions function.
 * - GenerateExperimentInstructionsOutput - The return type for the generateExperimentInstructions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateExperimentInstructionsInputSchema = z.object({
  topic: z.string().describe('The topic of the scientific experiment.'),
  gradeLevel: z.string().describe('The grade level of the students.'),
  learningObjectives: z.string().describe('The learning objectives of the experiment.'),
});
export type GenerateExperimentInstructionsInput = z.infer<typeof GenerateExperimentInstructionsInputSchema>;

const GenerateExperimentInstructionsOutputSchema = z.object({
  title: z.string().describe('The title of the experiment.'),
  materials: z.string().describe('A list of necessary materials for the experiment.'),
  instructions: z.string().describe('Step-by-step directions for conducting the experiment.'),
  safetyPrecautions: z.string().describe('Safety precautions to consider when performing the experiment.'),
});
export type GenerateExperimentInstructionsOutput = z.infer<typeof GenerateExperimentInstructionsOutputSchema>;

export async function generateExperimentInstructions(input: GenerateExperimentInstructionsInput): Promise<GenerateExperimentInstructionsOutput> {
  return generateExperimentInstructionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateExperimentInstructionsPrompt',
  input: {schema: GenerateExperimentInstructionsInputSchema},
  output: {schema: GenerateExperimentInstructionsOutputSchema},
  prompt: `You are an expert science educator specializing in creating simple and safe scientific experiment instructions for students.

You will use the provided information to generate clear, concise, and safe experiment instructions, including a list of necessary materials and step-by-step directions.

Topic: {{{topic}}}
Grade Level: {{{gradeLevel}}}
Learning Objectives: {{{learningObjectives}}}

Ensure the instructions are appropriate for the specified grade level and align with the learning objectives. Always include safety precautions.
`,
});

const generateExperimentInstructionsFlow = ai.defineFlow(
  {
    name: 'generateExperimentInstructionsFlow',
    inputSchema: GenerateExperimentInstructionsInputSchema,
    outputSchema: GenerateExperimentInstructionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
