
'use client';

import React, { createContext, useState, useEffect, ReactNode, useContext, useCallback } from 'react';
import { listenToConversations, type Conversation, type Message } from '@/services/chat';
import { UserContext } from './user-context';
import { useToast } from '@/hooks/use-toast';
import { ChatNotification } from '@/components/chat/chat-notification';

interface ChatContextType {
    conversations: Conversation[];
    totalUnreadCount: number;
    isLoading: boolean;
}

export const ChatContext = createContext<ChatContextType>({
    conversations: [],
    totalUnreadCount: 0,
    isLoading: true,
});

export const ChatProvider = ({ children }: { children: ReactNode }) => {
    const { student } = useContext(UserContext);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [totalUnreadCount, setTotalUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const lastNotifiedMessageId = React.useRef<string | undefined>();

    const showNotification = useCallback((message: Message, senderName: string) => {
        toast({
            title: `Nouveau message de ${senderName}`,
            description: message.text,
            duration: 5000,
            icon: <ChatNotification senderName={senderName} />,
        });
    }, [toast]);
    
    useEffect(() => {
        if (!student) {
            setConversations([]);
            setTotalUnreadCount(0);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);

        const unsubscribe = listenToConversations(student.id, (loadedConversations) => {
            const latestMessage = loadedConversations[0]?.lastMessage;
            if (
                latestMessage &&
                latestMessage.senderId !== student.id &&
                !latestMessage.readBy[student.id] &&
                latestMessage.id !== lastNotifiedMessageId.current
            ) {
                lastNotifiedMessageId.current = latestMessage.id;
                const senderName = loadedConversations[0].participantNames[latestMessage.senderId] || 'Un élève';
                showNotification(latestMessage, senderName);
            }
            
            const unreadCount = loadedConversations.reduce((count, convo) => {
                 if (convo.lastMessage && convo.lastMessage.senderId !== student.id && !convo.lastMessage.readBy[student.id]) {
                    return count + 1;
                }
                return count;
            }, 0);
            
            setConversations(loadedConversations);
            setTotalUnreadCount(unreadCount);
            setIsLoading(false);
        });

        return () => unsubscribe();

    }, [student, showNotification]);

    const contextValue = {
        conversations,
        totalUnreadCount,
        isLoading,
    };

    return (
        <ChatContext.Provider value={contextValue}>
            {children}
        </ChatContext.Provider>
    );
};
