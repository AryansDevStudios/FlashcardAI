'use client';

import { MindPalaceProvider, useMindPalace } from '@/contexts/mind-palace-context';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { Header } from '@/components/header';
import { SidebarContent } from '@/components/sidebar-content';
import { FlashcardGenerator } from '@/components/flashcard-generator';
import { FlashcardGrid } from '@/components/flashcard-grid';

function AppContent() {
  const { activePalace } = useMindPalace();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent />
      </Sidebar>
      <SidebarInset>
        <div className="flex h-full flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {activePalace ? (
              <FlashcardGrid key={activePalace.id} palace={activePalace} />
            ) : (
              <FlashcardGenerator />
            )}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function MindPalaceApp() {
  return (
    <MindPalaceProvider>
      <AppContent />
    </MindPalaceProvider>
  );
}
