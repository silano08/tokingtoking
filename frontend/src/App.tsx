import React from 'react'

// Pages
import IndexPage from '@/pages/index'
import LevelTestPage from '@/pages/level-test'
import ChatPage from '@/pages/chat'
import SpeakingPage from '@/pages/speaking'
import SessionResultPage from '@/pages/session-result'
import SubscribePage from '@/pages/subscribe'
import MyPage from '@/pages/mypage'

function getRoute(): string {
  const path = window.location.pathname
  return path === '' ? '/' : path
}

export default function App() {
  const route = getRoute()

  const pageMap: Record<string, React.ReactNode> = {
    '/': <IndexPage />,
    '/level-test': <LevelTestPage />,
    '/chat': <ChatPage />,
    '/speaking': <SpeakingPage />,
    '/session-result': <SessionResultPage />,
    '/subscribe': <SubscribePage />,
    '/mypage': <MyPage />,
  }

  return pageMap[route] ?? <IndexPage />
}
