import api from './api'
import type { VocabWord } from '@/types/vocab'

export const vocabService = {
  async getRandomWords(count: number = 3): Promise<VocabWord[]> {
    const { data } = await api.get('/vocab/random', { params: { count } })
    return data.words
  },
}
