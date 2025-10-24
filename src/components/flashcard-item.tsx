'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import ReactMarkdown from 'react-markdown';
import { Volume2, Loader2 } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import type { Flashcard } from '@/lib/types';
import { useMindPalace } from '@/contexts/mind-palace-context';
import { useToast } from '@/hooks/use-toast';
import { textToSpeechAction } from '@/app/actions';
import { Button } from './ui/button';

interface FlashcardItemProps {
  setId: string;
  flashcard: Flashcard;
  isEditing?: boolean;
  onSave?: () => void;
}

const SpeakerButton = ({ text }: { text: string }) => {
  const [isPending, startTransition] = useTransition();
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audio) {
      audio.play();
      return;
    }
    startTransition(async () => {
      const result = await textToSpeechAction({ text });
      if (result.success && result.data) {
        const newAudio = new Audio(result.data);
        setAudio(newAudio);
        newAudio.play();
      } else {
        toast({
          variant: 'destructive',
          title: 'Audio Failed',
          description: result.error,
        });
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleSpeak}
      disabled={isPending}
      className="absolute bottom-2 right-2 z-10 h-7 w-7 text-muted-foreground hover:text-foreground"
      aria-label="Speak text"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Volume2 className="h-4 w-4" />
      )}
    </Button>
  );
};


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
  }, [text]);

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
        className="h-full w-full resize-none bg-transparent text-current text-center text-lg flex items-center justify-center"
      />
    );
  }

  return (
    <div className="h-full p-4 whitespace-pre-wrap flex items-center justify-center text-center prose prose-lg dark:prose-invert max-w-full">
      <ReactMarkdown
        components={{
          p: ({ node, ...props }) => <p className="text-xl" {...props} />,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
};

export function FlashcardItem({
  setId,
  flashcard,
  isEditing: isEditingProp,
  onSave: onSaveProp,
}: FlashcardItemProps) {
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
    if (isEditingProp === false) {
      // Assuming false means save
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
    if (isEditingProp) return; // Don't flip when in controlled editing mode
    setIsFlipped(!isFlipped);
  };

  const handleUpdate = (side: 'front' | 'back', newText: string) => {
    const newFront = side === 'front' ? newText : flashcard.front;
    const newBack = side === 'back' ? newText : flashcard.back;
    if (newFront !== flashcard.front || newBack !== flashcard.back) {
      updateFlashcard(setId, flashcard.id, newFront, newBack);
      toast({ description: 'Card updated.' });
    }
  };

  const handleFrontSave = (newText: string) => {
    handleUpdate('front', newText);
    setIsEditingFront(false);
    if (onSaveProp) onSaveProp();
  };

  const handleBackSave = (newText: string) => {
    handleUpdate('back', newText);
    setIsEditingBack(false);
    if (onSaveProp) onSaveProp();
  };

  return (
    <div
      className={cn(
        'group h-64 w-full [perspective:1000px]',
        !isEditingProp && 'cursor-pointer'
      )}
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
             <SpeakerButton text={flashcard.front} />
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
            <SpeakerButton text={flashcard.back} />
          </div>
        </Card>
      </div>
    </div>
  );
}
