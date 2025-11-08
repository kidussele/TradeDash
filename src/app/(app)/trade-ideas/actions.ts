'use server';

import {
  generateTradeIdeas,
  type GenerateTradeIdeasInput,
  type GenerateTradeIdeasOutput,
} from '@/ai/flows/generate-trade-ideas';

export async function getTradeIdeas(
  input: GenerateTradeIdeasInput
): Promise<GenerateTradeIdeasOutput | { error: string }> {
  try {
    const result = await generateTradeIdeas(input);
    return result;
  } catch (e) {
    console.error(e);
    return { error: 'Failed to get answer. Please try again.' };
  }
}
