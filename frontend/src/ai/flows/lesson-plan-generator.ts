'use server';

/**
 * @fileOverview AI-powered lesson plan generator.
 *
 * - generateLessonPlan - A function that generates a lesson plan based on input parameters.
 * - LessonPlanInput - The input type for the generateLessonPlan function.
 * - LessonPlanOutput - The return type for the generateLessonPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LessonPlanInputSchema = z.object({
  subject: z.string().describe('The subject of the lesson plan.'),
  gradeLevel: z.string().describe('The grade level for the lesson plan.'),
  learningObjectives: z.string().describe('The learning objectives of the lesson plan.'),
  optionalSteps: z.string().optional().describe('Optional steps to include in the lesson plan.'),
  supportingMaterial: z.string().optional().describe('Supporting materials for the lesson plan.'),
});
export type LessonPlanInput = z.infer<typeof LessonPlanInputSchema>;

const LessonPlanOutputSchema = z.object({
  title: z.string().describe('The title of the lesson plan.'),
  introduction: z.string().describe('The introduction of the lesson plan.'),
  activities: z.string().describe('The activities for the lesson plan.'),
  assessment: z.string().describe('The assessment methods for the lesson plan.'),
  conclusion: z.string().describe('The conclusion of the lesson plan.'),
});
export type LessonPlanOutput = z.infer<typeof LessonPlanOutputSchema>;

export async function generateLessonPlan(input: LessonPlanInput): Promise<LessonPlanOutput> {
  return generateLessonPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'lessonPlanPrompt',
  input: {schema: LessonPlanInputSchema},
  output: {schema: LessonPlanOutputSchema},
  prompt: `You are an expert teacher specializing in creating lesson plans.

You will use this information to generate a comprehensive lesson plan.

Subject: {{{subject}}}
Grade Level: {{{gradeLevel}}}
Learning Objectives: {{{learningObjectives}}}
Optional Steps: {{{optionalSteps}}}
Supporting Material: {{{supportingMaterial}}}

Generate a lesson plan with the following sections:
- Title
- Introduction
- Activities
- Assessment
- Conclusion`,
});

const generateLessonPlanFlow = ai.defineFlow(
  {
    name: 'generateLessonPlanFlow',
    inputSchema: LessonPlanInputSchema,
    outputSchema: LessonPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
