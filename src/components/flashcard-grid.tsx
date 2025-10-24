'use client';

import { Palace } from '@/lib/types';
import { FlashcardItem } from './flashcard-item';

interface FlashcardGridProps {
  palace: Palace;
}

export function FlashcardGrid({ palace }: FlashcardGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {palace.flashcards.map((flashcard) => (
        <FlashcardItem
          key={flashcard.id}
          palaceId={palace.id}
          flashcard={flashcard}
        />
      ))}
    </div>
  );
}
