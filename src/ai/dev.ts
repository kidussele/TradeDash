'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-trading-insights.ts';
import '@/ai/flows/generate-trade-ideas.ts';
import '@/ai/flows/generate-news-summary.ts';
