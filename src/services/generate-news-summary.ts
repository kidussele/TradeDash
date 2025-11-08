'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';

export async function generateNewsSummary(
  topic: string,
  apiKey: string
): Promise<string> {
  if (!apiKey) {
    throw new Error('Missing Gemini API Key.');
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `You are a financial analyst. Write a concise, single-paragraph summary of the current state of the ${topic}. Focus on the most important trends and news relevant to a trader. The summary should be current and impactful.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  return text;
}
