import React, { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import api from '@/services/api'
import { colors, spacing, radius, font, headerStyle, backBtnStyle, headerTitleStyle, primaryBtnStyle } from '@/styles/tokens'

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
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
      // silently fail
    }
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={headerStyle}>
        <button onClick={() => window.history.back()} style={backBtnStyle}>
          &#8592;
        </button>
        <span style={headerTitleStyle}>마이페이지</span>
      </div>

      <div style={styles.content}>
        {/* Level Card */}
        <div style={styles.levelCard}>
          <div style={styles.levelCircle}>
            <span style={styles.levelIcon}>
              {(stats?.level ?? user?.level ?? 'beginner').charAt(0).toUpperCase()}
            </span>
          </div>
          <div style={styles.levelInfo}>
            <div style={styles.levelLabel}>현재 레벨</div>
            <div style={styles.levelValue}>
              {LEVEL_LABELS[stats?.level ?? user?.level ?? 'beginner']}
            </div>
          </div>
          <button
            onClick={() => (window.location.href = '/level-test')}
            style={styles.retestBtn}
          >
            재측정
          </button>
        </div>

        {/* Stats */}
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
            <div style={{
              ...styles.statCard,
              ...(stats.streak_days > 0 ? styles.streakCard : {}),
            }}>
              <div style={{
                ...styles.statValue,
                color: stats.streak_days > 0 ? colors.orange : colors.text,
              }}>
                {stats.streak_days}일
              </div>
              <div style={styles.statLabel}>연속 학습</div>
            </div>
          </div>
        )}

        {/* Word History Link */}
        <div style={styles.section}>
          <button
            onClick={() => (window.location.href = '/word-history')}
            style={styles.historyLink}
          >
            <span style={styles.historyLinkText}>단어 학습 기록</span>
            <span style={styles.historyArrow}>&#8250;</span>
          </button>
        </div>

        {/* Subscription */}
        <div style={styles.section}>
          <div style={styles.sectionTitle}>구독 상태</div>
          <div style={styles.subCard}>
            {user?.is_premium ? (
              <>
                <div style={styles.proBadge}>PRO</div>
                <div style={styles.subTitle}>Premium 구독 중</div>
                <div style={styles.subDesc}>스피킹 학습 이용 가능</div>
              </>
            ) : (
              <>
                <div style={styles.freeBadge}>FREE</div>
                <div style={styles.subTitle}>무료 플랜</div>
                <div style={styles.subDesc}>채팅 학습만 이용 가능</div>
                <button
                  onClick={() => (window.location.href = '/subscribe')}
                  style={{ ...primaryBtnStyle, marginTop: `${spacing.md}px` }}
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
    backgroundColor: colors.white,
  },
  content: {
    padding: `${spacing.lg}px`,
  },
  // Level Card - TDS style
  levelCard: {
    display: 'flex',
    alignItems: 'center',
    gap: `${spacing.md}px`,
    padding: `${spacing.xl}px`,
    backgroundColor: colors.blueLight,
    borderRadius: `${radius.lg}px`,
    marginBottom: `${spacing.lg}px`,
  },
  levelCircle: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: colors.blue,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  levelIcon: {
    fontSize: '22px',
    fontWeight: 800,
    color: colors.white,
  },
  levelInfo: {
    flex: 1,
  },
  levelLabel: {
    ...font.small,
    color: colors.blueDark,
    marginBottom: '2px',
  },
  levelValue: {
    ...font.h2,
    color: colors.text,
  },
  retestBtn: {
    padding: `${spacing.sm}px ${spacing.lg}px`,
    borderRadius: `${radius.full}px`,
    border: 'none',
    backgroundColor: colors.white,
    color: colors.blue,
    ...font.caption,
    fontWeight: 700,
    cursor: 'pointer',
  },
  // Stats
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: `${spacing.sm}px`,
    marginBottom: `${spacing.xxl}px`,
  },
  statCard: {
    padding: `${spacing.lg}px ${spacing.sm}px`,
    backgroundColor: colors.bg,
    borderRadius: `${radius.lg}px`,
    textAlign: 'center',
  },
  streakCard: {
    backgroundColor: colors.orangeLight,
  },
  statValue: {
    ...font.h2,
    color: colors.text,
    marginBottom: '2px',
  },
  statLabel: {
    ...font.small,
    color: colors.textTertiary,
  },
  // Section
  section: {
    marginBottom: `${spacing.xxl}px`,
  },
  sectionTitle: {
    ...font.caption,
    fontWeight: 600,
    color: colors.textSecondary,
    marginBottom: `${spacing.md}px`,
  },
  // History link
  historyLink: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: `${spacing.lg}px`,
    borderRadius: `${radius.lg}px`,
    border: 'none',
    backgroundColor: colors.bg,
    cursor: 'pointer',
  },
  historyLinkText: {
    ...font.bodyBold,
    color: colors.text,
  },
  historyArrow: {
    fontSize: '20px',
    color: colors.textTertiary,
  },
  // Subscription
  subCard: {
    padding: `${spacing.xl}px`,
    backgroundColor: colors.bg,
    borderRadius: `${radius.lg}px`,
  },
  proBadge: {
    display: 'inline-block',
    padding: `${spacing.xs}px ${spacing.md}px`,
    backgroundColor: colors.blue,
    color: colors.white,
    borderRadius: `${radius.sm}px`,
    ...font.small,
    fontWeight: 800,
    marginBottom: `${spacing.sm}px`,
  },
  freeBadge: {
    display: 'inline-block',
    padding: `${spacing.xs}px ${spacing.md}px`,
    backgroundColor: colors.surface,
    color: colors.textSecondary,
    borderRadius: `${radius.sm}px`,
    ...font.small,
    fontWeight: 800,
    marginBottom: `${spacing.sm}px`,
  },
  subTitle: {
    ...font.bodyBold,
    fontWeight: 700,
    color: colors.text,
    marginBottom: '4px',
  },
  subDesc: {
    ...font.caption,
    color: colors.textSecondary,
  },
}
