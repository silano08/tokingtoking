import { useCallback } from 'react'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/authService'

export function useAuth() {
  const { user, isLoggedIn, isNewUser, setUser, logout: clearUser } = useAuthStore()

  const login = useCallback(async (authorizationCode: string, referrer?: string) => {
    const response = await authService.login(authorizationCode, referrer)
    setUser(response.user, response.is_new_user)
    return response
  }, [setUser])

  const logout = useCallback(async () => {
    await authService.logout()
    clearUser()
  }, [clearUser])

  const fetchMe = useCallback(async () => {
    const userData = await authService.getMe()
    setUser(userData)
    return userData
  }, [setUser])

  return { user, isLoggedIn, isNewUser, login, logout, fetchMe }
}
