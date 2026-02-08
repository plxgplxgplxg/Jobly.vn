// API endpoints và configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001'

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/auth/register',
    VERIFY_OTP: '/auth/verify-otp',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  
  // Users
  USERS: {
    PROFILE: '/users/profile',
    UPLOAD_CV: '/users/cv',
    DELETE_CV: (id: string) => `/users/cv/${id}`,
    MY_CVS: '/users/cv',
  },
  
  // Jobs
  JOBS: {
    SEARCH: '/jobs/search',
    BY_ID: (id: string) => `/jobs/${id}`,
    CREATE: '/jobs',
    UPDATE: (id: string) => `/jobs/${id}`,
    DELETE: (id: string) => `/jobs/${id}`,
    MY_JOBS: '/jobs/my-jobs',
  },
  
  // Applications
  APPLICATIONS: {
    APPLY: '/applications',
    MY_APPLICATIONS: '/applications/my-applications',
    BY_JOB: (jobId: string) => `/applications/job/${jobId}`,
    UPDATE_STATUS: (id: string) => `/applications/${id}/status`,
  },
  
  // Companies
  COMPANIES: {
    CREATE: '/companies',
    UPDATE: (id: string) => `/companies/${id}`,
    MY_COMPANY: '/companies/my-company',
  },
  
  // CV Templates
  CV_TEMPLATES: {
    LIST: '/cv-templates',
    BY_ID: (id: string) => `/cv-templates/${id}`,
    GENERATE: (id: string) => `/cv-templates/${id}/generate`,
  },
  
  // Messages
  MESSAGES: {
    CONVERSATIONS: '/messages/conversations',
    BY_CONVERSATION: (id: string) => `/messages/conversations/${id}`,
    SEND: (conversationId: string) => `/messages/conversations/${conversationId}`,
    MARK_READ: (conversationId: string) => `/messages/conversations/${conversationId}/read`,
  },
  
  // Admin
  ADMIN: {
    USERS: '/admin/users',
    USER_STATUS: (id: string) => `/admin/users/${id}/status`,
    PENDING_JOBS: '/admin/jobs/pending',
    APPROVE_JOB: (id: string) => `/admin/jobs/${id}/approve`,
    TEMPLATES: '/admin/cv-templates',
    STATS: '/admin/stats',
    SEND_ALERT: '/admin/alerts',
  },
  
  // Employer
  EMPLOYER: {
    STATS: '/employer/stats',
  },
} as const
