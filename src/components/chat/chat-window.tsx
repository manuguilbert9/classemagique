
'use client';

import * as React from 'react';
import { useState, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { sendMessage, markAsRead, listenToMessages, findOrCreateConversation, type Message, updateMessageCorrection } from '@/services/chat';
import { type Student } from '@/services/students';
import { cn } from '@/lib/utils';
import { Send, Loader2, Users, MessageSquare, User, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';


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

    // State for correction dialog
    const [correctionTarget, setCorrectionTarget] = useState<Message | null>(null);
    const [correctedText, setCorrectedText] = useState('');
    const [isSavingCorrection, setIsSavingCorrection] = useState(false);

    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const lastReadConversationId = useRef<string | null>(null);

    React.useEffect(() => {
        // Scroll to bottom whenever new messages arrive
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages]);

    React.useEffect(() => {
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
    
    const openCorrectionDialog = (message: Message) => {
        setCorrectionTarget(message);
        setCorrectedText(message.correctedText || message.text);
    };

    const handleSaveCorrection = async () => {
        if (!correctionTarget || !conversationId || !correctedText.trim()) return;

        setIsSavingCorrection(true);
        const result = await updateMessageCorrection(conversationId, correctionTarget.id!, correctedText);
        if (result.success) {
            toast({ title: 'Correction enregistrée !' });
        } else {
            toast({ variant: 'destructive', title: 'Erreur', description: result.error });
        }
        setIsSavingCorrection(false);
        setCorrectionTarget(null);
    };


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
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <div className={cn(
                                            "max-w-xs md:max-w-md p-3 rounded-2xl cursor-pointer",
                                            isCurrentUser ? "bg-primary text-primary-foreground rounded-br-none" : "bg-secondary rounded-bl-none"
                                        )}>
                                            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                            {msg.correctedText && (
                                                <div className="border-t border-white/30 mt-2 pt-2">
                                                    <p className="text-sm font-medium whitespace-pre-wrap text-green-200">{msg.correctedText}</p>
                                                </div>
                                            )}
                                            <p className="text-xs text-right mt-1 opacity-70">
                                                {format(msg.createdAt.toDate(), 'HH:mm')}
                                            </p>
                                        </div>
                                    </DropdownMenuTrigger>
                                     <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => openCorrectionDialog(msg)}>
                                            <Pencil className="mr-2 h-4 w-4" />
                                            <span>Corriger</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
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
            
            <Dialog open={!!correctionTarget} onOpenChange={(isOpen) => !isOpen && setCorrectionTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Corriger le message</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div>
                             <Label>Message original</Label>
                             <p className="p-3 bg-muted rounded-md text-sm">"{correctionTarget?.text}"</p>
                        </div>
                        <div>
                             <Label htmlFor="corrected-text">Version corrigée</Label>
                            <Textarea 
                                id="corrected-text"
                                value={correctedText} 
                                onChange={(e) => setCorrectedText(e.target.value)}
                                rows={3}
                                className="text-base"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                         <Button variant="ghost" onClick={() => setCorrectionTarget(null)}>Annuler</Button>
                         <Button onClick={handleSaveCorrection} disabled={isSavingCorrection}>
                            {isSavingCorrection && <Loader2 className="mr-2 animate-spin"/>}
                            Enregistrer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}
