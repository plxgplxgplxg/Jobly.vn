import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showCloseButton?: boolean
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  
  // Focus trap và keyboard handling
  useEffect(() => {
    if (!isOpen) return
    
    // Lưu element đang focus
    previousFocusRef.current = document.activeElement as HTMLElement
    
    // Focus vào modal
    modalRef.current?.focus()
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden'
    
    // Handle ESC key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    
    return () => {
      document.body.style.overflow = 'unset'
      document.removeEventListener('keydown', handleEscape)
      
      // Restore focus
      previousFocusRef.current?.focus()
    }
  }, [isOpen, onClose])
  
  if (!isOpen) return null
  
  const sizeStyles = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }
  
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal Content */}
      <div
        ref={modalRef}
        className={`relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full ${sizeStyles[size]} max-h-[90vh] overflow-y-auto`}
        tabIndex={-1}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
            {title && (
              <h2 id="modal-title" className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Đóng modal"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            )}
          </div>
        )}
        
        {/* Body */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
