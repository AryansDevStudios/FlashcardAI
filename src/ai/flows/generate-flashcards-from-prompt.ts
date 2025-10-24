'use server';
/**
 * @fileOverview A flashcard generation AI agent.
 *
 * - generateFlashcardsFromPrompt - A function that generates a set of flashcards from a text prompt.
 * - GenerateFlashcardsFromPromptInput - The input type for the generateFlashcardsFromPrompt function.
 * - GenerateFlashcardsFromPromptOutput - The return type for the generateFlashcardsFromPrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFlashcardsFromPromptInputSchema = z.object({
  topic: z.string().describe('The topic for the flashcards.'),
  numFlashcards: z.number().min(5).max(100).describe('The number of flashcards to generate.'),
  frontTextLength: z.enum(['short', 'medium', 'long']).describe('The desired length of the text on the front of the flashcards.'),
  backTextLength: z.enum(['short', 'medium', 'long']).describe('The desired length of the text on the back of the flashcards.'),
});
export type GenerateFlashcardsFromPromptInput = z.infer<typeof GenerateFlashcardsFromPromptInputSchema>;

const FlashcardSchema = z.object({
  front: z.string().describe('The question or concept on the front of the flashcard.'),
  back: z.string().describe('The answer or notes on the back of the flashcard. Use Markdown for formatting and bold the most important part of the answer.'),
});

const GenerateFlashcardsFromPromptOutputSchema = z.array(FlashcardSchema).describe('An array of flashcards generated from the prompt.');
export type GenerateFlashcardsFromPromptOutput = z.infer<typeof GenerateFlashcardsFromPromptOutputSchema>;

export async function generateFlashcardsFromPrompt(input: GenerateFlashcardsFromPromptInput): Promise<GenerateFlashcardsFromPromptOutput> {
  return generateFlashcardsFromPromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFlashcardsFromPromptPrompt',
  input: {schema: GenerateFlashcardsFromPromptInputSchema},
  output: {schema: GenerateFlashcardsFromPromptOutputSchema},
  prompt: `You are a flashcard generation expert. Generate {{numFlashcards}} flashcards on the topic of {{topic}}.

The front of the flashcard should be {{frontTextLength}} in length and contain the question or concept.
The back of the flashcard should be {{backTextLength}} in length and contain the answer or notes.

IMPORTANT: For the back of the card, use Markdown to format the answer. You MUST bold the most important keyword or phrase in the answer using Markdown's double-asterisk syntax (e.g., **this is bold**).

Return the flashcards as a JSON array of objects with "front" and "back" keys. For example:

[
  {
    "front": "What is the capital of France?",
    "back": "The capital of France is **Paris**."
  },
  {
    "front": "What is the formula for water?",
    "back": "The chemical formula for water is **H2O**."
  }
]
`,
});

const generateFlashcardsFromPromptFlow = ai.defineFlow(
  {
    name: 'generateFlashcardsFromPromptFlow',
    inputSchema: GenerateFlashcardsFromPromptInputSchema,
    outputSchema: GenerateFlashcardsFromPromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
