'use server';

/**
 * @fileOverview Converts text into natural-sounding speech for accessibility and diverse learning preferences using AI.
 *
 * - generateVoiceScript - A function that handles the text-to-speech conversion.
 * - GenerateVoiceScriptInput - The input type for the generateVoiceScript function.
 * - GenerateVoiceScriptOutput - The return type for the generateVoiceScript function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const GenerateVoiceScriptInputSchema = z.string().describe('The text to convert to speech.');
export type GenerateVoiceScriptInput = z.infer<typeof GenerateVoiceScriptInputSchema>;

const GenerateVoiceScriptOutputSchema = z.object({
  media: z.string().describe('The audio data as a data URI in WAV format.'),
});
export type GenerateVoiceScriptOutput = z.infer<typeof GenerateVoiceScriptOutputSchema>;

export async function generateVoiceScript(input: GenerateVoiceScriptInput): Promise<GenerateVoiceScriptOutput> {
  return voiceScriptGeneratorFlow(input);
}

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const voiceScriptGeneratorFlow = ai.defineFlow(
  {
    name: 'voiceScriptGeneratorFlow',
    inputSchema: GenerateVoiceScriptInputSchema,
    outputSchema: GenerateVoiceScriptOutputSchema,
  },
  async (query) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: query,
    });
    if (!media) {
      throw new Error('no media returned');
    }
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    return {
      media: 'data:audio/wav;base64,' + (await toWav(audioBuffer)),
    };
  }
);
