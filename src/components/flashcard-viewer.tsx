'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Trash2,
  Pencil,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMindPalace } from '@/contexts/mind-palace-context';
import type { FlashcardSet, Flashcard } from '@/lib/types';
import { FlashcardItem } from './flashcard-item';

interface FlashcardViewerProps {
  flashcardSet: FlashcardSet;
}

export const FlashcardViewer: React.FC<FlashcardViewerProps> = ({
  flashcardSet,
}) => {
  const { deleteFlashcard } = useMindPalace();
  const [cards, setCards] = useState<Flashcard[]>(flashcardSet.flashcards);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // When the flashcard set changes from the context, update the component's state
    setCards(flashcardSet.flashcards);
    if (flashcardSet.flashcards.length > 0 && currentIndex >= flashcardSet.flashcards.length) {
      // If the current index is out of bounds (e.g., after a deletion), reset to the last card
      setCurrentIndex(Math.max(0, flashcardSet.flashcards.length - 1));
    } else if (flashcardSet.flashcards.length === 0) {
      // If the set is empty, reset index to 0
      setCurrentIndex(0);
    }
     // Always reset editing state when cards change
    setIsEditing(false);
  }, [flashcardSet.flashcards, currentIndex]);


  const handleNext = useCallback(() => {
    setCurrentIndex((prevIndex) => Math.min(prevIndex + 1, cards.length - 1));
    setIsEditing(false);
  }, [cards.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    setIsEditing(false);
  }, []);

  useEffect(() => {
    // Add keydown listener for navigation
    const handleKeyDown = (e: KeyboardEvent) => {
        if(isEditing) return;
        if (e.key === 'ArrowRight') {
            handleNext();
        } else if (e.key === 'ArrowLeft') {
            handlePrev();
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, handleNext, handlePrev]); // Rerun when isEditing changes


  const handleShuffle = useCallback(() => {
    setCards((prevCards) => {
      const shuffled = [...prevCards];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    });
    setCurrentIndex(0);
    setIsEditing(false);
  }, []);

  const handleDelete = () => {
    if (currentCard) {
      deleteFlashcard(flashcardSet.id, currentCard.id);
      setIsEditing(false);
    }
  };

  const toggleEdit = () => {
    if (currentCard) {
      setIsEditing(!isEditing);
    }
  };

  const currentCard = useMemo(
    () => cards[currentIndex],
    [cards, currentIndex]
  );

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <div className="flex w-full max-w-3xl flex-1 flex-col items-center">
        {currentCard ? (
          <FlashcardItem
            key={currentCard.id} // Ensures re-render on card change
            setId={flashcardSet.id}
            flashcard={currentCard}
            isEditing={isEditing}
            onSave={() => setIsEditing(false)}
          />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center rounded-lg border bg-card shadow-md">
            <p className="text-xl text-muted-foreground">
              No flashcards in this set.
            </p>
          </div>
        )}

        <div className="mt-8 flex w-full max-w-3xl flex-col items-center justify-between sm:flex-row">
          <div className="mb-4 flex w-full justify-center sm:mb-0 sm:w-auto sm:justify-start space-x-2">
            <Button
              onClick={handleShuffle}
              variant="outline"
              aria-label="Shuffle cards"
              disabled={cards.length < 2 || isEditing}
            >
              <Shuffle className="mr-2 h-5 w-5" />
              Shuffle
            </Button>
            <Button
              onClick={toggleEdit}
              variant="outline"
              aria-label={isEditing ? 'Save card' : 'Edit card'}
              disabled={!currentCard}
            >
              {isEditing ? (
                <Save className="mr-2 h-5 w-5" />
              ) : (
                <Pencil className="mr-2 h-5 w-5" />
              )}
              {isEditing ? 'Save' : 'Edit'}
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-4">
            <Button
              onClick={handlePrev}
              disabled={currentIndex === 0 || isEditing}
              variant="outline"
              size="icon"
              aria-label="Previous card"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>

            <p className="w-24 text-center text-lg font-medium tabular-nums text-muted-foreground">
              {cards.length > 0
                ? `${currentIndex + 1} / ${cards.length}`
                : '0 / 0'}
            </p>

            <Button
              onClick={handleNext}
              disabled={
                currentIndex === cards.length - 1 ||
                cards.length === 0 ||
                isEditing
              }
              variant="outline"
              size="icon"
              aria-label="Next card"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
          <div className="mt-4 flex w-full justify-center sm:mt-0 sm:w-auto sm:justify-end">
            <Button
              onClick={handleDelete}
              variant="destructive"
              aria-label="Delete card"
              disabled={!currentCard || isEditing}
            >
              <Trash2 className="mr-2 h-5 w-5" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
