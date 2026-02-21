import { apiClient } from './apiClient'

import type { Job, Company, CompanyWithJobs, CompaniesResponse, CompanyJobsResponse } from '../../types/job.types'

export type { Job, Company, CompanyWithJobs, CompaniesResponse, CompanyJobsResponse }

class CompanyService {
  async getCompanies(params?: {
    page?: number
    limit?: number
    search?: string
    industry?: string
  }): Promise<CompaniesResponse> {
    return await apiClient.get<CompaniesResponse>('/companies', { params })
  }

  async getCompanyById(id: string): Promise<Company> {
    return await apiClient.get<Company>(`/companies/${id}`)
  }

  async getCompanyJobs(id: string, params?: {
    page?: number
    limit?: number
  }): Promise<CompanyJobsResponse> {
    return await apiClient.get<CompanyJobsResponse>(`/companies/${id}/jobs`, { params })
  }

  async createCompany(data: {
    name: string
    taxCode: string
    industry: string
    logoUrl?: string
    description?: string
  }): Promise<Company> {
    return await apiClient.post<Company>('/companies', data)
  }

  async updateCompany(id: string, data: Partial<{
    name: string
    taxCode: string
    industry: string
    logoUrl: string
    description: string
  }>): Promise<{ message: string }> {
    return await apiClient.put<{ message: string }>(`/companies/${id}`, data)
  }

  async deleteCompany(id: string): Promise<{ message: string }> {
    return await apiClient.delete<{ message: string }>(`/companies/${id}`)
  }
}

export const companyService = new CompanyService()
export default companyService
