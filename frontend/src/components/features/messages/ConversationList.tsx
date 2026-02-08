import { useMessageStore, type Conversation } from '../../../store/messageStore'
import { useAuthStore } from '../../../store/authStore'

interface ConversationListProps {
  onSelectConversation: (conversationId: string) => void
}

export function ConversationList({ onSelectConversation }: ConversationListProps) {
  const { conversations, activeConversationId } = useMessageStore()
  const { user } = useAuthStore()

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p.id !== user?.id)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 48) {
      return 'Hôm qua'
    } else if (diffInHours < 168) {
      return date.toLocaleDateString('vi-VN', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
    }
  }

  const truncateMessage = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Tin nhắn
        </h2>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-gray-600 dark:text-gray-400">
              Chưa có cuộc trò chuyện nào
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {conversations.map((conversation) => {
              const otherParticipant = getOtherParticipant(conversation)
              const isActive = conversation.id === activeConversationId

              return (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.id)}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${isActive ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {otherParticipant?.avatarUrl ? (
                      <img
                        src={otherParticipant.avatarUrl}
                        alt={otherParticipant.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <span className="text-lg font-semibold text-blue-600 dark:text-blue-300">
                          {otherParticipant?.name[0]}
                        </span>
                      </div>
                    )}

                    {/* Unread badge */}
                    {conversation.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                          {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <h3 className={`font-semibold truncate ${conversation.unreadCount > 0
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-700 dark:text-gray-300'
                        }`}>
                        {otherParticipant?.name}
                      </h3>
                      {conversation.lastMessage && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                          {formatTime(conversation.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>

                    {conversation.lastMessage && (
                      <p className={`text-sm truncate ${conversation.unreadCount > 0
                          ? 'text-gray-900 dark:text-white font-medium'
                          : 'text-gray-600 dark:text-gray-400'
                        }`}>
                        {conversation.lastMessage.senderId === user?.id && 'Bạn: '}
                        {truncateMessage(conversation.lastMessage.content)}
                      </p>
                    )}

                    {/* Role badge */}
                    <div className="mt-1">
                      <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                        {otherParticipant?.role === 'employer' ? 'Nhà tuyển dụng' : 'Ứng viên'}
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
