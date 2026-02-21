import React, { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import api from '@/services/api'

/**
 * 개발 전용 마스터 패널
 * - import.meta.env.DEV (Vite dev mode) 일 때만 렌더링
 * - 우측 하단 플로팅 버튼 → 확장 패널
 */
export default function DevPanel() {
  const { user, isLoggedIn, setUser, logout: storeLogout } = useAuthStore()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // 프로덕션에서는 렌더링하지 않음
  if (!import.meta.env.DEV) return null

  const handleDevLogin = async () => {
    setLoading(true)
    setMessage('')
    try {
      const { data } = await api.post('/auth/dev-login')
      localStorage.setItem('access_token', data.access_token)
      setUser(data.user, data.is_new_user)
      setMessage('로그인 성공!')
    } catch (e: any) {
      setMessage(`실패: ${e.response?.data?.detail || e.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    storeLogout()
    setMessage('로그아웃 완료')
  }

  const handleChangeLevel = async (level: string) => {
    if (!user) return
    try {
      await api.patch(`/auth/dev-update`, { level })
      const { data } = await api.get('/auth/me')
      setUser({ ...user, ...data })
      setMessage(`레벨 변경: ${level}`)
    } catch {
      setMessage('레벨 변경 실패')
    }
  }

  const handleTogglePremium = async () => {
    if (!user) return
    try {
      await api.patch(`/auth/dev-update`, { is_premium: !user.is_premium })
      const { data } = await api.get('/auth/me')
      setUser({ ...user, ...data })
      setMessage(`프리미엄: ${!user.is_premium ? 'ON' : 'OFF'}`)
    } catch {
      setMessage('프리미엄 변경 실패')
    }
  }

  const navigateTo = (path: string) => {
    window.location.href = path
  }

  return (
    <>
      {/* 플로팅 토글 버튼 */}
      <button onClick={() => setOpen(!open)} style={styles.fab}>
        {open ? '✕' : 'DEV'}
      </button>

      {/* 패널 */}
      {open && (
        <div style={styles.panel}>
          <div style={styles.header}>🛠 Dev Panel</div>

          {/* 로그인 상태 */}
          <div style={styles.statusRow}>
            <span style={styles.dot(isLoggedIn)} />
            {isLoggedIn ? `로그인됨 (${user?.level})` : '비로그인'}
          </div>

          {/* 액션 버튼들 */}
          {!isLoggedIn ? (
            <button onClick={handleDevLogin} disabled={loading} style={styles.btn}>
              {loading ? '로그인 중...' : '⚡ Dev 로그인'}
            </button>
          ) : (
            <>
              {/* 유저 정보 */}
              <div style={styles.info}>
                <div>ID: {user?.id?.slice(0, 8)}...</div>
                <div>레벨: {user?.level}</div>
                <div>프리미엄: {user?.is_premium ? '✅' : '❌'}</div>
                <div>세션: {user?.total_sessions}회</div>
              </div>

              {/* 레벨 변경 */}
              <div style={styles.row}>
                {['beginner', 'intermediate', 'advanced'].map((lv) => (
                  <button
                    key={lv}
                    onClick={() => handleChangeLevel(lv)}
                    style={{
                      ...styles.smallBtn,
                      backgroundColor: user?.level === lv ? '#3182F6' : '#E5E8EB',
                      color: user?.level === lv ? '#fff' : '#333',
                    }}
                  >
                    {lv.slice(0, 3)}
                  </button>
                ))}
              </div>

              {/* 프리미엄 토글 */}
              <button onClick={handleTogglePremium} style={styles.btn}>
                {user?.is_premium ? '💎 프리미엄 해제' : '💎 프리미엄 활성화'}
              </button>

              {/* 페이지 네비게이션 */}
              <div style={styles.navLabel}>페이지 이동</div>
              <div style={styles.row}>
                <button onClick={() => navigateTo('/')} style={styles.navBtn}>홈</button>
                <button onClick={() => navigateTo('/level-test')} style={styles.navBtn}>레벨</button>
                <button onClick={() => navigateTo('/mypage')} style={styles.navBtn}>MY</button>
              </div>

              {/* 로그아웃 */}
              <button onClick={handleLogout} style={styles.logoutBtn}>
                로그아웃
              </button>
            </>
          )}

          {/* 메시지 */}
          {message && <div style={styles.message}>{message}</div>}
        </div>
      )}
    </>
  )
}

const styles: Record<string, any> = {
  fab: {
    position: 'fixed' as const,
    bottom: '16px',
    right: '16px',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#FF6B35',
    color: '#fff',
    fontSize: '11px',
    fontWeight: 800,
    cursor: 'pointer',
    zIndex: 9999,
    boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  panel: {
    position: 'fixed' as const,
    bottom: '72px',
    right: '16px',
    width: '240px',
    backgroundColor: '#1A1A2E',
    borderRadius: '12px',
    padding: '14px',
    zIndex: 9998,
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    color: '#E0E0E0',
    fontSize: '12px',
  },
  header: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#fff',
    marginBottom: '10px',
    paddingBottom: '8px',
    borderBottom: '1px solid #333',
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '10px',
    fontSize: '12px',
  },
  dot: (active: boolean) => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: active ? '#4CAF50' : '#F44336',
    flexShrink: 0,
  }),
  info: {
    backgroundColor: '#16213E',
    borderRadius: '8px',
    padding: '8px',
    marginBottom: '8px',
    lineHeight: '1.6',
    fontSize: '11px',
  },
  btn: {
    width: '100%',
    padding: '8px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#3182F6',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: '6px',
  },
  row: {
    display: 'flex',
    gap: '4px',
    marginBottom: '8px',
  },
  smallBtn: {
    flex: 1,
    padding: '5px 0',
    borderRadius: '4px',
    border: 'none',
    fontSize: '11px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  navLabel: {
    fontSize: '10px',
    color: '#888',
    marginBottom: '4px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  navBtn: {
    flex: 1,
    padding: '5px 0',
    borderRadius: '4px',
    border: '1px solid #444',
    backgroundColor: 'transparent',
    color: '#ccc',
    fontSize: '11px',
    cursor: 'pointer',
  },
  logoutBtn: {
    width: '100%',
    padding: '6px',
    borderRadius: '6px',
    border: '1px solid #F44336',
    backgroundColor: 'transparent',
    color: '#F44336',
    fontSize: '11px',
    cursor: 'pointer',
    marginTop: '4px',
  },
  message: {
    marginTop: '8px',
    padding: '6px',
    backgroundColor: '#16213E',
    borderRadius: '4px',
    textAlign: 'center' as const,
    fontSize: '11px',
    color: '#4CAF50',
  },
}
