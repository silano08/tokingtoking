export interface User {
  id: string
  level: 'beginner' | 'intermediate' | 'advanced'
  is_premium: boolean
  total_sessions: number
  streak_days: number
  last_study_date: string | null
}

export interface LoginResponse {
  access_token: string
  refresh_token?: string
  user: User
  is_new_user: boolean
}
