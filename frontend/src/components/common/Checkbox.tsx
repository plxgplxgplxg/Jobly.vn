import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string
    error?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    (
        {
            label,
            error,
            id,
            className = '',
            disabled,
            ...props
        },
        ref
    ) => {
        const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`
        const errorId = `${checkboxId}-error`

        return (
            <div className="w-full">
                <div className="flex items-start gap-2">
                    <input
                        ref={ref}
                        type="checkbox"
                        id={checkboxId}
                        disabled={disabled}
                        className={`
              w-5 h-5 mt-0.5 rounded border-2 transition-all cursor-pointer
              ${error
                                ? 'border-red-500 text-red-500 focus:ring-red-500/20'
                                : 'border-slate-300 dark:border-slate-600 text-primary focus:ring-primary/20'
                            }
              bg-white dark:bg-slate-800
              disabled:opacity-50 disabled:cursor-not-allowed
              focus:outline-none focus:ring-2
              checked:bg-primary checked:border-primary
              ${className}
            `}
                        aria-invalid={!!error}
                        aria-describedby={error ? errorId : undefined}
                        {...props}
                    />

                    {label && (
                        <label
                            htmlFor={checkboxId}
                            className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer select-none"
                        >
                            {label}
                        </label>
                    )}
                </div>

                {error && (
                    <p id={errorId} className="mt-1.5 text-sm text-red-500" role="alert">
                        {error}
                    </p>
                )}
            </div>
        )
    }
)

Checkbox.displayName = 'Checkbox'
