'use server';

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
});

export type GenerateNewsSummaryInput = {
  topic: string;
};

export type GenerateNewsSummaryOutput = {
  summary: string;
};

export async function getNews(
  input: GenerateNewsİnput
): Promise<GenerateNewsSummaryOutput | { error: string }> {
  try {
    const prompt = `You are a financial analyst. Write a concise, single-paragraph summary of the current state of the ${input.topic}. Focus on the most important trends and news relevant to a trader. The summary should be current and impactful.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return { summary: text };
  } catch (e) {
    console.error('Error generating news summary:', e);
    return { error: 'Failed to generate news. Please try again.' };
  }
}
