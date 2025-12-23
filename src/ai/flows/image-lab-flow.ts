
'use server';
/**
 * @fileOverview An AI flow for generating images from a captured photo and a text prompt.
 *
 * - imageLabFlow - A function that handles the image generation process.
 * - ImageLabFlowInput - The input type for the imageLabFlow function.
 * - ImageLabFlowOutput - The return type for the imageLabFlow function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ImageLabFlowInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo captured from the user's webcam, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  prompt: z.string().describe('The user-provided text prompt to guide the image generation.'),
});
export type ImageLabFlowInput = z.infer<typeof ImageLabFlowInputSchema>;

const ImageLabFlowOutputSchema = z.object({
  imageUrl: z.string().describe('The data URI of the generated image.'),
});
export type ImageLabFlowOutput = z.infer<typeof ImageLabFlowOutputSchema>;

export async function imageLabFlow(input: ImageLabFlowInput): Promise<ImageLabFlowOutput> {
  const { media } = await ai.generate({
    model: 'googleai/gemini-2.5-flash-image-preview',
    prompt: [
      { media: { url: input.photoDataUri } },
      { text: input.prompt },
    ],
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
    },
  });

  if (!media?.url) {
    throw new Error('Image generation failed to produce an image.');
  }

  return { imageUrl: media.url };
}
