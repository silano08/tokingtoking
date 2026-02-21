import React, { useEffect, useRef, useState } from 'react'
import { ChatBubble } from '@/components/ChatBubble'
import { WordStatusBar } from '@/components/WordStatusBar'
import { VoiceRecorder } from '@/components/VoiceRecorder'
import { useSessionStore } from '@/store/sessionStore'
import { chatService } from '@/services/chatService'
import { transcribeAudio } from '@/services/speechService'
import type { ChatMessage } from '@/types/chat'
import { speakText } from '@/utils/speech'
import { toast } from '@/store/toastStore'
import { colors, spacing, radius, font, headerStyle, backBtnStyle, headerTitleStyle } from '@/styles/tokens'

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
      startSession(session.session_id, 'speaking', session.target_words, session.initial_message)

      if (session.initial_message.content) {
        setLastAiMessage(session.initial_message.content)
        speakText(session.initial_message.content)
      }
    } catch {
      toast.error('세션 시작에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleAudioResult = async (audioBlob: Blob) => {
    if (!sessionId || isLoading) return

    setLoading(true)
    addMessage({ role: 'user', content: '음성 분석 중...' })

    try {
      const response = await transcribeAudio(audioBlob, sessionId)

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

  const handleVoiceResult = async (transcribedText: string) => {
    if (!sessionId || isLoading) return

    addMessage({ role: 'user', content: transcribedText })
    setLoading(true)

    try {
      const response = await chatService.sendSpeakingMessage(sessionId, transcribedText)
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
    if (lastAiMessage) speakText(lastAiMessage)
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={headerStyle}>
        <button onClick={() => window.history.back()} style={backBtnStyle}>
          &#8592;
        </button>
        <span style={headerTitleStyle}>스피킹 학습</span>
        <button onClick={handleReplay} style={styles.replayBtn}>
          &#9654;
        </button>
      </div>

      {/* Word Status */}
      {targetWords.length > 0 && sessionStatus && (
        <WordStatusBar targetWords={targetWords} wordsUsed={sessionStatus.words_used} />
      )}

      {/* Chat Area */}
      <div style={styles.chatArea}>
        {messages.map((msg, idx) => (
          <ChatBubble key={idx} message={msg} showFeedback={true} />
        ))}
        {isLoading && (
          <div style={styles.typing}>
            <div style={styles.typingBubble}>
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Voice Input */}
      <div style={styles.voiceArea}>
        <VoiceRecorder
          onResult={handleVoiceResult}
          onAudioResult={handleAudioResult}
          disabled={isLoading || sessionStatus?.is_completed}
          mode="server"
        />
        <div style={styles.voiceHint}>Groq Whisper 음성 인식</div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: colors.white,
  },
  replayBtn: {
    border: 'none',
    background: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    padding: `${spacing.xs}px ${spacing.sm}px`,
    color: colors.blue,
    marginLeft: 'auto',
  },
  chatArea: {
    flex: 1,
    overflowY: 'auto',
    padding: `${spacing.lg}px 0`,
  },
  typing: {
    padding: `0 ${spacing.lg}px`,
    marginBottom: `${spacing.md}px`,
  },
  typingBubble: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: `${spacing.md}px 14px`,
    backgroundColor: colors.bg,
    borderRadius: `${radius.lg}px`,
  },
  voiceArea: {
    padding: `${spacing.xl}px ${spacing.lg}px`,
    borderTop: `1px solid ${colors.border}`,
    backgroundColor: colors.white,
  },
  voiceHint: {
    textAlign: 'center',
    ...font.small,
    color: colors.textTertiary,
    marginTop: `${spacing.sm}px`,
  },
}
