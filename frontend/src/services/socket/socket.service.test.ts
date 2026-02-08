import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { io, Socket } from 'socket.io-client'
import { SocketService } from './socket.service'

vi.mock('socket.io-client')

describe('SocketService', () => {
  let socketService: SocketService
  let mockSocket: Partial<Socket>
  let eventHandlers: Record<string, Function>

  beforeEach(() => {
    eventHandlers = {}
    
    mockSocket = {
      id: 'test-socket-id',
      connected: false,
      on: vi.fn((event: string, handler: Function) => {
        eventHandlers[event] = handler
        return mockSocket as Socket
      }),
      off: vi.fn(),
      emit: vi.fn(),
      connect: vi.fn(() => {
        mockSocket.connected = true
        if (eventHandlers['connect']) {
          eventHandlers['connect']()
        }
        return mockSocket as Socket
      }),
      disconnect: vi.fn(() => {
        mockSocket.connected = false
        return mockSocket as Socket
      }),
      removeAllListeners: vi.fn(),
    }

    vi.mocked(io).mockReturnValue(mockSocket as Socket)
    
    socketService = new SocketService()
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.clearAllTimers()
  })

  describe('connect', () => {
    it('nên tạo socket connection với JWT token', () => {
      const token = 'test-token'
      
      socketService.connect(token)
      
      expect(io).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          auth: { token },
          reconnection: false,
        })
      )
    })

    it('nên setup event listeners khi connect', () => {
      socketService.connect('test-token')
      
      expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function))
      expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function))
      expect(mockSocket.on).toHaveBeenCalledWith('connect_error', expect.any(Function))
    })

    it('không nên tạo connection mới nếu đã connected', () => {
      mockSocket.connected = true
      socketService.connect('token-1')
      
      vi.clearAllMocks()
      
      socketService.connect('token-2')
      
      expect(io).not.toHaveBeenCalled()
    })
  })

  describe('disconnect', () => {
    it('nên ngắt kết nối và cleanup', () => {
      socketService.connect('test-token')
      
      socketService.disconnect()
      
      expect(mockSocket.removeAllListeners).toHaveBeenCalled()
      expect(mockSocket.disconnect).toHaveBeenCalled()
    })

    it('nên clear reconnect timer khi disconnect', () => {
      vi.useFakeTimers()
      
      socketService.connect('test-token')
      
      // Trigger disconnect để bắt đầu reconnect
      if (eventHandlers['disconnect']) {
        eventHandlers['disconnect']('transport close')
      }
      
      socketService.disconnect()
      
      // Verify timer đã bị clear
      vi.advanceTimersByTime(5000)
      expect(mockSocket.connect).not.toHaveBeenCalled()
      
      vi.useRealTimers()
    })
  })

  describe('emit', () => {
    it('nên emit event khi socket connected', () => {
      mockSocket.connected = true
      socketService.connect('test-token')
      
      socketService.emit('test:event', { data: 'test' })
      
      expect(mockSocket.emit).toHaveBeenCalledWith('test:event', { data: 'test' })
    })

    it('không nên emit khi socket chưa connected', () => {
      mockSocket.connected = false
      socketService.connect('test-token')
      
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      socketService.emit('test:event', { data: 'test' })
      
      expect(mockSocket.emit).not.toHaveBeenCalled()
      expect(consoleSpy).toHaveBeenCalledWith('Socket chưa kết nối')
      
      consoleSpy.mockRestore()
    })
  })

  describe('on/off', () => {
    it('nên register event listener', () => {
      socketService.connect('test-token')
      const callback = vi.fn()
      
      socketService.on('message:receive', callback)
      
      expect(mockSocket.on).toHaveBeenCalledWith('message:receive', callback)
    })

    it('nên remove event listener', () => {
      socketService.connect('test-token')
      const callback = vi.fn()
      
      socketService.off('message:receive', callback)
      
      expect(mockSocket.off).toHaveBeenCalledWith('message:receive', callback)
    })
  })

  describe('messaging methods', () => {
    beforeEach(() => {
      mockSocket.connected = true
      socketService.connect('test-token')
    })

    it('sendMessage nên emit message:send event', () => {
      socketService.sendMessage('conv-123', 'Hello')
      
      expect(mockSocket.emit).toHaveBeenCalledWith('message:send', {
        conversationId: 'conv-123',
        content: 'Hello',
      })
    })

    it('startTyping nên emit typing:start event', () => {
      socketService.startTyping('conv-123')
      
      expect(mockSocket.emit).toHaveBeenCalledWith('typing:start', {
        conversationId: 'conv-123',
      })
    })

    it('stopTyping nên emit typing:stop event', () => {
      socketService.stopTyping('conv-123')
      
      expect(mockSocket.emit).toHaveBeenCalledWith('typing:stop', {
        conversationId: 'conv-123',
      })
    })

    it('joinConversation nên emit conversation:join event', () => {
      socketService.joinConversation('conv-123')
      
      expect(mockSocket.emit).toHaveBeenCalledWith('conversation:join', {
        conversationId: 'conv-123',
      })
    })

    it('leaveConversation nên emit conversation:leave event', () => {
      socketService.leaveConversation('conv-123')
      
      expect(mockSocket.emit).toHaveBeenCalledWith('conversation:leave', {
        conversationId: 'conv-123',
      })
    })
  })

  describe('reconnection với exponential backoff', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('nên reconnect với exponential backoff khi disconnect', () => {
      // Tạo mock không tự động trigger connect event
      mockSocket.connect = vi.fn(() => {
        mockSocket.connected = true
        return mockSocket as Socket
      })
      
      socketService.connect('test-token')
      
      // Trigger disconnect
      if (eventHandlers['disconnect']) {
        eventHandlers['disconnect']('transport close')
      }
      
      // Lần thử 1: 1000ms (2^0 * 1000)
      vi.advanceTimersByTime(999)
      expect(mockSocket.connect).not.toHaveBeenCalled()
      
      vi.advanceTimersByTime(1)
      expect(mockSocket.connect).toHaveBeenCalledTimes(1)
      
      // Trigger disconnect lại (không trigger connect event để giữ reconnectAttempts)
      if (eventHandlers['disconnect']) {
        eventHandlers['disconnect']('transport close')
      }
      
      // Lần thử 2: 2000ms (2^1 * 1000)
      vi.advanceTimersByTime(1999)
      expect(mockSocket.connect).toHaveBeenCalledTimes(1)
      
      vi.advanceTimersByTime(1)
      expect(mockSocket.connect).toHaveBeenCalledTimes(2)
    })

    it('nên dừng reconnect sau max attempts', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      // Mock connect không trigger event
      mockSocket.connect = vi.fn(() => {
        mockSocket.connected = true
        return mockSocket as Socket
      })
      
      socketService.connect('test-token')
      
      // Trigger 5 lần disconnect và reconnect
      for (let i = 0; i < 5; i++) {
        if (eventHandlers['disconnect']) {
          eventHandlers['disconnect']('transport close')
        }
        // Advance timer để trigger reconnect
        vi.advanceTimersByTime(Math.pow(2, i) * 1000)
      }
      
      // Lần thứ 6 không nên reconnect vì đã đạt max
      if (eventHandlers['disconnect']) {
        eventHandlers['disconnect']('transport close')
      }
      
      expect(consoleErrorSpy).toHaveBeenCalledWith('Đã vượt quá số lần reconnect tối đa')
      
      consoleErrorSpy.mockRestore()
    })

    it('nên reset reconnect attempts khi connect thành công', () => {
      socketService.connect('test-token')
      
      // Trigger disconnect và reconnect
      if (eventHandlers['disconnect']) {
        eventHandlers['disconnect']('transport close')
      }
      
      vi.advanceTimersByTime(1000)
      
      // Simulate successful connect
      if (eventHandlers['connect']) {
        eventHandlers['connect']()
      }
      
      // Trigger disconnect lại
      if (eventHandlers['disconnect']) {
        eventHandlers['disconnect']('transport close')
      }
      
      // Nên bắt đầu lại từ 1000ms thay vì 2000ms
      vi.advanceTimersByTime(999)
      expect(mockSocket.connect).toHaveBeenCalledTimes(1)
      
      vi.advanceTimersByTime(1)
      expect(mockSocket.connect).toHaveBeenCalledTimes(2)
    })
  })

  describe('getters', () => {
    it('isConnected nên trả về connection status', () => {
      mockSocket.connected = false
      socketService.connect('test-token')
      expect(socketService.isConnected).toBe(false)
      
      mockSocket.connected = true
      expect(socketService.isConnected).toBe(true)
    })

    it('socketId nên trả về socket id', () => {
      socketService.connect('test-token')
      expect(socketService.socketId).toBe('test-socket-id')
    })
  })
})
