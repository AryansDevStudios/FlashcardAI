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
  const { palaces, activePalace, setActivePalaceId, deletePalace } = useMindPalace();

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <Book className="h-6 w-6 text-primary" />
            <h2 className="text-lg font-semibold">My Palaces</h2>
        </div>
      </SidebarHeader>
      <Content>
        <SidebarGroup>
          <SidebarMenu>
            {palaces.length > 0 ? (
              palaces.map((palace) => (
                <SidebarMenuItem key={palace.id}>
                  <SidebarMenuButton
                    onClick={() => setActivePalaceId(palace.id)}
                    isActive={activePalace?.id === palace.id}
                    className="h-auto py-2"
                  >
                    <div className="flex flex-col items-start gap-1">
                        <span className='font-medium'>{palace.name}</span>
                        <span className='text-xs text-muted-foreground'>
                            {palace.flashcards.length} cards, created{' '}
                            {formatDistanceToNow(new Date(palace.createdAt), { addSuffix: true })}
                        </span>
                    </div>
                  </SidebarMenuButton>
                  <SidebarMenuAction
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePalace(palace.id);
                    }}
                    aria-label="Delete palace"
                  >
                    <Trash2 />
                  </SidebarMenuAction>
                </SidebarMenuItem>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No palaces yet. Create one to get started!
              </div>
            )}
          </SidebarMenu>
        </SidebarGroup>
      </Content>
    </>
  );
}
