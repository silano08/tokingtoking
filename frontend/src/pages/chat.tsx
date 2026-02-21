import React, { useEffect, useRef, useState } from 'react'
import { ChatBubble } from '@/components/ChatBubble'
import { WordStatusBar } from '@/components/WordStatusBar'
import { useSessionStore } from '@/store/sessionStore'
import { chatService } from '@/services/chatService'
import { vocabService } from '@/services/vocabService'

export default function ChatPage() {
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
      // URL 파라미터에서 단어 ID 추출
      const params = new URLSearchParams(window.location.search)
      const wordIds = params.get('words')?.split(',') ?? []

      if (wordIds.length < 3) {
        // 단어가 없으면 랜덤 출제
        const words = await vocabService.getRandomWords(3)
        const ids = words.map((w) => w.id)
        const session = await chatService.createSession('chat', ids)
        startSession(
          session.session_id,
          'chat',
          session.target_words,
          session.initial_message
        )
      } else {
        const session = await chatService.createSession('chat', wordIds)
        startSession(
          session.session_id,
          'chat',
          session.target_words,
          session.initial_message
        )
      }
    } catch (err: any) {
      if (err?.response?.status === 429) {
        alert(err.response.data?.detail || '일일 무료 학습 횟수를 초과했습니다.')
        window.location.href = '/subscribe'
        return
      }
      alert('세션 시작에 실패했습니다.')
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
      addMessage(response.message)
      updateStatus(response.session_status)

      if (response.session_status.is_completed && response.summary) {
        setSummary(response.summary)
        // 완료 시 결과 페이지로 이동
        setTimeout(() => {
          window.location.href = `/session-result?session=${sessionId}`
        }, 1500)
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
      {/* 헤더 */}
      <div style={styles.header}>
        <button onClick={() => window.history.back()} style={styles.backButton}>
          ←
        </button>
        <span style={styles.headerTitle}>채팅 학습</span>
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
          <ChatBubble key={idx} message={msg} />
        ))}
        {isLoading && (
          <div style={styles.typing}>
            <div style={styles.typingDots}>🤖 입력 중...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div style={styles.inputArea}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="메시지를 입력하세요..."
          disabled={isLoading || sessionStatus?.is_completed}
          style={styles.input}
          maxLength={500}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          style={styles.sendButton}
        >
          전송
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid #E5E8EB',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    border: 'none',
    background: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '4px 8px',
  },
  headerTitle: {
    fontSize: '17px',
    fontWeight: 700,
    marginLeft: '8px',
  },
  chatArea: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '16px 0',
  },
  typing: {
    padding: '0 16px',
    marginBottom: '12px',
  },
  typingDots: {
    fontSize: '14px',
    color: '#8B95A1',
  },
  inputArea: {
    display: 'flex',
    gap: '8px',
    padding: '12px 16px',
    borderTop: '1px solid #E5E8EB',
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    height: '44px',
    borderRadius: '22px',
    border: '1px solid #E5E8EB',
    padding: '0 16px',
    fontSize: '15px',
    outline: 'none',
  },
  sendButton: {
    height: '44px',
    padding: '0 20px',
    borderRadius: '22px',
    border: 'none',
    backgroundColor: '#3182F6',
    color: '#FFFFFF',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
  },
}
