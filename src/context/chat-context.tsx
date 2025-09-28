'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { UserContext } from './user-context';
import type { ChatContact, ChatConversationSnapshot, ChatMessage, ChatNotificationItem } from '@/types/chat';
import {
  Timestamp,
  addDoc,
  collection,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ChatContextValue {
  contacts: ChatContact[];
  isChatOpen: boolean;
  activeConversationId: string | null;
  conversations: ChatConversationSnapshot[];
  conversationMessages: ChatMessage[];
  notifications: ChatNotificationItem[];
  unreadTotal: number;
  pendingConversationId: string | null;
  toggleChat: () => void;
  closeChat: () => void;
  openConversationByContact: (contactId: string) => Promise<void>;
  openConversationById: (conversationId: string) => Promise<void>;
  setPendingConversation: (conversationId: string | null) => void;
  sendMessage: (conversationId: string, text: string) => Promise<void>;
}

export const ChatContext = createContext<ChatContextValue | undefined>(undefined);

function getConversationId(a: string, b: string): string {
  return [a, b].sort().join('__');
}

function conversationIdToParticipants(conversationId: string): string[] {
  return conversationId.split('__');
}

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { student } = useContext(UserContext);
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [conversations, setConversations] = useState<Record<string, ChatConversationSnapshot>>({});
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messagesByConversation, setMessagesByConversation] = useState<Record<string, ChatMessage[]>>({});
  const [pendingConversationId, setPendingConversationId] = useState<string | null>(null);
  const messagesUnsubRef = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    if (!student?.id) {
      setContacts([]);
      return;
    }

    const studentsRef = collection(db, 'students');
    const unsubscribe = onSnapshot(studentsRef, (snapshot) => {
      const list: ChatContact[] = snapshot.docs
        .filter((doc) => doc.id !== student.id)
        .map((doc) => {
          const data = doc.data() as { name?: string };
          return {
            id: doc.id,
            name: data.name ?? 'Élève',
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name));
      setContacts(list);
    });

    return () => unsubscribe();
  }, [student?.id]);

  useEffect(() => {
    if (!student?.id) {
      setConversations({});
      return;
    }

    const conversationsRef = collection(db, 'conversations');
    const conversationsQuery = query(conversationsRef, where('participantIds', 'array-contains', student.id));

    const unsubscribe = onSnapshot(conversationsQuery, (snapshot) => {
      const mapped: Record<string, ChatConversationSnapshot> = {};
      snapshot.docs.forEach((doc) => {
        const data = doc.data() as any;
        const conversation: ChatConversationSnapshot = {
          id: doc.id,
          participantIds: Array.isArray(data.participantIds) ? data.participantIds : [],
          participantDetails: data.participantDetails ?? {},
          unreadCounts: data.unreadCounts ?? {},
          lastMessage: data.lastMessage
            ? {
                text: data.lastMessage.text ?? '',
                senderId: data.lastMessage.senderId ?? '',
                createdAt: data.lastMessage.createdAt?.toDate?.() ?? null,
              }
            : null,
          updatedAt: data.updatedAt?.toDate?.() ?? null,
        };
        mapped[conversation.id] = conversation;
      });
      setConversations(mapped);
    });

    return () => unsubscribe();
  }, [student?.id]);

  const conversationMessages = useMemo(() => {
    if (!activeConversationId) return [];
    return messagesByConversation[activeConversationId] ?? [];
  }, [activeConversationId, messagesByConversation]);

  useEffect(() => {
    if (!student?.id || !activeConversationId) {
      if (messagesUnsubRef.current) {
        messagesUnsubRef.current();
        messagesUnsubRef.current = null;
      }
      return;
    }

    if (messagesUnsubRef.current) {
      messagesUnsubRef.current();
      messagesUnsubRef.current = null;
    }

    const messagesRef = collection(db, 'conversations', activeConversationId, 'messages');
    const messagesQuery = query(messagesRef, orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const list: ChatMessage[] = snapshot.docs.map((doc) => {
        const data = doc.data() as any;
        return {
          id: doc.id,
          conversationId: activeConversationId,
          senderId: data.senderId ?? '',
          text: data.text ?? '',
          createdAt: data.createdAt?.toDate?.() ?? new Date(),
        };
      });
      setMessagesByConversation((prev) => ({
        ...prev,
        [activeConversationId]: list,
      }));
    });
    messagesUnsubRef.current = unsubscribe;

    const conversationRef = doc(db, 'conversations', activeConversationId);
    updateDoc(conversationRef, {
      [`unreadCounts.${student.id}`]: 0,
    }).catch(() => {
      // noop
    });

    return () => {
      unsubscribe();
      messagesUnsubRef.current = null;
    };
  }, [activeConversationId, student?.id]);

  const toggleChat = useCallback(() => {
    setIsChatOpen((prev) => !prev);
  }, []);

  const closeChat = useCallback(() => {
    setIsChatOpen(false);
  }, []);

  const ensureConversationExists = useCallback(
    async (contactId: string): Promise<string | null> => {
      if (!student?.id) return null;
      const contact = contacts.find((c) => c.id === contactId);
      if (!contact) return null;
      const conversationId = getConversationId(student.id, contactId);
      const conversationRef = doc(db, 'conversations', conversationId);
      const payload: Record<string, any> = {
        participantIds: [student.id, contactId].sort(),
        participantDetails: {
          [student.id]: { name: student.name },
          [contactId]: { name: contact.name },
        },
        unreadCounts: {
          [student.id]: 0,
          [contactId]: 0,
        },
      };
      await setDoc(conversationRef, payload, { merge: true });
      return conversationId;
    },
    [contacts, student?.id, student?.name],
  );

  const openConversationByContact = useCallback(
    async (contactId: string) => {
      if (!student?.id) return;
      const conversationId = await ensureConversationExists(contactId);
      if (!conversationId) return;
      setActiveConversationId(conversationId);
      setIsChatOpen(true);
      setPendingConversationId(null);
    },
    [ensureConversationExists, student?.id],
  );

  const openConversationById = useCallback(
    async (conversationId: string) => {
      if (!student?.id) return;
      const participantIds = conversationIdToParticipants(conversationId);
      const otherParticipant = participantIds.find((id) => id !== student.id);
      if (otherParticipant && !contacts.find((c) => c.id === otherParticipant)) {
        // Ensure we have basic participant info even if student snapshot did not arrive yet
        const conversationRef = doc(db, 'conversations', conversationId);
        await setDoc(
          conversationRef,
          {
            participantDetails: {
              [student.id]: { name: student.name },
            },
          },
          { merge: true },
        );
      }
      setActiveConversationId(conversationId);
      setIsChatOpen(true);
      setPendingConversationId(null);
    },
    [contacts, student?.id, student?.name],
  );

  const sendMessage = useCallback(
    async (conversationId: string, text: string) => {
      if (!student?.id) return;
      const trimmed = text.trim();
      if (!trimmed) return;

      const participantIdsSource =
        conversations[conversationId]?.participantIds ?? conversationIdToParticipants(conversationId);
      const participantIds = [...participantIdsSource].sort();
      const otherParticipants = participantIds.filter((id) => id !== student.id);

      const conversationRef = doc(db, 'conversations', conversationId);
      const createdAt = Timestamp.now();

      const contactDetails: Record<string, any> = {
        [student.id]: { name: student.name },
      };
      otherParticipants.forEach((id) => {
        const contact = contacts.find((c) => c.id === id);
        if (contact) {
          contactDetails[id] = { name: contact.name };
        }
      });

      await setDoc(
        conversationRef,
        {
          participantIds,
          participantDetails: contactDetails,
        },
        { merge: true },
      );

      const messagesRef = collection(conversationRef, 'messages');
      await addDoc(messagesRef, {
        senderId: student.id,
        text: trimmed,
        createdAt,
        readBy: [student.id],
      });

      const updates: Record<string, any> = {
        lastMessage: {
          text: trimmed,
          senderId: student.id,
          createdAt,
        },
        updatedAt: createdAt,
      };
      updates[`unreadCounts.${student.id}`] = 0;
      otherParticipants.forEach((id) => {
        updates[`unreadCounts.${id}`] = increment(1);
      });

      await setDoc(conversationRef, updates, { merge: true });
    },
    [conversations, contacts, student?.id, student?.name],
  );

  const unreadTotal = useMemo(() => {
    if (!student?.id) return 0;
    return Object.values(conversations).reduce((sum, conversation) => {
      const unread = conversation.unreadCounts?.[student.id] ?? 0;
      return sum + (typeof unread === 'number' ? unread : 0);
    }, 0);
  }, [conversations, student?.id]);

  const conversationList = useMemo(() => {
    if (!student?.id) return [] as ChatConversationSnapshot[];
    const map = new Map<string, ChatConversationSnapshot>();
    Object.values(conversations).forEach((conversation) => {
      map.set(conversation.id, conversation);
    });

    const result: ChatConversationSnapshot[] = contacts.map((contact) => {
      const conversationId = getConversationId(student.id, contact.id);
      const snapshot = map.get(conversationId);
      if (snapshot) {
        return snapshot;
      }
      return {
        id: conversationId,
        participantIds: [student.id, contact.id],
        participantDetails: {
          [student.id]: { name: student.name },
          [contact.id]: { name: contact.name },
        },
        unreadCounts: {
          [student.id]: 0,
          [contact.id]: 0,
        },
        lastMessage: null,
        updatedAt: null,
      };
    });

    return result.sort((a, b) => {
      const aTime = a.updatedAt?.getTime?.() ?? 0;
      const bTime = b.updatedAt?.getTime?.() ?? 0;
      if (aTime === bTime) {
        const aOtherId = a.participantIds.find((id) => id !== student.id) ?? '';
        const bOtherId = b.participantIds.find((id) => id !== student.id) ?? '';
        const aName = contacts.find((c) => c.id === aOtherId)?.name ?? '';
        const bName = contacts.find((c) => c.id === bOtherId)?.name ?? '';
        return aName.localeCompare(bName);
      }
      return bTime - aTime;
    });
  }, [contacts, conversations, student?.id, student?.name]);

  const notifications = useMemo(() => {
    if (!student?.id) return [];
    const items: ChatNotificationItem[] = [];
    conversationList.forEach((conversation) => {
      const unread = conversation.unreadCounts?.[student.id] ?? 0;
      if (!unread) return;
      const otherId = conversation.participantIds.find((id) => id !== student.id);
      if (!otherId) return;
      const contact = contacts.find((c) => c.id === otherId);
      const contactName = contact?.name ?? conversation.participantDetails?.[otherId]?.name ?? 'Élève';
      const previewSource = conversation.lastMessage?.text ?? 'Nouveau message';
      items.push({
        conversationId: conversation.id,
        contactId: otherId,
        contactName,
        preview: previewSource,
        unreadCount: unread,
        updatedAt: conversation.updatedAt ?? null,
      });
    });
    return items.sort((a, b) => {
      const aTime = a.updatedAt?.getTime?.() ?? 0;
      const bTime = b.updatedAt?.getTime?.() ?? 0;
      return bTime - aTime;
    });
  }, [conversationList, contacts, student?.id]);

  const value: ChatContextValue = {
    contacts,
    isChatOpen,
    activeConversationId,
    conversations: conversationList,
    conversationMessages,
    notifications,
    unreadTotal,
    pendingConversationId,
    toggleChat,
    closeChat,
    openConversationByContact,
    openConversationById,
    setPendingConversation: setPendingConversationId,
    sendMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export function useChat(): ChatContextValue {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}

export function getConversationIdForParticipants(selfId: string, otherId: string): string {
  return getConversationId(selfId, otherId);
}
