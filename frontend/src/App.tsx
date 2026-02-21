import React, { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { authService } from '@/services/authService'

// Pages
import IndexPage from '@/pages/index'
import LevelTestPage from '@/pages/level-test'
import ChatPage from '@/pages/chat'
import SpeakingPage from '@/pages/speaking'
import SessionResultPage from '@/pages/session-result'
import SubscribePage from '@/pages/subscribe'
import MyPage from '@/pages/mypage'
import WordHistoryPage from '@/pages/word-history'
import DevPanel from '@/components/DevPanel'
import ToastContainer from '@/components/Toast'

function getRoute(): string {
  const path = window.location.pathname
  return path === '' ? '/' : path
}

export default function App() {
  const route = getRoute()
  const { isLoggedIn, setUser } = useAuthStore()
  const [restoring, setRestoring] = useState(true)

  // localStorage에 토큰이 있으면 세션 복원
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token && !isLoggedIn) {
      authService
        .getMe()
        .then((user) => setUser(user))
        .catch(() => localStorage.removeItem('access_token'))
        .finally(() => setRestoring(false))
    } else {
      setRestoring(false)
    }
  }, [])

  // 세션 복원 중이면 스플래시
  if (restoring) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <span style={{ color: '#8B95A1', fontSize: '14px' }}>로딩 중...</span>
      </div>
    )
  }

  const pageMap: Record<string, React.ReactNode> = {
    '/': <IndexPage />,
    '/level-test': <LevelTestPage />,
    '/chat': <ChatPage />,
    '/speaking': <SpeakingPage />,
    '/session-result': <SessionResultPage />,
    '/subscribe': <SubscribePage />,
    '/mypage': <MyPage />,
    '/word-history': <WordHistoryPage />,
  }

  return (
    <>
      {pageMap[route] ?? <IndexPage />}
      <ToastContainer />
      <DevPanel />
    </>
  )
}
