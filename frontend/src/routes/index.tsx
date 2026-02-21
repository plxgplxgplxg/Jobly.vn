import { createBrowserRouter } from 'react-router-dom'
import { MainLayout } from '../layouts/MainLayout'
import { DashboardLayout } from '../layouts/DashboardLayout'
import { AuthLayout } from '../layouts/AuthLayout'
import { ProtectedRoute } from '../components/common/ProtectedRoute'
import { UserRole } from '../store/authStore'

// Import pages
import { HomePage } from '../pages/HomePage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { ForbiddenPage } from '../pages/ForbiddenPage'

import { LoginPage } from '../pages/auth/LoginPage'
import { RegisterPage } from '../pages/auth/RegisterPage'
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage'

import { JobSearchPage } from '../pages/candidate/JobSearchPage'
import { JobDetailPage } from '../pages/candidate/JobDetailPage'
import { ApplicationsPage } from '../pages/candidate/ApplicationsPage'
import { CVManagementPage } from '../pages/candidate/CVManagementPage'
import { CVBuilderPage } from '../pages/candidate/CVBuilderPage'
import { ProfilePage } from '../pages/candidate/ProfilePage'
import { ProfileCompletionPage } from '../pages/candidate/ProfileCompletionPage'
import { CandidateDashboard } from '../pages/candidate/CandidateDashboard'
import { SavedJobsPage } from '../pages/candidate/SavedJobsPage'

import { EmployerDashboard } from '../pages/employer/EmployerDashboard'
import { JobManagementPage } from '../pages/employer/JobManagementPage'
import { JobPostingPage } from '../pages/employer/JobPostingPage'
import { ApplicationManagementPage } from '../pages/employer/ApplicationManagementPage'
import { CandidateSearchPage } from '../pages/employer/CandidateSearchPage'
import { CandidateDetailPage } from '../pages/employer/CandidateDetailPage'
import { EmployerProfilePage } from '../pages/employer/EmployerProfilePage'
import { SavedCandidatesPage } from '../pages/employer/SavedCandidatesPage'

import AdminDashboard from '../pages/admin/AdminDashboard'
import UserManagementPage from '../pages/admin/UserManagementPage'
import JobApprovalPage from '../pages/admin/JobApprovalPage'



import { MessagesPage } from '../pages/MessagesPage'
import { CompaniesPage } from '../pages/CompaniesPage'
import { CompanyDetailPage } from '../pages/CompanyDetailPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'jobs',
        element: <JobSearchPage />,
      },
      {
        path: 'jobs/:id',
        element: <JobDetailPage />,
      },
      {
        path: 'companies',
        element: <CompaniesPage />,
      },
      {
        path: 'companies/:id',
        element: <CompanyDetailPage />,
      },
      {
        path: 'cv-builder',
        element: <CVBuilderPage />,
      },
      {
        path: '403',
        element: <ForbiddenPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordPage />,
      },
    ],
  },
  {
    path: '/candidate',
    element: (
      <ProtectedRoute allowedRoles={[UserRole.CANDIDATE]}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <CandidateDashboard />,
      },
      {
        path: 'jobs',
        element: <JobSearchPage />,
      },
      {
        path: 'applications',
        element: <ApplicationsPage />,
      },
      {
        path: 'cv-management',
        element: <CVManagementPage />,
      },
      {
        path: 'cv-builder',
        element: <CVBuilderPage />,
      },
      {
        path: 'messages',
        element: <MessagesPage />,
      },
      {
        path: 'profile-completion',
        element: <ProfileCompletionPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'saved-jobs',
        element: <SavedJobsPage />,
      },
    ],
  },
  {
    path: '/employer',
    element: (
      <ProtectedRoute allowedRoles={[UserRole.EMPLOYER]}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <EmployerDashboard />,
      },
      {
        path: 'jobs',
        element: <JobManagementPage />,
      },
      {
        path: 'jobs/new',
        element: <JobPostingPage />,
      },
      {
        path: 'applications',
        element: <ApplicationManagementPage />,
      },
      {
        path: 'jobs/:jobId/applications',
        element: <ApplicationManagementPage />,
      },
      {
        path: 'candidates',
        element: <CandidateSearchPage />,
      },
      {
        path: 'candidates/:id',
        element: <CandidateDetailPage />,
      },
      {
        path: 'messages',
        element: <MessagesPage />,
      },
      {
        path: 'profile',
        element: <EmployerProfilePage />,
      },
      {
        path: 'saved-candidates',
        element: <SavedCandidatesPage />,
      },
    ],
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'dashboard',
        element: <AdminDashboard />,
      },
      {
        path: 'users',
        element: <UserManagementPage />,
      },
      {
        path: 'jobs',
        element: <JobApprovalPage />,
      },


    ],
  },
])
