import { create } from 'zustand'
import { useAuthStore } from './authStore'

export interface Message {
  id: string
  conversationId: string
  senderId: string
  sender: {
    id: string
    name: string
    avatarUrl?: string
  }
  content: string
  isRead: boolean
  sentAt: string
}

export interface Conversation {
  id: string
  participants: Array<{
    id: string
    name: string
    avatarUrl?: string
    role: string
  }>
  lastMessage?: Message
  unreadCount: number
  createdAt: string
  updatedAt: string
}

interface MessageState {
  conversations: Conversation[]
  activeConversationId: string | null
  messages: Record<string, Message[]>
  unreadCount: number
  typingUsers: Record<string, string[]>

  setConversations: (conversations: Conversation[]) => void
  addConversation: (conversation: Conversation) => void
  updateConversation: (id: string, updates: Partial<Conversation>) => void

  setMessages: (conversationId: string, messages: Message[]) => void
  addMessage: (conversationId: string, message: Message) => void

  setActiveConversation: (id: string | null) => void

  markAsRead: (conversationId: string) => void
  updateUnreadCount: () => void

  setTyping: (conversationId: string, userId: string, isTyping: boolean) => void

  reset: () => void
}

export const useMessageStore = create<MessageState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: {},
  unreadCount: 0,
  typingUsers: {},

  setConversations: (conversations) => {
    set({ conversations })
    get().updateUnreadCount()
  },

  addConversation: (conversation) => {
    set((state) => ({
      conversations: [conversation, ...state.conversations]
    }))
  },

  updateConversation: (id, updates) => {
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === id ? { ...conv, ...updates } : conv
      )
    }))
  },

  setMessages: (conversationId, messages) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: messages
      }
    }))
  },

  addMessage: (conversationId, message) => {
    set((state) => {
      const existingMessages = state.messages[conversationId] || []

      // Tránh duplicate
      if (existingMessages.some(m => m.id === message.id)) {
        return state
      }

      return {
        messages: {
          ...state.messages,
          [conversationId]: [...existingMessages, message]
        }
      }
    })

    // Update conversation với last message
    const conversation = get().conversations.find(c => c.id === conversationId)
    if (conversation) {
      // Lấy current user ID từ authStore
      const currentUserId = useAuthStore.getState().user?.id

      // Chỉ tăng unreadCount nếu tin nhắn từ người khác
      const shouldIncreaseUnread = message.senderId !== currentUserId

      get().updateConversation(conversationId, {
        lastMessage: message,
        unreadCount: shouldIncreaseUnread
          ? conversation.unreadCount + 1
          : conversation.unreadCount
      })
    }

    get().updateUnreadCount()
  },

  setActiveConversation: (id) => {
    set({ activeConversationId: id })
    if (id) {
      get().markAsRead(id)
    }
  },

  markAsRead: (conversationId) => {
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      ),
      messages: {
        ...state.messages,
        [conversationId]: (state.messages[conversationId] || []).map(msg => ({
          ...msg,
          isRead: true
        }))
      }
    }))
    get().updateUnreadCount()
  },

  updateUnreadCount: () => {
    const total = get().conversations.reduce(
      (sum, conv) => sum + conv.unreadCount,
      0
    )
    set({ unreadCount: total })
  },

  setTyping: (conversationId, userId, isTyping) => {
    set((state) => {
      const currentTyping = state.typingUsers[conversationId] || []

      if (isTyping) {
        if (!currentTyping.includes(userId)) {
          return {
            typingUsers: {
              ...state.typingUsers,
              [conversationId]: [...currentTyping, userId]
            }
          }
        }
      } else {
        return {
          typingUsers: {
            ...state.typingUsers,
            [conversationId]: currentTyping.filter(id => id !== userId)
          }
        }
      }

      return state
    })
  },

  reset: () => {
    set({
      conversations: [],
      activeConversationId: null,
      messages: {},
      unreadCount: 0,
      typingUsers: {}
    })
  }
}))
