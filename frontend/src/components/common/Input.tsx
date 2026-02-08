import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      id,
      className = '',
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`
    const errorId = `${inputId}-error`
    const helperId = `${inputId}-helper`
    
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2"
          >
            {label}
            {required && <span className="text-red-500 ml-1" aria-label="bắt buộc">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={required}
            className={`
              w-full px-4 py-2.5 rounded-lg border transition-all
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon ? 'pr-10' : ''}
              ${error 
                ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' 
                : 'border-slate-300 dark:border-slate-700 focus:ring-primary/20 focus:border-primary'
              }
              bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100
              placeholder:text-slate-400 dark:placeholder:text-slate-500
              disabled:opacity-50 disabled:cursor-not-allowed
              focus:outline-none focus:ring-2
              ${className}
            `}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true">
              {rightIcon}
            </div>
          )}
        </div>
        
        {error && (
          <p id={errorId} className="mt-1.5 text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
        
        {!error && helperText && (
          <p id={helperId} className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
