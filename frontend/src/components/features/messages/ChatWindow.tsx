import { useState, useEffect, useRef } from 'react'
import { useMessageStore } from '../../../store/messageStore'
import { useAuthStore } from '../../../store/authStore'
import { useSocket } from '../../../hooks/useSocket'
import { messageService } from '../../../services/api/message.service'
import { MessageBubble } from './MessageBubble'
import { useUIStore } from '../../../store/uiStore'

interface ChatWindowProps {
  conversationId: string
}

export function ChatWindow({ conversationId }: ChatWindowProps) {
  const { user } = useAuthStore()
  const { messages, conversations, typingUsers, setMessages } = useMessageStore()
  const { addNotification } = useUIStore()
  const { startTyping, stopTyping, joinConversation, leaveConversation } = useSocket()

  const [messageInput, setMessageInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const conversation = conversations.find(c => c.id === conversationId)
  const conversationMessages = messages[conversationId] || []
  const typingUserIds = typingUsers[conversationId] || []
  const otherParticipant = conversation?.participants.find(p => p.id !== user?.id)

  // Load messages khi chọn conversation
  useEffect(() => {
    loadMessages()
    joinConversation(conversationId)

    return () => {
      leaveConversation(conversationId)
    }
  }, [conversationId])

  // Auto scroll to bottom khi có message mới
  useEffect(() => {
    scrollToBottom()
  }, [conversationMessages])

  const loadMessages = async () => {
    try {
      setIsLoading(true)
      const loadedMessages = await messageService.getMessages(conversationId)
      setMessages(conversationId, loadedMessages)
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Không thể tải tin nhắn'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(e.target.value)

    // Emit typing event
    startTyping(conversationId)

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Stop typing sau 2 giây không gõ
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(conversationId)
    }, 2000)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!messageInput.trim() || isSending) return

    try {
      setIsSending(true)

      // Stop typing
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      stopTyping(conversationId)

      // Send message via API
      await messageService.sendMessage({
        conversationId,
        content: messageInput.trim()
      })

      setMessageInput('')
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Không thể gửi tin nhắn'
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

  if (!conversation) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-gray-600 dark:text-gray-400">
            Chọn một cuộc trò chuyện để bắt đầu
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
        {otherParticipant?.avatarUrl ? (
          <img
            src={otherParticipant.avatarUrl}
            alt={otherParticipant.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-300">
              {otherParticipant?.name[0]}
            </span>
          </div>
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {otherParticipant?.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {otherParticipant?.role === 'employer' ? 'Nhà tuyển dụng' : 'Ứng viên'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : conversationMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-gray-600 dark:text-gray-400">
              Chưa có tin nhắn nào
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Gửi tin nhắn đầu tiên để bắt đầu cuộc trò chuyện
            </p>
          </div>
        ) : (
          <>
            {conversationMessages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.senderId === user?.id}
              />
            ))}

            {/* Typing indicator */}
            {typingUserIds.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                    {otherParticipant?.name[0]}
                  </span>
                </div>
                <div className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <textarea
            value={messageInput}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn..."
            rows={1}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={!messageInput.trim() || isSending}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isSending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
