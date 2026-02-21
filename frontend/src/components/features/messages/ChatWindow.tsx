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

  useEffect(() => {
    loadMessages()
    joinConversation(conversationId)

    return () => {
      leaveConversation(conversationId)
    }
  }, [conversationId])

  useEffect(() => {
    scrollToBottom()
  }, [conversationMessages])

  const loadMessages = async () => {
    try {
      setIsLoading(true)
      const loadedMessages = await messageService.getMessages(conversationId)
      setMessages(conversationId, loadedMessages)
      useMessageStore.getState().markAsRead(conversationId)
      await messageService.markAsRead(conversationId)
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
    startTyping(conversationId)

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(conversationId)
    }, 2000)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!messageInput.trim() || isSending || !otherParticipant) return

    const messageContent = messageInput.trim()

    try {
      setIsSending(true)

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      stopTyping(conversationId)

      const sentMessage = await messageService.sendMessage({
        receiverId: otherParticipant.id,
        content: messageContent
      })

      const { addMessage } = useMessageStore.getState()
      addMessage(conversationId, sentMessage)

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
      <div className="h-full flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-5xl text-primary">chat_bubble</span>
          </div>
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Chọn một cuộc trò chuyện để bắt đầu
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900">
      <div className="p-5 bg-gradient-to-r from-primary to-purple-600 flex items-center gap-4">
        {otherParticipant?.avatarUrl ? (
          <img
            src={otherParticipant.avatarUrl}
            alt={otherParticipant.name}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-white/30"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center ring-2 ring-white/30">
            <span className="text-lg font-bold text-white">
              {otherParticipant?.name[0]}
            </span>
          </div>
        )}
        <div className="flex-1">
          <h3 className="font-bold text-white text-lg">
            {otherParticipant?.name}
          </h3>
          <p className="text-sm text-white/80">
            {otherParticipant?.role === 'employer' ? 'Nhà tuyển dụng' : 'Ứng viên'}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-800">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <span className="material-symbols-outlined text-primary text-5xl animate-spin">progress_activity</span>
          </div>
        ) : conversationMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-5xl text-primary">chat_bubble</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-medium mb-2">
              Chưa có tin nhắn nào
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500">
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

            {typingUserIds.length > 0 && (
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                  <span className="text-sm font-bold text-white">
                    {otherParticipant?.name[0]}
                  </span>
                </div>
                <div className="px-5 py-3 bg-white dark:bg-slate-700 rounded-2xl rounded-bl-md shadow-sm border border-slate-200 dark:border-slate-600">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="p-5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <textarea
            value={messageInput}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn..."
            rows={1}
            className="flex-1 px-5 py-3 border border-slate-300 dark:border-slate-600 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none transition-all"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={!messageInput.trim() || isSending}
            className="px-6 py-3 bg-gradient-to-r from-primary to-purple-600 text-white rounded-full hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all flex items-center gap-2"
          >
            {isSending ? (
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined">send</span>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
