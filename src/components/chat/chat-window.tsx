
'use client';

import * as React from 'react';
import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { sendMessage, markAsRead, listenToMessages, findOrCreateConversation, type Message, updateMessageCorrection } from '@/services/chat';
import { type Student } from '@/services/students';
import type { StudentPresenceState } from '@/services/student-presence';
import { cn } from '@/lib/utils';
import { Send, Loader2, Users, MessageSquare, User, Pencil, Sparkles, RefreshCw } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '../ui/label';
import { useSpellSuggestions } from '@/hooks/use-spell-suggestions';
import { Badge } from '../ui/badge';
import { SyllableText } from '../syllable-text';
import { ChatMessageContent, EXERCISE_URL_REGEX } from './chat-message-content';

interface ChatWindowProps {
    conversationId: string | null;
    currentStudent: Student;
    allStudents: Student[];
    isCreatingNew: boolean;
    setIsCreatingNew: (isCreating: boolean) => void;
    setSelectedConversationId: (id: string | null) => void;
    colorizeSyllables: boolean;
    messageScale: number;
    presenceByStudentId: Record<string, StudentPresenceState>;
}

export function ChatWindow({
    conversationId,
    currentStudent,
    allStudents,
    isCreatingNew,
    setIsCreatingNew,
    setSelectedConversationId,
    colorizeSyllables,
    messageScale,
    presenceByStudentId,
}: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [suggestionPage, setSuggestionPage] = useState(0);

    const { toast } = useToast();
    const { wordSuggestions, isLoading: isLoadingSuggestions, refresh: refreshSuggestions } = useSpellSuggestions(newMessage, "fr");

    // State for correction dialog
    const [correctionTarget, setCorrectionTarget] = useState<Message | null>(null);
    const [correctedText, setCorrectedText] = useState('');
    const [isSavingCorrection, setIsSavingCorrection] = useState(false);
    
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const lastReadConversationId = useRef<string | null>(null);

    const messageFontSize = useMemo(() => Number((14 * messageScale).toFixed(2)), [messageScale]);
    const messageMetaFontSize = useMemo(() => Number((11 * messageScale).toFixed(2)), [messageScale]);

    const suggestionSignature = useMemo(() => wordSuggestions.join('|'), [wordSuggestions]);
    
    const trimmedMessageLength = useMemo(() => newMessage.trim().length, [newMessage]);
    
    const hasSuggestions = useMemo(
        () => wordSuggestions.length > 0,
        [wordSuggestions]
    );

    const suggestionsToShow = 12;
    const canRefreshSuggestions = wordSuggestions.length > suggestionsToShow;

    useEffect(() => {
        setSuggestionPage(0);
    }, [suggestionSignature]);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (!conversationId) {
            setMessages([]);
            return;
        }
        
        setIsLoading(true);
        const unsubscribe = listenToMessages(conversationId, (loadedMessages) => {
            setMessages(loadedMessages);
            setIsLoading(false);
             setTimeout(() => {
                if (scrollAreaRef.current) {
                    scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
                }
            }, 0);
        });

        // Mark as read when opening a conversation
        if (conversationId !== lastReadConversationId.current) {
            markAsRead(conversationId, currentStudent.id);
            lastReadConversationId.current = conversationId;
        }
        
        return () => unsubscribe();

    }, [conversationId, currentStudent.id]);
    
    const otherStudentInfo = useMemo(() => {
        if (!conversationId) {
            return { id: null as string | null, name: 'Nouveau message' };
        }
        const parts = conversationId.split('_');
        const otherId = parts.find((p) => p !== currentStudent.id) ?? null;
        const otherStudent = otherId ? allStudents.find((s) => s.id === otherId) : undefined;

        return {
            id: otherId,
            name: otherStudent?.name || 'Discussion',
        };
    }, [conversationId, allStudents, currentStudent.id]);

    const otherStudentPresence = otherStudentInfo.id ? presenceByStudentId[otherStudentInfo.id] : undefined;
    const isOtherStudentOnline = otherStudentPresence?.isOnline ?? false;
    const otherStudentLastSeen = !isOtherStudentOnline && otherStudentPresence?.lastSeenAt
        ? formatDistanceToNow(otherStudentPresence.lastSeenAt, { addSuffix: true, locale: fr })
        : null;
    const otherStudentPresenceText = isOtherStudentOnline
        ? 'En ligne'
        : otherStudentLastSeen
            ? `Hors ligne · vu ${otherStudentLastSeen}`
            : 'Hors ligne';


    const handleSendMessage = useCallback(async () => {
        if (!newMessage.trim() || !conversationId) return;

        setIsSending(true);
        const result = await sendMessage(conversationId, currentStudent.id, newMessage);

        if (result.success) {
            setNewMessage('');
            textareaRef.current?.focus();
        } else {
            toast({
                variant: 'destructive',
                title: 'Message non envoyé',
                description: result.error || 'Une erreur est survenue.',
            });
        }

        setIsSending(false);
    }, [conversationId, currentStudent.id, newMessage, toast]);
    
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
    
    const handleApplySuggestion = useCallback((suggestion: string) => {
        const normalizedSuggestion = suggestion.trim();
        if (!normalizedSuggestion) return;

        setNewMessage((prev) => {
            const base = prev.trimEnd();
            const lastSpaceIndex = base.lastIndexOf(' ');
            
            if (lastSpaceIndex === -1) {
                 // Remplacer le seul mot
                 return `${normalizedSuggestion} `;
            }
            
            // Remplacer le dernier mot
            return `${base.substring(0, lastSpaceIndex + 1)}${normalizedSuggestion} `;
        });
        textareaRef.current?.focus();
    }, []);


    const handleInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    }, [handleSendMessage]);

    const handleRefreshSuggestions = () => {
        const totalSuggestions = wordSuggestions.length;
        if (totalSuggestions <= suggestionsToShow) return;
        setSuggestionPage(prev => (prev + 1) % Math.ceil(totalSuggestions / suggestionsToShow));
    }
    

    if (isCreatingNew) {
        return (
            <div className="flex flex-col h-full">
                <header className="p-4 border-b">
                    <h3 className="font-semibold text-lg flex items-center gap-2"><Users/> Démarrer une nouvelle discussion</h3>
                </header>
                <ScrollArea className="flex-grow">
                    <div className="p-2 space-y-1">
                        {allStudents.map((student) => {
                            const presence = presenceByStudentId[student.id];
                            const isOnline = presence?.isOnline ?? false;
                            const lastSeen = !isOnline && presence?.lastSeenAt
                                ? formatDistanceToNow(presence.lastSeenAt, { addSuffix: true, locale: fr })
                                : null;
                            const presenceText = isOnline ? 'En ligne' : lastSeen ? `Hors ligne · vu ${lastSeen}` : 'Hors ligne';

                            return (
                                <div
                                    key={student.id}
                                    onClick={() => handleStartConversation(student)}
                                    className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-accent/50"
                                >
                                    <div className="relative">
                                        <div className="h-10 w-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                                            <User />
                                        </div>
                                        <span
                                            className={cn(
                                                'absolute -top-1 -right-1 block h-3 w-3 rounded-full border-2 border-muted/40',
                                                isOnline ? 'bg-emerald-500' : 'bg-muted-foreground/60'
                                            )}
                                            aria-label={`Statut : ${presenceText}`}
                                            title={presenceText}
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <p className="font-semibold leading-tight">{student.name}</p>
                                        <span
                                            className={cn(
                                                'text-xs font-medium uppercase tracking-wide flex items-center gap-1',
                                                isOnline ? 'text-emerald-600' : 'text-muted-foreground'
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    'h-2.5 w-2.5 rounded-full',
                                                    isOnline ? 'bg-emerald-500' : 'bg-muted-foreground/60'
                                                )}
                                                aria-hidden="true"
                                            />
                                            {presenceText}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            </div>
        );
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

    const showSuggestionsPanel = hasSuggestions || isLoadingSuggestions || trimmedMessageLength === 0;
    const suggestionStart = suggestionPage * suggestionsToShow;
    const currentSuggestions = wordSuggestions.slice(suggestionStart, suggestionStart + suggestionsToShow);

    const MessageBubble = ({ msg }: { msg: Message }) => {
        const isCurrentUser = msg.senderId === currentStudent.id;
        const containsExerciseLink = EXERCISE_URL_REGEX.test(msg.text);

        return (
            <div className={cn(
                "max-w-xs md:max-w-md p-3 rounded-2xl",
                isCurrentUser ? "bg-primary text-primary-foreground rounded-br-none" : "bg-secondary rounded-bl-none",
                !containsExerciseLink && "cursor-pointer"
            )}>
                <div
                    className="whitespace-pre-wrap break-words"
                    style={{ fontSize: `${messageFontSize}px`, lineHeight: 1.4 }}
                >
                    <ChatMessageContent text={msg.text} />
                </div>
                {msg.correctedText && (
                    <div className="border-t border-white/30 mt-2 pt-2">
                        <div
                            className={cn(
                                'whitespace-pre-wrap font-medium',
                                isCurrentUser ? 'text-emerald-100' : 'text-emerald-700'
                            )}
                            style={{ fontSize: `${messageFontSize}px`, lineHeight: 1.4 }}
                        >
                            <ChatMessageContent text={msg.correctedText} />
                        </div>
                    </div>
                )}
                <p
                    className="text-right mt-1 opacity-70"
                    style={{ fontSize: `${messageMetaFontSize}px` }}
                >
                    {format(msg.createdAt.toDate(), 'HH:mm')}
                </p>
            </div>
        );
    };

    return (
        <div className="flex h-full flex-col md:flex-row">
            <div className="flex flex-1 flex-col">
                <header className="border-b p-4">
                    <div className="flex flex-col">
                        <h3 className="text-lg font-semibold">{otherStudentInfo.name}</h3>
                        <span
                            className={cn(
                                'mt-1 flex items-center gap-2 text-sm font-medium',
                                isOtherStudentOnline ? 'text-emerald-600' : 'text-muted-foreground'
                            )}
                            title={otherStudentPresenceText}
                        >
                            <span
                                className={cn(
                                    'h-2.5 w-2.5 rounded-full',
                                    isOtherStudentOnline ? 'bg-emerald-500' : 'bg-muted-foreground/60'
                                )}
                                aria-hidden="true"
                            />
                            {otherStudentPresenceText}
                        </span>
                    </div>
                </header>
                <ScrollArea className="flex-1 bg-muted/10 p-4" viewportRef={scrollAreaRef}>
                    <div className="space-y-4">
                        {messages.map((msg, index) => {
                            const isCurrentUser = msg.senderId === currentStudent.id;
                            const showDate = index === 0 || (new Date(msg.createdAt.toDate()).getDate() !== new Date(messages[index - 1].createdAt.toDate()).getDate());
                            const containsExerciseLink = EXERCISE_URL_REGEX.test(msg.text);

                            return (
                               <React.Fragment key={msg.id}>
                                {showDate && (
                                    <div className="text-center text-xs text-muted-foreground my-4">
                                        {format(msg.createdAt.toDate(), 'd MMMM yyyy', { locale: fr })}
                                    </div>
                                )}
                                <div className={cn("flex items-end gap-2", isCurrentUser ? "justify-end" : "justify-start")}>
                                     {containsExerciseLink ? (
                                        <MessageBubble msg={msg} />
                                     ) : (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                 <MessageBubble msg={msg} />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={() => openCorrectionDialog(msg)}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    <span>Corriger</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                     )}
                                </div>
                               </React.Fragment>
                            );
                        })}
                    </div>
                </ScrollArea>
                <div className="border-t p-4">
                    <div className="relative rounded-xl border bg-background/90 p-3 shadow-sm">
                        <Textarea
                            ref={textareaRef}
                            id="chat-input"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={handleInputKeyDown}
                            placeholder="Écris ton message..."
                            className="min-h-[44px] h-20 resize-none pr-12"
                            disabled={isSending}
                            spellCheck
                        />
                        <Button
                            size="icon"
                            className="absolute bottom-1 right-1 h-9 w-9"
                            onClick={handleSendMessage}
                            disabled={isSending || trimmedMessageLength === 0}
                        >
                            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            </div>
            {showSuggestionsPanel && (
                <aside className="border-t bg-muted/10 p-4 md:w-[400px] md:border-l md:border-t-0">
                    <div className="rounded-xl border bg-background/90 p-3 shadow-sm">
                        
                        {isLoadingSuggestions ? (
                             <div className="flex justify-center items-center h-24">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                             </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-2">
                                {currentSuggestions.map((s, i) => (
                                    <Button key={s+i} size="sm" variant="outline" onMouseDown={() => handleApplySuggestion(s)}>{s}</Button>
                                ))}
                                {canRefreshSuggestions && (
                                     <Button size="sm" variant="ghost" onClick={handleRefreshSuggestions} className="col-span-3">
                                        <RefreshCw className="mr-2 h-4 w-4"/>
                                        Autres suggestions
                                    </Button>
                                )}
                            </div>
                        )}
                        {!isLoadingSuggestions && wordSuggestions.length === 0 && trimmedMessageLength > 0 && (
                            <p className="text-xs text-muted-foreground text-center p-4">Aucune suggestion pour "{newMessage.trim().split(' ').pop()}"</p>
                        )}
                    </div>
                </aside>
            )}
            
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
