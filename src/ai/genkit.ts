
'use client';
import { genkit, type Genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

let ai: Genkit;

function initializeGenkit() {
  const newAi = genkit({
    plugins: [
      googleAI({
        apiVersion: ['v1', 'v1beta'],
      }),
    ],
    logLevel: 'debug',
    enableTracingAndMetrics: true,
  });
  return newAi;
}

if (process.env.NODE_ENV === 'production') {
  ai = initializeGenkit();
} else {
  // @ts-ignore
  if (!global.ai) {
    // @ts-ignore
    global.ai = initializeGenkit();
  }
  // @ts-ignore
  ai = global.ai;
}

export { ai };
