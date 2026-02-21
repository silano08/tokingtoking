import api from './api'

/**
 * Server-side speech transcription via Groq Whisper API.
 * Sends audio blob to backend for fast (<1s) transcription + LLM post-processing.
 */
export async function transcribeAudio(
  audioBlob: Blob,
  sessionId: string
): Promise<{
  message: { role: string; content: string; feedback?: any; hint?: string }
  session_status: { words_used: Record<string, boolean>; completed_count: number; is_completed: boolean }
  transcription: { raw: string; processed: string }
  summary?: any
}> {
  const formData = new FormData()
  formData.append('audio', audioBlob, 'recording.webm')
  formData.append('session_id', sessionId)

  const { data } = await api.post('/speaking/transcribe', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000,
  })

  return data
}
