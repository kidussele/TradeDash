'use server';

import {
  generateNewsSummary,
  type GenerateNewsSummaryInput,
  type GenerateNewsSummaryOutput,
} from '@/ai/flows/generate-news-summary';

export async function getNews(
  input: GenerateNewsSummaryInput
): Promise<GenerateNewsSummaryOutput | { error: string }> {
  try {
    const result = await generateNewsSummary(input);
    return result;
  } catch (e) {
    console.error(e);
    return { error: 'Failed to generate news. Please try again.' };
  }
}
