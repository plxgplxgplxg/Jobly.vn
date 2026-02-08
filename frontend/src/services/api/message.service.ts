import { apiClient } from './apiClient'
import type { Conversation, Message } from '../../store/messageStore'

export interface SendMessageData {
  conversationId: string
  content: string
}

export interface CreateConversationData {
  participantId: string
  initialMessage?: string
}

class MessageService {
  async getConversations(): Promise<Conversation[]> {
    const response = await apiClient.get<Conversation[]>('/messages/conversations')
    return response
  }

  async getMessages(conversationId: string, page = 1, limit = 50): Promise<Message[]> {
    const response = await apiClient.get<Message[]>(
      `/messages/conversations/${conversationId}/messages?page=${page}&limit=${limit}`
    )
    return response
  }

  async sendMessage(data: SendMessageData): Promise<Message> {
    const response = await apiClient.post<Message>('/messages', data)
    return response
  }

  async markAsRead(conversationId: string): Promise<void> {
    await apiClient.patch(`/messages/conversations/${conversationId}/read`)
  }

  async createConversation(data: CreateConversationData): Promise<Conversation> {
    const response = await apiClient.post<Conversation>('/messages/conversations', data)
    return response
  }

  async getConversationById(id: string): Promise<Conversation> {
    const response = await apiClient.get<Conversation>(`/messages/conversations/${id}`)
    return response
  }

  async deleteConversation(id: string): Promise<void> {
    await apiClient.delete(`/messages/conversations/${id}`)
  }
}

export const messageService = new MessageService()
export default messageService
