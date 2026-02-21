import React from 'react'
import { useSessionStore } from '@/store/sessionStore'
import { useAuthStore } from '@/store/authStore'

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
      <div style={styles.header}>
        <span style={styles.headerTitle}>학습 완료!</span>
      </div>

      <div style={styles.content}>
        <div style={styles.celebrationEmoji}>🎉</div>
        <div style={styles.title}>수고했어요!</div>

        {/* 학습한 단어 */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>오늘 학습한 단어</div>
          {summary?.word_usage_details.map((detail, idx) => (
            <div key={idx} style={styles.wordResult}>
              <div style={styles.wordResultHeader}>
                ✅ {detail.word}
              </div>
              <div style={styles.wordResultSentence}>
                "{detail.used_in}"
              </div>
              <div style={styles.wordResultFeedback}>
                {detail.feedback}
              </div>
            </div>
          ))}
        </div>

        {/* 학습 통계 */}
        {summary && (
          <div style={styles.statsCard}>
            <div style={styles.sectionTitle}>📊 학습 통계</div>
            <div style={styles.statRow}>
              <span>소요 시간</span>
              <span style={styles.statValue}>
                {formatDuration(summary.duration_seconds)}
              </span>
            </div>
            <div style={styles.statRow}>
              <span>메시지 수</span>
              <span style={styles.statValue}>{summary.message_count}개</span>
            </div>
            {(user?.streak_days ?? 0) > 0 && (
              <div style={styles.statRow}>
                <span>연속 학습</span>
                <span style={styles.statValue}>
                  {user?.streak_days}일째 🔥
                </span>
              </div>
            )}
          </div>
        )}

        {/* 액션 버튼 */}
        <div style={styles.actions}>
          <button onClick={handleNewSession} style={styles.primaryButton}>
            한 번 더 학습하기
          </button>
          <button
            onClick={() => (window.location.href = '/')}
            style={styles.secondaryButton}
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: '12px 16px',
    borderBottom: '1px solid #E5E8EB',
  },
  headerTitle: {
    fontSize: '17px',
    fontWeight: 700,
  },
  content: {
    padding: '24px 16px',
  },
  celebrationEmoji: {
    fontSize: '48px',
    textAlign: 'center' as const,
    marginBottom: '8px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 800,
    textAlign: 'center' as const,
    marginBottom: '24px',
    color: '#333D4B',
  },
  section: {
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 700,
    marginBottom: '12px',
    color: '#333D4B',
  },
  wordResult: {
    padding: '14px',
    backgroundColor: '#F5F6F8',
    borderRadius: '12px',
    marginBottom: '8px',
  },
  wordResultHeader: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#2E7D32',
    marginBottom: '6px',
  },
  wordResultSentence: {
    fontSize: '14px',
    color: '#333D4B',
    fontStyle: 'italic',
    marginBottom: '4px',
  },
  wordResultFeedback: {
    fontSize: '13px',
    color: '#6B7684',
  },
  statsCard: {
    padding: '16px',
    backgroundColor: '#F5F6F8',
    borderRadius: '16px',
    marginBottom: '24px',
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    fontSize: '14px',
    color: '#6B7684',
  },
  statValue: {
    fontWeight: 700,
    color: '#333D4B',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  primaryButton: {
    width: '100%',
    height: '52px',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: '#3182F6',
    color: '#FFFFFF',
    fontSize: '17px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  secondaryButton: {
    width: '100%',
    height: '48px',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: '#F5F6F8',
    color: '#6B7684',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
  },
}
