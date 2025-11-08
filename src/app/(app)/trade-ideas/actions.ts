'use server';

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';

export type GenerateTradeIdeasInput = {
  allData: string;
  question: string;
};

export type GenerateTradeIdeasOutput = {
  answer: string;
};

export async function getTradeIdeas(
  input: GenerateTradeIdeasInput
): Promise<GenerateTradeIdeasOutput | { error: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not set in the environment.');
    return { error: 'Server configuration error: Missing API Key.' };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
    });

    const prompt = `You are an expert trading analyst. Your role is to answer questions about a user's trading-related data.
The user's data is provided below as a JSON string. It contains live journal entries, backtest entries, goals, market analysis notes, self-development notes, and strategy checklists.
Today's date is ${new Date().toDateString()}.

Analyze the user's data and answer their question concisely. Be brief and to the point.

If you cannot answer the question from the provided data, just say "I could not find any relevant information in your data to answer that question."

User's Question: ${input.question}

User's Data (JSON format):
${input.allData}
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return { answer: text };
  } catch (e) {
    console.error('Error generating trade ideas:', e);
    return { error: 'Failed to get answer. Please try again.' };
  }
}
