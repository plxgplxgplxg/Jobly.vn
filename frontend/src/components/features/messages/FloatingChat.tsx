import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useMessageStore } from '../../../store/messageStore'
import { useAuthStore } from '../../../store/authStore'
import { messageService } from '../../../services/api/message.service'
import { useSocket } from '../../../hooks/useSocket'

interface FloatingChatProps { }

export function FloatingChat({ }: FloatingChatProps) {
    const location = useLocation()
    const { user } = useAuthStore()
    const { conversations, unreadCount, setConversations } = useMessageStore()
    const [isOpen, setIsOpen] = useState(false)
    const [activeChat, setActiveChat] = useState<string | null>(null)
    const [messageInput, setMessageInput] = useState('')

    const isOnMessagesPage = location.pathname.includes('/messages')

    useSocket()

    useEffect(() => {
        if (user && !isOnMessagesPage) {
            loadConversations()
        }
    }, [user, isOnMessagesPage])

    const loadConversations = async () => {
        try {
            const data = await messageService.getConversations()
            setConversations(data)
        } catch (error) {
            console.error('Failed to load conversations:', error)
        }
    }

    const handleToggle = () => {
        setIsOpen(!isOpen)
        if (!isOpen) {
            setActiveChat(null)
        }
    }

    const handleSelectConversation = async (conversationId: string) => {
        setActiveChat(conversationId)

        try {
            const messages = await messageService.getMessages(conversationId)
            const { setMessages, markAsRead } = useMessageStore.getState()
            setMessages(conversationId, messages)
            markAsRead(conversationId)
            await messageService.markAsRead(conversationId)
        } catch (error) {
            console.error('Failed to load messages:', error)
        }
    }

    const handleBack = () => {
        setActiveChat(null)
    }

    const handleSendMessage = async (conversationId: string) => {
        if (!messageInput.trim()) return

        const conversation = conversations.find(c => c.id === conversationId)
        const otherParticipant = conversation?.participants.find(p => p.id !== user?.id)

        if (!otherParticipant) return

        try {
            const sentMessage = await messageService.sendMessage({
                receiverId: otherParticipant.id,
                content: messageInput.trim()
            })

            const { addMessage } = useMessageStore.getState()
            addMessage(conversationId, sentMessage)

            setMessageInput('')
        } catch (error) {
            console.error('Failed to send message:', error)
        }
    }

    if (isOnMessagesPage || !user) {
        return null
    }

    const activeConversation = conversations.find(c => c.id === activeChat)
    const otherParticipant = activeConversation?.participants.find(p => p.id !== user?.id)

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {isOpen && (
                <div className="mb-4 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    {activeChat ? (
                        <div className="flex flex-col h-96">
                            <div className="p-4 bg-gradient-to-r from-primary to-purple-600 text-white flex items-center gap-3">
                                <button onClick={handleBack} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                                    <span className="material-symbols-outlined text-xl">arrow_back</span>
                                </button>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-sm truncate">{otherParticipant?.name}</h3>
                                    <p className="text-xs text-white/80">Đang hoạt động</p>
                                </div>
                                <button onClick={handleToggle} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                                    <span className="material-symbols-outlined text-xl">close</span>
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-800">
                                {(useMessageStore.getState().messages[activeChat] || []).map((message) => (
                                    <div key={message.id} className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl shadow-sm ${message.senderId === user?.id
                                            ? 'bg-gradient-to-r from-primary to-purple-600 text-white rounded-br-md'
                                            : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-bl-md border border-slate-200 dark:border-slate-600'
                                            }`}>
                                            <p className="text-sm leading-relaxed">{message.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault()
                                                handleSendMessage(activeChat)
                                            }
                                        }}
                                        placeholder="Nhập tin nhắn..."
                                        className="flex-1 px-4 py-2.5 text-sm border border-slate-300 dark:border-slate-600 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    />
                                    <button
                                        onClick={() => handleSendMessage(activeChat)}
                                        disabled={!messageInput.trim()}
                                        className="p-2.5 bg-gradient-to-r from-primary to-purple-600 text-white rounded-full hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <span className="material-symbols-outlined text-xl">send</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col h-96">
                            <div className="p-4 bg-gradient-to-r from-primary to-purple-600 text-white flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-2xl">chat_bubble</span>
                                    <h3 className="font-bold text-base">Tin nhắn</h3>
                                </div>
                                <button onClick={handleToggle} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
                                    <span className="material-symbols-outlined text-xl">close</span>
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-800">
                                {conversations.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-3xl text-primary">chat_bubble</span>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                            Chưa có cuộc trò chuyện nào
                                        </p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {conversations.map((conversation) => {
                                            const other = conversation.participants.find(p => p.id !== user?.id)
                                            return (
                                                <button
                                                    key={conversation.id}
                                                    onClick={() => handleSelectConversation(conversation.id)}
                                                    className="w-full p-4 flex items-start gap-3 hover:bg-white dark:hover:bg-slate-700 transition-colors group"
                                                >
                                                    <div className="relative flex-shrink-0">
                                                        {other?.avatarUrl ? (
                                                            <img
                                                                src={other.avatarUrl}
                                                                alt={other.name}
                                                                className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-600 group-hover:ring-primary transition-all"
                                                            />
                                                        ) : (
                                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center ring-2 ring-slate-200 dark:ring-slate-600 group-hover:ring-primary transition-all">
                                                                <span className="text-base font-bold text-white">{other?.name[0]}</span>
                                                            </div>
                                                        )}
                                                        {conversation.unreadCount > 0 && (
                                                            <div className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                                                                <span className="text-xs font-bold text-white">
                                                                    {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0 text-left">
                                                        <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate mb-1">
                                                            {other?.name}
                                                        </h4>
                                                        {conversation.lastMessage && (
                                                            <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                                                                {conversation.lastMessage.content}
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
                    )}
                </div>
            )}

            <button
                onClick={handleToggle}
                className="w-14 h-14 bg-gradient-to-r from-primary to-purple-600 hover:shadow-2xl hover:shadow-primary/40 text-white rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 relative group"
            >
                <span className="material-symbols-outlined text-2xl">
                    {isOpen ? 'close' : 'chat'}
                </span>
                {unreadCount > 0 && !isOpen && (
                    <div className="absolute -top-1 -right-1 min-w-[24px] h-6 px-2 bg-red-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                        <span className="text-xs font-bold text-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    </div>
                )}
                <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
            </button>
        </div>
    )
}
