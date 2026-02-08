export interface RegisterDTO {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  taxCode?: string;
  industry?: string;
  role: 'candidate' | 'employer';
  phone?: string;
}

export interface LoginDTO {
  identifier: string;
  password: string;
}

export interface UserDTO {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  avatarUrl?: string;
}

export interface AuthResponse {
  token: string;
  user: UserDTO;
  message?: string;
}
