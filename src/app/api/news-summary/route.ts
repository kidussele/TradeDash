
import { NextResponse } from 'next/server';
import { getNewsSummary } from '@/services/news-service';

export async function POST(request: Request) {
  try {
    const { topic } = await request.json();

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json({ error: 'Invalid topic provided.' }, { status: 400 });
    }
    
    const summary = await getNewsSummary(topic);
    
    return NextResponse.json({ summary });

  } catch (error) {
    console.error('News Summary API Error:', error);
    // Pass specific, safe error messages to the client
    const message = (error as Error).message.includes('API Key')
        ? 'Server configuration error.' 
        : 'Failed to generate news summary.';
    
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
