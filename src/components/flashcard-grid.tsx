'use client';

import { useState } from 'react';
import { LayoutGrid, Rows3 } from 'lucide-react';
import { FlashcardSet, Flashcard } from '@/lib/types';
import { FlashcardGrid as GridView } from './flashcard-grid-view';
import { FlashcardViewer } from './flashcard-viewer';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useMindPalace } from '@/contexts/mind-palace-context';

interface FlashcardGridProps {
  flashcardSet: FlashcardSet;
}

type ViewMode = 'grid' | 'viewer';

export function FlashcardGrid({ flashcardSet }: FlashcardGridProps) {
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>(
    'flashcard-ai-view-mode',
    'viewer'
  );
  const { addFlashcard } = useMindPalace();

  const handleAddCard = () => {
    addFlashcard(flashcardSet.id, { front: 'New Front', back: 'New Back' });
  };


  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">
                {flashcardSet.name}
            </h2>
            <span className="text-muted-foreground">({flashcardSet.flashcards.length} cards)</span>
        </div>

        <div className="flex items-center gap-2">
           <Button onClick={handleAddCard}>Add Card</Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setViewMode(viewMode === 'viewer' ? 'grid' : 'viewer')
                  }
                >
                  {viewMode === 'viewer' ? (
                    <LayoutGrid className="h-4 w-4" />
                  ) : (
                    <Rows3 className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Switch to {viewMode === 'viewer' ? 'Grid View' : 'Viewer Mode'}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      {viewMode === 'grid' ? (
        <GridView flashcardSet={flashcardSet} />
      ) : (
        <FlashcardViewer flashcardSet={flashcardSet} />
      )}
    </div>
  );
}
