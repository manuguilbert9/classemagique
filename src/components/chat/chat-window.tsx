
'use client';

import * as React from 'react';
import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { sendMessage, markAsRead, listenToMessages, findOrCreateConversation, type Message, updateMessageCorrection } from '@/services/chat';
import { type Student } from '@/services/students';
import { cn } from '@/lib/utils';
import { Send, Loader2, Users, MessageSquare, User, Pencil, Sparkles, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '../ui/label';
import { useSpellSuggestions } from '@/hooks/use-spell-suggestions';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import { Badge } from '../ui/badge';
import { SyllableText } from '../syllable-text';

const MESSAGE_SCALE_MIN = 0.85;
const MESSAGE_SCALE_MAX = 1.4;
const MESSAGE_SCALE_STEP = 0.05;

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
    const [colorizeSyllables, setColorizeSyllables] = useState(false);
    const [messageScale, setMessageScale] = useState(1);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);

    const { toast } = useToast();
    const { wordSuggestions, suggestionBuckets, isLoading: isLoadingSuggestions, refresh: refreshSuggestions } = useSpellSuggestions(newMessage, "fr");

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
    const primarySuggestionSet = useMemo(() => new Set(wordSuggestions.map((value) => value.toLowerCase())), [wordSuggestions]);
    const trimmedMessageLength = useMemo(() => newMessage.trim().length, [newMessage]);
    const hasSuggestions = useMemo(
        () => wordSuggestions.length > 0 || suggestionBuckets.some((bucket) => bucket.suggestions.length > 0),
        [wordSuggestions, suggestionBuckets]
    );
    const hasTypedInput = useMemo(() => trimmedMessageLength > 0, [trimmedMessageLength]);
    const canRefreshSuggestions = useMemo(
        () => trimmedMessageLength >= 3,
        [trimmedMessageLength]
    );

    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            const storedColor = localStorage.getItem('chat:syllable-color');
            if (storedColor !== null) {
                setColorizeSyllables(storedColor === 'true');
            }
            const storedScale = localStorage.getItem('chat:message-scale');
            if (storedScale) {
                const parsed = parseFloat(storedScale);
                if (!Number.isNaN(parsed)) {
                    const clamped = Math.min(MESSAGE_SCALE_MAX, Math.max(MESSAGE_SCALE_MIN, parsed));
                    setMessageScale(clamped);
                }
            }
        } catch (error) {
            console.warn('Impossible de charger les préférences de discussion', error);
        }
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem('chat:syllable-color', String(colorizeSyllables));
        } catch (error) {
            console.warn('Impossible de sauvegarder la préférence de colorisation', error);
        }
    }, [colorizeSyllables]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem('chat:message-scale', messageScale.toString());
        } catch (error) {
            console.warn('Impossible de sauvegarder la taille des messages', error);
        }
    }, [messageScale]);

    useEffect(() => {
        setActiveSuggestionIndex(0);
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
    
     const otherStudentName = useMemo(() => {
        if (!conversationId) return "Nouveau message";
        const parts = conversationId.split('_');
        const otherId = parts.find(p => p !== currentStudent.id);
        const otherStudent = allStudents.find(s => s.id === otherId);
        return otherStudent?.name || "Discussion";
    }, [conversationId, allStudents, currentStudent.id]);


    const handleSendMessage = useCallback(async () => {
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
            if (!prev.trim()) {
                return `${normalizedSuggestion} `;
            }

            const trailingWhitespace = /\s+$/.test(prev);
            if (!trailingWhitespace) {
                const wordMatch = prev.match(/([A-Za-zÀ-ÖØ-öø-ÿ'-]+)$/);
                if (wordMatch) {
                    return `${prev.slice(0, prev.length - wordMatch[1].length)}${normalizedSuggestion} `;
                }
            }

            const base = trailingWhitespace ? prev : `${prev}${prev.endsWith(' ') ? '' : ' '}`;
            return `${base}${normalizedSuggestion} `;
        });
        textareaRef.current?.focus();
    }, []);

    const handleApplySuggestionAtIndex = useCallback((index: number) => {
        const suggestion = wordSuggestions[index];
        if (!suggestion) return;
        handleApplySuggestion(suggestion);
    }, [handleApplySuggestion, wordSuggestions]);

    const handleInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (wordSuggestions.length) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveSuggestionIndex((prev) => (prev + 1) % wordSuggestions.length);
                return;
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveSuggestionIndex((prev) => (prev - 1 + wordSuggestions.length) % wordSuggestions.length);
                return;
            }
            if (e.key === 'Tab') {
                e.preventDefault();
                handleApplySuggestionAtIndex(activeSuggestionIndex);
                return;
            }
        }

        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    }, [wordSuggestions.length, handleApplySuggestionAtIndex, activeSuggestionIndex, handleSendMessage]);
    

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
            <ScrollArea className="flex-grow p-4 bg-muted/10" viewportRef={scrollAreaRef}>
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
                                            <div
                                                className="whitespace-pre-wrap break-words"
                                                style={{ fontSize: `${messageFontSize}px`, lineHeight: 1.4 }}
                                            >
                                                {colorizeSyllables ? <SyllableText text={msg.text} /> : msg.text}
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
                                                        {colorizeSyllables ? <SyllableText text={msg.correctedText} /> : msg.correctedText}
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
             <div className="p-4 border-t space-y-2">
                 {(hasSuggestions || isLoadingSuggestions || hasTypedInput) && (
                    <div className="rounded-xl border bg-background/90 p-3 shadow-sm">
                        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            <span className="flex items-center gap-2"><Sparkles className="h-4 w-4" /> Suggestions</span>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={refreshSuggestions}
                                disabled={isLoadingSuggestions || !canRefreshSuggestions}
                                title="Rafraîchir les suggestions"
                            >
                                {isLoadingSuggestions ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                            </Button>
                        </div>
                        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                            {wordSuggestions.length ? (
                                wordSuggestions.map((suggestion, index) => (
                                    <Button
                                        key={`${suggestion}-${index}`}
                                        size="sm"
                                        variant={activeSuggestionIndex === index ? 'secondary' : 'outline'}
                                        onMouseDown={() => handleApplySuggestion(suggestion)}
                                        onMouseEnter={() => setActiveSuggestionIndex(index)}
                                        className="shrink-0"
                                    >
                                        {suggestion}
                                        {activeSuggestionIndex === index && <span className="ml-2 text-[10px] text-muted-foreground">↹</span>}
                                    </Button>
                                ))
                            ) : (
                                <p className="text-xs text-muted-foreground">Commence à taper pour voir des idées !</p>
                            )}
                        </div>
                        {suggestionBuckets.map((bucket) => {
                            const filtered = bucket.suggestions.filter((value) => !primarySuggestionSet.has(value.toLowerCase()));
                            if (!filtered.length) return null;

                            return (
                                <div key={bucket.id} className="mt-3 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="text-[11px] font-medium uppercase tracking-wide">
                                            {bucket.label}
                                        </Badge>
                                        {bucket.description && <span className="text-[11px] text-muted-foreground">{bucket.description}</span>}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {filtered.map((suggestion) => (
                                            <Button
                                                key={`${bucket.id}-${suggestion}`}
                                                size="sm"
                                                variant="outline"
                                                onMouseDown={() => handleApplySuggestion(suggestion)}
                                            >
                                                {suggestion}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                <div className="flex flex-col gap-3 rounded-xl border bg-background/90 p-3 shadow-sm">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <Switch
                                id="toggle-syllables"
                                checked={colorizeSyllables}
                                onCheckedChange={(checked) => setColorizeSyllables(Boolean(checked))}
                            />
                            <Label htmlFor="toggle-syllables" className="text-sm">Coloriser les syllabes dans le fil</Label>
                        </div>
                        <div className="flex flex-col gap-2 sm:items-center sm:gap-3 sm:flex-row">
                            <Label htmlFor="message-size" className="text-sm">Taille du texte</Label>
                            <div className="flex items-center gap-3">
                                <Slider
                                    id="message-size"
                                    min={MESSAGE_SCALE_MIN}
                                    max={MESSAGE_SCALE_MAX}
                                    step={MESSAGE_SCALE_STEP}
                                    value={[messageScale]}
                                    onValueChange={(value) => {
                                        if (!value.length) return;
                                        setMessageScale(Number(value[0]));
                                    }}
                                    className="w-40"
                                />
                                <span className="text-xs text-muted-foreground w-12 text-right">{Math.round(messageScale * 100)}%</span>
                            </div>
                        </div>
                    </div>
                    <div className="relative">
                        <Textarea
                            ref={textareaRef}
                            id="chat-input"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={handleInputKeyDown}
                            placeholder="Écris ton message..."
                            className="pr-12 min-h-[44px] h-20 resize-none"
                            disabled={isSending}
                            spellCheck
                        />
                        <Button
                            size="icon"
                            className="absolute right-1 bottom-1 h-9 w-9"
                            onClick={handleSendMessage}
                            disabled={isSending || !hasTypedInput}
                        >
                            {isSending ? <Loader2 className="h-4 w-4 animate-spin"/> : <Send className="h-4 w-4" />}
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
