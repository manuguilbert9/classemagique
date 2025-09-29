
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
        <div className="fixed bottom-0 right-4 z-50 flex items-end gap-4">
            <Card className="w-[600px] h-[500px] shadow-2xl flex flex-col rounded-t-lg overflow-hidden">
                <header className="bg-primary text-primary-foreground border-b p-3">
                    <div className="grid gap-3 md:grid-cols-[auto,1fr,auto] md:items-center">
                        <div className="flex items-center gap-2">
                            <MessageSquare />
                            <h2 className="text-lg font-semibold">Messagerie</h2>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium sm:text-sm md:justify-center">
                            <div className="flex items-center gap-2">
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
                            <div className="flex items-center gap-3">
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
                            className="justify-self-start p-1 rounded-full transition hover:bg-primary/80 md:justify-self-end"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </header>
                <div className="flex flex-grow overflow-hidden">
                    <div className="w-1/3 border-r bg-muted/30 flex flex-col">
                        <header className="p-2 border-b">
                            <Button onClick={handleStartNewConversation} className="w-full">
                                <Users className="mr-2 h-4 w-4"/> Nouvelle discussion
                            </Button>
                        </header>
                        <ConversationList
                            conversations={conversations}
                            currentStudentId={student.id}
                            onSelectConversation={handleSelectConversation}
                            selectedConversationId={selectedConversationId}
                            isLoading={isLoadingConversations}
                            presenceByStudentId={presenceByStudentId}
                        />
                    </div>
                    <div className="w-2/3 flex flex-col">
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
