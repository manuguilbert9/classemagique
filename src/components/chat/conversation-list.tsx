

'use client';

import * as React from 'react';
import { Conversation } from '@/services/chat';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Skeleton } from '../ui/skeleton';
import type { StudentPresenceState } from '@/services/student-presence';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Student } from '@/services/students';

interface ConversationListProps {
    conversations: Conversation[];
    currentStudentId: string;
    onSelectConversation: (conversationId: string) => void;
    selectedConversationId: string | null;
    isLoading: boolean;
    presenceByStudentId: Record<string, StudentPresenceState>;
}

export function ConversationList({
    conversations,
    currentStudentId,
    selectedConversationId,
    onSelectConversation,
    isLoading,
    presenceByStudentId
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
                    const otherParticipantPhotoURL = otherParticipantId ? (convo as any).participantPhotoURLs?.[otherParticipantId] : undefined;
                    const otherParticipantShowPhoto = otherParticipantId ? (convo as any).participantShowPhoto?.[otherParticipantId] ?? false : false;

                    const presence = otherParticipantId ? presenceByStudentId[otherParticipantId] : undefined;
                    const isOnline = presence?.isOnline ?? false;
                    const lastSeenText = !isOnline && presence?.lastSeenAt
                        ? formatDistanceToNow(presence.lastSeenAt, { addSuffix: true, locale: fr })
                        : null;
                    const presenceLabel = isOnline ? 'En ligne' : 'Hors ligne';
                    const presenceDescription = isOnline ? 'En ligne' : lastSeenText ? `Hors ligne · vu ${lastSeenText}` : 'Hors ligne';

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
                                <Avatar>
                                    <AvatarImage src={otherParticipantShowPhoto ? otherParticipantPhotoURL : ''} alt={otherParticipantName} />
                                    <AvatarFallback>{otherParticipantName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span
                                    className={cn(
                                        'absolute -top-1 -right-1 block h-3 w-3 rounded-full border-2 border-muted/40',
                                        isOnline ? 'bg-emerald-500' : 'bg-muted-foreground/60'
                                    )}
                                    title={presenceDescription}
                                    aria-label={`Statut : ${presenceDescription}`}
                                />
                                {isUnread && (
                                    <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-red-500 border-2 border-muted/30" />
                                )}
                            </div>
                            <div className="flex-grow overflow-hidden">
                                <div className="flex justify-between items-center gap-2">
                                    <p className="truncate">{otherParticipantName}</p>
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={cn(
                                                'flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide',
                                                isOnline ? 'text-emerald-600' : 'text-muted-foreground'
                                            )}
                                            title={presenceDescription}
                                        >
                                            <span
                                                className={cn(
                                                    'h-2.5 w-2.5 rounded-full',
                                                    isOnline ? 'bg-emerald-500' : 'bg-muted-foreground/60'
                                                )}
                                                aria-hidden="true"
                                            />
                                            {presenceLabel}
                                        </span>
                                        <p className="text-xs text-muted-foreground flex-shrink-0">{lastMessageDate}</p>
                                    </div>
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
