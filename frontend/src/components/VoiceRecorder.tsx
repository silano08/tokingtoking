import React, { useState, useRef, useCallback } from 'react'

interface VoiceRecorderProps {
  onResult: (text: string) => void
  onAudioResult?: (audioBlob: Blob) => void
  disabled?: boolean
  mode?: 'browser' | 'server'
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onResult,
  onAudioResult,
  disabled = false,
  mode = 'server',
}) => {
  const [isRecording, setIsRecording] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const handleStart = useCallback(async () => {
    setError(null)

    if (mode === 'server') {
      // MediaRecorder mode: capture audio for server-side Groq Whisper
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
            ? 'audio/webm;codecs=opus'
            : 'audio/webm',
        })

        chunksRef.current = []
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data)
        }

        mediaRecorder.onstop = () => {
          stream.getTracks().forEach((t) => t.stop())
          const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
          if (onAudioResult) {
            onAudioResult(audioBlob)
          }
          setIsRecording(false)
        }

        mediaRecorderRef.current = mediaRecorder
        mediaRecorder.start()
        setIsRecording(true)
      } catch {
        setError('마이크 접근이 거부되었습니다.')
      }
    } else {
      // Browser fallback: Web Speech API
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SR) {
        setError('이 브라우저에서는 음성 인식이 지원되지 않습니다.')
        return
      }
      setIsRecording(true)
      const recognition = new SR()
      recognition.lang = 'en-US'
      recognition.interimResults = false
      recognition.onresult = (event: any) => {
        const transcript = event.results[0]?.[0]?.transcript ?? ''
        onResult(transcript)
        setIsRecording(false)
      }
      recognition.onend = () => setIsRecording(false)
      recognition.onerror = (event: any) => {
        setError(`음성 인식 오류: ${event.error}`)
        setIsRecording(false)
      }
      recognition.start()
    }
  }, [mode, onResult, onAudioResult])

  const handleStop = useCallback(() => {
    if (mode === 'server' && mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
    setIsRecording(false)
  }, [mode])

  return (
    <div style={styles.container}>
      <button
        onClick={isRecording ? handleStop : handleStart}
        disabled={disabled}
        style={{
          ...styles.button,
          ...(isRecording ? styles.recording : {}),
          ...(disabled ? styles.disabled : {}),
        }}
      >
        {isRecording ? '⏹ 중지' : '🎤 말하기'}
      </button>
      {isRecording && (
        <div style={styles.indicator}>녹음 중...</div>
      )}
      {error && <div style={styles.error}>{error}</div>}
    </div>
  )
}

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  button: {
    width: '120px',
    height: '48px',
    borderRadius: '24px',
    border: 'none',
    backgroundColor: '#3182F6',
    color: '#FFFFFF',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  recording: {
    backgroundColor: '#E53935',
  },
  disabled: {
    backgroundColor: '#B0BEC5',
    cursor: 'not-allowed',
  },
  indicator: {
    fontSize: '13px',
    color: '#E53935',
    fontWeight: 500,
  },
  error: {
    fontSize: '12px',
    color: '#E53935',
  },
}
