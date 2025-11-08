
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { topic } = await req.json();

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json({ error: 'Topic is required.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set in the environment.');
      return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `As a financial news summarizer, provide a concise, single-paragraph, news-style summary of recent events and trends for the ${topic}. Focus on factual information relevant to a trader, not financial advice.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ summary: text });

  } catch (error) {
    console.error('Error in /api/news:', error);
    return NextResponse.json({ error: 'Failed to generate news. Please try again.' }, { status: 500 });
  }
}
