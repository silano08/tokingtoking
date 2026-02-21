export interface LevelTestQuestion {
  id: string
  question_type: 'multiple_choice' | 'fill_blank'
  question_text: string
  options: string[] | null
  level: string
  order: number
}

export interface LevelTestResult {
  score: number
  total: number
  level_scores: Record<string, number>
  assigned_level: string
  message: string
}
