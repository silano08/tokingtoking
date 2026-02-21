export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  word_usage?: Record<string, boolean>
  feedback?: SpeakingFeedback | null
  hint?: string | null
  grammar_correction?: string | null
}

export interface SpeakingFeedback {
  pronunciation: string
  grammar: string
  vocabulary: string
  score: number
}

export interface SessionStatus {
  words_used: Record<string, boolean>
  completed_count: number
  is_completed: boolean
}

export interface SessionSummary {
  session_id: string
  duration_seconds: number
  message_count: number
  word_usage_details: {
    word: string
    used_in: string
    feedback: string
  }[]
}

export interface TargetWord {
  id: string
  word: string
  definition_ko: string
}

export interface SessionCreateResponse {
  session_id: string
  mode: string
  target_words: TargetWord[]
  initial_message: ChatMessage
}

export interface ChatResponse {
  message: ChatMessage
  session_status: SessionStatus
  summary?: SessionSummary | null
}
