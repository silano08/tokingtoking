import api from './api'
import type { LoginResponse, User } from '@/types/user'

export const authService = {
  async login(authorizationCode: string, referrer: string = 'DEFAULT'): Promise<LoginResponse> {
    const { data } = await api.post('/auth/login', {
      authorization_code: authorizationCode,
      referrer,
    })
    localStorage.setItem('access_token', data.access_token)
    return data
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout')
    localStorage.removeItem('access_token')
  },

  async getMe(): Promise<User> {
    const { data } = await api.get('/auth/me')
    return data
  },
}
