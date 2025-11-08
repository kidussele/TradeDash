import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const { topic } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'API key is missing.' }, { status: 500 });
    }

    const prompts = {
      scalping: "Generate a hypothetical scalping trade idea for a popular forex pair like EUR/USD or a major index. Include a potential entry trigger, a tight stop-loss, and a take-profit target. This is for educational purposes only, not financial advice.",
      swing: "Generate a hypothetical swing trade idea based on a recent technical pattern (like a flag or head and shoulders) on a well-known stock. Mention the timeframe (e.g., daily chart). This is for educational purposes only, not financial advice.",
      investment: "Describe a hypothetical long-term investment thesis for a specific technology sector (e.g., AI, biotech, renewable energy). Mention potential catalysts and long-term risks. This is for educational purposes only, not financial advice.",
      contrarian: "Present a contrarian view on a popular, trending asset. Explain the reasoning behind why the crowd might be wrong. This is for educational purposes only, not financial advice."
    };

    const prompt = (prompts as any)[topic] || prompts.scalping;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const summary = response.text();

    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error('AI trade idea generation failed:', error);
    // Ensure we return the specific error message from the Google AI SDK if available
    const errorMessage = error?.message || 'An unexpected error occurred during AI content generation.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
