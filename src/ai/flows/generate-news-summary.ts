'use server';

/**
 * @fileOverview Generates news summaries for financial markets.
 *
 * - generateNewsSummary - A function that generates news summaries.
 * - GenerateNewsSummaryInput - The input type for the generateNewsSummary function.
 * - GenerateNewsSummaryOutput - The return type for the generateNewsSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateNewsSummaryInputSchema = z.object({
  topic: z.string().describe('The financial topic to generate news for (e.g., forex market, stock market).'),
});
export type GenerateNewsSummaryInput = z.infer<typeof GenerateNewsSummaryInputSchema>;

const GenerateNewsSummaryOutputSchema = z.object({
  articles: z.array(
    z.object({
      headline: z.string().describe('A compelling headline for the news article.'),
      summary: z.string().describe('A concise summary of the news article.'),
      source: z.string().describe('The mock source of the news (e.g., Reuters, Bloomberg).'),
      publishedAt: z.string().describe('The publication date and time in a friendly format (e.g., "2 hours ago").'),
    })
  ).describe('A list of generated news articles.'),
});
export type GenerateNewsSummaryOutput = z.infer<typeof GenerateNewsSummaryOutputSchema>;

export async function generateNewsSummary(input: GenerateNewsSummaryInput): Promise<GenerateNewsSummaryOutput> {
  return generateNewsSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateNewsSummaryPrompt',
  input: {schema: GenerateNewsSummaryInputSchema},
  output: {schema: GenerateNewsSummaryOutputSchema},
  prompt: `You are a financial news generator. Create a list of 5 recent and relevant news articles about the following topic: {{{topic}}}.

  For each article, provide a realistic headline, a brief summary, a plausible source (like Reuters, Bloomberg, etc.), and a relative publication time (e.g., "1 hour ago", "3 hours ago"). The news should be current and impactful for a trader.`,
});

const generateNewsSummaryFlow = ai.defineFlow(
  {
    name: 'generateNewsSummaryFlow',
    inputSchema: GenerateNewsSummaryInputSchema,
    outputSchema: GenerateNewsSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
