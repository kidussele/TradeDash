// src/app/ai-insights/api/route.ts
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic'; // Defaults to auto

async function getAIResponse(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error('AI generation failed:', error);
    if (error instanceof Error) {
        throw new Error(`[GoogleGenerativeAI Error]: ${error.message}`);
    }
    throw new Error('An unknown error occurred during AI content generation.');
  }
}

export async function POST(request: Request) {
  try {
    const { topic, context } = await request.json();

    if (!topic || !context) {
        return NextResponse.json({ error: 'Topic and context are required.' }, { status: 400 });
    }

    const prompt = `Based on the following trading context: "${context}", generate a concise, actionable trade idea for the topic "${topic}". The idea should be a single paragraph. Do not give financial advice.`;
    
    const idea = await getAIResponse(prompt);

    return NextResponse.json({ idea });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
