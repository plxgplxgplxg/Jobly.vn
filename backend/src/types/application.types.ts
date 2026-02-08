import { ApplicationStatus, CVType } from '../models/Application';
import { JobDTO } from './job.types';
import { UserProfileDTO } from './user.types';

export interface CreateApplicationDTO {
  jobId: string;
  cvId: string;
  cvType: CVType;
  coverLetter?: string;
}

export interface UpdateApplicationDTO {
  cvId?: string;
  cvType?: CVType;
  coverLetter?: string;
}

export interface StatusHistoryItem {
  status: ApplicationStatus;
  changedAt: Date;
  changedBy?: string;
}

export interface ApplicationDTO {
  id: string;
  candidateId: string;
  candidate?: UserProfileDTO;
  jobId: string;
  job?: JobDTO;
  cvId: string;
  cvType: CVType;
  cvName: string;
  cvUrl: string;
  coverLetter?: string;
  status: ApplicationStatus;
  createdAt: Date;
  updatedAt: Date;
  statusHistory?: StatusHistoryItem[];
}

export interface ApplicationFilterDTO {
  status?: ApplicationStatus;
  dateFrom?: Date;
  dateTo?: Date;
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
