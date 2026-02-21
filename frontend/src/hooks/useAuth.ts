import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authService, type LoginCredentials, type RegisterData, type VerifyOTPData } from '../services/api/auth.service'
import { useUIStore } from '../store/uiStore'

export function useAuth() {
  const navigate = useNavigate()
  const { user, token, isAuthenticated, setUser, setToken, logout: clearAuth, setLoading } = useAuthStore()
  const { addNotification } = useUIStore()

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setLoading(true)
      const response = await authService.login(credentials)

      setUser(response.user)
      setToken(response.token)

      // Lưu refresh token
      localStorage.setItem('refreshToken', response.refreshToken)

      addNotification({
        type: 'success',
        message: 'Đăng nhập thành công!'
      })

      // Redirect theo role
      if (response.user.role === 'admin') {
        navigate('/admin/dashboard')
      } else if (response.user.role === 'employer') {
        navigate('/employer/dashboard')
      } else {
        navigate('/candidate/dashboard')
      }

      return response
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || error.response?.data?.error || 'Đăng nhập thất bại'
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [setUser, setToken, setLoading, addNotification, navigate])

  const register = useCallback(async (data: RegisterData) => {
    try {
      setLoading(true)
      const response = await authService.register(data)

      addNotification({
        type: 'success',
        message: response.message || 'Đăng ký thành công!'
      })

      // Nếu có token (candidate auto active), tự động login
      if (response.token && response.user) {
        setUser(response.user)
        setToken(response.token)

        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken)
        }

        // Redirect theo role
        if (response.user.role === 'admin') {
          navigate('/admin/dashboard')
        } else if (response.user.role === 'employer') {
          navigate('/employer/dashboard')
        } else {
          navigate('/candidate/dashboard')
        }
      } else {
        // Employer pending - redirect về login
        navigate('/auth/login')
      }

      return response
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || error.response?.data?.error || 'Đăng ký thất bại'
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [setUser, setToken, setLoading, addNotification, navigate])

  const verifyOTP = useCallback(async (data: VerifyOTPData) => {
    try {
      setLoading(true)
      const response = await authService.verifyOTP(data)

      setUser(response.user)
      setToken(response.token)

      localStorage.setItem('refreshToken', response.refreshToken)

      addNotification({
        type: 'success',
        message: 'Xác thực OTP thành công!'
      })

      // Redirect theo role
      if (response.user.role === 'admin') {
        navigate('/admin/dashboard')
      } else if (response.user.role === 'employer') {
        navigate('/employer/dashboard')
      } else {
        navigate('/candidate/dashboard')
      }

      return response
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || error.response?.data?.error || 'Xác thực OTP thất bại'
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [setUser, setToken, setLoading, addNotification, navigate])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      clearAuth()
      localStorage.removeItem('refreshToken')

      addNotification({
        type: 'info',
        message: 'Đã đăng xuất'
      })

      navigate('/auth/login')
    }
  }, [clearAuth, addNotification, navigate])

  const resetPassword = useCallback(async (email: string) => {
    try {
      setLoading(true)
      const response = await authService.resetPassword({ email })

      addNotification({
        type: 'success',
        message: response.message || 'Đã gửi mã OTP đến email/số điện thoại của bạn'
      })

      return response
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || error.response?.data?.error || 'Gửi mã OTP thất bại'
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [setLoading, addNotification])

  const changePassword = useCallback(async (oldPassword: string, newPassword: string) => {
    try {
      setLoading(true)
      const response = await authService.changePassword({ oldPassword, newPassword })

      addNotification({
        type: 'success',
        message: response.message || 'Đổi mật khẩu thành công'
      })

      return response
    } catch (error: any) {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || error.response?.data?.error || 'Đổi mật khẩu thất bại'
      })
      throw error
    } finally {
      setLoading(false)
    }
  }, [setLoading, addNotification])

  const checkAuth = useCallback(async () => {
    if (!token) {
      return false
    }

    try {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
      return true
    } catch (error) {
      clearAuth()
      localStorage.removeItem('refreshToken')
      return false
    }
  }, [token, setUser, clearAuth])

  return {
    user,
    token,
    isAuthenticated,
    login,
    register,
    verifyOTP,
    logout,
    resetPassword,
    changePassword,
    checkAuth
  }
}
