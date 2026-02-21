import { useCallback } from 'react'
import { useSessionStore } from '@/store/sessionStore'
import { chatService } from '@/services/chatService'

export function useChat() {
  const {
    sessionId, mode, targetWords, messages, sessionStatus, summary, isLoading,
    startSession, addMessage, updateStatus, setSummary, setLoading, resetSession,
  } = useSessionStore()

  const createSession = useCallback(async (chatMode: string, wordIds: string[]) => {
    setLoading(true)
    try {
      const response = await chatService.createSession(chatMode, wordIds)
      startSession(
        response.session_id,
        response.mode as 'chat' | 'speaking',
        response.target_words,
        response.initial_message,
      )
      return response
    } finally {
      setLoading(false)
    }
  }, [setLoading, startSession])

  const sendMessage = useCallback(async (content: string) => {
    if (!sessionId) return
    addMessage({ role: 'user', content })
    setLoading(true)
    try {
      const response = await chatService.sendMessage(sessionId, content)
      addMessage(response.message)
      updateStatus(response.session_status)
      if (response.summary) setSummary(response.summary)
      return response
    } finally {
      setLoading(false)
    }
  }, [sessionId, addMessage, setLoading, updateStatus, setSummary])

  return {
    sessionId, mode, targetWords, messages, sessionStatus, summary, isLoading,
    createSession, sendMessage, resetSession,
  }
}
