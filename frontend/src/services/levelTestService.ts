import api from './api'
import type { LevelTestQuestion, LevelTestResult } from '@/types/levelTest'

export const levelTestService = {
  async getQuestions(): Promise<{ questions: LevelTestQuestion[]; total_count: number }> {
    const { data } = await api.get('/level-test/questions')
    return data
  },

  async submitAnswers(
    answers: { question_id: string; answer: string }[]
  ): Promise<LevelTestResult> {
    const { data } = await api.post('/level-test/submit', { answers })
    return data
  },
}
