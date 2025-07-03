'use server';

/**
 * @fileOverview Conversational assistant flow for Q&A with memory.
 *
 * - conversationalAssistant - A function that takes conversation history and a new prompt, and returns a response.
 * - ConversationalAssistantInput - The input type for the conversationalAssistant function.
 * - ConversationalAssistantOutput - The return type for the conversationalAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const ConversationalAssistantInputSchema = z.object({
  history: z.array(MessageSchema).describe('The conversation history.'),
  prompt: z.string().describe('The latest user prompt.'),
});
export type ConversationalAssistantInput = z.infer<typeof ConversationalAssistantInputSchema>;

const ConversationalAssistantOutputSchema = z.object({
  response: z.string().describe("The AI assistant's response."),
});
export type ConversationalAssistantOutput = z.infer<typeof ConversationalAssistantOutputSchema>;

export async function conversationalAssistant(
  input: ConversationalAssistantInput
): Promise<ConversationalAssistantOutput> {
  return conversationalAssistantFlow(input);
}

const conversationalAssistantFlow = ai.defineFlow(
  {
    name: 'conversationalAssistantFlow',
    inputSchema: ConversationalAssistantInputSchema,
    outputSchema: ConversationalAssistantOutputSchema,
  },
  async ({history, prompt}) => {
    const fullHistory = history.map(msg => ({
      role: msg.role,
      content: [{text: msg.content}],
    }));

    const result = await ai.generate({
      history: fullHistory,
      prompt,
    });

    return {
      response: result.text,
    };
  }
);
