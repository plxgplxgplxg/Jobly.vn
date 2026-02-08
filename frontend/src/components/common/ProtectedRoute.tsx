import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore, UserRole } from '../../store/authStore'
import type { ReactNode } from 'react'

interface ProtectedRouteProps {
  children?: ReactNode
  allowedRoles?: UserRole[]
  redirectTo?: string
}

export function ProtectedRoute({ 
  children, 
  allowedRoles, 
  redirectTo = '/auth/login' 
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()

  // Chưa đăng nhập
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  // Kiểm tra role nếu có yêu cầu
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user.role as UserRole
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/403" replace />
    }
  }

  // Render children hoặc Outlet cho nested routes
  return children ? <>{children}</> : <Outlet />
}
