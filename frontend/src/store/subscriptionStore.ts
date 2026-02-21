import { create } from 'zustand'
import type { Subscription } from '@/types/subscription'

interface SubscriptionState {
  isPremium: boolean
  subscription: Subscription | null
  setSubscription: (subscription: Subscription, isPremium: boolean) => void
  clearSubscription: () => void
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  isPremium: false,
  subscription: null,

  setSubscription: (subscription, isPremium) =>
    set({ subscription, isPremium }),

  clearSubscription: () =>
    set({ isPremium: false, subscription: null }),
}))
