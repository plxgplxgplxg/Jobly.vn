import { apiClient } from './apiClient'

export interface Company {
  id: string
  name: string
  taxCode: string
  industry: string
  logoUrl?: string
  description?: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface CompanyWithJobs extends Company {
  jobs: Job[]
}

export interface Job {
  id: string
  title: string
  description: string
  requirements: string
  benefits?: string
  location: string
  salary?: string
  deadline: string
  status: string
  companyId: string
  createdAt: string
}

export interface CompaniesResponse {
  companies: Company[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface CompanyJobsResponse {
  company: Company
  jobs: Job[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

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
