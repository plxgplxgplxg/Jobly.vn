// Route paths
export const ROUTES = {
  HOME: '/',
  JOBS: '/jobs',
  JOB_DETAIL: (id: string) => `/jobs/${id}`,
  ABOUT: '/about',
  CONTACT: '/contact',
  
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
  },
  
  // Candidate
  CANDIDATE: {
    DASHBOARD: '/candidate/dashboard',
    PROFILE: '/candidate/profile',
    CV: '/candidate/cv',
    CV_BUILDER: '/candidate/cv/builder',
    APPLICATIONS: '/candidate/applications',
    MESSAGES: '/candidate/messages',
  },
  
  // Employer
  EMPLOYER: {
    DASHBOARD: '/employer/dashboard',
    COMPANY: '/employer/company',
    JOBS: '/employer/jobs',
    CREATE_JOB: '/employer/jobs/new',
    EDIT_JOB: (id: string) => `/employer/jobs/${id}/edit`,
    APPLICATIONS: '/employer/applications',
    MESSAGES: '/employer/messages',
  },
  
  // Admin
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    USERS: '/admin/users',
    JOBS: '/admin/jobs',
    TEMPLATES: '/admin/templates',
    REPORTS: '/admin/reports',
  },
  
  // Error pages
  NOT_FOUND: '/404',
  FORBIDDEN: '/403',
} as const
