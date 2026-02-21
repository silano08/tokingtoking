import React from 'react'
import type { ChatMessage } from '@/types/chat'
import { colors, spacing, radius, font } from '@/styles/tokens'

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
      {!isUser && <div style={styles.avatar}>AI</div>}
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
            <div style={styles.feedbackTitle}>Feedback</div>
            <div style={styles.feedbackRow}>
              <span style={styles.feedbackLabel}>발음</span>
              <span style={styles.feedbackValue}>{message.feedback.pronunciation}</span>
            </div>
            <div style={styles.feedbackRow}>
              <span style={styles.feedbackLabel}>문법</span>
              <span style={styles.feedbackValue}>{message.feedback.grammar}</span>
            </div>
            <div style={styles.feedbackRow}>
              <span style={styles.feedbackLabel}>어휘</span>
              <span style={styles.feedbackValue}>{message.feedback.vocabulary}</span>
            </div>
            <div style={styles.feedbackScore}>
              <span style={styles.scoreLabel}>점수</span>
              <span style={styles.scoreValue}>{message.feedback.score}/10</span>
            </div>
          </div>
        )}

        {message.hint && (
          <div style={styles.hint}>
            <span style={styles.hintLabel}>Hint</span>
            <span>{message.hint}</span>
          </div>
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: `${spacing.sm}px`,
    marginBottom: `${spacing.md}px`,
    padding: `0 ${spacing.lg}px`,
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: colors.green,
    color: colors.white,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: 800,
    flexShrink: 0,
  },
  bubble: {
    maxWidth: '260px',
    padding: `${spacing.md}px 14px`,
    borderRadius: `${radius.lg}px`,
    ...font.body,
    wordBreak: 'break-word',
  },
  userBubble: {
    backgroundColor: colors.blue,
    color: colors.textOnPrimary,
    borderBottomRightRadius: '4px',
  },
  aiBubble: {
    backgroundColor: colors.bg,
    color: colors.text,
    borderBottomLeftRadius: '4px',
    border: `1px solid ${colors.border}`,
  },
  feedbackCard: {
    marginTop: `${spacing.sm}px`,
    padding: `${spacing.md}px`,
    backgroundColor: colors.greenBg,
    borderRadius: `${radius.md}px`,
    ...font.caption,
    maxWidth: '260px',
    border: `1px solid ${colors.greenLight}`,
  },
  feedbackTitle: {
    ...font.caption,
    fontWeight: 700,
    color: colors.greenDark,
    marginBottom: `${spacing.sm}px`,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  feedbackRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '4px',
    gap: `${spacing.sm}px`,
  },
  feedbackLabel: {
    fontWeight: 600,
    color: colors.textSecondary,
    flexShrink: 0,
  },
  feedbackValue: {
    color: colors.text,
    textAlign: 'right',
  },
  feedbackScore: {
    marginTop: `${spacing.sm}px`,
    paddingTop: `${spacing.sm}px`,
    borderTop: `1px solid ${colors.greenLight}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreLabel: {
    fontWeight: 600,
    color: colors.textSecondary,
  },
  scoreValue: {
    fontWeight: 800,
    color: colors.orange,
    fontSize: '15px',
  },
  hint: {
    marginTop: `${spacing.sm}px`,
    padding: `${spacing.sm}px ${spacing.md}px`,
    backgroundColor: colors.blueLight,
    borderRadius: `${radius.sm}px`,
    ...font.caption,
    color: colors.blueDark,
    maxWidth: '260px',
    display: 'flex',
    gap: `${spacing.sm}px`,
    alignItems: 'flex-start',
  },
  hintLabel: {
    fontWeight: 700,
    flexShrink: 0,
    textTransform: 'uppercase' as const,
    fontSize: '11px',
    letterSpacing: '0.3px',
  },
}
