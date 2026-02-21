import { create } from 'zustand'
import type { User } from '@/types/user'

interface AuthState {
  user: User | null
  isLoggedIn: boolean
  isNewUser: boolean
  setUser: (user: User, isNewUser?: boolean) => void
  updateUser: (updates: Partial<User>) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,
  isNewUser: false,

  setUser: (user, isNewUser = false) =>
    set({ user, isLoggedIn: true, isNewUser }),

  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),

  logout: () =>
    set({ user: null, isLoggedIn: false, isNewUser: false }),
}))
