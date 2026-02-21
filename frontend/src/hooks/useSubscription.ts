import { useCallback } from 'react'
import { useSubscriptionStore } from '@/store/subscriptionStore'
import { useAuthStore } from '@/store/authStore'
import { iapService } from '@/services/iapService'

export function useSubscription() {
  const { isPremium, subscription, setSubscription, clearSubscription } = useSubscriptionStore()
  const { updateUser } = useAuthStore()

  const checkStatus = useCallback(async () => {
    const status = await iapService.getSubscriptionStatus()
    if (status.subscription) {
      setSubscription(status.subscription, status.is_premium)
    } else {
      clearSubscription()
    }
    updateUser({ is_premium: status.is_premium })
    return status
  }, [setSubscription, clearSubscription, updateUser])

  const verifyPurchase = useCallback(async (orderId: string, productId: string) => {
    const result = await iapService.verifyPurchase(orderId, productId)
    if (result.verified) {
      await checkStatus()
    }
    return result
  }, [checkStatus])

  return { isPremium, subscription, checkStatus, verifyPurchase }
}
