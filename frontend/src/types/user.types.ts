// User types
export const UserRole = {
  CANDIDATE: 'candidate',
  EMPLOYER: 'employer',
  ADMIN: 'admin'
} as const

export type UserRole = typeof UserRole[keyof typeof UserRole]

import type { Company } from './job.types'

export interface User {
  id: string
  email: string
  phone: string
  role: UserRole
  name: string
  avatarUrl?: string
  status: 'pending' | 'active' | 'locked' | 'deleted'
  createdAt: string
  updatedAt: string
}

export interface UserProfile extends User {
  address?: string
  dateOfBirth?: string
  experience?: string
  desiredPosition?: string
  experienceLevel?: string
  jobLevel?: string
  workType?: string
  gender?: string
  expectedSalary?: string
  industry?: string
  province?: string
  district?: string
  ward?: string
  willingToRelocate?: boolean
  profileCompleted?: boolean
  company?: Company
  cvs?: CV[]
}

export interface CandidateProfile {
  address?: string
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'other'
  experience: Experience[]
  education: Education[]
  skills: string[]
  summary?: string
}

export interface Experience {
  id: string
  company: string
  position: string
  startDate: string
  endDate?: string
  description: string
  isCurrent: boolean
}

export interface Education {
  id: string
  school: string
  degree: string
  field: string
  startDate: string
  endDate?: string
  description?: string
}

export interface Candidate extends User {
  role: 'candidate'
  profile: CandidateProfile
  cvs: CV[]
}

export interface Employer extends User {
  role: 'employer'
  company: Company
}


export interface CV {
  id: string
  userId: string
  title?: string
  fileName: string
  fileUrl: string
  fileSize: number
  mimeType: string
  isDefault: boolean
  createdAt: string
  updatedAt?: string
}
