import { useCallback, useRef, useState } from 'react'
import { useSessionStore } from '@/store/sessionStore'
import { chatService } from '@/services/chatService'
import { transcribeAudio } from '@/services/speechService'

export function useSpeaking() {
  const {
    sessionId, addMessage, updateStatus, setSummary, setLoading,
  } = useSessionStore()
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const startRecording = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const recorder = new MediaRecorder(stream)
    chunksRef.current = []
    recorder.ondataavailable = (e) => chunksRef.current.push(e.data)
    recorder.start()
    mediaRecorderRef.current = recorder
    setIsRecording(true)
  }, [])

  const stopRecording = useCallback((): Promise<Blob> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current
      if (!recorder) return
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setIsRecording(false)
        recorder.stream.getTracks().forEach((t) => t.stop())
        resolve(blob)
      }
      recorder.stop()
    })
  }, [])

  const sendSpeakingMessage = useCallback(async (
    transcribedText: string,
    audioDurationMs?: number,
  ) => {
    if (!sessionId) return
    addMessage({ role: 'user', content: transcribedText })
    setLoading(true)
    try {
      const response = await chatService.sendSpeakingMessage(
        sessionId, transcribedText, audioDurationMs,
      )
      addMessage(response.message)
      updateStatus(response.session_status)
      if (response.summary) setSummary(response.summary)
      return response
    } finally {
      setLoading(false)
    }
  }, [sessionId, addMessage, setLoading, updateStatus, setSummary])

  const recordAndTranscribe = useCallback(async () => {
    if (!sessionId) return
    const blob = await stopRecording()
    setLoading(true)
    try {
      const result = await transcribeAudio(blob, sessionId)
      addMessage({ role: 'user', content: result.transcription.processed })
      addMessage(result.message as any)
      updateStatus(result.session_status)
      if (result.summary) setSummary(result.summary)
      return result
    } finally {
      setLoading(false)
    }
  }, [sessionId, stopRecording, addMessage, setLoading, updateStatus, setSummary])

  return {
    isRecording, startRecording, stopRecording,
    sendSpeakingMessage, recordAndTranscribe,
  }
}
