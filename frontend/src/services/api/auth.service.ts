import { apiClient } from './apiClient'

import type { User } from '../../types/user.types'

export interface RegisterData {
  email: string
  phone: string
  password: string
  confirmPassword: string
  firstName?: string
  lastName?: string
  companyName?: string
  role: string
}

export interface RegisterResponse {
  token?: string
  user?: User
  refreshToken?: string
  message: string
}

export interface VerifyOTPData {
  phone: string
  otp: string
}

export interface LoginCredentials {
  emailOrPhone: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
}

export interface ResetPasswordData {
  email: string
}

export interface ChangePasswordData {
  oldPassword: string
  newPassword: string
}

export interface SetNewPasswordData {
  phone: string
  otp: string
  newPassword: string
}

class AuthService {
  async register(data: RegisterData): Promise<RegisterResponse> {
    const response = await apiClient.post<RegisterResponse>('/auth/register', data)
    return response
  }

  async verifyOTP(data: VerifyOTPData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/verify-otp', data)
    return response
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      identifier: credentials.emailOrPhone,
      password: credentials.password
    })
    return response
  }

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout')
  }

  async refreshToken(refreshToken: string): Promise<{ token: string }> {
    const response = await apiClient.post<{ token: string }>('/auth/refresh-token', {
      refreshToken
    })
    return response
  }

  async resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/reset-password', data)
    return response
  }

  async setNewPassword(data: SetNewPasswordData): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/set-new-password', data)
    return response
  }

  async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/auth/change-password', data)
    return response
  }

  async getCurrentUser(): Promise<AuthResponse['user']> {
    const response = await apiClient.get<AuthResponse['user']>('/auth/me')
    return response
  }
}

export const authService = new AuthService()
export default authService
