import { JobStatus } from '../models/Job';
import { CompanyDTO } from './user.types';

export interface CreateJobDTO {
  title: string;
  description: string;
  requirements: string;
  salary: string;
  location: string;
  deadline: Date;
  companyId: string;
}

export interface UpdateJobDTO {
  title?: string;
  description?: string;
  requirements?: string;
  salary?: string;
  location?: string;
  deadline?: Date;
}

export interface JobDTO {
  id: string;
  title: string;
  description: string;
  requirements: string;
  salary: string;
  location: string;
  deadline: Date;
  status: JobStatus;
  vipFlag: boolean;
  vipExpiresAt?: Date;
  companyId: string;
  company?: CompanyDTO;
  applicationCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SearchJobDTO {
  keyword?: string;
  industry?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  vipOnly?: boolean;
  page: number;
  limit: number;
}

export interface JobFilterDTO {
  companyId?: string;
  status?: JobStatus;
  vipFlag?: boolean;
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
