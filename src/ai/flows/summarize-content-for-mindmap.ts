'use server';
/**
 * @fileOverview Summarizes content for mindmap creation.
 *
 * - summarizeContentForMindmap - A function that summarizes content.
 * - SummarizeContentForMindmapInput - The input type for the summarizeContentForMindmap function.
 * - SummarizeContentForMindmapOutput - The return type for the summarizeContentForMindmap function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeContentForMindmapInputSchema = z.object({
  text: z.string().describe('The text content to summarize for mindmap creation.'),
});

export type SummarizeContentForMindmapInput = z.infer<typeof SummarizeContentForMindmapInputSchema>;

const SummarizeContentForMindmapOutputSchema = z.object({
  summary: z.string().describe('A summary of the key concepts and relationships in the text.'),
});

export type SummarizeContentForMindmapOutput = z.infer<typeof SummarizeContentForMindmapOutputSchema>;

export async function summarizeContentForMindmap(input: SummarizeContentForMindmapInput): Promise<SummarizeContentForMindmapOutput> {
  return summarizeContentForMindmapFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeContentForMindmapPrompt',
  input: {schema: SummarizeContentForMindmapInputSchema},
  output: {schema: SummarizeContentForMindmapOutputSchema},
  prompt: `You are an expert at summarizing text content for the purpose of creating mindmaps.

  Your goal is to identify the key concepts and their relationships within the provided text.

  Text: {{{text}}}

  Please provide a concise summary of the key concepts and relationships that would be useful for creating a mindmap.`,
});

const summarizeContentForMindmapFlow = ai.defineFlow(
  {
    name: 'summarizeContentForMindmapFlow',
    inputSchema: SummarizeContentForMindmapInputSchema,
    outputSchema: SummarizeContentForMindmapOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
