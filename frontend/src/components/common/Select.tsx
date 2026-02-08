import { forwardRef } from 'react'
import type { SelectHTMLAttributes } from 'react'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string
    error?: string
    helperText?: string
    options: Array<{ value: string; label: string }>
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    (
        {
            label,
            error,
            helperText,
            options,
            id,
            className = '',
            required,
            disabled,
            ...props
        },
        ref
    ) => {
        const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`
        const errorId = `${selectId}-error`
        const helperId = `${selectId}-helper`

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={selectId}
                        className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2"
                    >
                        {label}
                        {required && <span className="text-red-500 ml-1" aria-label="bắt buộc">*</span>}
                    </label>
                )}

                <div className="relative">
                    <select
                        ref={ref}
                        id={selectId}
                        disabled={disabled}
                        required={required}
                        className={`
              w-full px-4 py-2.5 rounded-lg border transition-all appearance-none
              ${error
                                ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
                                : 'border-slate-300 dark:border-slate-700 focus:ring-primary/20 focus:border-primary'
                            }
              bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100
              disabled:opacity-50 disabled:cursor-not-allowed
              focus:outline-none focus:ring-2
              ${className}
            `}
                        aria-invalid={!!error}
                        aria-describedby={error ? errorId : helperText ? helperId : undefined}
                        {...props}
                    >
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden="true">
                        <span className="material-symbols-outlined text-xl">expand_more</span>
                    </div>
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

Select.displayName = 'Select'
