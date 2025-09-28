'use client';

import { useChat } from '@/context/chat-context';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { UserContext } from '@/context/user-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

function formatTime(date: Date | null): string {
  if (!date) return '';
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatRelative(date: Date | null): string {
  if (!date) return '';
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const oneDay = 24 * 60 * 60 * 1000;
  if (diff < oneDay) {
    return formatTime(date);
  }
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
  }).format(date);
}

export function ChatOverlay() {
  const pathname = usePathname();
  const { student } = useContext(UserContext);
  const {
    isChatOpen,
    closeChat,
    conversations,
    activeConversationId,
    openConversationByContact,
    openConversationById,
    conversationMessages,
    sendMessage,
  } = useChat();
  const [message, setMessage] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isChatOpen) {
      setMessage('');
    }
  }, [isChatOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages]);

  useEffect(() => {
    if (!isChatOpen) return;
    if (activeConversationId) return;
    if (conversations.length === 0) return;
    openConversationById(conversations[0].id);
  }, [isChatOpen, conversations, activeConversationId, openConversationById]);

  const activeConversation = useMemo(() => {
    return conversations.find((conversation) => conversation.id === activeConversationId) ?? null;
  }, [conversations, activeConversationId]);

  const contactName = useMemo(() => {
    if (!student || !activeConversation) return '';
    const otherId = activeConversation.participantIds.find((id) => id !== student.id);
    if (!otherId) return '';
    const details = activeConversation.participantDetails?.[otherId];
    return details?.name ?? 'Élève';
  }, [activeConversation, student]);

  const handleSendMessage = async () => {
    if (!activeConversation) return;
    const currentMessage = message;
    setMessage('');
    await sendMessage(activeConversation.id, currentMessage);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleSendMessage();
  };

  if (!student) return null;
  if (pathname !== '/en-classe') return null;
  if (!isChatOpen) return null;

  return (
    <div className="pointer-events-none fixed bottom-24 right-6 z-[150] flex flex-col gap-4 lg:flex-row">
      <Card className="pointer-events-auto w-72 shadow-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Conversations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 overflow-y-auto p-0">
          {conversations.map((conversation) => {
            const otherId = conversation.participantIds.find((id) => id !== student.id);
            const details = otherId ? conversation.participantDetails?.[otherId] : undefined;
            const name = details?.name ?? 'Élève';
            const isActive = activeConversationId === conversation.id;
            const unread = conversation.unreadCounts?.[student.id] ?? 0;
            const preview = conversation.lastMessage?.text ?? 'Commencer une discussion';
            const handleOpen = () => {
              if (otherId) {
                void openConversationByContact(otherId);
              } else {
                void openConversationById(conversation.id);
              }
            };
            return (
              <button
                key={conversation.id}
                className={cn(
                  'flex w-full items-start gap-2 px-4 py-3 text-left transition-colors hover:bg-muted',
                  isActive && 'bg-muted'
                )}
                onClick={handleOpen}
                type="button"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold uppercase text-primary">
                  {name.slice(0, 2)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{name}</span>
                    <span className="text-xs text-muted-foreground">{formatRelative(conversation.updatedAt ?? null)}</span>
                  </div>
                  <p className="line-clamp-1 text-sm text-muted-foreground">{preview}</p>
                </div>
                {unread > 0 && (
                  <span className="ml-2 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                    {unread}
                  </span>
                )}
              </button>
            );
          })}
          {conversations.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              Commence une conversation avec un camarade !
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="pointer-events-auto w-[22rem] shadow-xl lg:w-[26rem]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b px-4 py-3">
          <CardTitle className="text-lg font-semibold">{contactName || 'Messagerie'}</CardTitle>
          <Button variant="ghost" size="icon" onClick={closeChat} aria-label="Fermer la messagerie">
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent className="flex h-96 flex-col gap-3 p-4">
          <div className="flex-1 space-y-2 overflow-y-auto pr-2">
            {conversationMessages.length === 0 && (
              <div className="text-center text-sm text-muted-foreground">Dis bonjour à {contactName || 'ton camarade'} !</div>
            )}
            {conversationMessages.map((messageItem) => {
              const isOwn = messageItem.senderId === student.id;
              return (
                <div key={messageItem.id} className="flex flex-col">
                  <div className={cn('max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow', isOwn ? 'self-end bg-primary text-primary-foreground' : 'self-start bg-muted')}>
                    {messageItem.text}
                  </div>
                  <span className={cn('mt-1 text-[10px]', isOwn ? 'self-end text-primary/70' : 'self-start text-muted-foreground')}>{formatTime(messageItem.createdAt)}</span>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              aria-label="Votre message"
              autoFocus
              onChange={(event) => setMessage(event.target.value)}
              placeholder={`Message à ${contactName || 'ton camarade'}...`}
              value={message}
            />
            <Button type="submit" disabled={!message.trim()}>
              Envoyer
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
