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

export type GenerateTradingInsightsInput = {
  historicalTradeData: string;
};

export type GenerateTradingInsightsOutput = {
  insights: string;
};

export async function getTradingInsights(
  input: GenerateTradingInsightsInput
): Promise<GenerateTradingInsightsOutput | { error: string }> {
  try {
    if (!input.historicalTradeData) {
      return { error: 'Historical trade data cannot be empty.' };
    }
    
    const prompt = `You are an expert trading analyst. Analyze the provided historical trade data and generate insights on trading performance, patterns, strengths, and weaknesses.

Historical Trade Data:
${input.historicalTradeData}

Provide detailed and actionable insights to improve the trading strategy.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return { insights: text };
  } catch (e) {
    console.error('Error generating trading insights:', e);
    return { error: 'Failed to generate insights. Please try again.' };
  }
}
