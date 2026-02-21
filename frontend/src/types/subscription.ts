export interface Subscription {
  status: 'active' | 'expired' | 'cancelled' | 'refunded'
  product_id: string
  expires_at: string
}

export interface SubscriptionStatus {
  is_premium: boolean
  subscription: Subscription | null
}
