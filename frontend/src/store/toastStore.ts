import { create } from 'zustand'

export type ToastType = 'info' | 'success' | 'error' | 'premium'

interface Toast {
  id: number
  message: string
  type: ToastType
  action?: { label: string; onClick: () => void }
}

interface ToastState {
  toasts: Toast[]
  show: (message: string, type?: ToastType, action?: Toast['action']) => void
  dismiss: (id: number) => void
}

let nextId = 0
let lastMessage = ''
let lastTime = 0

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  show: (message, type = 'info', action) => {
    // 중복 방지: 같은 메시지가 1초 이내 반복되면 무시
    const now = Date.now()
    if (message === lastMessage && now - lastTime < 1000) return
    lastMessage = message
    lastTime = now

    const id = ++nextId
    set((s) => ({ toasts: [...s.toasts, { id, message, type, action }] }))
    // 자동 제거 (action이 있으면 더 오래 유지)
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
    }, action ? 5000 : 3000)
  },

  dismiss: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

// 편의 함수
export const toast = {
  info: (msg: string) => useToastStore.getState().show(msg, 'info'),
  success: (msg: string) => useToastStore.getState().show(msg, 'success'),
  error: (msg: string) => useToastStore.getState().show(msg, 'error'),
  premium: (msg: string, action?: { label: string; onClick: () => void }) =>
    useToastStore.getState().show(msg, 'premium', action),
}
