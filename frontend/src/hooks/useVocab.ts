import { useCallback, useState } from 'react'
import { vocabService } from '@/services/vocabService'
import type { VocabWord } from '@/types/vocab'

export function useVocab() {
  const [words, setWords] = useState<VocabWord[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchRandomWords = useCallback(async (count: number = 3) => {
    setIsLoading(true)
    try {
      const data = await vocabService.getRandomWords(count)
      setWords(data)
      return data
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { words, isLoading, fetchRandomWords }
}
