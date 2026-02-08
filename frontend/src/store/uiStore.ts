import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  message: string
  duration?: number
  createdAt: number
}

interface UIState {
  theme: 'light' | 'dark'
  sidebarOpen: boolean
  notifications: Notification[]
  
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark') => void
  
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: 'light',
      sidebarOpen: true,
      notifications: [],
      
      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light'
        set({ theme: newTheme })
        
        // Apply theme to document
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },
      
      setTheme: (theme) => {
        set({ theme })
        
        if (theme === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      },
      
      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }))
      },
      
      setSidebarOpen: (open) => {
        set({ sidebarOpen: open })
      },
      
      addNotification: (notification) => {
        const id = `notification-${Date.now()}-${Math.random()}`
        const newNotification: Notification = {
          ...notification,
          id,
          createdAt: Date.now(),
          duration: notification.duration ?? 5000
        }
        
        set((state) => ({
          notifications: [...state.notifications, newNotification]
        }))
        
        // Auto remove sau duration
        const duration = newNotification.duration ?? 0
        if (duration > 0) {
          setTimeout(() => {
            get().removeNotification(id)
          }, duration)
        }
      },
      
      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }))
      },
      
      clearNotifications: () => {
        set({ notifications: [] })
      }
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({ 
        theme: state.theme,
        sidebarOpen: state.sidebarOpen
      }),
    }
  )
)
