import type { ReactNode } from 'react'

export interface CardProps {
  children: ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
}

export function Card({ children, className = '', padding = 'md', hover = false }: CardProps) {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }
  
  return (
    <div
      className={`
        bg-white dark:bg-slate-900 
        border border-slate-200 dark:border-slate-800 
        rounded-xl 
        ${paddingStyles[padding]}
        ${hover ? 'hover:shadow-xl hover:border-primary/50 transition-all cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`border-b border-slate-200 dark:border-slate-800 pb-4 mb-4 ${className}`}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={`text-xl font-bold text-slate-900 dark:text-slate-100 ${className}`}>
      {children}
    </h3>
  )
}

export function CardContent({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`border-t border-slate-200 dark:border-slate-800 pt-4 mt-4 ${className}`}>
      {children}
    </div>
  )
}
