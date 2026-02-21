import api from './api'
import type { VocabWord } from '@/types/vocab'

const CACHE_KEY = 'toking_today_words'

interface CachedWords {
  date: string
  words: VocabWord[]
}

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0] as string
}

function getCachedWords(): VocabWord[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const cached: CachedWords = JSON.parse(raw)
    if (cached.date !== getTodayStr()) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }
    return cached.words
  } catch {
    return null
  }
}

function setCachedWords(words: VocabWord[]): void {
  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({ date: getTodayStr(), words })
  )
}

export const vocabService = {
  async getTodayWords(count: number = 3): Promise<VocabWord[]> {
    const cached = getCachedWords()
    if (cached && cached.length >= count) return cached

    const { data } = await api.get('/vocab/random', { params: { count } })
    const words: VocabWord[] = data.words
    setCachedWords(words)
    return words
  },

  // Backward compat alias
  async getRandomWords(count: number = 3): Promise<VocabWord[]> {
    return this.getTodayWords(count)
  },

  clearCache(): void {
    localStorage.removeItem(CACHE_KEY)
  },
}
