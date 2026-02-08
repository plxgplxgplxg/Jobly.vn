// Loading Spinner component
export function LoadingSpinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }
  
  return (
    <div className={`${sizeStyles[size]} ${className}`} role="status" aria-label="Đang tải">
      <span className="material-symbols-outlined animate-spin text-primary">
        progress_activity
      </span>
    </div>
  )
}

// Loading Overlay component
export function LoadingOverlay({ message = 'Đang tải...' }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-xl p-8 flex flex-col items-center gap-4 shadow-xl">
        <LoadingSpinner size="lg" />
        <p className="text-slate-700 dark:text-slate-300 font-medium">{message}</p>
      </div>
    </div>
  )
}

// Skeleton Loader component
export function Skeleton({ className = '', variant = 'text' }: { className?: string; variant?: 'text' | 'circular' | 'rectangular' }) {
  const variantStyles = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  }
  
  return (
    <div
      className={`bg-slate-200 dark:bg-slate-800 animate-pulse ${variantStyles[variant]} ${className}`}
      aria-hidden="true"
    />
  )
}
