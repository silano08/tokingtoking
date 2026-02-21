import React from 'react'
import { useSessionStore } from '@/store/sessionStore'
import { useAuthStore } from '@/store/authStore'
import { colors, spacing, radius, font, shadows, primaryBtnStyle, secondaryBtnStyle } from '@/styles/tokens'

export default function SessionResultPage() {
  const { summary } = useSessionStore()
  const { user } = useAuthStore()
  const { resetSession } = useSessionStore()

  const handleNewSession = () => {
    resetSession()
    window.location.href = '/'
  }

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}분 ${s}초`
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.headerTitle}>학습 완료</span>
      </div>

      <div style={styles.content}>
        {/* Celebration */}
        <div style={styles.celebration}>
          <div style={styles.celebrationCircle}>
            <span style={styles.checkMark}>&#10003;</span>
          </div>
          <div style={styles.celebrationTitle}>수고했어요!</div>
        </div>

        {/* Word Results */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>학습한 단어</div>
          {summary?.word_usage_details.map((detail, idx) => (
            <div key={idx} style={styles.wordResult}>
              <div style={styles.wordHeader}>
                <span style={styles.wordCheckCircle}>&#10003;</span>
                <span style={styles.wordName}>{detail.word}</span>
              </div>
              <div style={styles.wordSentence}>"{detail.used_in}"</div>
              <div style={styles.wordFeedback}>{detail.feedback}</div>
            </div>
          ))}
        </div>

        {/* Stats */}
        {summary && (
          <div style={styles.statsCard}>
            <div style={styles.sectionTitle}>학습 통계</div>
            <div style={styles.statsGrid}>
              <div style={styles.statItem}>
                <div style={styles.statNumber}>
                  {formatDuration(summary.duration_seconds)}
                </div>
                <div style={styles.statLabel}>소요 시간</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statNumber}>{summary.message_count}</div>
                <div style={styles.statLabel}>메시지</div>
              </div>
              {(user?.streak_days ?? 0) > 0 && (
                <div style={styles.statItem}>
                  <div style={{ ...styles.statNumber, color: colors.orange }}>
                    {user?.streak_days}일
                  </div>
                  <div style={styles.statLabel}>연속 학습</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={styles.actions}>
          <button onClick={handleNewSession} style={primaryBtnStyle}>
            한 번 더 학습하기
          </button>
          <button
            onClick={() => (window.location.href = '/')}
            style={secondaryBtnStyle}
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: colors.white,
  },
  header: {
    padding: `${spacing.md}px ${spacing.lg}px`,
    borderBottom: `2px solid ${colors.border}`,
  },
  headerTitle: {
    ...font.h3,
    color: colors.text,
  },
  content: {
    padding: `${spacing.xxl}px ${spacing.lg}px`,
    animation: 'fadeIn 0.5s ease-out',
  },
  celebration: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: `${spacing.xxl}px`,
    animation: 'scaleIn 0.5s ease-out',
  },
  celebrationCircle: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: colors.green,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: `${spacing.lg}px`,
    boxShadow: shadows.button,
  },
  checkMark: {
    fontSize: '36px',
    color: colors.white,
    fontWeight: 700,
  },
  celebrationTitle: {
    ...font.h1,
    color: colors.text,
  },
  section: {
    marginBottom: `${spacing.xxl}px`,
  },
  sectionTitle: {
    ...font.bodyBold,
    color: colors.text,
    marginBottom: `${spacing.md}px`,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    fontSize: '13px',
  },
  wordResult: {
    padding: `14px`,
    backgroundColor: colors.white,
    borderRadius: `${radius.md}px`,
    marginBottom: `${spacing.sm}px`,
    border: `2px solid ${colors.border}`,
    boxShadow: shadows.card,
  },
  wordHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: `${spacing.sm}px`,
    marginBottom: `${spacing.sm}px`,
  },
  wordCheckCircle: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: colors.green,
    color: colors.white,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 700,
    flexShrink: 0,
  },
  wordName: {
    ...font.bodyBold,
    fontWeight: 700,
    color: colors.text,
  },
  wordSentence: {
    ...font.caption,
    color: colors.text,
    fontStyle: 'italic',
    marginBottom: '4px',
    paddingLeft: `${spacing.xxxl}px`,
  },
  wordFeedback: {
    ...font.caption,
    color: colors.textSecondary,
    paddingLeft: `${spacing.xxxl}px`,
  },
  statsCard: {
    padding: `${spacing.lg}px`,
    backgroundColor: colors.bg,
    borderRadius: `${radius.lg}px`,
    marginBottom: `${spacing.xxl}px`,
  },
  statsGrid: {
    display: 'flex',
    gap: `${spacing.sm}px`,
  },
  statItem: {
    flex: 1,
    textAlign: 'center',
    padding: `${spacing.md}px`,
    backgroundColor: colors.white,
    borderRadius: `${radius.md}px`,
    border: `2px solid ${colors.border}`,
    boxShadow: shadows.card,
  },
  statNumber: {
    ...font.h2,
    color: colors.text,
    marginBottom: '2px',
  },
  statLabel: {
    ...font.small,
    color: colors.textTertiary,
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${spacing.md}px`,
  },
}
