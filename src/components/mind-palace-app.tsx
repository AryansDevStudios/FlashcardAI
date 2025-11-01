'use client';

import { MindPalaceProvider, useMindPalace } from '@/contexts/mind-palace-context';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { Header } from '@/components/header';
import { SidebarContent } from '@/components/sidebar-content';
import { FlashcardGenerator } from '@/components/flashcard-generator';
import { FlashcardGrid } from '@/components/flashcard-grid';

function AppContent() {
  const { activeSet } = useMindPalace();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent />
      </Sidebar>
      <SidebarInset>
        <div className="flex h-full flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {activeSet ? (
              <FlashcardGrid key={activeSet.id} flashcardSet={activeSet} />
            ) : (
              <FlashcardGenerator />
            )}
          </main>
          <footer className="p-4 text-center text-sm text-muted-foreground">
            Made by Aryan Gupta
          </footer>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function FlashcardAIApp() {
  return (
    <MindPalaceProvider>
      <AppContent />
    </MindPalaceProvider>
  );
}
