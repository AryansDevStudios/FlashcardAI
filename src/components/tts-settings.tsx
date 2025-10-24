'use client';
import { useState, useTransition } from 'react';
import {
  Settings,
  Bot,
  Monitor,
  Play,
  Loader2,
  Volume2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useTtsSettings, AI_VOICES } from '@/contexts/tts-settings-context';
import { textToSpeechAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';

const PREVIEW_TEXT = 'Hello, this is a preview of my voice.';

export function TtsSettingsDialog() {
  const [open, setOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState<Record<string, boolean>>({});
  const { voiceSource, setVoiceSource, aiVoice, setAiVoice } = useTtsSettings();
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handlePreview = (voice: string) => {
    startTransition(async () => {
      setIsPlaying((prev) => ({ ...prev, [voice]: true }));
      const result = await textToSpeechAction({
        text: PREVIEW_TEXT,
        voice: voice,
      });
      if (result.success && result.data) {
        const audio = new Audio(result.data);
        audio.play();
        audio.onended = () => {
          setIsPlaying((prev) => ({ ...prev, [voice]: false }));
        };
      } else {
        console.log(result.error);
        toast({
          variant: 'destructive',
          title: 'Preview Failed',
          description: result.error,
        });
        setIsPlaying((prev) => ({ ...prev, [voice]: false }));
      }
    });
  };

  const handleBrowserPreview = () => {
    const utterance = new SpeechSynthesisUtterance(PREVIEW_TEXT);
    speechSynthesis.speak(utterance);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
                <span className="sr-only">TTS Settings</span>
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Voice Settings</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Text-to-Speech Settings</DialogTitle>
          <DialogDescription>
            Choose your preferred voice source for listening to flashcards.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <RadioGroup
            value={voiceSource}
            onValueChange={(value) => setVoiceSource(value as any)}
            className="space-y-4"
          >
            <Label className="flex items-start space-x-3 rounded-md border p-4 has-[:checked]:border-primary">
              <RadioGroupItem value="browser" id="browser" />
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 font-semibold">
                  <Monitor className="h-5 w-5" />
                  <span>Browser Voice</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>
                    Uses your browser&apos;s built-in text-to-speech engine.
                  </p>
                  <ul className="mt-2 list-inside list-disc text-xs">
                    <li>
                      <span className="font-semibold text-green-600">Pro:</span>{' '}
                      Instant playback, no network needed.
                    </li>
                    <li>
                      <span className="font-semibold text-red-600">Con:</span>{' '}
                      More robotic, voice varies by browser.
                    </li>
                  </ul>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={handleBrowserPreview}
                    className="px-0 h-auto mt-1"
                  >
                    <Volume2 className="mr-1 h-4 w-4" /> Preview
                  </Button>
                </div>
              </div>
            </Label>
            <Label className="flex items-start space-x-3 rounded-md border p-4 has-[:checked]:border-primary">
              <RadioGroupItem value="ai" id="ai" />
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2 font-semibold">
                  <Bot className="h-5 w-5" />
                  <span>AI Voice</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Uses a high-quality, natural-sounding AI voice.</p>
                  <ul className="mt-2 list-inside list-disc text-xs">
                    <li>
                      <span className="font-semibold text-green-600">Pro:</span>{' '}
                      Very natural and human-like.
                    </li>
                    <li>
                      <span className="font-semibold text-red-600">Con:</span>{' '}
                      Requires an internet connection, slight delay.
                    </li>
                  </ul>
                </div>
              </div>
            </Label>
          </RadioGroup>

          {voiceSource === 'ai' && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="ai-voice-select">Select AI Voice</Label>
                <div className="flex items-center gap-2">
                  <Select
                    value={aiVoice}
                    onValueChange={setAiVoice}
                    disabled={voiceSource !== 'ai'}
                  >
                    <SelectTrigger id="ai-voice-select" className="flex-1">
                      <SelectValue placeholder="Select a voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {AI_VOICES.map((voice) => (
                        <SelectItem key={voice} value={voice}>
                          {voice}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handlePreview(aiVoice)}
                          disabled={isPending || isPlaying[aiVoice]}
                          aria-label="Preview selected voice"
                        >
                          {isPending && isPlaying[aiVoice] ? (
                            <Loader2 className="animate-spin" />
                          ) : (
                            <Play />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Preview Voice</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
