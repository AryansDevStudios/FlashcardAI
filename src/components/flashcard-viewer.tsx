'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Shuffle, Trash2, Pencil, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMindPalace } from '@/contexts/mind-palace-context';
import type { FlashcardSet, Flashcard } from '@/lib/types';
import { FlashcardItem } from './flashcard-item';

interface FlashcardViewerProps {
  flashcardSet: FlashcardSet;
}

export const FlashcardViewer: React.FC<FlashcardViewerProps> = ({ flashcardSet }) => {
  const { deleteFlashcard } = useMindPalace();
  const [cards, setCards] = useState<Flashcard[]>(flashcardSet.flashcards);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setCards(flashcardSet.flashcards);
    if (flashcardSet.flashcards.length > 0 && currentIndex >= flashcardSet.flashcards.length) {
      setCurrentIndex(Math.max(0, flashcardSet.flashcards.length - 1));
    } else if (flashcardSet.flashcards.length === 0) {
      setCurrentIndex(0);
    }
    // Reset editing state when flashcardSet changes
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
  }

  const currentCard = useMemo(() => cards[currentIndex], [cards, currentIndex]);

  return (
    <div className="flex flex-col items-center justify-center flex-1 w-full">
      <div className="w-full max-w-3xl flex-1 flex flex-col items-center">
        {currentCard ? (
          <FlashcardItem
            key={currentCard.id} // Ensures re-render on card change
            setId={flashcardSet.id}
            flashcard={currentCard}
            isEditing={isEditing}
            onSave={() => setIsEditing(false)}
          />
        ) : (
          <div className="aspect-video w-full flex items-center justify-center bg-card rounded-lg shadow-md">
            <p className="text-xl text-muted-foreground">No flashcards in this set.</p>
          </div>
        )}
        
        <div className="w-full max-w-3xl mt-8 flex flex-col sm:flex-row items-center justify-between">
            <div className="w-full sm:w-auto flex justify-center mb-4 sm:mb-0 space-x-2">
                <Button
                onClick={handleShuffle}
                variant="outline"
                aria-label="Shuffle cards"
                disabled={cards.length < 2 || isEditing}
                >
                <Shuffle className="w-5 h-5 mr-2" />
                Shuffle
                </Button>
                 <Button
                    onClick={toggleEdit}
                    variant="outline"
                    aria-label={isEditing ? 'Save card' : 'Edit card'}
                    disabled={!currentCard}
                    >
                    {isEditing ? <Save className="w-5 h-5 mr-2" /> : <Pencil className="w-5 h-5 mr-2" />}
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
                <ChevronLeft className="w-6 h-6" />
                </Button>

                <p className="text-lg font-medium text-muted-foreground tabular-nums w-24 text-center">
                {cards.length > 0 ? `${currentIndex + 1} / ${cards.length}` : '0 / 0'}
                </p>

                <Button
                onClick={handleNext}
                disabled={currentIndex === cards.length - 1 || cards.length === 0 || isEditing}
                variant="outline"
                size="icon"
                aria-label="Next card"
                >
                <ChevronRight className="w-6 h-6" />
                </Button>
            </div>
             <div className="w-full sm:w-auto flex justify-center mt-4 sm:mt-0">
                 <Button
                    onClick={handleDelete}
                    variant="destructive"
                    aria-label="Delete card"
                    disabled={!currentCard || isEditing}
                    >
                    <Trash2 className="w-5 h-5 mr-2" />
                    Delete
                </Button>
            </div>

        </div>
      </div>
    </div>
  );
};
