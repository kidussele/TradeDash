'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-trading-insights';
import '@/ai/flows/generate-trade-ideas';
import '@/ai/flows/generate-news-summary';
