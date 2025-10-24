'use client';

import { useState, useRef, useEffect } from 'react';
import { Trash2 } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { Flashcard } from '@/lib/types';
import { useMindPalace } from '@/contexts/mind-palace-context';
import { useToast } from '@/hooks/use-toast';

interface FlashcardItemProps {
  palaceId: string;
  flashcard: Flashcard;
}

const EditableText = ({
  text,
  onSave,
}: {
  text: string;
  onSave: (newText: string) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing) {
      textareaRef.current?.focus();
      textareaRef.current?.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editText.trim() !== text) {
      onSave(editText.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditText(text);
    }
  };

  if (isEditing) {
    return (
      <Textarea
        ref={textareaRef}
        value={editText}
        onChange={(e) => setEditText(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className="h-full w-full resize-none bg-transparent text-current"
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="h-full cursor-pointer p-4 whitespace-pre-wrap"
    >
      {text}
    </div>
  );
};

export function FlashcardItem({ palaceId, flashcard }: FlashcardItemProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const { updateFlashcard, deleteFlashcard } = useMindPalace();
  const { toast } = useToast();

  const handleFlip = (e: React.MouseEvent) => {
    // Prevent flipping when interacting with buttons or editable text
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('textarea')) {
      return;
    }
    setIsFlipped(!isFlipped);
  };
  
  const handleUpdate = (side: 'front' | 'back', newText: string) => {
    const newFront = side === 'front' ? newText : flashcard.front;
    const newBack = side === 'back' ? newText : flashcard.back;
    updateFlashcard(palaceId, flashcard.id, newFront, newBack);
    toast({ description: "Card updated." });
  };

  return (
    <div
      className="group h-64 w-full cursor-pointer [perspective:1000px]"
      onClick={handleFlip}
    >
      <div
        className={cn(
          'relative h-full w-full rounded-lg shadow-md transition-transform duration-700 [transform-style:preserve-3d]',
          isFlipped && '[transform:rotateY(180deg)]'
        )}
      >
        {/* Front */}
        <Card className="absolute h-full w-full [backface-visibility:hidden]">
          <div className="flex h-full flex-col items-center justify-center p-2 text-center">
            <EditableText text={flashcard.front} onSave={(newText) => handleUpdate('front', newText)} />
          </div>
        </Card>

        {/* Back */}
        <Card className="absolute h-full w-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="flex h-full flex-col items-center justify-center p-2 text-center">
             <EditableText text={flashcard.back} onSave={(newText) => handleUpdate('back', newText)} />
          </div>
        </Card>
      </div>

       <Button
          variant="destructive"
          size="icon"
          className="absolute bottom-2 right-2 z-10 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            deleteFlashcard(palaceId, flashcard.id);
            toast({ description: "Card deleted." });
          }}
          aria-label="Delete card"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
    </div>
  );
}
