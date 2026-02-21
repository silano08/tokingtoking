import React, { useEffect, useRef, useState } from 'react'
import { ChatBubble } from '@/components/ChatBubble'
import { WordStatusBar } from '@/components/WordStatusBar'
import { useSessionStore } from '@/store/sessionStore'
import { useAuthStore } from '@/store/authStore'
import { chatService } from '@/services/chatService'
import { vocabService } from '@/services/vocabService'
import { toast } from '@/store/toastStore'
import { colors, spacing, radius, font, headerStyle, backBtnStyle, headerTitleStyle } from '@/styles/tokens'

export default function ChatPage() {
  const {
    sessionId,
    targetWords,
    messages,
    sessionStatus,
    isLoading,
    startSession,
    addMessage,
    updateLastUserMessage,
    updateStatus,
    setSummary,
    setLoading,
  } = useSessionStore()

  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

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

      if (wordIds.length < 3) {
        const words = await vocabService.getRandomWords(3)
        const ids = words.map((w) => w.id)
        const session = await chatService.createSession('chat', ids)
        startSession(session.session_id, 'chat', session.target_words, session.initial_message)
      } else {
        const session = await chatService.createSession('chat', wordIds)
        startSession(session.session_id, 'chat', session.target_words, session.initial_message)
      }
    } catch (err: any) {
      if (err?.response?.status === 429) {
        toast.premium('오늘의 무료 학습을 모두 사용했어요', {
          label: '홈으로 돌아가기',
          onClick: () => (window.location.href = '/'),
        })
        return
      }
      toast.error('세션 시작에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!input.trim() || !sessionId || isLoading) return

    const userMessage = input.trim()
    setInput('')
    addMessage({ role: 'user', content: userMessage })
    setLoading(true)

    try {
      const response = await chatService.sendMessage(sessionId, userMessage)
      if (response.message.grammar_correction) {
        updateLastUserMessage({ grammar_correction: response.message.grammar_correction })
      }
      addMessage(response.message)
      updateStatus(response.session_status)

      if (response.session_status.is_completed && response.summary) {
        setSummary(response.summary)

        const user = useAuthStore.getState().user
        if (user && !user.is_premium) {
          toast.premium('잘 하셨어요! 스피킹으로도 연습해보는 건 어때요?', {
            label: '스피킹 알아보기',
            onClick: () => (window.location.href = '/subscribe'),
          })
        }

        setTimeout(() => {
          window.location.href = `/session-result?session=${sessionId}`
        }, 3000)
      }
    } catch {
      addMessage({
        role: 'assistant',
        content: '죄송해요, 잠시 오류가 발생했어요. 다시 시도해주세요.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={headerStyle}>
        <button onClick={() => window.history.back()} style={backBtnStyle}>
          &#8592;
        </button>
        <span style={headerTitleStyle}>채팅 학습</span>
      </div>

      {/* Word Status */}
      {targetWords.length > 0 && sessionStatus && (
        <WordStatusBar targetWords={targetWords} wordsUsed={sessionStatus.words_used} />
      )}

      {/* Chat Area */}
      <div style={styles.chatArea}>
        {messages.map((msg, idx) => (
          <ChatBubble key={idx} message={msg} />
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

      {/* Input Area */}
      <div style={styles.inputArea}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="영어로 대화해보세요..."
          disabled={isLoading || sessionStatus?.is_completed}
          style={styles.input}
          maxLength={500}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          style={{
            ...styles.sendButton,
            backgroundColor: input.trim() ? colors.blue : colors.bg,
            color: input.trim() ? colors.white : colors.textTertiary,
          }}
        >
          &#8593;
        </button>
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
  chatArea: {
    flex: 1,
    overflowY: 'auto',
    padding: `${spacing.lg}px 0`,
    backgroundColor: colors.white,
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
  inputArea: {
    display: 'flex',
    gap: `${spacing.sm}px`,
    padding: `${spacing.md}px ${spacing.lg}px`,
    borderTop: `1px solid ${colors.border}`,
    backgroundColor: colors.white,
  },
  input: {
    flex: 1,
    height: '48px',
    borderRadius: `${radius.md}px`,
    border: `1px solid ${colors.border}`,
    padding: `0 ${spacing.lg}px`,
    ...font.body,
    color: colors.text,
    backgroundColor: colors.white,
  },
  sendButton: {
    width: '48px',
    height: '48px',
    borderRadius: `${radius.md}px`,
    border: 'none',
    fontSize: '20px',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
}
