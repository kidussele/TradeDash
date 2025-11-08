
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];


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
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', safetySettings });

    const prompt = `As a financial news summarizer, provide a concise, single-paragraph, news-style summary of recent events and trends for the ${topic}. Focus on factual information relevant to a trader, not financial advice.`;

    const result = await model.generateContent(prompt);
    const response = result.response;

    // More robust response handling
    if (
      !response ||
      !response.candidates ||
      response.candidates.length === 0 ||
      !response.candidates[0].content ||
      !response.candidates[0].content.parts ||
      response.candidates[0].content.parts.length === 0
    ) {
        // Check for a safety-related block reason
        if (response?.promptFeedback?.blockReason) {
             throw new Error(`AI generation blocked for reason: ${response.promptFeedback.blockReason}`);
        }
        throw new Error('Invalid response structure from AI service.');
    }
    
    // Even if there's a candidate, it might have been stopped for safety reasons.
    if (response.candidates[0].finishReason && response.candidates[0].finishReason !== 'STOP') {
        throw new Error(`AI generation stopped for reason: ${response.candidates[0].finishReason}`);
    }

    const text = response.candidates[0].content.parts.map(part => part.text).join('');
    
    return text;
  } catch (error) {
    console.error(`AI generation failed for topic "${topic}":`, error);
    // Re-throw a generic error to be handled by the calling API route.
    throw new Error('AI content generation failed.');
  }
}
