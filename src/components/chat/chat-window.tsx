

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
import { Send, Loader2, Users, MessageSquare, Pencil, RefreshCw } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '../ui/label';
import { useSpellSuggestions } from '@/hooks/use-spell-suggestions';
import { SyllableText } from '../syllable-text';
import { ChatMessageContent, EXERCISE_URL_REGEX } from './chat-message-content';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { HowToWriteDialog } from './how-to-write-dialog';

interface MessageBubbleProps extends React.HTMLAttributes<HTMLDivElement> {
    msg: Message;
    isCurrentUser: boolean;
    messageFontSize: number;
    messageMetaFontSize: number;
    colorizeSyllables: boolean;
}

const MessageBubble = React.forwardRef<HTMLDivElement, MessageBubbleProps>(
    ({ msg, isCurrentUser, messageFontSize, messageMetaFontSize, colorizeSyllables, className, ...props }, ref) => {
        const containsExerciseLink = EXERCISE_URL_REGEX.test(msg.text);

        return (
            <div
                ref={ref}
                className={cn(
                    'max-w-xs md:max-w-md p-3.5 rounded-3xl shadow-sm',
                    isCurrentUser
                        ? 'bg-gradient-to-br from-[hsl(340,85%,64%)] to-[hsl(340,80%,56%)] text-white rounded-br-lg'
                        : 'bg-white border text-foreground rounded-bl-lg',
                    !containsExerciseLink && 'cursor-pointer',
                    className
                )}
                {...props}
            >
                <div
                    className="whitespace-pre-wrap break-words"
                    style={{ fontSize: `${messageFontSize}px`, lineHeight: 1.4 }}
                >
                    <ChatMessageContent text={msg.text} colorizeSyllables={colorizeSyllables} />
                </div>
                {msg.correctedText && (
                    <div className={cn('mt-2 border-t pt-2', isCurrentUser ? 'border-white/30' : 'border-emerald-200')}>
                        <div
                            className={cn('whitespace-pre-wrap font-medium', isCurrentUser ? 'text-white' : 'text-emerald-700')}
                            style={{ fontSize: `${messageFontSize}px`, lineHeight: 1.4 }}
                        >
                            <ChatMessageContent text={msg.correctedText} colorizeSyllables={colorizeSyllables} />
                        </div>
                    </div>
                )}
                <p
                    className={cn('text-right mt-1', isCurrentUser ? 'text-white/80' : 'text-muted-foreground')}
                    style={{ fontSize: `${messageMetaFontSize}px` }}
                >
                    {format(msg.createdAt.toDate(), 'HH:mm')}
                </p>
            </div>
        );
    }
);

MessageBubble.displayName = 'MessageBubble';

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
    const [activeMessageMenuId, setActiveMessageMenuId] = useState<string | null>(null);

    const { toast } = useToast();
    const { wordSuggestions, isLoading: isLoadingSuggestions, refresh: refreshSuggestions } = useSpellSuggestions(newMessage, "fr");
    
    // State for correction dialog
    const [correctionTarget, setCorrectionTarget] = useState<Message | null>(null);
    const [correctedText, setCorrectedText] = useState('');
    const [isSavingCorrection, setIsSavingCorrection] = useState(false);
    
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const lastReadConversationId = useRef<string | null>(null);

    const messageFontSize = useMemo(() => Number((28 * messageScale).toFixed(2)), [messageScale]);
    const messageMetaFontSize = useMemo(() => Number((22 * messageScale).toFixed(2)), [messageScale]);

    const trimmedMessageLength = useMemo(() => newMessage.trim().length, [newMessage]);

    const hasSuggestions = useMemo(
        () => wordSuggestions.length > 0 && trimmedMessageLength > 0,
        [wordSuggestions, trimmedMessageLength]
    );

    // Scroll automatique vers le bas quand les messages changent
    useEffect(() => {
        // Utiliser requestAnimationFrame pour s'assurer que le DOM est mis à jour
        requestAnimationFrame(() => {
            if (scrollAreaRef.current) {
                scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
            }
        });
    }, [messages, messages.length]);

    useEffect(() => {
        if (!conversationId) {
            setMessages([]);
            return;
        }

        setIsLoading(true);
        const unsubscribe = listenToMessages(conversationId, (loadedMessages) => {
            setMessages(loadedMessages);
            setIsLoading(false);

            // Scroll vers le bas lors du chargement initial ou changement de conversation
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    if (scrollAreaRef.current) {
                        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
                    }
                });
            });
        });

        // Mark as read when opening a conversation
        if (conversationId !== lastReadConversationId.current) {
            markAsRead(conversationId, currentStudent.id);
            lastReadConversationId.current = conversationId;
        }

        return () => unsubscribe();

    }, [conversationId, currentStudent.id]);
    
    useEffect(() => {
        setActiveMessageMenuId(null);
    }, [conversationId]);

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
            photoURL: otherStudent?.photoURL,
            showPhoto: otherStudent?.showPhoto,
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

    const handleMessageContextMenu = (event: React.MouseEvent, message: Message) => {
        if (!message.id) return;

        event.preventDefault();
        setActiveMessageMenuId(message.id);
    };

    const handleCorrectionSelect = (message: Message) => {
        openCorrectionDialog(message);
        setActiveMessageMenuId(null);
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

    const handleInsertFromDictation = useCallback((text: string) => {
        setNewMessage((prev) => {
            const base = prev.trimEnd();
            return base ? `${base} ${text}` : text;
        });
        textareaRef.current?.focus();
    }, []);


    if (isCreatingNew) {
        return (
            <div className="flex flex-col h-full bg-[#faf9fd]">
                <header className="border-b bg-white p-4">
                    <h3 className="flex items-center gap-2 text-lg font-bold">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary"><Users className="h-4 w-4" /></span>
                        Démarrer une nouvelle discussion
                    </h3>
                </header>
                <ScrollArea className="flex-grow">
                    <div className="space-y-2 p-3">
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
                                    className="flex items-center gap-3 rounded-2xl border border-transparent p-2.5 cursor-pointer transition-all hover:border-border hover:bg-white hover:shadow-sm"
                                >
                                    <div className="relative shrink-0">
                                        <Avatar className="h-11 w-11 ring-2 ring-white shadow-sm">
                                            <AvatarImage src={student.showPhoto ? student.photoURL : ''} alt={student.name} />
                                            <AvatarFallback className="bg-primary/10 font-semibold text-primary">{student.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span
                                            className={cn(
                                                'absolute -top-0.5 -right-0.5 block h-3.5 w-3.5 rounded-full border-2 border-white',
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
            <div className="flex h-full flex-col items-center justify-center bg-[#faf9fd] p-4 text-center">
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-accent/15">
                    <MessageSquare className="h-10 w-10 text-primary" />
                </span>
                <h3 className="mt-4 text-lg font-semibold">Sélectionne une discussion</h3>
                <p className="text-sm text-muted-foreground">Ou commence une nouvelle conversation.</p>
            </div>
        );
    }

    if (isLoading) {
        return <div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    const displayedSuggestions = wordSuggestions.slice(0, 8);

    return (
        <div className="flex h-full flex-col min-h-0">
            <header className="flex flex-shrink-0 items-center gap-3 border-b bg-white p-4 shadow-sm">
                     <Avatar className="h-11 w-11 ring-2 ring-primary/10">
                        <AvatarImage src={otherStudentInfo.showPhoto ? otherStudentInfo.photoURL : undefined} alt={otherStudentInfo.name} />
                        <AvatarFallback className="bg-primary/10 font-semibold text-primary">{otherStudentInfo.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <h3 className="text-lg font-bold">{otherStudentInfo.name}</h3>
                        <span
                            className={cn(
                                'mt-0.5 flex items-center gap-2 text-sm font-medium',
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
                <ScrollArea className="flex-1 bg-[#f3f0fb] p-4 min-h-0" viewportRef={scrollAreaRef}>
                    <div className="space-y-3">
                        {messages.map((msg, index) => {
                            const isCurrentUser = msg.senderId === currentStudent.id;
                            const showDate = index === 0 || (new Date(msg.createdAt.toDate()).getDate() !== new Date(messages[index - 1].createdAt.toDate()).getDate());
                            const containsExerciseLink = EXERCISE_URL_REGEX.test(msg.text);

                            return (
                               <React.Fragment key={msg.id}>
                                {showDate && (
                                    <div className="my-4 flex items-center justify-center">
                                        <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
                                            {format(msg.createdAt.toDate(), 'd MMMM yyyy', { locale: fr })}
                                        </span>
                                    </div>
                                )}
                                <div className={cn('flex items-end gap-2', isCurrentUser ? 'justify-end' : 'justify-start')}>
                                    {!isCurrentUser && (
                                        <Avatar className="h-7 w-7 shrink-0">
                                            <AvatarImage src={otherStudentInfo.showPhoto ? otherStudentInfo.photoURL : undefined} alt={otherStudentInfo.name} />
                                            <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">{otherStudentInfo.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    )}
                                    {containsExerciseLink ? (
                                        <MessageBubble
                                            msg={msg}
                                            isCurrentUser={isCurrentUser}
                                            messageFontSize={messageFontSize}
                                            messageMetaFontSize={messageMetaFontSize}
                                            colorizeSyllables={colorizeSyllables}
                                        />
                                    ) : (
                                        <DropdownMenu
                                            open={activeMessageMenuId === msg.id}
                                            onOpenChange={(open) => {
                                                if (!open && activeMessageMenuId === msg.id) {
                                                    setActiveMessageMenuId(null);
                                                }
                                            }}
                                        >
                                            <DropdownMenuTrigger asChild>
                                                <MessageBubble
                                                    msg={msg}
                                                    isCurrentUser={isCurrentUser}
                                                    messageFontSize={messageFontSize}
                                                    messageMetaFontSize={messageMetaFontSize}
                                                    colorizeSyllables={colorizeSyllables}
                                                    onContextMenu={(event) => handleMessageContextMenu(event, msg)}
                                                />
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align={isCurrentUser ? 'end' : 'start'}>
                                                <DropdownMenuItem
                                                    onSelect={(event) => {
                                                        event.preventDefault();
                                                        handleCorrectionSelect(msg);
                                                    }}
                                                >
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
                <div className="flex-shrink-0 border-t bg-white p-4">
                    <div className="space-y-3">
                        <div className="flex justify-center">
                            <HowToWriteDialog onInsert={handleInsertFromDictation} />
                        </div>

                        {/* Suggestions de mots au-dessus du champ de saisie */}
                        {hasSuggestions && !isLoadingSuggestions && (
                            <div className="flex flex-wrap items-center gap-1.5 px-1">
                                <span className="mr-1 self-center text-xs text-muted-foreground">Suggestions :</span>
                                {displayedSuggestions.map((suggestion, i) => (
                                    <Button
                                        key={`${suggestion}-${i}`}
                                        size="sm"
                                        variant="secondary"
                                        className="h-7 rounded-full px-3 text-xs font-medium transition-colors hover:bg-primary hover:text-primary-foreground"
                                        onMouseDown={() => handleApplySuggestion(suggestion)}
                                    >
                                        {suggestion}
                                    </Button>
                                ))}
                                {wordSuggestions.length > 8 && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 rounded-full px-2 text-xs"
                                        onClick={refreshSuggestions}
                                    >
                                        <RefreshCw className="h-3 w-3" />
                                    </Button>
                                )}
                            </div>
                        )}

                        {/* Zone de saisie */}
                        <div className="relative rounded-2xl border bg-[#faf9fd] p-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/30">
                            <Textarea
                                ref={textareaRef}
                                id="chat-input"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={handleInputKeyDown}
                                placeholder="Écris ton message..."
                                className="min-h-[52px] h-24 resize-none border-none bg-transparent pr-14 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                                style={{ fontSize: `${messageFontSize}px`, lineHeight: 1.4 }}
                                disabled={isSending}
                                spellCheck
                            />
                            <Button
                                size="icon"
                                className="absolute bottom-2 right-2 h-10 w-10 rounded-full bg-gradient-to-br from-[hsl(340,85%,62%)] to-[hsl(12,76%,61%)] shadow-md hover:opacity-90"
                                onClick={handleSendMessage}
                                disabled={isSending || trimmedMessageLength === 0}
                            >
                                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </Button>
                        </div>
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
