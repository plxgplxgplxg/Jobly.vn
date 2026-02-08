import { useEffect } from 'react'
import { useUIStore } from '../../store/uiStore'
import type { NotificationType } from '../../store/uiStore'

export function ToastContainer() {
  const { notifications, removeNotification } = useUIStore()
  
  return (
    <div
      className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-md"
      role="region"
      aria-label="Thông báo"
      aria-live="polite"
    >
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          id={notification.id}
          type={notification.type}
          message={notification.message}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  )
}

interface ToastProps {
  id: string
  type: NotificationType
  message: string
  onClose: () => void
}

function Toast({ type, message, onClose }: ToastProps) {
  useEffect(() => {
    // Auto dismiss sau 5s
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [onClose])
  
  const typeStyles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-orange-500 text-white',
    info: 'bg-blue-500 text-white',
  }
  
  const icons = {
    success: 'check_circle',
    error: 'error',
    warning: 'warning',
    info: 'info',
  }
  
  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg shadow-lg ${typeStyles[type]} animate-slide-in-right`}
      role="alert"
    >
      <span className="material-symbols-outlined" aria-hidden="true">
        {icons[type]}
      </span>
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="p-1 hover:bg-white/20 rounded transition-colors"
        aria-label="Đóng thông báo"
      >
        <span className="material-symbols-outlined text-lg">close</span>
      </button>
    </div>
  )
}
