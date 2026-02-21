import { create } from 'zustand'
import type { ChatMessage, SessionStatus, SessionSummary, TargetWord } from '@/types/chat'

interface SessionState {
  sessionId: string | null
  mode: 'chat' | 'speaking' | null
  targetWords: TargetWord[]
  messages: ChatMessage[]
  sessionStatus: SessionStatus | null
  summary: SessionSummary | null
  isLoading: boolean

  startSession: (
    sessionId: string,
    mode: 'chat' | 'speaking',
    targetWords: TargetWord[],
    initialMessage: ChatMessage
  ) => void
  addMessage: (message: ChatMessage) => void
  updateStatus: (status: SessionStatus) => void
  setSummary: (summary: SessionSummary) => void
  setLoading: (loading: boolean) => void
  resetSession: () => void
}

export const useSessionStore = create<SessionState>((set) => ({
  sessionId: null,
  mode: null,
  targetWords: [],
  messages: [],
  sessionStatus: null,
  summary: null,
  isLoading: false,

  startSession: (sessionId, mode, targetWords, initialMessage) =>
    set({
      sessionId,
      mode,
      targetWords,
      messages: [initialMessage],
      sessionStatus: {
        words_used: Object.fromEntries(targetWords.map((w) => [w.word, false])),
        completed_count: 0,
        is_completed: false,
      },
      summary: null,
      isLoading: false,
    }),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  updateStatus: (status) => set({ sessionStatus: status }),

  setSummary: (summary) => set({ summary }),

  setLoading: (loading) => set({ isLoading: loading }),

  resetSession: () =>
    set({
      sessionId: null,
      mode: null,
      targetWords: [],
      messages: [],
      sessionStatus: null,
      summary: null,
      isLoading: false,
    }),
}))
