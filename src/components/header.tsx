'use client';

import { Settings } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { useMindPalace } from '@/contexts/mind-palace-context';
import { Button } from './ui/button';
import { TtsSettingsDialog } from './tts-settings';
import Image from 'next/image';

export function Header() {
  const { activeSet, setActiveSetId } = useMindPalace();
  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <Image src="/logo.ico" alt="FlashcardAI Logo" width={28} height={28} />
        <h1 className="text-xl font-semibold tracking-tight">FlashcardAI</h1>
      </div>

      <div className="flex items-center gap-2">
        {activeSet && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveSetId(null)}
          >
            New Set
          </Button>
        )}
        <TtsSettingsDialog />
        <ThemeToggle />
      </div>
    </header>
  );
}
