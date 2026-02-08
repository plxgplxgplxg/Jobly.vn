import { io, Socket } from 'socket.io-client'
import { SOCKET_URL } from '../../constants/api'

export interface SocketEventCallback {
  (data: any): void
}

export class SocketService {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private readonly maxReconnectAttempts = 5
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private baseReconnectDelay = 1000

  connect(token: string): void {
    if (this.socket?.connected) {
      console.log('Socket đã kết nối')
      return
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      reconnection: false, // Tự xử lý reconnection với exponential backoff
      transports: ['websocket', 'polling'],
    })

    this.setupEventListeners()
  }

  private setupEventListeners(): void {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id)
      this.reconnectAttempts = 0
      
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer)
        this.reconnectTimer = null
      }
    })

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
      
      if (reason === 'io server disconnect') {
        this.attemptReconnect()
      } else if (reason === 'transport close' || reason === 'transport error') {
        this.attemptReconnect()
      }
    })

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message)
      this.attemptReconnect()
    })
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Đã vượt quá số lần reconnect tối đa')
      return
    }

    if (this.reconnectTimer) {
      return
    }

    const delay = this.calculateBackoffDelay()
    console.log(`Reconnecting sau ${delay}ms (lần thử ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`)

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++
      this.reconnectTimer = null
      
      if (this.socket) {
        this.socket.connect()
      }
    }, delay)
  }

  private calculateBackoffDelay(): number {
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s
    return Math.min(
      this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts),
      30000 // Max 30s
    )
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.socket) {
      this.socket.removeAllListeners()
      this.socket.disconnect()
      this.socket = null
    }

    this.reconnectAttempts = 0
  }

  on(event: string, callback: SocketEventCallback): void {
    if (!this.socket) {
      console.warn('Socket chưa được khởi tạo')
      return
    }

    this.socket.on(event, callback)
  }

  off(event: string, callback?: SocketEventCallback): void {
    if (!this.socket) {
      return
    }

    if (callback) {
      this.socket.off(event, callback)
    } else {
      this.socket.off(event)
    }
  }

  emit(event: string, data?: any): void {
    if (!this.socket?.connected) {
      console.warn('Socket chưa kết nối')
      return
    }

    this.socket.emit(event, data)
  }

  // Messaging methods
  sendMessage(conversationId: string, content: string): void {
    this.emit('message:send', { conversationId, content })
  }

  startTyping(conversationId: string): void {
    this.emit('typing:start', { conversationId })
  }

  stopTyping(conversationId: string): void {
    this.emit('typing:stop', { conversationId })
  }

  joinConversation(conversationId: string): void {
    this.emit('conversation:join', { conversationId })
  }

  leaveConversation(conversationId: string): void {
    this.emit('conversation:leave', { conversationId })
  }

  get isConnected(): boolean {
    return this.socket?.connected ?? false
  }

  get socketId(): string | undefined {
    return this.socket?.id
  }
}

export const socketService = new SocketService()
export default socketService
