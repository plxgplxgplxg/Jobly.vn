export interface UserProfileDTO {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  address?: string;
  dateOfBirth?: Date;
  experience?: string;
  avatarUrl?: string;
  desiredPosition?: string;
  experienceLevel?: string;
  jobLevel?: string;
  workType?: string;
  gender?: string;
  expectedSalary?: string;
  industry?: string;
  province?: string;
  district?: string;
  ward?: string;
  willingToRelocate?: boolean;
  profileCompleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfileDTO {
  name?: string;
  address?: string;
  dateOfBirth?: Date;
  experience?: string;
  desiredPosition?: string;
  experienceLevel?: string;
  jobLevel?: string;
  workType?: string;
  gender?: string;
  expectedSalary?: string;
  industry?: string;
  province?: string;
  district?: string;
  ward?: string;
  willingToRelocate?: boolean;
  profileCompleted?: boolean;
}

export interface CVDTO {
  id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  createdAt: Date;
  isDefault: boolean;
}

export interface CompanyDTO {
  id?: string;
  name: string;
  taxCode: string;
  industry: string;
  logoUrl?: string;
  logo?: string;
  description?: string;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
