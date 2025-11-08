
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Generates a news summary for a given topic using the Google Generative AI.
 * This function is self-contained and handles its own API key validation.
 * @param topic The topic to generate a news summary for.
 * @returns A promise that resolves to the summary string.
 * @throws An error if the API key is not configured or if the generation fails.
 */
export async function getNewsSummary(topic: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('GEMINI_API_KEY is not set in the environment.');
    // This specific error message will be caught by the API route and sent to the client.
    throw new Error('Server configuration error: Missing API Key.');
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `As a financial news summarizer, provide a concise, single-paragraph, news-style summary of recent events and trends for the ${topic}. Focus on factual information relevant to a trader, not financial advice.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return text;
  } catch (error) {
    console.error(`AI generation failed for topic "${topic}":`, error);
    // Re-throw the error to be handled by the calling API route.
    throw new Error('AI content generation failed.');
  }
}
