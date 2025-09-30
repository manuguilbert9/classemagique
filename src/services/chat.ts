

import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, onSnapshot, Unsubscribe, Timestamp, doc, setDoc, getDoc, serverTimestamp, writeBatch, updateDoc } from "firebase/firestore";
import type { Student } from './students';
import { getChatSettings } from './teacher';

export interface Conversation {
    id: string;
    participants: string[]; // array of student IDs
    participantNames: { [id: string]: string };
    participantPhotoURLs: { [id: string]: string | undefined };
    participantShowPhoto: { [id: string]: boolean | undefined };
    lastMessage: Message | null;
}

export interface Message {
    id?: string;
    conversationId: string;
    senderId: string;
    text: string;
    createdAt: Timestamp;
    readBy: { [id: string]: boolean };
    correctedText?: string;
}

// --- Listener Functions (for real-time updates) ---

export function listenToConversations(studentId: string, callback: (conversations: Conversation[]) => void): Unsubscribe {
    const q = query(
        collection(db, 'conversations'), 
        where('participants', 'array-contains', studentId)
    );

    const studentsPromise = getDocs(collection(db, 'students')).then(snapshot => {
        const studentMap = new Map<string, Student>();
        snapshot.forEach(doc => studentMap.set(doc.id, { id: doc.id, ...doc.data() } as Student));
        return studentMap;
    });

    return onSnapshot(q, async (querySnapshot) => {
        const studentMap = await studentsPromise;
        const conversations: Conversation[] = [];

        for (const docSnap of querySnapshot.docs) {
            let convoData = docSnap.data() as Partial<Conversation>;

            let needsUpdate = false;
            // Ensure the photo info objects exist
            if (!convoData.participantPhotoURLs) {
                convoData.participantPhotoURLs = {};
                needsUpdate = true;
            }
             if (!convoData.participantShowPhoto) {
                convoData.participantShowPhoto = {};
                needsUpdate = true;
            }
            
            for (const participantId of convoData.participants || []) {
                const student = studentMap.get(participantId);
                const currentPhotoURL = convoData.participantPhotoURLs![participantId];
                const currentShowPhoto = convoData.participantShowPhoto![participantId];

                if (student && (currentPhotoURL !== (student.photoURL || '') || currentShowPhoto !== (student.showPhoto ?? true))) {
                    needsUpdate = true;
                    convoData.participantPhotoURLs![participantId] = student.photoURL || '';
                    convoData.participantShowPhoto![participantId] = student.showPhoto ?? true;
                }
            }

            if (needsUpdate) {
                const conversationRef = doc(db, 'conversations', docSnap.id);
                // Perform the update non-blockingly in the background
                setDoc(conversationRef, {
                    participantPhotoURLs: convoData.participantPhotoURLs,
                    participantShowPhoto: convoData.participantShowPhoto
                }, { merge: true }).catch(err => console.error("Failed to update conversation with photo info:", err));
            }

            conversations.push({ id: docSnap.id, ...convoData } as Conversation);
        };
        
        // Sort conversations by last message timestamp, descending.
        conversations.sort((a, b) => {
            const timeA = a.lastMessage?.createdAt?.toMillis() || 0;
            const timeB = b.lastMessage?.createdAt?.toMillis() || 0;
            return timeB - timeA;
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
        const convoData = docSnap.data();
        let needsUpdate = false;
        
        const photoURLs = convoData.participantPhotoURLs || {};
        const showPhotoFlags = convoData.participantShowPhoto || {};

        if (photoURLs[currentStudent.id] !== (currentStudent.photoURL || '') || showPhotoFlags[currentStudent.id] !== (currentStudent.showPhoto ?? true) ||
            photoURLs[otherStudent.id] !== (otherStudent.photoURL || '') || showPhotoFlags[otherStudent.id] !== (otherStudent.showPhoto ?? true)) {
            needsUpdate = true;
        }

        if (needsUpdate) {
            await setDoc(conversationRef, {
                participantPhotoURLs: {
                    [currentStudent.id]: currentStudent.photoURL || '',
                    [otherStudent.id]: otherStudent.photoURL || '',
                },
                participantShowPhoto: {
                    [currentStudent.id]: currentStudent.showPhoto ?? true,
                    [otherStudent.id]: otherStudent.showPhoto ?? true,
                }
            }, { merge: true });
        }
        return docSnap.id;
    } else {
        await setDoc(conversationRef, {
            participants,
            participantNames: {
                [currentStudent.id]: currentStudent.name,
                [otherStudent.id]: otherStudent.name,
            },
            participantPhotoURLs: {
                [currentStudent.id]: currentStudent.photoURL || '',
                [otherStudent.id]: otherStudent.photoURL || '',
            },
            participantShowPhoto: {
                [currentStudent.id]: currentStudent.showPhoto ?? true,
                [otherStudent.id]: otherStudent.showPhoto ?? true,
            },
            lastMessage: null,
        });
        return conversationId;
    }
}

export async function sendMessage(conversationId: string, senderId: string, text: string): Promise<{ success: boolean, error?: string }> {
    if (!text.trim()) return { success: false, error: "Le message est vide." };

    const chatSettings = await getChatSettings();
    if (!chatSettings.enabled) {
        return { success: false, error: "Le chat est désactivé par l'enseignant." };
    }
    
    const now = new Date();
    const dayName = now.toLocaleDateString('fr-FR', { weekday: 'long' });
    const capitalizedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);
    
    if (!chatSettings.days.includes(capitalizedDayName)) {
        return { success: false, error: "Le chat n'est pas disponible aujourd'hui." };
    }

    const currentTime = now.getHours() * 60 + now.getMinutes();
    const [startH, startM] = chatSettings.startTime.split(':').map(Number);
    const [endH, endM] = chatSettings.endTime.split(':').map(Number);
    const startTimeInMinutes = startH * 60 + startM;
    const endTimeInMinutes = endH * 60 + endM;

    if (currentTime < startTimeInMinutes || currentTime > endTimeInMinutes) {
        return { success: false, error: `Le chat est uniquement disponible entre ${chatSettings.startTime} et ${chatSettings.endTime}.` };
    }

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

export async function updateMessageCorrection(conversationId: string, messageId: string, correctedText: string): Promise<{ success: boolean; error?: string }> {
    if (!conversationId || !messageId) {
        return { success: false, error: 'Conversation ou ID de message manquant.' };
    }

    try {
        const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);
        await updateDoc(messageRef, {
            correctedText: correctedText
        });
        return { success: true };
    } catch (error) {
        console.error("Error updating message correction:", error);
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: 'An unknown error occurred.' };
    }
}
