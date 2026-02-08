import { apiClient } from './apiClient'

import type { UserProfile, CV } from '../../types/user.types'

class UserService {
  async getProfile(): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>('/users/profile')
    return response
  }

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    const response = await apiClient.put<UserProfile>('/users/profile', data)
    return response
  }

  async completeProfile(data: any): Promise<UserProfile> {
    const response = await apiClient.put<UserProfile>('/users/profile/complete', data)
    return response
  }

  async getDashboardStats(): Promise<{ applications: number; savedJobs: number; cvs: number; messages: number }> {
    const response = await apiClient.get<any>('/users/dashboard/stats')
    return response
  }

  async uploadCV(file: File): Promise<CV> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post<CV>('/users/cv/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response
  }

  async deleteCV(id: string): Promise<void> {
    await apiClient.delete(`/users/cv/${id}`)
  }

  async getMyCVs(): Promise<CV[]> {
    const response = await apiClient.get<CV[]>('/users/cv')
    return response
  }

  async setDefaultCV(id: string): Promise<CV> {
    const response = await apiClient.patch<CV>(`/users/cv/${id}/default`)
    return response
  }

  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData()
    formData.append('avatar', file)

    const response = await apiClient.post<{ avatarUrl: string }>('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response
  }

  async createCompany(data: any): Promise<any> {
    const response = await apiClient.post('/users/company', data)
    return response
  }

  async updateCompany(companyId: string, data: any): Promise<any> {
    const response = await apiClient.put(`/users/company/${companyId}`, data)
    return response
  }
}

export const userService = new UserService()
export default userService
