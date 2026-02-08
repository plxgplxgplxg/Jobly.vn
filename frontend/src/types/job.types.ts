import type { Company } from './user.types'

// Job types
export const JobType = {
  FULL_TIME: 'full_time',
  PART_TIME: 'part_time',
  CONTRACT: 'contract',
  INTERNSHIP: 'internship'
} as const

export type JobType = typeof JobType[keyof typeof JobType]

export const JobStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  EXPIRED: 'expired'
} as const

export type JobStatus = typeof JobStatus[keyof typeof JobStatus]

export interface Job {
  id: string
  title: string
  description: string
  requirements: string
  benefits?: string
  salary: string | {
    min: number
    max: number
    currency: string
  }
  location: string
  type?: JobType
  status: JobStatus
  companyId: string
  company: Company
  applicationCount?: number
  viewCount?: number
  createdAt: string
  updatedAt: string
  expiresAt: string
}

export interface SearchQuery {
  keyword?: string
  location?: string
  jobType?: JobType[]
  salaryMin?: number
  salaryMax?: number
  page: number
  limit: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
