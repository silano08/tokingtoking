import React, { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { vocabService } from '@/services/vocabService'
import type { VocabWord } from '@/types/vocab'

// 앱인토스 SDK는 실제 환경에서 import
// import { appLogin } from '@apps-in-toss/web-framework'

const LEVEL_LABELS: Record<string, string> = {
  beginner: '초급 (Beginner)',
  intermediate: '중급 (Intermediate)',
  advanced: '고급 (Advanced)',
}

export default function HomePage() {
  const { user, isLoggedIn, isNewUser } = useAuthStore()
  const [todayWords, setTodayWords] = useState<VocabWord[]>([])
  const [isLoadingWords, setIsLoadingWords] = useState(false)

  useEffect(() => {
    if (isLoggedIn && !isNewUser) {
      loadTodayWords()
    }
  }, [isLoggedIn, isNewUser])

  const loadTodayWords = async () => {
    setIsLoadingWords(true)
    try {
      const words = await vocabService.getRandomWords(3)
      setTodayWords(words)
    } catch {
      // 에러 처리
    } finally {
      setIsLoadingWords(false)
    }
  }

  const handleLogin = async () => {
    try {
      // 실제 앱인토스 환경:
      // const { authorizationCode, referrer } = await appLogin()
      // const result = await authService.login(authorizationCode, referrer)

      // 개발 환경 placeholder
      alert('토스 로그인은 앱인토스 환경에서만 동작합니다.')
    } catch {
      alert('로그인에 실패했습니다.')
    }
  }

  const handleStartChat = () => {
    if (todayWords.length < 3) return
    const wordIds = todayWords.map((w) => w.id).join(',')
    // 앱인토스 file-based routing
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

  if (!isLoggedIn) {
    return (
      <div style={styles.page}>
        <div style={styles.hero}>
          <h1 style={styles.title}>토킹토킹</h1>
          <p style={styles.subtitle}>AI와 대화하며 영어 단어를 익혀요</p>
          <button onClick={handleLogin} style={styles.loginButton}>
            토스로 시작하기
          </button>
        </div>
      </div>
    )
  }

  if (isNewUser) {
    window.location.href = '/level-test'
    return null
  }

  return (
    <div style={styles.page}>
      {/* 사용자 정보 */}
      <div style={styles.userCard}>
        <div style={styles.greeting}>👋 안녕하세요!</div>
        <div style={styles.levelBadge}>
          현재 레벨: {LEVEL_LABELS[user?.level ?? 'beginner']}
        </div>
        {(user?.streak_days ?? 0) > 0 && (
          <div style={styles.streak}>
            🔥 {user?.streak_days}일 연속 학습 중!
          </div>
        )}
      </div>

      {/* 오늘의 단어 */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>오늘의 단어</div>
        {isLoadingWords ? (
          <div style={styles.loading}>단어를 불러오는 중...</div>
        ) : (
          <div style={styles.wordCards}>
            {todayWords.map((word) => (
              <div key={word.id} style={styles.wordCard}>
                <div style={styles.word}>{word.word}</div>
                <div style={styles.pos}>{word.pos}</div>
                <div style={styles.definition}>{word.definition_ko}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 학습 시작 버튼 */}
      <div style={styles.actions}>
        <button
          onClick={handleStartChat}
          disabled={todayWords.length < 3}
          style={styles.chatButton}
        >
          💬 채팅으로 학습하기
          <span style={styles.freeLabel}>(무료)</span>
        </button>

        <button
          onClick={handleStartSpeaking}
          disabled={todayWords.length < 3}
          style={styles.speakingButton}
        >
          🎤 스피킹으로 학습하기
          <span style={styles.premiumLabel}>
            {user?.is_premium ? '(Premium)' : '🔒'}
          </span>
        </button>

        <button
          onClick={() => (window.location.href = '/mypage')}
          style={styles.historyButton}
        >
          📊 학습 기록 보기
        </button>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#FFFFFF',
    paddingBottom: '32px',
  },
  hero: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '80vh',
    padding: '0 24px',
    textAlign: 'center' as const,
  },
  title: {
    fontSize: '32px',
    fontWeight: 800,
    color: '#333D4B',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#6B7684',
    marginBottom: '32px',
  },
  loginButton: {
    width: '100%',
    maxWidth: '320px',
    height: '52px',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: '#3182F6',
    color: '#FFFFFF',
    fontSize: '17px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  userCard: {
    margin: '16px',
    padding: '20px',
    backgroundColor: '#F5F6F8',
    borderRadius: '16px',
  },
  greeting: {
    fontSize: '20px',
    fontWeight: 700,
    marginBottom: '8px',
  },
  levelBadge: {
    fontSize: '14px',
    color: '#3182F6',
    fontWeight: 600,
    marginBottom: '4px',
  },
  streak: {
    fontSize: '14px',
    color: '#E65100',
    fontWeight: 600,
  },
  section: {
    margin: '24px 16px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 700,
    marginBottom: '12px',
    color: '#333D4B',
  },
  loading: {
    textAlign: 'center' as const,
    color: '#6B7684',
    padding: '20px',
  },
  wordCards: {
    display: 'flex',
    gap: '8px',
  },
  wordCard: {
    flex: 1,
    padding: '16px 12px',
    backgroundColor: '#F5F6F8',
    borderRadius: '12px',
    textAlign: 'center' as const,
  },
  word: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#333D4B',
    marginBottom: '4px',
  },
  pos: {
    fontSize: '11px',
    color: '#8B95A1',
    marginBottom: '4px',
  },
  definition: {
    fontSize: '13px',
    color: '#6B7684',
  },
  actions: {
    padding: '0 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  chatButton: {
    width: '100%',
    height: '56px',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: '#3182F6',
    color: '#FFFFFF',
    fontSize: '17px',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  freeLabel: {
    fontSize: '13px',
    fontWeight: 400,
    opacity: 0.8,
  },
  speakingButton: {
    width: '100%',
    height: '56px',
    borderRadius: '12px',
    border: '2px solid #3182F6',
    backgroundColor: '#FFFFFF',
    color: '#3182F6',
    fontSize: '17px',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  premiumLabel: {
    fontSize: '13px',
    fontWeight: 400,
  },
  historyButton: {
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
