
'use server';

/**
 * @fileOverview AI-powered insights on trading performance based on historical data.
 *
 * - generateTradingInsights - A function that generates trading insights.
 * - GenerateTradingInsightsInput - The input type for the generateTradingInsights function.
 * - GenerateTradingInsightsOutput - The return type for the generateTradingInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTradingInsightsInputSchema = z.object({
  historicalTradeData: z
    .string()
    .describe(
      'Historical trade data, ideally in CSV format, but other formats are acceptable. This data should include all trades that insights should be generated from.'
    ),
});
export type GenerateTradingInsightsInput = z.infer<typeof GenerateTradingInsightsInputSchema>;

const GenerateTradingInsightsOutputSchema = z.object({
  insights: z
    .string()
    .describe('AI-generated insights on trading performance, patterns, strengths, and weaknesses.'),
});
export type GenerateTradingInsightsOutput = z.infer<typeof GenerateTradingInsightsOutputSchema>;

const prompt = ai.definePrompt({
  name: 'generateTradingInsightsPrompt',
  input: {schema: GenerateTradingInsightsInputSchema},
  output: {schema: GenerateTradingInsightsOutputSchema},
  prompt: `You are an expert trading analyst. Analyze the provided historical trade data and generate insights on trading performance, patterns, strengths, and weaknesses.

Historical Trade Data:
{{{historicalTradeData}}}

Provide detailed and actionable insights to improve the trading strategy.`,
});

const generateTradingInsightsFlow = ai.defineFlow(
  {
    name: 'generateTradingInsightsFlow',
    inputSchema: GenerateTradingInsightsInputSchema,
    outputSchema: GenerateTradingInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

export async function generateTradingInsights(
  input: GenerateTradingInsightsInput
): Promise<GenerateTradingInsightsOutput> {
  return generateTradingInsightsFlow(input);
}
