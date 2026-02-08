import { describe, it, expect, beforeEach, vi } from 'vitest'
import { APP_CONFIG } from '../../constants/config'

// Mock axios trước khi import apiClient
vi.mock('axios', () => {
  const mockAxiosInstance = {
    interceptors: {
      request: {
        use: vi.fn(),
      },
      response: {
        use: vi.fn(),
      },
    },
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  }

  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
    },
  }
})

describe('ApiClient', () => {
  let mockAxiosInstance: any

  beforeEach(async () => {
    // Reset module để tạo instance mới
    vi.resetModules()
    localStorage.clear()
    
    // Import lại để lấy mock instance
    const axiosModule = await import('axios')
    mockAxiosInstance = (axiosModule.default.create as any)()
    
    vi.clearAllMocks()
  })

  describe('Request Interceptor', () => {
    it('should add JWT token to headers when token exists', async () => {
      const token = 'test-token-123'
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.TOKEN, token)

      // Import apiClient sau khi setup
      await import('./apiClient')

      const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0]
      const config = { headers: {} } as any

      const result = requestInterceptor(config)

      expect(result.headers.Authorization).toBe(`Bearer ${token}`)
    })

    it('should not add Authorization header when token does not exist', async () => {
      // Import apiClient sau khi setup
      await import('./apiClient')

      const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0]
      const config = { headers: {} } as any

      const result = requestInterceptor(config)

      expect(result.headers.Authorization).toBeUndefined()
    })
  })

  describe('Response Interceptor - Error Handling', () => {
    let responseErrorHandler: any

    beforeEach(async () => {
      // Import apiClient sau khi setup
      await import('./apiClient')
      
      responseErrorHandler = mockAxiosInstance.interceptors.response.use.mock.calls[0][1]
      delete (window as any).location
      ;(window as any).location = { href: '' }
    })

    it('should handle 401 error and redirect to login', async () => {
      const token = 'expired-token'
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.TOKEN, token)
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN, 'refresh-token')
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.USER, JSON.stringify({ id: '1' }))

      const error = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
      }

      await expect(responseErrorHandler(error)).rejects.toEqual(error)

      expect(localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TOKEN)).toBeNull()
      expect(localStorage.getItem(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN)).toBeNull()
      expect(localStorage.getItem(APP_CONFIG.STORAGE_KEYS.USER)).toBeNull()
      expect(window.location.href).toBe('/auth/login')
    })

    it('should handle 403 error', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const error = {
        response: {
          status: 403,
          data: { message: 'Forbidden' },
        },
      }

      await expect(responseErrorHandler(error)).rejects.toEqual(error)

      expect(consoleErrorSpy).toHaveBeenCalledWith('Forbidden: Bạn không có quyền truy cập')
      consoleErrorSpy.mockRestore()
    })

    it('should handle 4xx client errors', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const error = {
        response: {
          status: 400,
          data: { message: 'Bad Request' },
        },
      }

      await expect(responseErrorHandler(error)).rejects.toEqual(error)

      expect(consoleErrorSpy).toHaveBeenCalledWith('Client error:', error.response.data)
      consoleErrorSpy.mockRestore()
    })

    it('should handle 5xx server errors', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const error = {
        response: {
          status: 500,
          data: { message: 'Internal Server Error' },
        },
      }

      await expect(responseErrorHandler(error)).rejects.toEqual(error)

      expect(consoleErrorSpy).toHaveBeenCalledWith('Server error:', error.response.data)
      consoleErrorSpy.mockRestore()
    })

    it('should handle network errors', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const error = {
        request: {},
        message: 'Network Error',
      }

      await expect(responseErrorHandler(error)).rejects.toEqual(error)

      expect(consoleErrorSpy).toHaveBeenCalledWith('Network error: Không có kết nối mạng')
      consoleErrorSpy.mockRestore()
    })
  })

  describe('HTTP Methods', () => {
    it('should call axios.get with correct parameters', async () => {
      const mockData = { id: 1, name: 'Test' }
      mockAxiosInstance.get.mockResolvedValue(mockData)

      const { apiClient } = await import('./apiClient')
      const result = await apiClient.get('/test')

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test', undefined)
      expect(result).toEqual(mockData)
    })

    it('should call axios.post with correct parameters', async () => {
      const mockData = { id: 1 }
      const postData = { name: 'Test' }
      mockAxiosInstance.post.mockResolvedValue(mockData)

      const { apiClient } = await import('./apiClient')
      const result = await apiClient.post('/test', postData)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/test', postData, undefined)
      expect(result).toEqual(mockData)
    })

    it('should call axios.put with correct parameters', async () => {
      const mockData = { id: 1 }
      const putData = { name: 'Updated' }
      mockAxiosInstance.put.mockResolvedValue(mockData)

      const { apiClient } = await import('./apiClient')
      const result = await apiClient.put('/test/1', putData)

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/test/1', putData, undefined)
      expect(result).toEqual(mockData)
    })

    it('should call axios.patch with correct parameters', async () => {
      const mockData = { id: 1 }
      const patchData = { name: 'Patched' }
      mockAxiosInstance.patch.mockResolvedValue(mockData)

      const { apiClient } = await import('./apiClient')
      const result = await apiClient.patch('/test/1', patchData)

      expect(mockAxiosInstance.patch).toHaveBeenCalledWith('/test/1', patchData, undefined)
      expect(result).toEqual(mockData)
    })

    it('should call axios.delete with correct parameters', async () => {
      mockAxiosInstance.delete.mockResolvedValue({ success: true })

      const { apiClient } = await import('./apiClient')
      const result = await apiClient.delete('/test/1')

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/test/1', undefined)
      expect(result).toEqual({ success: true })
    })
  })
})
