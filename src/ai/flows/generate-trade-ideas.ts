
'use server';

/**
 * @fileOverview Generates trading ideas and answers questions based on user's trading data.
 *
 * - generateTradeIdeas - A function that generates trading ideas or answers questions.
 * - GenerateTradeIdeasInput - The input type for the generateTradeIdeas function.
 * - GenerateTradeIdeasOutput - The return type for the generateTradeIdeas function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTradeIdeasInputSchema = z.object({
  history: z.string().describe("The user's trading history in CSV format."),
  question: z.string().describe("The user's question about their trading history."),
});

export type GenerateTradeIdeasInput = z.infer<typeof GenerateTradeIdeasInputSchema>;

const GenerateTradeIdeasOutputSchema = z.object({
  answer: z.string().describe('A short and brief answer to the user question based on the provided trade history.'),
});

export type GenerateTradeIdeasOutput = z.infer<typeof GenerateTradeIdeasOutputSchema>;

export async function generateTradeIdeas(input: GenerateTradeIdeasInput): Promise<GenerateTradeIdeasOutput> {
  return generateTradeIdeasFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTradeIdeasPrompt',
  input: {schema: GenerateTradeIdeasInputSchema},
  output: {schema: GenerateTradeIdeasOutputSchema},
  prompt: `You are an expert trading analyst. Your role is to answer questions about a user's trading history.
The user's trade history is provided below in CSV format.
Today's date is ${new Date().toDateString()}.

Analyze the user's trading history and answer their question concisely. Be brief and to the point.

User's Question: {{{question}}}

Trading History:
{{{history}}}
`,
});

const generateTradeideasFlow = ai.defineFlow(
  {
    name: 'generateTradeIdeasFlow',
    inputSchema: GenerateTradeIdeasInputSchema,
    outputSchema: GenerateTradeIdeasOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
