import { apiClient } from './apiClient'
import type { Application, ApplicationStatus, CV } from '../../types/api.types'

export type { Application, ApplicationStatus, CV }

export interface ApplyJobData {
  jobId: string
  cvId: string
  cvType: 'uploaded' | 'template'
  coverLetter?: string
}

class ApplicationService {
  async applyJob(data: ApplyJobData): Promise<Application> {
    const response = await apiClient.post<Application>('/applications', data)
    return response
  }

  async getMyApplications(params?: { status?: string; page?: number; limit?: number }): Promise<{ items: Application[]; total: number; totalPages: number }> {
    const response = await apiClient.get<any>('/applications/my-applications', { params })
    return response
  }

  async getApplicationsForJob(jobId: string): Promise<Application[]> {
    const response = await apiClient.get<Application[]>(`/applications/job/${jobId}`)
    return response
  }

  async updateApplicationStatus(id: string, status: ApplicationStatus): Promise<Application> {
    const response = await apiClient.patch<Application>(`/applications/${id}/status`, {
      status
    })
    return response
  }

  async getApplicationById(id: string): Promise<Application> {
    const response = await apiClient.get<Application>(`/applications/${id}`)
    return response
  }

  async withdrawApplication(id: string): Promise<void> {
    await apiClient.delete(`/applications/${id}`)
  }
}

export const applicationService = new ApplicationService()
export default applicationService
