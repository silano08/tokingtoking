import React, { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { vocabService } from '@/services/vocabService'
import { toast } from '@/store/toastStore'
import api from '@/services/api'
import type { VocabWord } from '@/types/vocab'
import { colors, spacing, radius, font } from '@/styles/tokens'

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

const FREE_DAILY_LIMIT = 3

export default function HomePage() {
  const { user, isLoggedIn, isNewUser } = useAuthStore()
  const [todayWords, setTodayWords] = useState<VocabWord[]>([])
  const [isLoadingWords, setIsLoadingWords] = useState(false)
  const [todaySessionCount, setTodaySessionCount] = useState(0)

  useEffect(() => {
    if (isLoggedIn && !isNewUser) {
      loadTodayWords()
      loadTodaySessionCount()
    }
  }, [isLoggedIn, isNewUser])

  const loadTodayWords = async () => {
    setIsLoadingWords(true)
    try {
      const words = await vocabService.getTodayWords(3)
      setTodayWords(words)
    } catch {
      // silently fail
    } finally {
      setIsLoadingWords(false)
    }
  }

  const loadTodaySessionCount = async () => {
    try {
      const { data } = await api.get('/history/stats')
      setTodaySessionCount(data.today_sessions ?? 0)
    } catch {
      // silently fail
    }
  }

  const handleLogin = async () => {
    try {
      toast.info('토스 로그인은 앱인토스 환경에서만 동작합니다.')
    } catch {
      toast.error('로그인에 실패했습니다.')
    }
  }

  const remaining = Math.max(0, FREE_DAILY_LIMIT - todaySessionCount)
  const isLimitReached = !user?.is_premium && remaining <= 0

  const handleStartChat = () => {
    if (todayWords.length < 3) return
    if (isLimitReached) {
      toast.premium('오늘의 무료 학습을 모두 사용했어요. 내일 다시 만나요!')
      return
    }
    const wordIds = todayWords.map((w) => w.id).join(',')
    window.location.href = `/chat?words=${wordIds}`
  }

  const handleStartSpeaking = () => {
    if (!user?.is_premium) {
      window.location.href = '/subscribe'
      return
    }
    if (todayWords.length < 3) return
    const wordIds = todayWords.map((w) => w.id).join(',')
    window.location.href = `/speaking?words=${wordIds}`
  }

  // Login screen
  if (!isLoggedIn) {
    return (
      <div style={styles.page}>
        <div style={styles.hero}>
          <div style={styles.logoCircle}>T</div>
          <h1 style={styles.heroTitle}>TokingToking</h1>
          <p style={styles.heroSubtitle}>AI와 대화하며 영어 단어를 마스터하세요</p>
          <button onClick={handleLogin} style={styles.loginButton}>
            시작하기
          </button>
        </div>
      </div>
    )
  }

  if (isNewUser) {
    window.location.href = '/level-test'
    return null
  }

  const progressPercent = Math.min(
    100,
    (todaySessionCount / FREE_DAILY_LIMIT) * 100
  )

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.levelPill}>
            {LEVEL_LABELS[user?.level ?? 'beginner']}
          </div>
        </div>
        <div style={styles.headerRight}>
          {(user?.streak_days ?? 0) > 0 && (
            <div style={styles.streakBadge}>
              <span style={styles.streakFire}>&#9632;</span>
              <span style={styles.streakCount}>{user?.streak_days}</span>
            </div>
          )}
          <button
            onClick={() => (window.location.href = '/mypage')}
            style={styles.profileBtn}
          >
            MY
          </button>
        </div>
      </div>

      {/* Daily Progress */}
      <div style={styles.progressSection}>
        <div style={styles.progressHeader}>
          <span style={styles.progressLabel}>오늘의 학습</span>
          <span style={styles.progressCount}>
            {todaySessionCount} / {FREE_DAILY_LIMIT}
          </span>
        </div>
        <div style={styles.progressTrack}>
          <div
            style={{
              ...styles.progressFill,
              width: `${progressPercent}%`,
            }}
          />
        </div>
      </div>

      {/* Today's Words */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>오늘의 단어</div>
        {isLoadingWords ? (
          <div style={styles.loadingCards}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={styles.skeletonCard} />
            ))}
          </div>
        ) : (
          <div style={styles.wordCards}>
            {todayWords.map((word, idx) => (
              <div
                key={word.id}
                style={{
                  ...styles.wordCard,
                  animationDelay: `${idx * 0.1}s`,
                }}
              >
                <div style={styles.wordText}>{word.word}</div>
                <div style={styles.wordPos}>{word.pos}</div>
                <div style={styles.wordDef}>{word.definition_ko}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={styles.actions}>
        <button
          onClick={handleStartChat}
          disabled={todayWords.length < 3}
          style={{
            ...styles.chatBtn,
            opacity: isLimitReached ? 0.4 : 1,
          }}
        >
          <span style={styles.btnLabel}>채팅으로 학습하기</span>
          {!user?.is_premium && (
            <span style={styles.btnSub}>
              {isLimitReached ? '오늘 학습 완료' : `오늘 ${remaining}회 남음`}
            </span>
          )}
        </button>

        <button
          onClick={handleStartSpeaking}
          disabled={todayWords.length < 3}
          style={styles.speakBtn}
        >
          <span>스피킹으로 학습하기</span>
          {!user?.is_premium && (
            <span style={styles.premiumTag}>PRO</span>
          )}
        </button>

        <button
          onClick={() => (window.location.href = '/word-history')}
          style={styles.historyBtn}
        >
          단어 학습 기록
        </button>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: colors.white,
    paddingBottom: `${spacing.xxxl}px`,
  },
  // Hero (login)
  hero: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: `0 ${spacing.xxl}px`,
    textAlign: 'center',
    background: `linear-gradient(180deg, ${colors.blueLight} 0%, ${colors.white} 60%)`,
  },
  logoCircle: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: colors.blue,
    color: colors.white,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '36px',
    fontWeight: 800,
    marginBottom: `${spacing.xl}px`,
  },
  heroTitle: {
    ...font.h1,
    color: colors.text,
    marginBottom: `${spacing.sm}px`,
  },
  heroSubtitle: {
    ...font.body,
    color: colors.textSecondary,
    marginBottom: `${spacing.xxxl}px`,
  },
  loginButton: {
    width: '100%',
    maxWidth: '320px',
    height: '56px',
    borderRadius: `${radius.lg}px`,
    border: 'none',
    backgroundColor: colors.blue,
    color: colors.textOnPrimary,
    ...font.h3,
    cursor: 'pointer',
  },
  // Header
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '56px',
    padding: `0 ${spacing.lg}px`,
    borderBottom: `1px solid ${colors.border}`,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: `${spacing.sm}px`,
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: `${spacing.md}px`,
  },
  levelPill: {
    padding: `${spacing.xs}px ${spacing.md}px`,
    borderRadius: `${radius.full}px`,
    backgroundColor: colors.blueLight,
    color: colors.blueDark,
    ...font.caption,
    fontWeight: 700,
  },
  streakBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: `${spacing.xs}px ${spacing.sm}px`,
    borderRadius: `${radius.full}px`,
    backgroundColor: colors.orangeLight,
    animation: 'streakGlow 2s ease-in-out infinite',
  },
  streakFire: {
    color: colors.orange,
    fontSize: '14px',
  },
  streakCount: {
    ...font.caption,
    fontWeight: 800,
    color: colors.orange,
  },
  profileBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: colors.bg,
    color: colors.textSecondary,
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Progress
  progressSection: {
    padding: `${spacing.lg}px ${spacing.lg}px ${spacing.sm}px`,
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: `${spacing.sm}px`,
  },
  progressLabel: {
    ...font.caption,
    color: colors.textSecondary,
  },
  progressCount: {
    ...font.caption,
    fontWeight: 700,
    color: colors.text,
  },
  progressTrack: {
    height: '8px',
    backgroundColor: colors.bg,
    borderRadius: `${radius.full}px`,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.blue,
    borderRadius: `${radius.full}px`,
    transition: 'width 0.6s ease',
    animation: 'progressFill 0.8s ease-out',
  },
  // Section
  section: {
    padding: `${spacing.xl}px ${spacing.lg}px`,
  },
  sectionTitle: {
    ...font.h3,
    color: colors.text,
    marginBottom: `${spacing.md}px`,
  },
  loadingCards: {
    display: 'flex',
    gap: `${spacing.sm}px`,
  },
  skeletonCard: {
    flex: 1,
    height: '100px',
    borderRadius: `${radius.lg}px`,
    backgroundColor: colors.bg,
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  wordCards: {
    display: 'flex',
    gap: `${spacing.sm}px`,
  },
  wordCard: {
    flex: 1,
    padding: `${spacing.lg}px ${spacing.md}px`,
    backgroundColor: colors.white,
    borderRadius: `${radius.lg}px`,
    textAlign: 'center',
    border: `1px solid ${colors.border}`,
    animation: 'slideUp 0.4s ease-out both',
  },
  wordText: {
    ...font.bodyBold,
    fontWeight: 700,
    color: colors.text,
    marginBottom: '2px',
  },
  wordPos: {
    ...font.small,
    color: colors.textTertiary,
    marginBottom: `${spacing.xs}px`,
  },
  wordDef: {
    ...font.caption,
    color: colors.textSecondary,
  },
  // Actions
  actions: {
    padding: `0 ${spacing.lg}px`,
    display: 'flex',
    flexDirection: 'column',
    gap: `${spacing.md}px`,
  },
  chatBtn: {
    width: '100%',
    height: '56px',
    borderRadius: `${radius.lg}px`,
    border: 'none',
    backgroundColor: colors.blue,
    color: colors.textOnPrimary,
    ...font.h3,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2px',
  },
  btnLabel: {
    ...font.h3,
    color: 'inherit',
  },
  btnSub: {
    ...font.small,
    opacity: 0.85,
    color: 'inherit',
  },
  speakBtn: {
    width: '100%',
    height: '52px',
    borderRadius: `${radius.lg}px`,
    border: 'none',
    backgroundColor: colors.bg,
    color: colors.text,
    ...font.bodyBold,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: `${spacing.sm}px`,
  },
  premiumTag: {
    ...font.small,
    fontWeight: 700,
    color: colors.purple,
    backgroundColor: colors.purpleLight,
    padding: `2px ${spacing.sm}px`,
    borderRadius: `${radius.sm}px`,
  },
  historyBtn: {
    width: '100%',
    height: '48px',
    borderRadius: `${radius.lg}px`,
    border: 'none',
    backgroundColor: 'transparent',
    color: colors.textSecondary,
    ...font.bodyBold,
    cursor: 'pointer',
  },
}
