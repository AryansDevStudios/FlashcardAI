'use server';

import {
  generateFlashcardsFromPrompt,
  type GenerateFlashcardsFromPromptInput,
} from '@/ai/flows/generate-flashcards-from-prompt';
import {
  textToSpeech,
  type TextToSpeechInput,
} from '@/ai/flows/text-to-speech';

export async function generateFlashcardsAction(
  input: GenerateFlashcardsFromPromptInput
) {
  try {
    const flashcards = await generateFlashcardsFromPrompt(input);
    if (!flashcards || flashcards.length === 0) {
      const errorMessage =
        'The AI could not generate flashcards for this topic. Please try a different one.';
      console.error('generateFlashcardsAction Error:', errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
    return { success: true, data: flashcards };
  } catch (error) {
    console.error('Error generating flashcards:', error);
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again later.',
    };
  }
}

export async function textToSpeechAction(input: TextToSpeechInput) {
  try {
    const { audio } = await textToSpeech(input);
    return { success: true, data: audio };
  } catch (error) {
    console.error('Error converting text to speech:', error);
    return {
      success: false,
      error: 'An unexpected error occurred during text-to-speech conversion.',
    };
  }
}
