
import { NextRequest, NextResponse } from 'next/server';
import { getNewsSummary } from '@/services/news-service';

export async function POST(req: NextRequest) {
  try {
    const { topic } = await req.json();

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json({ error: 'Topic is required.' }, { status: 400 });
    }
    
    const summary = await getNewsSummary(topic);

    return NextResponse.json({ summary });

  } catch (error: any) {
    console.error('Error in /api/news:', error);
    // The service will throw an error with a specific message if the key is missing or generation fails.
    const errorMessage = error.message || 'Failed to generate news. Please try again.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
