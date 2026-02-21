import React from 'react'
import type { ChatMessage } from '@/types/chat'

interface ChatBubbleProps {
  message: ChatMessage
  showFeedback?: boolean
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  showFeedback = false,
}) => {
  const isUser = message.role === 'user'

  return (
    <div style={{ ...styles.wrapper, justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
      {!isUser && <div style={styles.avatar}>🤖</div>}
      <div>
        <div
          style={{
            ...styles.bubble,
            ...(isUser ? styles.userBubble : styles.aiBubble),
          }}
        >
          {message.content}
        </div>

        {showFeedback && message.feedback && (
          <div style={styles.feedbackCard}>
            <div style={styles.feedbackTitle}>📝 피드백</div>
            <div style={styles.feedbackRow}>
              <span style={styles.feedbackLabel}>발음:</span>
              <span>{message.feedback.pronunciation}</span>
            </div>
            <div style={styles.feedbackRow}>
              <span style={styles.feedbackLabel}>문법:</span>
              <span>{message.feedback.grammar}</span>
            </div>
            <div style={styles.feedbackRow}>
              <span style={styles.feedbackLabel}>어휘:</span>
              <span>{message.feedback.vocabulary}</span>
            </div>
            <div style={styles.feedbackScore}>
              점수: {message.feedback.score}/10
            </div>
          </div>
        )}

        {message.hint && (
          <div style={styles.hint}>💡 {message.hint}</div>
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    marginBottom: '12px',
    padding: '0 16px',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#F5F6F8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    flexShrink: 0,
  },
  bubble: {
    maxWidth: '260px',
    padding: '10px 14px',
    borderRadius: '16px',
    fontSize: '15px',
    lineHeight: '1.5',
    wordBreak: 'break-word' as const,
  },
  userBubble: {
    backgroundColor: '#3182F6',
    color: '#FFFFFF',
    borderBottomRightRadius: '4px',
  },
  aiBubble: {
    backgroundColor: '#F5F6F8',
    color: '#333D4B',
    borderBottomLeftRadius: '4px',
  },
  feedbackCard: {
    marginTop: '8px',
    padding: '12px',
    backgroundColor: '#FFF8E1',
    borderRadius: '12px',
    fontSize: '13px',
    lineHeight: '1.6',
    maxWidth: '260px',
  },
  feedbackTitle: {
    fontWeight: 700,
    marginBottom: '6px',
    fontSize: '14px',
  },
  feedbackRow: {
    marginBottom: '4px',
  },
  feedbackLabel: {
    fontWeight: 600,
    marginRight: '4px',
  },
  feedbackScore: {
    marginTop: '8px',
    fontWeight: 700,
    color: '#E65100',
  },
  hint: {
    marginTop: '6px',
    padding: '8px 12px',
    backgroundColor: '#E3F2FD',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#1565C0',
    maxWidth: '260px',
  },
}
