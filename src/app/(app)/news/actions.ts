'use server';

import { generateNewsSummary } from '@/services/generate-news-summary';

export type GenerateNewsInput = {
  topic: string;
};

export async function getNews(
  input: GenerateNewsInput
): Promise<{ summary: string } | { error: string }> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in the environment.');
    }
    const summary = await generateNewsSummary(input.topic, apiKey);
    return { summary };
  } catch (e) {
    console.error('Error generating news summary:', e);
    // Return a generic error to the client to avoid leaking implementation details.
    return { error: 'Failed to generate news. Please try again.' };
  }
}
