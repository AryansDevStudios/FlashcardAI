'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Palace, Flashcard } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface MindPalaceContextType {
  palaces: Palace[];
  activePalace: Palace | null;
  createPalace: (name: string, flashcards: Omit<Flashcard, 'id'>[]) => void;
  setActivePalaceId: (id: string | null) => void;
  deletePalace: (id: string) => void;
  updateFlashcard: (palaceId: string, cardId: string, newFront: string, newBack: string) => void;
  deleteFlashcard: (palaceId: string, cardId: string) => void;
}

const MindPalaceContext = createContext<MindPalaceContextType | undefined>(
  undefined
);

export const MindPalaceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [palaces, setPalaces] = useLocalStorage<Palace[]>('mind-palaces', []);
  const [activePalaceId, setActivePalaceId] = useLocalStorage<string | null>(
    'mind-palaces-active',
    null
  );
  const [activePalace, setActivePalace] = useState<Palace | null>(null);

  useEffect(() => {
    if (activePalaceId) {
      const foundPalace = palaces.find((p) => p.id === activePalaceId);
      setActivePalace(foundPalace || null);
    } else {
      setActivePalace(null);
    }
  }, [activePalaceId, palaces]);

  const createPalace = useCallback((name: string, flashcards: Omit<Flashcard, 'id'>[]) => {
      const newPalace: Palace = {
        id: crypto.randomUUID(),
        name,
        flashcards: flashcards.map(card => ({...card, id: crypto.randomUUID()})),
        createdAt: new Date().toISOString(),
      };
      setPalaces((prev) => [newPalace, ...prev]);
      setActivePalaceId(newPalace.id);
    },
    [setPalaces, setActivePalaceId]
  );
  
  const deletePalace = useCallback((id: string) => {
      setPalaces((prev) => prev.filter((p) => p.id !== id));
      if (activePalaceId === id) {
        setActivePalaceId(null);
      }
    },
    [activePalaceId, setPalaces, setActivePalaceId]
  );

  const updateFlashcard = useCallback((palaceId: string, cardId: string, newFront: string, newBack: string) => {
    setPalaces(prev => prev.map(palace => {
      if (palace.id === palaceId) {
        return {
          ...palace,
          flashcards: palace.flashcards.map(card => {
            if (card.id === cardId) {
              return { ...card, front: newFront, back: newBack };
            }
            return card;
          })
        };
      }
      return palace;
    }));
  }, [setPalaces]);

  const deleteFlashcard = useCallback((palaceId: string, cardId: string) => {
    setPalaces(prev => prev.map(palace => {
      if (palace.id === palaceId) {
        return {
          ...palace,
          flashcards: palace.flashcards.filter(card => card.id !== cardId)
        };
      }
      return palace;
    }));
  }, [setPalaces]);


  return (
    <MindPalaceContext.Provider
      value={{
        palaces,
        activePalace,
        createPalace,
        setActivePalaceId,
        deletePalace,
        updateFlashcard,
        deleteFlashcard,
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
