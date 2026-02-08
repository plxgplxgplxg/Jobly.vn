export interface SendMessageDTO {
  receiverId: string;
  content: string;
}

export interface MessageDTO {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  sentAt: Date;
  sender?: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

export interface ConversationParticipant {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

export interface ConversationDTO {
  id: string;
  participants: ConversationParticipant[];
  lastMessage?: MessageDTO;
  unreadCount: number;
  updatedAt: Date;
}
