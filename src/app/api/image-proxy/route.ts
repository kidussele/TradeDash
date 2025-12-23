
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    // Fetch the image from the external URL
    const imageResponse = await fetch(imageUrl);

    if (!imageResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: imageResponse.status });
    }

    // Get the image data as an ArrayBuffer
    const imageBuffer = await imageResponse.arrayBuffer();
    // Get the content type from the original response
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

    // Convert the ArrayBuffer to a Buffer
    const buffer = Buffer.from(imageBuffer);

    // Create a data URL
    const dataUrl = `data:${contentType};base64,${buffer.toString('base64')}`;

    // Return the data URL in the response
    return NextResponse.json({ dataUrl });

  } catch (error) {
    console.error('Image Proxy Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
