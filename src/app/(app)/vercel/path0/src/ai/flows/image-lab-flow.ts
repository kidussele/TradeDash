
'use server';
/**
 * @fileOverview An AI image manipulation flow.
 *
 * - imageLabFlow - A function that handles generating an image from a source image and a prompt.
 * - ImageLabInput - The input type for the imageLabFlow function.
 * - ImageLabOutput - The return type for the imageLabFlow function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ImageLabInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a person or object, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  prompt: z.string().describe('The user prompt describing the desired transformation.'),
});
export type ImageLabInput = z.infer<typeof ImageLabInputSchema>;

const ImageLabOutputSchema = z.object({
  imageUrl: z.string().describe('The data URI of the generated image.'),
});
export type ImageLabOutput = z.infer<typeof ImageLabOutputSchema>;


const imageLabGenerationFlow = ai.defineFlow(
  {
    name: 'imageLabGenerationFlow',
    inputSchema: ImageLabInputSchema,
    outputSchema: ImageLabOutputSchema,
  },
  async (input) => {
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
      throw new Error('Image generation failed to return an image.');
    }
    
    return { imageUrl: media.url };
  }
);


export async function imageLabFlow(input: ImageLabInput): Promise<ImageLabOutput> {
  return imageLabGenerationFlow(input);
}
