'use server';

import {
  generateTradingInsights,
  type GenerateTradingInsightsInput,
  type GenerateTradingInsightsOutput,
} from '@/ai/flows/generate-trading-insights';

export async function getTradingInsights(
  input: GenerateTradingInsightsInput
): Promise<GenerateTradingInsightsOutput | { error: string }> {
  try {
    if (!input.historicalTradeData) {
      return { error: 'Historical trade data cannot be empty.' };
    }

    const result = await generateTradingInsights(input);
    return result;
  } catch (e) {
    console.error(e);
    return { error: 'Failed to generate insights. Please try again.' };
  }
}
