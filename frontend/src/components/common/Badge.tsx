import type { ReactNode } from 'react'

export interface BadgeProps {
  children: ReactNode
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Badge({ children, variant = 'default', size = 'md', className = '' }: BadgeProps) {
  const variantStyles = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-green-500/10 text-green-600 dark:text-green-500',
    warning: 'bg-orange-500/10 text-orange-600 dark:text-orange-500',
    danger: 'bg-red-500/10 text-red-600 dark:text-red-500',
    info: 'bg-blue-500/10 text-blue-600 dark:text-blue-500',
    default: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
  }
  
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  }
  
  return (
    <span className={`inline-flex items-center font-bold rounded-full ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      {children}
    </span>
  )
}
