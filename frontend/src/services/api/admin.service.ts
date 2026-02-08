import { apiClient } from './apiClient'
import type { Job } from '../../types/job.types'
import type { CVTemplate } from './cvTemplate.service'

export interface AdminUser {
  id: string
  email: string
  phone: string
  role: 'candidate' | 'employer' | 'admin'
  name: string
  status: 'pending' | 'active' | 'locked' | 'deleted'
  createdAt: string
  updatedAt: string
}

export interface AdminStats {
  totalUsers: number
  totalJobs: number
  totalApplications: number
  revenue: number
  usersOverTime: Array<{
    date: string
    count: number
  }>
  jobsOverTime: Array<{
    date: string
    count: number
  }>
}

export interface SendAlertData {
  userIds?: string[]
  message: string
  type: 'info' | 'warning' | 'error'
}

export interface UploadTemplateData {
  name: string
  description: string
  htmlTemplate: string
  cssTemplate: string
  thumbnail?: string
}

class AdminService {
  async getUsers(page = 1, limit = 20): Promise<{ data: AdminUser[]; total: number }> {
    const response = await apiClient.get<{ data: AdminUser[]; total: number }>(
      `/admin/users?page=${page}&limit=${limit}`
    )
    return response
  }

  async lockUser(id: string, reason: string): Promise<AdminUser> {
    const response = await apiClient.post<AdminUser>(`/admin/users/${id}/lock`, {
      reason
    })
    return response
  }

  async unlockUser(id: string): Promise<AdminUser> {
    const response = await apiClient.post<AdminUser>(`/admin/users/${id}/unlock`)
    return response
  }

  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/admin/users/${id}`)
  }

  async getPendingJobs(page = 1, limit = 20): Promise<{ data: Job[]; total: number }> {
    const response = await apiClient.get<{ data: Job[]; total: number }>(
      `/admin/jobs/pending?page=${page}&limit=${limit}`
    )
    return response
  }

  async approveJob(id: string, status: 'approved' | 'rejected'): Promise<Job> {
    const response = await apiClient.patch<Job>(`/admin/jobs/${id}/approve`, {
      status
    })
    return response
  }

  async getTemplates(): Promise<CVTemplate[]> {
    const response = await apiClient.get<CVTemplate[]>('/admin/cv-templates')
    return response
  }

  async uploadTemplate(data: UploadTemplateData): Promise<CVTemplate> {
    const response = await apiClient.post<CVTemplate>('/admin/cv-templates', data)
    return response
  }

  async deleteTemplate(id: string): Promise<void> {
    await apiClient.delete(`/admin/cv-templates/${id}`)
  }

  async getStats(startDate?: string, endDate?: string): Promise<AdminStats> {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)

    const response = await apiClient.get<AdminStats>(
      `/admin/stats?${params.toString()}`
    )
    return response
  }

  async sendAlert(data: SendAlertData): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/admin/alerts', data)
    return response
  }

  async searchUsers(query: string): Promise<AdminUser[]> {
    const response = await apiClient.get<AdminUser[]>(`/admin/users/search?q=${query}`)
    return response
  }
}

export const adminService = new AdminService()
export default adminService
