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
  totalCandidates: number
  totalEmployers: number
  totalJobs: number
  totalApplications: number
  newUsersChart: Array<{
    date: string
    value: number
  }>
  jobsChart: Array<{
    date: string
    value: number
  }>
  applicationsChart: Array<{
    date: string
    value: number
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

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

class AdminService {
  async getUsers(params?: { page?: number; limit?: number; role?: string; status?: string; keyword?: string }): Promise<PaginatedResponse<AdminUser>> {
    const response = await apiClient.get<PaginatedResponse<AdminUser>>('/admin/users', { params })
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

  async rejectUser(id: string, reason: string): Promise<AdminUser> {
    const response = await apiClient.post<AdminUser>(`/admin/users/${id}/reject`, { reason })
    return response
  }

  async deleteUser(id: string): Promise<void> {
    await apiClient.delete(`/admin/users/${id}`)
  }

  async getPendingJobs(page = 1, limit = 20): Promise<PaginatedResponse<Job>> {
    const response = await apiClient.get<PaginatedResponse<Job>>(
      `/admin/jobs/pending?page=${page}&limit=${limit}`
    )
    return response
  }

  async approveJob(id: string): Promise<Job> {
    const response = await apiClient.post<Job>(`/admin/jobs/${id}/approve`)
    return response
  }

  async rejectJob(id: string, reason: string): Promise<Job> {
    const response = await apiClient.post<Job>(`/admin/jobs/${id}/reject`, { reason })
    return response
  }

  async getTemplates(params?: { page?: number; limit?: number; category?: string }): Promise<PaginatedResponse<CVTemplate>> {
    const response = await apiClient.get<PaginatedResponse<CVTemplate>>('/admin/cv-templates', { params })
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
    if (startDate) params.append('dateFrom', startDate)
    if (endDate) params.append('dateTo', endDate)

    const response = await apiClient.get<AdminStats>(
      `/admin/statistics?${params.toString()}`
    )
    return response
  }

  async sendAlert(data: SendAlertData): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/admin/alerts', data)
    return response
  }

  async searchUsers(query: string): Promise<AdminUser[]> {
    const response = await apiClient.get<PaginatedResponse<AdminUser>>(`/admin/users?keyword=${query}`)
    return response.items
  }
}

export const adminService = new AdminService()
export default adminService
