import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button } from '../components/common/Button'
import { useMessageStore } from '../store/messageStore'
import { messageService } from '../services/api/message.service'
import { useUIStore } from '../store/uiStore'
import { useSocket } from '../hooks/useSocket'
import { ConversationList } from '../components/features/messages/ConversationList'
import { ChatWindow } from '../components/features/messages/ChatWindow'

export function MessagesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { conversations, activeConversationId, setConversations, setActiveConversation } = useMessageStore()
  const { addNotification } = useUIStore()
  const { isConnected } = useSocket() // Can be removed if not used for UI

  const [isLoading, setIsLoading] = useState(true)
  const [showMobileChat, setShowMobileChat] = useState(false)

  useEffect(() => {
    loadConversations()
  }, [])

  const hasProcessedParams = useRef(false)

  // Xu ly query parameter ?user=id hoac ?conversationId=id
  useEffect(() => {
    const userId = searchParams.get('user')
    const conversationId = searchParams.get('conversationId')

    if (!isLoading && !hasProcessedParams.current && (userId || conversationId)) {
      hasProcessedParams.current = true

      if (conversationId) {
        // Neu co conversationId, set active conversation
        setActiveConversation(conversationId)
        setShowMobileChat(true)
        setSearchParams({})
      } else if (userId) {
        // Neu co userId, khoi tao conversation
        handleStartConversation(userId)
      }
    }
  }, [searchParams, isLoading])

  const loadConversations = async () => {
    try {
      setIsLoading(true)
      const data = await messageService.getConversations()
      setConversations(data)
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Không thể tải danh sách cuộc trò chuyện'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartConversation = async (userId: string) => {
    try {
      // Tim conversation hien tai voi user nay
      const existingConv = conversations.find(conv =>
        conv.participants.some(p => p.id === userId)
      )

      if (existingConv) {
        // Neu da co conversation, chi can set active
        setActiveConversation(existingConv.id)
        setShowMobileChat(true)
      } else {
        // Neu chua co, tao conversation moi
        const newConv = await messageService.createConversation({ participantId: userId })

        // Remove duplicate check strict
        const isExist = conversations.some(c => c.id === newConv.id)
        if (!isExist) {
          setConversations([newConv, ...conversations])
        }

        setActiveConversation(newConv.id)
        setShowMobileChat(true)
      }
    } catch (error: any) {
      console.error('Start conversation error:', error)
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Không thể tạo cuộc trò chuyện'
      })
    } finally {
      // Xoa query parameter sau khi xu ly xong (thanh cong hay that bai)
      setSearchParams({})
    }
  }

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversation(conversationId)
    setShowMobileChat(true)
  }

  const handleBackToList = () => {
    setShowMobileChat(false)
    setActiveConversation(null)
  }

  return (
    <div className="h-screen bg-background-light dark:bg-background-dark">
      <div className="max-w-7xl mx-auto h-full">
        {/* Connection status */}
        {!isConnected && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-2">
            <div className="flex items-center gap-2 text-sm text-yellow-800 dark:text-yellow-200">
              <span className="material-symbols-outlined text-base animate-spin">sync</span>
              Đang kết nối lại...
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <span className="material-symbols-outlined text-primary text-6xl animate-spin">progress_activity</span>
          </div>
        ) : (
          <div className="h-full flex">
            {/* Desktop layout */}
            <div className="hidden md:flex w-full h-full">
              {/* Conversation list - 1/3 width */}
              <div className="w-1/3 border-r border-slate-200 dark:border-slate-800">
                <ConversationList onSelectConversation={handleSelectConversation} />
              </div>

              {/* Chat window - 2/3 width */}
              <div className="flex-1">
                {activeConversationId ? (
                  <ChatWindow conversationId={activeConversationId} />
                ) : (
                  <div className="h-full flex items-center justify-center bg-white dark:bg-slate-900">
                    <div className="text-center">
                      <span className="material-symbols-outlined mx-auto text-slate-400 text-7xl mb-4 block">chat_bubble</span>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                        Tin nhắn của bạn
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        Chọn một cuộc trò chuyện để bắt đầu nhắn tin
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile layout */}
            <div className="md:hidden w-full h-full">
              {!showMobileChat ? (
                <ConversationList onSelectConversation={handleSelectConversation} />
              ) : activeConversationId ? (
                <div className="h-full flex flex-col">
                  {/* Back button */}
                  <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4">
                    <Button
                      onClick={handleBackToList}
                      variant="ghost"
                      size="sm"
                      leftIcon={<span className="material-symbols-outlined">arrow_back</span>}
                    >
                      Quay lại
                    </Button>
                  </div>
                  <div className="flex-1">
                    <ChatWindow conversationId={activeConversationId} />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Empty state - no conversations AND no active conversation */}
        {!isLoading && conversations.length === 0 && !activeConversationId && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center p-8">
              <span className="material-symbols-outlined mx-auto text-slate-400 text-7xl mb-4 block">chat_bubble</span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                Chưa có cuộc trò chuyện nào
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Bắt đầu trò chuyện với nhà tuyển dụng hoặc ứng viên
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
