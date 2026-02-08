import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { User } from '../types/user.types'
import { UserRole } from '../types/user.types'

export type { User }
export { UserRole }

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean

  setUser: (user: User) => void
  setToken: (token: string) => void
  logout: () => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => set({ user, isAuthenticated: true }),

      setToken: (token) => {
        localStorage.setItem('auth_token', token)
        set({ token })
      },

      logout: () => {
        localStorage.removeItem('auth_token')
        set({
          user: null,
          token: null,
          isAuthenticated: false
        })
      },

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
)
