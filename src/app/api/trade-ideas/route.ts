
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

export async function POST(req: NextRequest) {
  try {
    const { question, allData } = await req.json();

    if (!question || !allData) {
      return NextResponse.json({ error: 'Question and data are required.' }, { status: 400 });
    }
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not set in the environment.');
      return NextResponse.json({ error: 'Server configuration error: Missing API Key.' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', safetySettings });

    const prompt = `You are an expert trading analyst. Your role is to answer questions about a user's trading-related data.
The user's data is provided below as a JSON string. It contains live journal entries, backtest entries, goals, market analysis notes, self-development notes, and strategy checklists.
Today's date is ${new Date().toDateString()}.

Analyze the user's data and answer their question concisely. Be brief and to the point.

If you cannot answer the question from the provided data, just say "I could not find any relevant information in your data to answer that question."

User's Question: ${question}

User's Data (JSON format):
${allData}
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    
    if (!response || !response.candidates || response.candidates.length === 0) {
      throw new Error('AI service returned an empty response.');
    }
    const text = response.candidates[0].content.parts.map(part => part.text).join('');

    return NextResponse.json({ answer: text });

  } catch (error: any) {
    console.error('Error in /api/trade-ideas:', error);
    const errorMessage = error.message || 'Failed to get an answer. Please try again.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
