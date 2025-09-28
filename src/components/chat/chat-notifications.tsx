'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useChat } from '@/context/chat-context';

function formatRelative(date: Date | null): string {
  if (!date) return '';
  const formatter = new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return formatter.format(date);
}

export function ChatNotifications() {
  const router = useRouter();
  const pathname = usePathname();
  const { notifications, unreadTotal, setPendingConversation, openConversationById } = useChat();
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleOpenConversation = (conversationId: string) => {
    setIsOpen(false);
    setPendingConversation(conversationId);
    if (pathname === '/en-classe') {
      void openConversationById(conversationId);
    } else {
      router.push('/en-classe');
    }
  };

  const hasNotifications = notifications.length > 0;

  return (
    <div className="pointer-events-none fixed top-4 right-4 z-[160]">
      <div className="pointer-events-auto">
        <Button
          aria-label="Notifications de messagerie"
          onClick={handleToggle}
          size="icon"
          variant="outline"
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {unreadTotal > 0 && (
            <span className="absolute -top-2 -right-2 flex h-5 min-w-[1.1rem] items-center justify-center rounded-full bg-red-500 px-[3px] text-[10px] font-semibold text-white">
              {unreadTotal}
            </span>
          )}
        </Button>
        {isOpen && (
          <Card className="mt-2 w-80 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Nouveaux messages</CardTitle>
            </CardHeader>
            <CardContent className="max-h-80 space-y-2 overflow-y-auto p-2">
              {hasNotifications ? (
                notifications.map((notification) => (
                  <button
                    key={notification.conversationId}
                    className="w-full rounded-lg border border-transparent px-3 py-2 text-left transition hover:border-primary/40 hover:bg-primary/5"
                    onClick={() => handleOpenConversation(notification.conversationId)}
                    type="button"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">{notification.contactName}</span>
                      <span className="text-xs text-muted-foreground">{formatRelative(notification.updatedAt)}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="inline-flex min-w-[1.5rem] justify-center rounded-full bg-red-500 px-2 text-[11px] font-bold text-white">
                        {notification.unreadCount}
                      </span>
                      <span className="line-clamp-2 text-xs text-muted-foreground">{notification.preview}</span>
                    </div>
                  </button>
                ))
              ) : (
                <p className="px-1 py-6 text-center text-sm text-muted-foreground">Aucune nouvelle notification.</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
