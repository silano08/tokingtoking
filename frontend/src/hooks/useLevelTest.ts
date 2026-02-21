import { useCallback, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { levelTestService } from '@/services/levelTestService'
import type { LevelTestQuestion, LevelTestResult } from '@/types/levelTest'

export function useLevelTest() {
  const [questions, setQuestions] = useState<LevelTestQuestion[]>([])
  const [result, setResult] = useState<LevelTestResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { updateUser } = useAuthStore()

  const fetchQuestions = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await levelTestService.getQuestions()
      setQuestions(data.questions)
      return data
    } finally {
      setIsLoading(false)
    }
  }, [])

  const submitAnswers = useCallback(async (
    answers: { question_id: string; answer: string }[],
  ) => {
    setIsLoading(true)
    try {
      const data = await levelTestService.submitAnswers(answers)
      setResult(data)
      updateUser({ level: data.assigned_level as any })
      return data
    } finally {
      setIsLoading(false)
    }
  }, [updateUser])

  return { questions, result, isLoading, fetchQuestions, submitAnswers }
}
