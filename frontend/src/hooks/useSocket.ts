import { useEffect } from 'react'
import { socketService } from '../services/socket/socket.service'
import { useMessageStore } from '../store/messageStore'
import { useAuthStore } from '../store/authStore'
import type { Message } from '../store/messageStore'

export function useSocket() {
  const { token, isAuthenticated } = useAuthStore()
  const { addMessage, setTyping, updateConversation } = useMessageStore()

  useEffect(() => {
    if (!isAuthenticated || !token) {
      socketService.disconnect()
      return
    }

    // Connect socket với JWT token
    socketService.connect(token)

    // Listen to message:receive event
    const handleMessageReceive = (data: Message) => {
      addMessage(data.conversationId, data)
    }

    // Listen to typing:start event
    const handleTypingStart = (data: { conversationId: string; userId: string }) => {
      setTyping(data.conversationId, data.userId, true)
    }

    // Listen to typing:stop event
    const handleTypingStop = (data: { conversationId: string; userId: string }) => {
      setTyping(data.conversationId, data.userId, false)
    }

    // Listen to conversation:update event
    const handleConversationUpdate = (data: { conversationId: string; updates: any }) => {
      updateConversation(data.conversationId, data.updates)
    }

    // Register event listeners
    socketService.on('message:receive', handleMessageReceive)
    socketService.on('typing:start', handleTypingStart)
    socketService.on('typing:stop', handleTypingStop)
    socketService.on('conversation:update', handleConversationUpdate)

    // Cleanup
    return () => {
      socketService.off('message:receive', handleMessageReceive)
      socketService.off('typing:start', handleTypingStart)
      socketService.off('typing:stop', handleTypingStop)
      socketService.off('conversation:update', handleConversationUpdate)
      socketService.disconnect()
    }
  }, [isAuthenticated, token, addMessage, setTyping, updateConversation])

  return {
    isConnected: socketService.isConnected,
    sendMessage: socketService.sendMessage.bind(socketService),
    startTyping: socketService.startTyping.bind(socketService),
    stopTyping: socketService.stopTyping.bind(socketService),
    joinConversation: socketService.joinConversation.bind(socketService),
    leaveConversation: socketService.leaveConversation.bind(socketService)
  }
}
