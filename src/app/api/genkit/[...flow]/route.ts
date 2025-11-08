import { defineNextHandler } from '@genkit-ai/next';
import '@/ai/flows/generate-news-summary';
import '@/ai/flows/generate-trade-ideas';
import '@/ai/flows/generate-trading-insights';

export const { GET, POST } = defineNextHandler();
