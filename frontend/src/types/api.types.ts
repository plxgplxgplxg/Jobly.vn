import type { User } from './user.types'
import type { Job } from './job.types'

// API response types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: any
  }
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
}

// Form types
export interface LoginCredentials {
  emailOrPhone: string
  password: string
}

export interface RegisterData {
  email: string
  phone: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  role: 'candidate' | 'employer'
}

// Application types
export type ApplicationStatus = 'pending' | 'reviewed' | 'accepted' | 'rejected'

export interface CV {
  id: string
  fileName: string
  fileUrl: string
  createdAt: string
}

export interface Application {
  id: string
  jobId: string
  job: Job
  candidateId: string
  candidate: {
    id: string
    name: string
    email: string
    phone: string
    avatarUrl?: string
  }
  cvId: string
  cvType: 'uploaded' | 'template'
  cvName: string
  cvUrl: string
  coverLetter?: string
  status: ApplicationStatus
  createdAt: string
  updatedAt: string
}
