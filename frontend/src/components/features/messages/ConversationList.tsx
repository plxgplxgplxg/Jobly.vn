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
    <div className="h-full flex flex-col bg-white dark:bg-slate-900">
      <div className="p-6 bg-gradient-to-r from-primary to-purple-600">
        <div className="flex items-center gap-3 text-white">
          <span className="material-symbols-outlined text-3xl">chat_bubble</span>
          <h2 className="text-2xl font-bold">Tin nhắn</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-800">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-20 h-20 mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-5xl text-primary">chat_bubble</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              Chưa có cuộc trò chuyện nào
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {conversations.map((conversation) => {
              const otherParticipant = getOtherParticipant(conversation)
              const isActive = conversation.id === activeConversationId

              return (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.id)}
                  className={`w-full p-4 flex items-start gap-3 transition-all group ${isActive
                      ? 'bg-primary/10 border-l-4 border-primary'
                      : 'hover:bg-white dark:hover:bg-slate-700 border-l-4 border-transparent'
                    }`}
                >
                  <div className="relative flex-shrink-0">
                    {otherParticipant?.avatarUrl ? (
                      <img
                        src={otherParticipant.avatarUrl}
                        alt={otherParticipant.name}
                        className={`w-14 h-14 rounded-full object-cover ring-2 transition-all ${isActive
                            ? 'ring-primary'
                            : 'ring-slate-200 dark:ring-slate-600 group-hover:ring-primary'
                          }`}
                      />
                    ) : (
                      <div className={`w-14 h-14 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center ring-2 transition-all ${isActive
                          ? 'ring-primary'
                          : 'ring-slate-200 dark:ring-slate-600 group-hover:ring-primary'
                        }`}>
                        <span className="text-xl font-bold text-white">
                          {otherParticipant?.name[0]}
                        </span>
                      </div>
                    )}
                    {conversation.unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 min-w-[22px] h-5.5 px-1.5 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-xs font-bold text-white">
                          {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-bold text-base truncate ${isActive ? 'text-primary' : 'text-slate-900 dark:text-white'
                        }`}>
                        {otherParticipant?.name}
                      </h3>
                      {conversation.lastMessage && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 ml-2 flex-shrink-0">
                          {formatTime(conversation.lastMessage.sentAt)}
                        </span>
                      )}
                    </div>
                    {conversation.lastMessage && (
                      <p className={`text-sm truncate ${conversation.unreadCount > 0
                          ? 'text-slate-900 dark:text-white font-semibold'
                          : 'text-slate-600 dark:text-slate-400'
                        }`}>
                        {truncateMessage(conversation.lastMessage.content)}
                      </p>
                    )}
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
