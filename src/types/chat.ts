export interface ChatContact {
  id: string;
  name: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: Date;
}

export interface ChatConversationSnapshot {
  id: string;
  participantIds: string[];
  participantDetails: Record<string, { name: string }>;
  unreadCounts: Record<string, number>;
  lastMessage?: {
    text: string;
    senderId: string;
    createdAt: Date | null;
  } | null;
  updatedAt?: Date | null;
}

export interface ChatNotificationItem {
  conversationId: string;
  contactId: string;
  contactName: string;
  preview: string;
  unreadCount: number;
  updatedAt: Date | null;
}
