
'use client';

import { useState, useEffect, useContext } from 'react';
import { Card } from '@/components/ui/card';
import { ConversationList } from './conversation-list';
import { ChatWindow } from './chat-window';
import { Button } from '@/components/ui/button';
import { X, MessageSquare, Users } from 'lucide-react';
import { getStudents, type Student } from '@/services/students';
import { ChatContext } from '@/context/chat-context';

interface ChatManagerProps {
    student: Student;
    onClose: () => void;
}

export function ChatManager({ student, onClose }: ChatManagerProps) {
    const [allStudents, setAllStudents] = useState<Student[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    
    const { conversations, isLoading: isLoadingConversations } = useContext(ChatContext);

    useEffect(() => {
        getStudents().then(students => {
            const otherStudents = students.filter(s => s.id !== student.id);
            setAllStudents(otherStudents);
        });
    }, [student.id]);
    
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
                 <header className="flex items-center justify-between p-3 bg-primary text-primary-foreground border-b">
                    <div className="flex items-center gap-2">
                        <MessageSquare />
                        <h2 className="text-lg font-semibold">Messagerie</h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-primary/80">
                        <X className="h-5 w-5" />
                    </button>
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
                        />
                    </div>
                </div>
            </Card>
        </div>
    );
}
