
'use client';
import { User } from 'lucide-react';

export function ChatNotification({ senderName }: { senderName: string }) {
    return (
        <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
            <User className="h-6 w-6 text-secondary-foreground" />
        </div>
    );
}
