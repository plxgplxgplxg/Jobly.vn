import { apiClient } from './apiClient'
import type { Job, SearchQuery } from '../../types/job.types'

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

  async getMyJobs(): Promise<Job[]> {
    const response = await apiClient.get<any>('/jobs/my-jobs')
    return (response.items || []).map((job: any) => ({
      ...job,
      expiresAt: job.deadline
    }))
  }

  async createJob(data: any): Promise<Job> {
    const response = await apiClient.post<any>('/jobs', data)
    return {
      ...response,
      expiresAt: response.deadline
    }
  }
}

export const jobService = new JobService()
export default jobService
