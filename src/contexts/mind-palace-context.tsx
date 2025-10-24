'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { FlashcardSet, Flashcard } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface MindPalaceContextType {
  flashcardSets: FlashcardSet[];
  activeSet: FlashcardSet | null;
  createSet: (name: string, flashcards: Omit<Flashcard, 'id'>[]) => void;
  setActiveSetId: (id: string | null) => void;
  deleteSet: (id: string) => void;
  updateFlashcard: (setId: string, cardId: string, newFront: string, newBack: string) => void;
  deleteFlashcard: (setId: string, cardId: string) => void;
  addFlashcard: (setId: string, flashcard: Omit<Flashcard, 'id'>) => void;
}

const MindPalaceContext = createContext<MindPalaceContextType | undefined>(
  undefined
);

export const MindPalaceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [flashcardSets, setFlashcardSets] = useLocalStorage<FlashcardSet[]>('flashcard-ai-sets', []);
  const [activeSetId, setActiveSetId] = useLocalStorage<string | null>(
    'flashcard-ai-active-set',
    null
  );
  const [activeSet, setActiveSet] = useState<FlashcardSet | null>(null);

  useEffect(() => {
    if (activeSetId) {
      const foundSet = flashcardSets.find((p) => p.id === activeSetId);
      setActiveSet(foundSet || null);
    } else {
      setActiveSet(null);
    }
  }, [activeSetId, flashcardSets]);

  const createSet = useCallback((name: string, flashcards: Omit<Flashcard, 'id'>[]) => {
      const newSet: FlashcardSet = {
        id: crypto.randomUUID(),
        name,
        flashcards: flashcards.map(card => ({...card, id: crypto.randomUUID()})),
        createdAt: new Date().toISOString(),
      };
      setFlashcardSets((prev) => [newSet, ...prev]);
      setActiveSetId(newSet.id);
    },
    [setFlashcardSets, setActiveSetId]
  );
  
  const deleteSet = useCallback((id: string) => {
      setFlashcardSets((prev) => prev.filter((p) => p.id !== id));
      if (activeSetId === id) {
        setActiveSetId(null);
      }
    },
    [activeSetId, setFlashcardSets, setActiveSetId]
  );

  const updateFlashcard = useCallback((setId: string, cardId: string, newFront: string, newBack: string) => {
    setFlashcardSets(prev => prev.map(set => {
      if (set.id === setId) {
        return {
          ...set,
          flashcards: set.flashcards.map(card => {
            if (card.id === cardId) {
              return { ...card, front: newFront, back: newBack };
            }
            return card;
          })
        };
      }
      return set;
    }));
  }, [setFlashcardSets]);

  const deleteFlashcard = useCallback((setId: string, cardId: string) => {
    setFlashcardSets(prev => prev.map(set => {
      if (set.id === setId) {
        return {
          ...set,
          flashcards: set.flashcards.filter(card => card.id !== cardId)
        };
      }
      return set;
    }));
  }, [setFlashcardSets]);

  const addFlashcard = useCallback((setId: string, flashcard: Omit<Flashcard, 'id'>) => {
    const newCard: Flashcard = { ...flashcard, id: crypto.randomUUID() };
    setFlashcardSets(prev => prev.map(set => {
      if (set.id === setId) {
        return {
          ...set,
          flashcards: [...set.flashcards, newCard]
        };
      }
      return set;
    }));
  }, [setFlashcardSets]);


  return (
    <MindPalaceContext.Provider
      value={{
        flashcardSets,
        activeSet,
        createSet,
        setActiveSetId,
        deleteSet,
        updateFlashcard,
        deleteFlashcard,
        addFlashcard,
      }}
    >
      {children}
    </MindPalaceContext.Provider>
  );
};

export const useMindPalace = () => {
  const context = useContext(MindPalaceContext);
  if (context === undefined) {
    throw new Error('useMindPalace must be used within a MindPalaceProvider');
  }
  return context;
};
