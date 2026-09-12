
'use client';

import { useState, useEffect, useContext } from 'react';
import { Card } from '@/components/ui/card';
import { ConversationList } from './conversation-list';
import { ChatWindow } from './chat-window';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { X, MessageSquare, Users } from 'lucide-react';
import { type Student } from '@/services/students';
import { createPresenceMap, listenToStudentsPresence, type StudentPresenceState } from '@/services/student-presence';
import { ChatContext } from '@/context/chat-context';
import { MESSAGE_SCALE_MIN, MESSAGE_SCALE_MAX, MESSAGE_SCALE_STEP } from './constants';

interface ChatManagerProps {
    student: Student;
    onClose: () => void;
}

export function ChatManager({ student, onClose }: ChatManagerProps) {
    const [allStudents, setAllStudents] = useState<Student[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [colorizeSyllables, setColorizeSyllables] = useState(false);
    const [messageScale, setMessageScale] = useState(1);
    const [presenceByStudentId, setPresenceByStudentId] = useState<Record<string, StudentPresenceState>>({});

    const { conversations, isLoading: isLoadingConversations } = useContext(ChatContext);

    // Bloquer le scroll de la page parent quand la messagerie est ouverte
    useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        const originalPosition = document.body.style.position;

        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';

        return () => {
            document.body.style.overflow = originalOverflow;
            document.body.style.position = originalPosition;
            document.body.style.width = '';
        };
    }, []);

    useEffect(() => {
        const unsubscribe = listenToStudentsPresence((students) => {
            const otherStudents = students.filter((s) => s.id !== student.id);
            setAllStudents(otherStudents);
            setPresenceByStudentId(createPresenceMap(students));
        });

        return () => unsubscribe();
    }, [student.id]);

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
    
    const handleSelectConversation = (conversationId: string) => {
        setSelectedConversationId(conversationId);
        setIsCreatingNew(false);
    }
    
    const handleStartNewConversation = () => {
        setSelectedConversationId(null);
        setIsCreatingNew(true);
    }

    return (
        <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-[#f3f0fb]">
            <Card className="flex h-full flex-col rounded-none border-0 shadow-none">
                <header className="relative overflow-hidden bg-gradient-to-r from-[hsl(340,85%,62%)] via-[hsl(340,85%,58%)] to-[hsl(12,76%,61%)] p-4 text-white sm:p-3">
                    <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-white/10" />
                    <div className="pointer-events-none absolute -bottom-12 left-16 h-24 w-24 rounded-full bg-white/10" />
                    <div className="relative grid gap-3 md:grid-cols-[auto,1fr,auto] md:items-center">
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 shadow-inner">
                                <MessageSquare className="h-5 w-5" />
                            </span>
                            <h2 className="text-lg font-bold tracking-tight">Messagerie</h2>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium sm:text-sm md:justify-center">
                            <div className="flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5">
                                <Switch
                                    id="chat-toggle-syllables"
                                    checked={colorizeSyllables}
                                    onCheckedChange={(checked) => setColorizeSyllables(Boolean(checked))}
                                    aria-label="Coloriser les syllabes dans le fil"
                                />
                                <Label htmlFor="chat-toggle-syllables" className="cursor-pointer">
                                    Coloriser les syllabes
                                </Label>
                            </div>
                            <div className="flex items-center gap-3 rounded-full bg-white/15 px-3 py-1.5">
                                <Label htmlFor="chat-message-size" className="whitespace-nowrap">
                                    Taille du texte
                                </Label>
                                <Slider
                                    id="chat-message-size"
                                    min={MESSAGE_SCALE_MIN}
                                    max={MESSAGE_SCALE_MAX}
                                    step={MESSAGE_SCALE_STEP}
                                    value={[messageScale]}
                                    onValueChange={(value) => {
                                        if (!value.length) return;
                                        setMessageScale(Number(value[0]));
                                    }}
                                    className="w-28 sm:w-32 md:w-40"
                                    aria-label="Ajuster la taille du texte des messages"
                                />
                                <span className="text-[11px] font-semibold tabular-nums sm:text-xs">
                                    {Math.round(messageScale * 100)}%
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="justify-self-start rounded-full bg-white/15 p-1.5 transition hover:bg-white/30 md:justify-self-end"
                            aria-label="Fermer la messagerie"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </header>
                <div className="flex flex-1 flex-col overflow-hidden md:flex-row min-h-0">
                    <div className="flex flex-col border-b bg-white md:w-1/3 md:max-w-sm md:border-b-0 md:border-r md:flex-none min-h-0">
                        <header className="flex-shrink-0 border-b p-3 sm:p-2">
                            <Button
                                onClick={handleStartNewConversation}
                                className="w-full gap-2 rounded-full bg-gradient-to-r from-[hsl(340,85%,62%)] to-[hsl(12,76%,61%)] font-semibold shadow-sm hover:opacity-90"
                            >
                                <Users className="h-4 w-4" /> Nouvelle discussion
                            </Button>
                        </header>
                        <div className="flex-1 min-h-0 overflow-hidden bg-[#faf9fd]">
                            <ConversationList
                                conversations={conversations}
                                currentStudentId={student.id}
                                onSelectConversation={handleSelectConversation}
                                selectedConversationId={selectedConversationId}
                                isLoading={isLoadingConversations}
                                presenceByStudentId={presenceByStudentId}
                            />
                        </div>
                    </div>
                    <div className="flex flex-1 flex-col overflow-hidden min-h-0">
                        <ChatWindow
                           currentStudent={student}
                           allStudents={allStudents}
                           isCreatingNew={isCreatingNew}
                           setIsCreatingNew={setIsCreatingNew}
                           conversationId={selectedConversationId}
                           setSelectedConversationId={setSelectedConversationId}
                           colorizeSyllables={colorizeSyllables}
                           messageScale={messageScale}
                           presenceByStudentId={presenceByStudentId}
                        />
                    </div>
                </div>
            </Card>
        </div>
    );
}
