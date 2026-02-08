import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-bold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed'
    
    const variantStyles = {
      primary: 'bg-primary text-white hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30',
      secondary: 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600',
      outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
      ghost: 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
      danger: 'bg-red-500 text-white hover:bg-red-600',
    }
    
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-5 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    }
    
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading && (
          <span className="material-symbols-outlined animate-spin" aria-hidden="true">
            progress_activity
          </span>
        )}
        {!isLoading && leftIcon && <span aria-hidden="true">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span aria-hidden="true">{rightIcon}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'
