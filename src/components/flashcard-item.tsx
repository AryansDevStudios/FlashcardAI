'use client';

import { useState, useRef, useEffect } from 'react';

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
  isEditing?: boolean;
  onSave?: () => void;
}

const EditableText = ({
  text,
  onSave,
  isEditing,
  setIsEditing,
}: {
  text: string;
  onSave: (newText: string) => void;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
}) => {
  const [editText, setEditText] = useState(text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing) {
      textareaRef.current?.focus();
      textareaRef.current?.select();
    }
  }, [isEditing]);
  
  useEffect(() => {
    setEditText(text);
  }, [text])

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
        className="h-full w-full resize-none bg-transparent text-current text-center"
      />
    );
  }

  return (
    <div
      className="h-full p-4 whitespace-pre-wrap flex items-center justify-center"
    >
      {text}
    </div>
  );
};

export function FlashcardItem({ palaceId, flashcard, isEditing: isEditingProp, onSave: onSaveProp }: FlashcardItemProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const { updateFlashcard } = useMindPalace();
  const { toast } = useToast();

  const [isEditingFront, setIsEditingFront] = useState(false);
  const [isEditingBack, setIsEditingBack] = useState(false);

  useEffect(() => {
    // If external editing state is provided, use it
    if (typeof isEditingProp !== 'undefined') {
        setIsEditingFront(isEditingProp);
        setIsEditingBack(isEditingProp);
    }
  }, [isEditingProp]);

  // When external onSave is called, it means save everything
  useEffect(() => {
    if(isEditingProp === false) { // Assuming false means save
      // This is a bit tricky because EditableText saves on blur.
      // We're now controlling save from parent.
      // We might need to lift state up.
      if (onSaveProp) {
        onSaveProp();
      }
    }
  }, [isEditingProp, onSaveProp]);

  const handleFlip = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('textarea')) {
      return;
    }
    if(isEditingProp) return; // Don't flip when in controlled editing mode
    setIsFlipped(!isFlipped);
  };
  
  const handleUpdate = (side: 'front' | 'back', newText: string) => {
    const newFront = side === 'front' ? newText : flashcard.front;
    const newBack = side === 'back' ? newText : flashcard.back;
    if (newFront !== flashcard.front || newBack !== flashcard.back) {
      updateFlashcard(palaceId, flashcard.id, newFront, newBack);
      toast({ description: "Card updated." });
    }
  };

  const handleFrontSave = (newText: string) => {
    handleUpdate('front', newText);
    setIsEditingFront(false);
    if(onSaveProp) onSaveProp();
  }

  const handleBackSave = (newText: string) => {
    handleUpdate('back', newText);
    setIsEditingBack(false);
    if(onSaveProp) onSaveProp();
  }

  return (
    <div
      className={cn("group h-64 w-full [perspective:1000px]", !isEditingProp && "cursor-pointer")}
      onClick={handleFlip}
    >
      <div
        className={cn(
          'relative h-full w-full rounded-lg shadow-md transition-transform duration-700 [transform-style:preserve-3d]',
          isFlipped && !isEditingProp && '[transform:rotateY(180deg)]'
        )}
      >
        {/* Front */}
        <Card className="absolute h-full w-full [backface-visibility:hidden]">
          <div className="flex h-full flex-col items-center justify-center p-2 text-center">
            <EditableText 
              text={flashcard.front} 
              onSave={handleFrontSave}
              isEditing={isEditingFront}
              setIsEditing={setIsEditingFront}
            />
          </div>
        </Card>

        {/* Back */}
        <Card className="absolute h-full w-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="flex h-full flex-col items-center justify-center p-2 text-center">
             <EditableText 
              text={flashcard.back} 
              onSave={handleBackSave} 
              isEditing={isEditingBack}
              setIsEditing={setIsEditingBack}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
