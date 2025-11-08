import { GoogleGenerativeAI } from '@google/generative-ai';

export type GenerateNewsSummaryOutput = {
  summary: string;
};

export async function generateNewsSummary(
  topic: string
): Promise<string> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `You are a financial analyst. Write a concise, single-paragraph summary of the current state of the ${topic}. Focus on the most important trends and news relevant to a trader. The summary should be current and impactful.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  return text;
}
