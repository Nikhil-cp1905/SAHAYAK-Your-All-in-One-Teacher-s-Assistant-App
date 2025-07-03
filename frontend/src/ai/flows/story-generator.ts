'use server';
/**
 * @fileOverview Generates engaging stories with multimedia assets for immersive learning experiences.
 *
 * - generateStory - A function that generates a story with text, images, and TTS audio.
 * - GenerateStoryInput - The input type for the generateStory function.
 * - GenerateStoryOutput - The return type for the generateStory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const GenerateStoryInputSchema = z.object({
  topic: z.string().describe('The topic of the story.'),
  gradeLevel: z.string().describe('The grade level of the story.'),
  length: z.string().describe('The desired length of the story (short, medium, long).'),
});
export type GenerateStoryInput = z.infer<typeof GenerateStoryInputSchema>;

const GenerateStoryOutputSchema = z.object({
  text: z.string().describe('The generated story text.'),
  imageUrl: z.string().describe('A data URI of the generated image.'),
  audioUrl: z.string().describe('A data URI of the generated audio.'),
});
export type GenerateStoryOutput = z.infer<typeof GenerateStoryOutputSchema>;

export async function generateStory(input: GenerateStoryInput): Promise<GenerateStoryOutput> {
  return generateStoryFlow(input);
}

const storyPrompt = ai.definePrompt({
  name: 'storyPrompt',
  input: {schema: GenerateStoryInputSchema},
  output: {schema: z.string().describe('The generated story.')},
  prompt: `You are a creative story writer for education. Write a story for grade level {{{gradeLevel}}} about the following topic: {{{topic}}}. The story should be approximately {{{length}}} in length.
`,
});

const generateImage = ai.definePrompt({
  name: 'generateImage',
  input: {schema: z.object({story: z.string()})},
  output: {schema: z.string().describe('A data URI of the generated image.')},
  prompt: `Based on this story: {{{story}}}, generate an image that represents the main theme or a key scene from the story. Return the image as a data URI.`,
});

const generateAudio = ai.definePrompt({
  name: 'generateAudio',
  input: {schema: z.object({text: z.string()})},
  output: {schema: z.string().describe('A data URI of the generated audio.')},
  prompt: `Convert the following text into natural-sounding speech.  Return the audio as a data URI.: {{{text}}}`,
});

const generateStoryFlow = ai.defineFlow(
  {
    name: 'generateStoryFlow',
    inputSchema: GenerateStoryInputSchema,
    outputSchema: GenerateStoryOutputSchema,
  },
  async input => {
    const {output: text} = await storyPrompt(input);

    // Generate image
    const {media: imageMedia} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [{text: `generate an image based on this story: ${text}`}],
      config: {
        responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE, IMAGE only won't work
      },
    });
    const imageUrl = imageMedia?.url ?? '';

    // Generate audio
    const { media } = await ai.generate({
      model: ai.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: text,
    });
    if (!media) {
      throw new Error('no media returned');
    }
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    const audioUrl = 'data:audio/wav;base64,' + (await toWav(audioBuffer));

    return {text: text!, imageUrl, audioUrl};
  }
);

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


