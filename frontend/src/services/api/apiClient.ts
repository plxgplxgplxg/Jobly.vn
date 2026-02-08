import axios, { type AxiosInstance, type AxiosRequestConfig, AxiosError } from 'axios'
import { API_BASE_URL } from '../../constants/api'
import { APP_CONFIG } from '../../constants/config'

// API client với interceptors
class ApiClient {
  private axiosInstance: AxiosInstance

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: APP_CONFIG.API_TIMEOUT_MS,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    // Request interceptor: thêm JWT token vào headers
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TOKEN)
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor: xử lý errors
    this.axiosInstance.interceptors.response.use(
      (response) => response.data,
      async (error: AxiosError) => {
        if (error.response) {
          const status = error.response.status

          if (status === 401) {
            // Token expired, xóa token và redirect đến login
            localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.TOKEN)
            localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN)
            localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER)
            window.location.href = '/auth/login'
          } else if (status === 403) {
            // Forbidden - không có quyền truy cập
            console.error('Forbidden: Bạn không có quyền truy cập')
          } else if (status >= 500) {
            // Server error (5xx)
            console.error('Server error:', error.response.data)
          } else if (status >= 400) {
            // Client error (4xx)
            console.error('Client error:', error.response.data)
          }
        } else if (error.request) {
          // Network error - không nhận được response
          console.error('Network error: Không có kết nối mạng')
        } else {
          // Lỗi khác
          console.error('Error:', error.message)
        }

        return Promise.reject(error)
      }
    )
  }

  // HTTP methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.axiosInstance.get<T, T>(url, config)
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.axiosInstance.post<T, T>(url, data, config)
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.axiosInstance.put<T, T>(url, data, config)
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.axiosInstance.patch<T, T>(url, data, config)
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.axiosInstance.delete<T, T>(url, config)
  }

  // Lấy axios instance để sử dụng trực tiếp nếu cần
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance
  }
}

// Export singleton instance
export const apiClient = new ApiClient()
export default apiClient
