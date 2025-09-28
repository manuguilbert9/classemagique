'use client';

import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChat } from '@/context/chat-context';
import { useContext, useEffect } from 'react';
import { UserContext } from '@/context/user-context';

export function ChatLauncher() {
  const { student } = useContext(UserContext);
  const { toggleChat, unreadTotal, pendingConversationId, openConversationById, setPendingConversation } = useChat();

  useEffect(() => {
    if (!pendingConversationId) return;
    if (!student?.id) return;
    openConversationById(pendingConversationId).then(() => {
      setPendingConversation(null);
    });
  }, [pendingConversationId, openConversationById, student?.id, setPendingConversation]);

  if (!student) return null;

  return (
    <Button
      aria-label="Ouvrir la messagerie"
      className="fixed bottom-6 right-6 z-[120] h-14 w-14 rounded-full shadow-lg"
      onClick={toggleChat}
      size="icon"
    >
      <MessageCircle className="h-6 w-6" />
      {unreadTotal > 0 && (
        <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
          {unreadTotal}
        </span>
      )}
    </Button>
  );
}
