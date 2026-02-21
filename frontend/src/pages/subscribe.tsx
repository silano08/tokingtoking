import React, { useState } from 'react'
import { useAuthStore } from '@/store/authStore'

// 앱인토스 IAP SDK
// import { IAP } from '@apps-in-toss/web-framework'

interface Product {
  id: string
  name: string
  price: string
  description: string
  badge?: string
}

const PRODUCTS: Product[] = [
  {
    id: 'monthly_premium',
    name: '월간 구독',
    price: '₩4,900/월',
    description: '스피킹 학습 + AI 발음 피드백 무제한',
  },
  {
    id: 'yearly_premium',
    name: '연간 구독',
    price: '₩39,900/년',
    description: '스피킹 학습 + AI 발음 피드백 무제한',
    badge: '32% 할인',
  },
]

export default function SubscribePage() {
  const { user } = useAuthStore()
  const [selectedProduct, setSelectedProduct] = useState<string>('yearly_premium')
  const [isProcessing, setIsProcessing] = useState(false)

  if (user?.is_premium) {
    return (
      <div style={styles.page}>
        <div style={styles.header}>
          <button onClick={() => window.history.back()} style={styles.backButton}>
            ←
          </button>
          <span style={styles.headerTitle}>구독 관리</span>
        </div>
        <div style={styles.activeCard}>
          <div style={styles.activeEmoji}>✅</div>
          <div style={styles.activeTitle}>Premium 구독 중</div>
          <div style={styles.activeDesc}>스피킹 학습을 자유롭게 이용하세요!</div>
        </div>
      </div>
    )
  }

  const handlePurchase = async () => {
    if (isProcessing) return
    setIsProcessing(true)

    try {
      // 실제 앱인토스 환경:
      // const products = await IAP.getProductItemList()
      // const result = await IAP.createOneTimePurchaseOrder({ productId: selectedProduct })
      // if (result?.orderId) {
      //   await IAP.completeProductGrant({ orderId: result.orderId })
      //   const verification = await iapService.verifyPurchase(result.orderId, selectedProduct)
      //   if (verification.verified) {
      //     updateUser({ is_premium: true })
      //     window.location.href = '/'
      //   }
      // }

      alert('결제는 앱인토스 환경에서만 동작합니다.')
    } catch {
      alert('결제에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button onClick={() => window.history.back()} style={styles.backButton}>
          ←
        </button>
        <span style={styles.headerTitle}>Premium 구독</span>
      </div>

      <div style={styles.content}>
        <div style={styles.heroTitle}>🎤 스피킹 학습 시작하기</div>
        <div style={styles.heroDesc}>
          AI가 발음, 문법, 어휘 사용을 실시간으로 피드백해드려요
        </div>

        <div style={styles.features}>
          <div style={styles.feature}>✅ 음성으로 영어 대화 연습</div>
          <div style={styles.feature}>✅ AI 발음 피드백</div>
          <div style={styles.feature}>✅ 문법/어휘 사용 분석</div>
          <div style={styles.feature}>✅ 실시간 점수 확인</div>
        </div>

        <div style={styles.products}>
          {PRODUCTS.map((product) => (
            <button
              key={product.id}
              onClick={() => setSelectedProduct(product.id)}
              style={{
                ...styles.productCard,
                ...(selectedProduct === product.id ? styles.selectedProduct : {}),
              }}
            >
              {product.badge && (
                <div style={styles.badge}>{product.badge}</div>
              )}
              <div style={styles.productName}>{product.name}</div>
              <div style={styles.productPrice}>{product.price}</div>
              <div style={styles.productDesc}>{product.description}</div>
            </button>
          ))}
        </div>

        <button
          onClick={handlePurchase}
          disabled={isProcessing}
          style={styles.purchaseButton}
        >
          {isProcessing ? '처리 중...' : '구독 시작하기'}
        </button>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#FFFFFF',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid #E5E8EB',
  },
  backButton: {
    border: 'none',
    background: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '4px 8px',
  },
  headerTitle: {
    fontSize: '17px',
    fontWeight: 700,
    marginLeft: '8px',
  },
  content: {
    padding: '32px 16px',
  },
  heroTitle: {
    fontSize: '24px',
    fontWeight: 800,
    textAlign: 'center' as const,
    marginBottom: '8px',
  },
  heroDesc: {
    fontSize: '15px',
    color: '#6B7684',
    textAlign: 'center' as const,
    marginBottom: '24px',
  },
  features: {
    padding: '20px',
    backgroundColor: '#F5F6F8',
    borderRadius: '16px',
    marginBottom: '24px',
  },
  feature: {
    fontSize: '15px',
    color: '#333D4B',
    padding: '6px 0',
  },
  products: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '24px',
  },
  productCard: {
    position: 'relative' as const,
    padding: '20px',
    borderRadius: '16px',
    border: '2px solid #E5E8EB',
    backgroundColor: '#FFFFFF',
    cursor: 'pointer',
    textAlign: 'left' as const,
  },
  selectedProduct: {
    borderColor: '#3182F6',
    backgroundColor: '#EBF4FF',
  },
  badge: {
    position: 'absolute' as const,
    top: '-10px',
    right: '16px',
    padding: '4px 12px',
    backgroundColor: '#E53935',
    color: '#FFFFFF',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 700,
  },
  productName: {
    fontSize: '16px',
    fontWeight: 700,
    marginBottom: '4px',
  },
  productPrice: {
    fontSize: '20px',
    fontWeight: 800,
    color: '#3182F6',
    marginBottom: '4px',
  },
  productDesc: {
    fontSize: '13px',
    color: '#6B7684',
  },
  purchaseButton: {
    width: '100%',
    height: '56px',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: '#3182F6',
    color: '#FFFFFF',
    fontSize: '17px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  activeCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '48px 24px',
    textAlign: 'center' as const,
  },
  activeEmoji: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  activeTitle: {
    fontSize: '20px',
    fontWeight: 800,
    marginBottom: '8px',
  },
  activeDesc: {
    fontSize: '15px',
    color: '#6B7684',
  },
}
