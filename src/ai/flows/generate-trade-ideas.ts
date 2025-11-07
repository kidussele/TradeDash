'use server';

/**
 * @fileOverview Generates trading ideas based on market trends and risk tolerance.
 *
 * - generateTradeIdeas - A function that generates trading ideas.
 * - GenerateTradeIdeasInput - The input type for the generateTradeIdeas function.
 * - GenerateTradeIdeasOutput - The return type for the generateTradeIdeas function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTradeIdeasInputSchema = z.object({
  marketTrends: z.string().describe('The current market trends.'),
  riskTolerance: z.string().describe('The user\u2019s risk tolerance (e.g., high, medium, low).'),
});

export type GenerateTradeIdeasInput = z.infer<typeof GenerateTradeIdeasInputSchema>;

const GenerateTradeIdeasOutputSchema = z.object({
  tradeIdeas: z.array(
    z.object({
      asset: z.string().describe('The asset to trade (e.g., AAPL, TSLA).'),
      strategy: z.string().describe('The trading strategy to use (e.g., long, short).'),
      rationale: z.string().describe('The rationale behind the trade idea.'),
      risk: z.string().describe('The risk associated with the trade idea.'),
    })
  ).describe('A list of trading ideas.'),
});

export type GenerateTradeIdeasOutput = z.infer<typeof GenerateTradeIdeasOutputSchema>;

export async function generateTradeIdeas(input: GenerateTradeIdeasInput): Promise<GenerateTradeIdeasOutput> {
  return generateTradeIdeasFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTradeIdeasPrompt',
  input: {schema: GenerateTradeIdeasInputSchema},
  output: {schema: GenerateTradeIdeasOutputSchema},
  prompt: `You are an AI trading assistant that generates trading ideas based on market trends and the user's risk tolerance.

  Market Trends: {{{marketTrends}}}
  Risk Tolerance: {{{riskTolerance}}}

  Generate a list of trading ideas, including the asset to trade, the trading strategy to use (long or short), a rationale behind the trade idea, and the risk associated with the trade idea.
  `,
});

const generateTradeIdeasFlow = ai.defineFlow(
  {
    name: 'generateTradeIdeasFlow',
    inputSchema: GenerateTradeIdeasInputSchema,
    outputSchema: GenerateTradeIdeasOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
