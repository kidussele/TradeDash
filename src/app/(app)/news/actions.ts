'use server';

import { generateNewsSummary } from '@/services/generate-news-summary';
import type { GenerateNewsSummaryOutput } from '@/services/generate-news-summary';

export type GenerateNewsİnput = {
  topic: string;
};

export async function getNews(
  input: GenerateNewsİnput
): Promise<GenerateNewsSummaryOutput | { error: string }> {
  try {
    const summary = await generateNewsSummary(input.topic);
    return { summary };
  } catch (e) {
    console.error('Error generating news summary:', e);
    return { error: 'Failed to generate news. Please try again.' };
  }
}
