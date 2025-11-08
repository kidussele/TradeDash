
'use server';

/**
 * @fileOverview Generates a concise summary for a given financial market topic.
 *
 * - generateNewsSummary - A function that generates a market summary.
 * - GenerateNewsSummaryInput - The input type for the generateNewsSummary function.
 * - GenerateNewsSummaryOutput - The return type for the generateNewsSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateNewsSummaryInputSchema = z.object({
  topic: z.string().describe('The financial topic to generate a summary for (e.g., forex market, stock market).'),
});
export type GenerateNewsSummaryInput = z.infer<typeof GenerateNewsSummaryInputSchema>;

const GenerateNewsSummaryOutputSchema = z.object({
  summary: z.string().describe('A concise, single-paragraph summary of the current state of the given market topic.'),
});
export type GenerateNewsSummaryOutput = z.infer<typeof GenerateNewsSummaryOutputSchema>;

const prompt = ai.definePrompt({
  name: 'generateNewsSummaryPrompt',
  input: {schema: GenerateNewsSummaryInputSchema},
  output: {schema: GenerateNewsSummaryOutputSchema},
  prompt: `You are a financial analyst. Write a concise, single-paragraph summary of the current state of the {{{topic}}}. Focus on the most important trends and news relevant to a trader. The summary should be current and impactful.`,
});

const newsSummaryFlow = ai.defineFlow(
  {
    name: 'newsSummaryFlow',
    inputSchema: GenerateNewsSummaryInputSchema,
    outputSchema: GenerateNewsSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

export async function generateNewsSummary(input: GenerateNewsSummaryInput): Promise<GenerateNewsSummaryOutput> {
  return newsSummaryFlow(input);
}
