
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, onSnapshot, Unsubscribe, Timestamp, doc, setDoc, getDoc, serverTimestamp, writeBatch } from "firebase/firestore";
import type { Student } from './students';

export interface Conversation {
    id: string;
    participants: string[]; // array of student IDs
    participantNames: { [id: string]: string };
    lastMessage: Message | null;
}

export interface Message {
    id?: string;
    conversationId: string;
    senderId: string;
    text: string;
    createdAt: Timestamp;
    readBy: { [id: string]: boolean };
}

// --- Listener Functions (for real-time updates) ---

export function listenToConversations(studentId: string, callback: (conversations: Conversation[]) => void): Unsubscribe {
    const q = query(
        collection(db, 'conversations'), 
        where('participants', 'array-contains', studentId),
        orderBy('lastMessage.createdAt', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
        const conversations: Conversation[] = [];
        querySnapshot.forEach((doc) => {
            conversations.push({ id: doc.id, ...doc.data() } as Conversation);
        });
        callback(conversations);
    });
}

export function listenToMessages(conversationId: string, callback: (messages: Message[]) => void): Unsubscribe {
    const q = query(
        collection(db, 'conversations', conversationId, 'messages'),
        orderBy('createdAt', 'asc')
    );

    return onSnapshot(q, (querySnapshot) => {
        const messages: Message[] = [];
        querySnapshot.forEach((doc) => {
            messages.push({ id: doc.id, ...doc.data() } as Message);
        });
        callback(messages);
    });
}

// --- Action Functions ---

export async function findOrCreateConversation(currentStudent: Student, otherStudent: Student): Promise<string> {
    const participants = [currentStudent.id, otherStudent.id].sort();
    const conversationId = participants.join('_');

    const conversationRef = doc(db, 'conversations', conversationId);
    const docSnap = await getDoc(conversationRef);

    if (docSnap.exists()) {
        return docSnap.id;
    } else {
        await setDoc(conversationRef, {
            participants,
            participantNames: {
                [currentStudent.id]: currentStudent.name,
                [otherStudent.id]: otherStudent.name,
            },
            lastMessage: null,
        });
        return conversationId;
    }
}

export async function sendMessage(conversationId: string, senderId: string, text: string): Promise<{ success: boolean }> {
    if (!text.trim()) return { success: false };

    const conversationRef = doc(db, 'conversations', conversationId);
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    
    const newMessage: Omit<Message, 'id'> = {
        conversationId,
        senderId,
        text,
        createdAt: Timestamp.now(),
        readBy: { [senderId]: true }
    };
    
    const batch = writeBatch(db);

    const newMessageRef = doc(messagesRef);
    batch.set(newMessageRef, newMessage);

    batch.update(conversationRef, { lastMessage: newMessage });

    await batch.commit();

    return { success: true };
}

export async function markAsRead(conversationId: string, studentId: string): Promise<void> {
    const conversationRef = doc(db, 'conversations', conversationId);
    const docSnap = await getDoc(conversationRef);

    if (docSnap.exists()) {
        const conversationData = docSnap.data();
        if (conversationData.lastMessage && !conversationData.lastMessage.readBy[studentId]) {
            await setDoc(conversationRef, {
                lastMessage: {
                    ...conversationData.lastMessage,
                    readBy: {
                        ...conversationData.lastMessage.readBy,
                        [studentId]: true
                    }
                }
            }, { merge: true });
        }
    }
}
