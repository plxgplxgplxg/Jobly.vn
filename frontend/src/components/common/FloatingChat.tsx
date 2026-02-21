import { useState, useEffect } from 'react'
import { ChatWindow } from '../features/messages/ChatWindow'
import { messageService } from '../../services/api/message.service'
import { useMessageStore } from '../../store/messageStore'
import { useUIStore } from '../../store/uiStore'

interface FloatingChatProps {
    userId: string | null
    onClose: () => void
}

export function FloatingChat({ userId, onClose }: FloatingChatProps) {
    const [conversationId, setConversationId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isMinimized, setIsMinimized] = useState(false)
    const { addNotification } = useUIStore()
    const { conversations, setConversations } = useMessageStore()

    useEffect(() => {
        if (userId) {
            initializeChat(userId)
        }
    }, [userId])

    const initializeChat = async (targetUserId: string) => {
        try {
            setIsLoading(true)
            // Check existing conversation locally first
            const existingConv = conversations.find(conv =>
                conv.participants.some(p => p.id === targetUserId)
            )

            if (existingConv) {
                setConversationId(existingConv.id)
            } else {
                // Create new or get from server
                const newConv = await messageService.createConversation({ participantId: targetUserId })

                // Add to store if not exists
                if (!conversations.find(c => c.id === newConv.id)) {
                    setConversations([newConv, ...conversations])
                }

                setConversationId(newConv.id)
            }
        } catch (error: any) {
            console.error('Failed to initialize chat:', error)
            addNotification({
                type: 'error',
                message: 'Không thể bắt đầu cuộc trò chuyện'
            })
            onClose()
        } finally {
            setIsLoading(false)
        }
    }

    if (!userId) return null

    return (
        <div className={`fixed bottom-4 right-4 w-96 bg-white dark:bg-gray-800 rounded-t-lg shadow-2xl border border-gray-200 dark:border-gray-700 z-50 flex flex-col transition-all duration-300 ${isMinimized ? 'h-14' : 'h-[500px]'}`}>
            {/* Header */}
            <div
                className="flex items-center justify-between p-3 bg-blue-600 text-white rounded-t-lg cursor-pointer"
                onClick={() => setIsMinimized(!isMinimized)}
            >
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <span className="font-medium">Tin nhắn</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            setIsMinimized(!isMinimized)
                        }}
                        className="hover:bg-blue-700 p-1 rounded"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMinimized ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                        </svg>
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onClose()
                        }}
                        className="hover:bg-blue-700 p-1 rounded"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Body */}
            {!isMinimized && (
                <div className="flex-1 overflow-hidden flex flex-col">
                    {isLoading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : conversationId ? (
                        <ChatWindow conversationId={conversationId} />
                    ) : null}
                </div>
            )}
        </div>
    )
}
