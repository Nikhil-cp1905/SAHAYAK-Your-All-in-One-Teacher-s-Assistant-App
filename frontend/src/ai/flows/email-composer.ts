'use server';

/**
 * @fileOverview An AI agent for composing emails.
 *
 * - composeEmail - A function that generates an email draft.
 * - EmailComposerInput - The input type for the composeEmail function.
 * - EmailComposerOutput - The return type for the composeEmail function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EmailComposerInputSchema = z.object({
  topic: z.string().describe('The main topic or purpose of the email.'),
  audience: z.string().describe('The target audience for the email (e.g., Parents, Students, Colleagues).'),
  tone: z.string().describe('The desired tone of the email (e.g., Formal, Friendly, Encouraging).'),
});
export type EmailComposerInput = z.infer<typeof EmailComposerInputSchema>;

const EmailComposerOutputSchema = z.object({
  subject: z.string().describe('The suggested subject line for the email.'),
  body: z.string().describe('The generated body of the email.'),
});
export type EmailComposerOutput = z.infer<typeof EmailComposerOutputSchema>;

export async function composeEmail(input: EmailComposerInput): Promise<EmailComposerOutput> {
  return composeEmailFlow(input);
}

const prompt = ai.definePrompt({
  name: 'composeEmailPrompt',
  input: {schema: EmailComposerInputSchema},
  output: {schema: EmailComposerOutputSchema},
  prompt: `You are an expert at writing clear and effective emails for educators.

  Your task is to generate an email draft based on the following requirements.

  Topic: {{{topic}}}
  Audience: {{{audience}}}
  Tone: {{{tone}}}

  Generate a suitable subject line and body for the email.
  `,
});

const composeEmailFlow = ai.defineFlow(
  {
    name: 'composeEmailFlow',
    inputSchema: EmailComposerInputSchema,
    outputSchema: EmailComposerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
