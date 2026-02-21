import { apiClient } from './apiClient'
import type { Job, SearchQuery } from '../../types/job.types'
export type { Job, SearchQuery }

export interface JobSearchResponse {
  jobs: Job[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

class JobService {
  async searchJobs(params?: Partial<SearchQuery>): Promise<JobSearchResponse> {
    const response = await apiClient.get<any>('/jobs/search', { params })
    const jobs = (response.items || []).map((job: any) => ({
      ...job,
      expiresAt: job.deadline, // Map backend deadline to frontend expiresAt
    }))

    return {
      jobs,
      pagination: {
        total: response.total || 0,
        page: response.page || 1,
        limit: response.limit || 10,
        totalPages: response.totalPages || 0
      }
    }
  }

  async getJobById(id: string): Promise<Job> {
    const job = await apiClient.get<any>(`/jobs/${id}`)
    return {
      ...job,
      expiresAt: job.deadline
    }
  }

  async applyJob(jobId: string, cvId: string): Promise<{ message: string }> {
    return await apiClient.post<{ message: string }>(`/jobs/${jobId}/apply`, { cvId })
  }

  async getMyJobs(params?: { page?: number; limit?: number }): Promise<{ items: Job[]; total: number; page: number; limit: number; totalPages: number }> {
    const response = await apiClient.get<any>('/jobs/my-jobs', { params })
    return {
      items: (response.items || []).map((job: any) => ({
        ...job,
        expiresAt: job.deadline
      })),
      total: response.total || 0,
      page: response.page || 1,
      limit: response.limit || 10,
      totalPages: response.totalPages || 0
    }
  }

  async createJob(data: any): Promise<Job> {
    const response = await apiClient.post<any>('/jobs', data)
    return {
      ...response,
      expiresAt: response.deadline
    }
  }

  async updateJob(id: string, data: any): Promise<Job> {
    const response = await apiClient.put<any>(`/jobs/${id}`, data)
    return {
      ...response,
      expiresAt: response.deadline
    }
  }

  async deleteJob(id: string): Promise<void> {
    await apiClient.delete(`/jobs/${id}`)
  }
}

export const jobService = new JobService()
export default jobService
