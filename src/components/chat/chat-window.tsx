
'use client';

import * as React from 'react';
import { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { sendMessage, markAsRead, listenToMessages, findOrCreateConversation, type Message } from '@/services/chat';
import { type Student } from '@/services/students';
import { cn } from '@/lib/utils';
import { Send, Loader2, Users, MessageSquare, User } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

interface ChatWindowProps {
    conversationId: string | null;
    currentStudent: Student;
    allStudents: Student[];
    isCreatingNew: boolean;
    setIsCreatingNew: (isCreating: boolean) => void;
    setSelectedConversationId: (id: string | null) => void;
}

export function ChatWindow({ conversationId, currentStudent, allStudents, isCreatingNew, setIsCreatingNew, setSelectedConversationId }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [otherParticipant, setOtherParticipant] = useState<Student | null>(null);
    const { toast } = useToast();

    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const lastReadConversationId = useRef<string | null>(null);

    useEffect(() => {
        // Scroll to bottom whenever new messages arrive
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (!conversationId) {
            setMessages([]);
            setOtherParticipant(null);
            return;
        }
        
        setIsLoading(true);
        const unsubscribe = listenToMessages(conversationId, (loadedMessages) => {
            setMessages(loadedMessages);
            setIsLoading(false);
        });

        // Mark as read when opening a conversation
        if (conversationId !== lastReadConversationId.current) {
            markAsRead(conversationId, currentStudent.id);
            lastReadConversationId.current = conversationId;
        }
        
        return () => unsubscribe();

    }, [conversationId, currentStudent.id]);
    
     const otherStudentName = useMemo(() => {
        if (!conversationId) return "Nouveau message";
        const parts = conversationId.split('_');
        const otherId = parts.find(p => p !== currentStudent.id);
        const otherStudent = allStudents.find(s => s.id === otherId);
        return otherStudent?.name || "Discussion";
    }, [conversationId, allStudents, currentStudent.id]);


    const handleSendMessage = async () => {
        if (!newMessage.trim() || !conversationId) return;
        
        setIsSending(true);
        const result = await sendMessage(conversationId, currentStudent.id, newMessage);
        
        if (result.success) {
            setNewMessage('');
        } else {
            toast({
                variant: 'destructive',
                title: 'Message non envoyé',
                description: result.error || 'Une erreur est survenue.',
            });
        }
        
        setIsSending(false);
    };
    
    const handleStartConversation = async (otherStudent: Student) => {
        const newConversationId = await findOrCreateConversation(currentStudent, otherStudent);
        setSelectedConversationId(newConversationId);
        setIsCreatingNew(false);
    }

    if (isCreatingNew) {
        return (
            <div className="flex flex-col h-full">
                <header className="p-4 border-b">
                    <h3 className="font-semibold text-lg flex items-center gap-2"><Users/> Démarrer une nouvelle discussion</h3>
                </header>
                <ScrollArea className="flex-grow">
                     <div className="p-2 space-y-1">
                        {allStudents.map(student => (
                            <div key={student.id} onClick={() => handleStartConversation(student)} className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-accent/50">
                                <div className="h-10 w-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                                    <User />
                                </div>
                                <p className="font-semibold">{student.name}</p>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>
        )
    }

    if (!conversationId) {
        return (
            <div className="flex flex-col h-full items-center justify-center text-center p-4 bg-muted/20">
                <MessageSquare className="h-16 w-16 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Sélectionne une discussion</h3>
                <p className="text-sm text-muted-foreground">Ou commence une nouvelle conversation.</p>
            </div>
        );
    }

    if (isLoading) {
        return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="flex flex-col h-full">
            <header className="p-4 border-b">
                <h3 className="font-semibold text-lg">{otherStudentName}</h3>
            </header>
            <ScrollArea className="flex-grow p-4 bg-muted/10" ref={scrollAreaRef}>
                <div className="space-y-4">
                    {messages.map((msg, index) => {
                        const isCurrentUser = msg.senderId === currentStudent.id;
                        const showDate = index === 0 || (new Date(msg.createdAt.toDate()).getDate() !== new Date(messages[index - 1].createdAt.toDate()).getDate());
                        
                        return (
                           <React.Fragment key={msg.id}>
                            {showDate && (
                                <div className="text-center text-xs text-muted-foreground my-4">
                                    {format(msg.createdAt.toDate(), 'd MMMM yyyy', { locale: fr })}
                                </div>
                            )}
                             <div className={cn("flex items-end gap-2", isCurrentUser ? "justify-end" : "justify-start")}>
                                <div className={cn(
                                    "max-w-xs md:max-w-md p-3 rounded-2xl",
                                    isCurrentUser ? "bg-primary text-primary-foreground rounded-br-none" : "bg-secondary rounded-bl-none"
                                )}>
                                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                    <p className="text-xs text-right mt-1 opacity-70">
                                        {format(msg.createdAt.toDate(), 'HH:mm')}
                                    </p>
                                </div>
                            </div>
                           </React.Fragment>
                        );
                    })}
                </div>
            </ScrollArea>
            <div className="p-4 border-t">
                <div className="relative">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Écris ton message..."
                        className="pr-12 h-11"
                        disabled={isSending}
                    />
                    <Button
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9"
                        onClick={handleSendMessage}
                        disabled={isSending || !newMessage.trim()}
                    >
                       {isSending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4" />}
                    </Button>
                </div>
            </div>
        </div>
    );
}
