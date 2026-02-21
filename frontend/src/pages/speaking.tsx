import React, { useEffect, useRef, useState } from 'react'
import { ChatBubble } from '@/components/ChatBubble'
import { WordStatusBar } from '@/components/WordStatusBar'
import { VoiceRecorder } from '@/components/VoiceRecorder'
import { useSessionStore } from '@/store/sessionStore'
import { chatService } from '@/services/chatService'
import { transcribeAudio } from '@/services/speechService'
import type { ChatMessage } from '@/types/chat'
import { speakText } from '@/utils/speech'

export default function SpeakingPage() {
  const {
    sessionId,
    targetWords,
    messages,
    sessionStatus,
    isLoading,
    startSession,
    addMessage,
    updateStatus,
    setSummary,
    setLoading,
  } = useSessionStore()

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [lastAiMessage, setLastAiMessage] = useState<string>('')

  useEffect(() => {
    if (!sessionId) {
      initSession()
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const initSession = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams(window.location.search)
      const wordIds = params.get('words')?.split(',') ?? []

      if (wordIds.length < 3) return

      const session = await chatService.createSession('speaking', wordIds)
      startSession(
        session.session_id,
        'speaking',
        session.target_words,
        session.initial_message
      )

      // AI 첫 메시지 TTS 재생
      if (session.initial_message.content) {
        setLastAiMessage(session.initial_message.content)
        speakText(session.initial_message.content)
      }
    } catch {
      alert('세션 시작에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // Groq Whisper 기반 음성 처리 (서버 사이드)
  const handleAudioResult = async (audioBlob: Blob) => {
    if (!sessionId || isLoading) return

    setLoading(true)
    addMessage({ role: 'user', content: '🎤 음성 분석 중...' })

    try {
      const response = await transcribeAudio(audioBlob, sessionId)

      // 사용자 메시지를 실제 전사 텍스트로 교체
      const transcribedText = response.transcription.processed || response.transcription.raw
      useSessionStore.setState((state) => {
        const msgs = [...state.messages]
        for (let i = msgs.length - 1; i >= 0; i--) {
          if (msgs[i]?.role === 'user') {
            msgs[i] = { role: 'user' as const, content: transcribedText }
            break
          }
        }
        return { messages: msgs }
      })

      const aiMessage: ChatMessage = {
        role: response.message.role as 'user' | 'assistant',
        content: response.message.content,
        feedback: response.message.feedback,
        hint: response.message.hint,
      }
      addMessage(aiMessage)
      updateStatus(response.session_status)

      // AI 응답 TTS 재생
      if (response.message.content) {
        setLastAiMessage(response.message.content)
        speakText(response.message.content)
      }

      if (response.session_status.is_completed && response.summary) {
        setSummary(response.summary)
        setTimeout(() => {
          window.location.href = `/session-result?session=${sessionId}`
        }, 2000)
      }
    } catch (err: any) {
      if (err?.response?.status === 403) {
        window.location.href = '/subscribe'
        return
      }
      useSessionStore.setState((state) => {
        const msgs = [...state.messages]
        for (let i = msgs.length - 1; i >= 0; i--) {
          if (msgs[i]?.role === 'user') {
            msgs[i] = { role: 'user' as const, content: '(음성 인식 실패)' }
            break
          }
        }
        return { messages: msgs }
      })
      addMessage({
        role: 'assistant',
        content: '죄송해요, 음성을 인식하지 못했어요. 다시 시도해주세요.',
      })
    } finally {
      setLoading(false)
    }
  }

  // 브라우저 Web Speech API 폴백
  const handleVoiceResult = async (transcribedText: string) => {
    if (!sessionId || isLoading) return

    addMessage({ role: 'user', content: transcribedText })
    setLoading(true)

    try {
      const response = await chatService.sendSpeakingMessage(
        sessionId,
        transcribedText
      )
      addMessage(response.message)
      updateStatus(response.session_status)

      if (response.message.content) {
        setLastAiMessage(response.message.content)
        speakText(response.message.content)
      }

      if (response.session_status.is_completed && response.summary) {
        setSummary(response.summary)
        setTimeout(() => {
          window.location.href = `/session-result?session=${sessionId}`
        }, 2000)
      }
    } catch (err: any) {
      if (err?.response?.status === 403) {
        window.location.href = '/subscribe'
        return
      }
      addMessage({
        role: 'assistant',
        content: '죄송해요, 오류가 발생했어요. 다시 시도해주세요.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReplay = () => {
    if (lastAiMessage) {
      speakText(lastAiMessage)
    }
  }

  return (
    <div style={styles.page}>
      {/* 헤더 */}
      <div style={styles.header}>
        <button onClick={() => window.history.back()} style={styles.backButton}>
          ←
        </button>
        <span style={styles.headerTitle}>스피킹 학습</span>
        <button onClick={handleReplay} style={styles.replayButton}>
          🔊
        </button>
      </div>

      {/* 단어 상태 바 */}
      {targetWords.length > 0 && sessionStatus && (
        <WordStatusBar
          targetWords={targetWords}
          wordsUsed={sessionStatus.words_used}
        />
      )}

      {/* 채팅 영역 */}
      <div style={styles.chatArea}>
        {messages.map((msg, idx) => (
          <ChatBubble key={idx} message={msg} showFeedback={true} />
        ))}
        {isLoading && (
          <div style={styles.typing}>🤖 분석 중...</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 음성 입력 영역 */}
      <div style={styles.voiceArea}>
        <VoiceRecorder
          onResult={handleVoiceResult}
          onAudioResult={handleAudioResult}
          disabled={isLoading || sessionStatus?.is_completed}
          mode="server"
        />
        <div style={styles.voiceHint}>
          Groq Whisper로 빠른 음성 인식
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#FFFFFF',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid #E5E8EB',
  },
  backButton: {
    border: 'none',
    background: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '4px 8px',
  },
  headerTitle: {
    flex: 1,
    fontSize: '17px',
    fontWeight: 700,
    marginLeft: '8px',
  },
  replayButton: {
    border: 'none',
    background: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '4px 8px',
  },
  chatArea: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '16px 0',
  },
  typing: {
    padding: '0 16px',
    fontSize: '14px',
    color: '#8B95A1',
    marginBottom: '12px',
  },
  voiceArea: {
    padding: '20px 16px',
    borderTop: '1px solid #E5E8EB',
    backgroundColor: '#F5F6F8',
  },
  voiceHint: {
    textAlign: 'center' as const,
    fontSize: '11px',
    color: '#8B95A1',
    marginTop: '8px',
  },
}
