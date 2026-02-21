import api from './api'
import type { ChatResponse, SessionCreateResponse } from '@/types/chat'

export const chatService = {
  async createSession(mode: string, wordIds: string[]): Promise<SessionCreateResponse> {
    const { data } = await api.post('/chat/session', {
      mode,
      word_ids: wordIds,
    })
    return data
  },

  async sendMessage(sessionId: string, content: string): Promise<ChatResponse> {
    const { data } = await api.post('/chat/message', {
      session_id: sessionId,
      content,
    })
    return data
  },

  async sendSpeakingMessage(
    sessionId: string,
    transcribedText: string,
    audioDurationMs: number = 0
  ): Promise<ChatResponse> {
    const { data } = await api.post('/speaking/message', {
      session_id: sessionId,
      transcribed_text: transcribedText,
      audio_duration_ms: audioDurationMs,
    })
    return data
  },
}
