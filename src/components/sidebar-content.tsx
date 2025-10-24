'use client';

import { useMindPalace } from '@/contexts/mind-palace-context';
import {
  SidebarHeader,
  SidebarContent as Content,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
} from '@/components/ui/sidebar';
import { Book, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function SidebarContent() {
  const { flashcardSets, activeSet, setActiveSetId, deleteSet } = useMindPalace();

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <Book className="h-6 w-6 text-primary" />
            <h2 className="text-lg font-semibold">My Flashcard Sets</h2>
        </div>
      </SidebarHeader>
      <Content>
        <SidebarGroup>
          <SidebarMenu>
            {flashcardSets.length > 0 ? (
              flashcardSets.map((set) => (
                <SidebarMenuItem key={set.id}>
                  <SidebarMenuButton
                    onClick={() => setActiveSetId(set.id)}
                    isActive={activeSet?.id === set.id}
                    className="h-auto py-2"
                  >
                    <div className="flex flex-col items-start gap-1">
                        <span className='font-medium'>{set.name}</span>
                        <span className='text-xs text-muted-foreground'>
                            {set.flashcards.length} cards, created{' '}
                            {formatDistanceToNow(new Date(set.createdAt), { addSuffix: true })}
                        </span>
                    </div>
                  </SidebarMenuButton>
                  <SidebarMenuAction
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSet(set.id);
                    }}
                    aria-label="Delete set"
                  >
                    <Trash2 />
                  </SidebarMenuAction>
                </SidebarMenuItem>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No flashcard sets yet. Create one to get started!
              </div>
            )}
          </SidebarMenu>
        </SidebarGroup>
      </Content>
    </>
  );
}
