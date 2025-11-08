
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
  allData: z.string().describe("A JSON string containing all of the user's application data, including live and backtest journals, goals, notes, and checklists."),
  question: z.string().describe("The user's question about their data."),
});

export type GenerateTradeIdeasInput = z.infer<typeof GenerateTradeIdeasInputSchema>;

const GenerateTradeIdeasOutputSchema = z.object({
  answer: z.string().describe('A short and brief answer to the user question based on the provided data.'),
});

export type GenerateTradeIdeasOutput = z.infer<typeof GenerateTradeIdeasOutputSchema>;


const prompt = ai.definePrompt({
  name: 'generateTradeIdeasPrompt',
  input: {schema: GenerateTradeIdeasInputSchema},
  output: {schema: GenerateTradeIdeasOutputSchema},
  prompt: `You are an expert trading analyst. Your role is to answer questions about a user's trading-related data.
The user's data is provided below as a JSON string. It contains live journal entries, backtest entries, goals, market analysis notes, self-development notes, and strategy checklists.
Today's date is ${new Date().toDateString()}.

Analyze the user's data and answer their question concisely. Be brief and to the point.

If you cannot answer the question from the provided data, just say "I could not find any relevant information in your data to answer that question."

User's Question: {{{question}}}

User's Data (JSON format):
{{{allData}}}
`,
});

const generateTradeIdeasFlow = ai.defineFlow(
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

export async function generateTradeIdeas(input: GenerateTradeIdeasInput): Promise<GenerateTradeIdeasOutput> {
  return generateTradeIdeasFlow(input);
}
