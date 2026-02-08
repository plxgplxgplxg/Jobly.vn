import { UserProfileDTO } from './user.types';
import { JobDTO } from './job.types';
import { PaginatedResult } from './job.types';

export interface UserFilterDTO {
  role?: string;
  status?: string;
  keyword?: string;
  page: number;
  limit: number;
}

export interface CreateTemplateDTO {
  name: string;
  category: string;
  structureJSON: TemplateStructure;
  htmlTemplate: string;
  cssStyles: string;
  previewImageUrl?: string;
}

export interface UpdateTemplateDTO {
  name?: string;
  category?: string;
  structureJSON?: TemplateStructure;
  htmlTemplate?: string;
  cssStyles?: string;
  previewImageUrl?: string;
}

export interface TemplateStructure {
  sections: Section[];
  styles?: StyleConfig;
}

export interface Section {
  id: string;
  type: 'personal' | 'experience' | 'education' | 'skills' | 'custom';
  label: string;
  fields: Field[];
  required: boolean;
}

export interface Field {
  name: string;
  type: 'text' | 'textarea' | 'date' | 'list' | 'rich-text';
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: ValidationRule;
}

export interface ValidationRule {
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

export interface StyleConfig {
  fontFamily?: string;
  fontSize?: string;
  colors?: {
    primary?: string;
    secondary?: string;
    text?: string;
  };
}

export interface CVTemplateDTO {
  id: string;
  name: string;
  category: string;
  structureJSON: TemplateStructure;
  htmlTemplate: string;
  cssStyles: string;
  previewImageUrl?: string;
  createdAt: Date;
}

export interface TemplateFilterDTO {
  category?: string;
  page: number;
  limit: number;
}

export interface StatisticsDTO {
  totalUsers: number;
  totalCandidates: number;
  totalEmployers: number;
  totalJobs: number;
  totalApplications: number;
  newUsersChart: ChartData[];
  jobsChart: ChartData[];
  applicationsChart: ChartData[];
}

export interface ChartData {
  date: string;
  value: number;
}

export type ReportType = 'users' | 'jobs' | 'applications';

export interface AdminLogDTO {
  id: string;
  adminId: string;
  action: string;
  targetType?: string;
  targetId?: string;
  details?: object;
  createdAt: Date;
}
