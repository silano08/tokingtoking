import React, { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import api from '@/services/api'

const LEVEL_LABELS: Record<string, string> = {
  beginner: '초급',
  intermediate: '중급',
  advanced: '고급',
}

interface Stats {
  level: string
  total_sessions: number
  completed_sessions: number
  streak_days: number
  last_study_date: string | null
}

export default function MyPage() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const { data } = await api.get('/history/stats')
      setStats(data)
    } catch {
      // 에러 무시
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button onClick={() => window.history.back()} style={styles.backButton}>
          ←
        </button>
        <span style={styles.headerTitle}>학습 기록</span>
      </div>

      <div style={styles.content}>
        {/* 레벨 카드 */}
        <div style={styles.levelCard}>
          <div style={styles.levelLabel}>현재 레벨</div>
          <div style={styles.levelValue}>
            {LEVEL_LABELS[stats?.level ?? user?.level ?? 'beginner']}
          </div>
          <button
            onClick={() => (window.location.href = '/level-test')}
            style={styles.retestButton}
          >
            레벨 재측정
          </button>
        </div>

        {/* 통계 */}
        {stats && (
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{stats.total_sessions}</div>
              <div style={styles.statLabel}>총 학습</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{stats.completed_sessions}</div>
              <div style={styles.statLabel}>완료</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>
                {stats.streak_days > 0 ? `${stats.streak_days}일 🔥` : '0일'}
              </div>
              <div style={styles.statLabel}>연속 학습</div>
            </div>
          </div>
        )}

        {/* 구독 상태 */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>구독 상태</div>
          <div style={styles.subscriptionCard}>
            {user?.is_premium ? (
              <>
                <div style={styles.premiumBadge}>Premium ✅</div>
                <div style={styles.premiumDesc}>스피킹 학습 이용 가능</div>
              </>
            ) : (
              <>
                <div style={styles.freeBadge}>무료 플랜</div>
                <div style={styles.premiumDesc}>채팅 학습만 이용 가능</div>
                <button
                  onClick={() => (window.location.href = '/subscribe')}
                  style={styles.upgradeButton}
                >
                  Premium 시작하기
                </button>
              </>
            )}
          </div>
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
    fontSize: '17px',
    fontWeight: 700,
    marginLeft: '8px',
  },
  content: {
    padding: '16px',
  },
  levelCard: {
    padding: '24px',
    backgroundColor: '#3182F6',
    borderRadius: '16px',
    color: '#FFFFFF',
    textAlign: 'center' as const,
    marginBottom: '16px',
  },
  levelLabel: {
    fontSize: '13px',
    opacity: 0.8,
    marginBottom: '4px',
  },
  levelValue: {
    fontSize: '28px',
    fontWeight: 800,
    marginBottom: '12px',
  },
  retestButton: {
    padding: '8px 20px',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.5)',
    backgroundColor: 'transparent',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '8px',
    marginBottom: '24px',
  },
  statCard: {
    padding: '16px',
    backgroundColor: '#F5F6F8',
    borderRadius: '12px',
    textAlign: 'center' as const,
  },
  statValue: {
    fontSize: '20px',
    fontWeight: 800,
    color: '#333D4B',
    marginBottom: '4px',
  },
  statLabel: {
    fontSize: '12px',
    color: '#8B95A1',
  },
  section: {
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 700,
    marginBottom: '12px',
  },
  subscriptionCard: {
    padding: '20px',
    backgroundColor: '#F5F6F8',
    borderRadius: '16px',
  },
  premiumBadge: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#2E7D32',
    marginBottom: '4px',
  },
  freeBadge: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#6B7684',
    marginBottom: '4px',
  },
  premiumDesc: {
    fontSize: '14px',
    color: '#6B7684',
    marginBottom: '12px',
  },
  upgradeButton: {
    width: '100%',
    height: '44px',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: '#3182F6',
    color: '#FFFFFF',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
  },
}
