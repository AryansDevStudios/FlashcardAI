'use client';

import { BrainCircuit } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { useMindPalace } from '@/contexts/mind-palace-context';
import { Button } from './ui/button';

export function Header() {
  const { activePalace, setActivePalaceId } = useMindPalace();
  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <BrainCircuit className="h-7 w-7 text-primary" />
        <h1 className="text-xl font-semibold tracking-tight">FlashcardAI</h1>
      </div>
     
      <div className="flex items-center gap-2">
        {activePalace && (
          <Button variant="outline" size="sm" onClick={() => setActivePalaceId(null)}>
            New Palace
          </Button>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
