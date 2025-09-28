
'use client';

import * as React from 'react';
import { Conversation } from '@/services/chat';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Skeleton } from '../ui/skeleton';
import { User } from 'lucide-react';

interface ConversationListProps {
    conversations: Conversation[];
    currentStudentId: string;
    selectedConversationId: string | null;
    onSelectConversation: (conversationId: string) => void;
    isLoading: boolean;
}

export function ConversationList({
    conversations,
    currentStudentId,
    selectedConversationId,
    onSelectConversation,
    isLoading
}: ConversationListProps) {

    if (isLoading) {
        return (
            <div className="p-2 space-y-2">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-2">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <ScrollArea className="flex-grow">
            <div className="p-2 space-y-1">
                {conversations.map(convo => {
                    const otherParticipantId = convo.participants.find(p => p !== currentStudentId);
                    const otherParticipantName = otherParticipantId ? convo.participantNames[otherParticipantId] : "Inconnu";
                    
                    const isUnread = convo.lastMessage && convo.lastMessage.senderId !== currentStudentId && !convo.lastMessage.readBy[currentStudentId];
                    const lastMessageText = convo.lastMessage ? (convo.lastMessage.senderId === currentStudentId ? "Vous: " : "") + convo.lastMessage.text : "Aucun message";
                    const lastMessageDate = convo.lastMessage ? formatDistanceToNow(convo.lastMessage.createdAt.toDate(), { addSuffix: true, locale: fr }) : '';

                    return (
                        <div
                            key={convo.id}
                            onClick={() => onSelectConversation(convo.id)}
                            className={cn(
                                "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                                selectedConversationId === convo.id ? "bg-primary/20" : "hover:bg-accent/50",
                                isUnread && "font-bold"
                            )}
                        >
                            <div className="relative">
                                <div className="h-10 w-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                                    <User />
                                </div>
                                {isUnread && (
                                    <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-red-500 border-2 border-muted/30" />
                                )}
                            </div>
                            <div className="flex-grow overflow-hidden">
                                <div className="flex justify-between items-center">
                                    <p className="truncate">{otherParticipantName}</p>
                                    <p className="text-xs text-muted-foreground flex-shrink-0">{lastMessageDate}</p>
                                </div>
                                <p className={cn("text-sm truncate", isUnread ? "text-foreground" : "text-muted-foreground")}>
                                    {lastMessageText}
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </ScrollArea>
    );
}
