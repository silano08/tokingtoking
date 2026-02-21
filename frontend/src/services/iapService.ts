import api from './api'
import type { SubscriptionStatus } from '@/types/subscription'

export const iapService = {
  async verifyPurchase(
    orderId: string,
    productId: string
  ): Promise<{ verified: boolean; subscription: any }> {
    const { data } = await api.post('/iap/verify', {
      order_id: orderId,
      product_id: productId,
    })
    return data
  },

  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    const { data } = await api.get('/iap/subscription')
    return data
  },
}
