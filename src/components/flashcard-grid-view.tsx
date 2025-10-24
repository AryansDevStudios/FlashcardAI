'use client';

import { FlashcardSet } from '@/lib/types';
import { FlashcardItem } from './flashcard-item';

interface FlashcardGridViewProps {
  flashcardSet: FlashcardSet;
}

export function FlashcardGrid({ flashcardSet }: FlashcardGridViewProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {flashcardSet.flashcards.map((flashcard) => (
        <FlashcardItem
          key={flashcard.id}
          setId={flashcardSet.id}
          flashcard={flashcard}
        />
      ))}
    </div>
  );
}
