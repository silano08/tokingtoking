import React, { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/store/toastStore'
import { colors, spacing, radius, font, headerStyle, backBtnStyle, headerTitleStyle, primaryBtnStyle } from '@/styles/tokens'

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
    price: '\u20A94,900/월',
    description: '스피킹 학습 + AI 발음 피드백 무제한',
  },
  {
    id: 'yearly_premium',
    name: '연간 구독',
    price: '\u20A939,900/년',
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
        <div style={headerStyle}>
          <button onClick={() => window.history.back()} style={backBtnStyle}>
            &#8592;
          </button>
          <span style={headerTitleStyle}>구독 관리</span>
        </div>
        <div style={styles.activeCard}>
          <div style={styles.activeCircle}>
            <span style={styles.activeCheck}>&#10003;</span>
          </div>
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
      toast.info('결제는 앱인토스 환경에서만 동작합니다.')
    } catch {
      toast.error('결제에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={headerStyle}>
        <button onClick={() => window.history.back()} style={backBtnStyle}>
          &#8592;
        </button>
        <span style={headerTitleStyle}>Premium 구독</span>
      </div>

      <div style={styles.content}>
        <div style={styles.heroTitle}>스피킹 학습 시작하기</div>
        <div style={styles.heroDesc}>
          AI가 발음, 문법, 어휘 사용을 실시간으로 피드백합니다
        </div>

        {/* Features */}
        <div style={styles.features}>
          {['음성으로 영어 대화 연습', 'AI 발음 피드백', '문법/어휘 사용 분석', '실시간 점수 확인'].map(
            (feature, idx) => (
              <div key={idx} style={styles.featureRow}>
                <span style={styles.featureCheck}>&#10003;</span>
                <span style={styles.featureText}>{feature}</span>
              </div>
            )
          )}
        </div>

        {/* Products */}
        <div style={styles.products}>
          {PRODUCTS.map((product) => {
            const isSelected = selectedProduct === product.id
            return (
              <button
                key={product.id}
                onClick={() => setSelectedProduct(product.id)}
                style={{
                  ...styles.productCard,
                  ...(isSelected ? styles.productSelected : {}),
                }}
              >
                {product.badge && (
                  <div style={styles.badge}>{product.badge}</div>
                )}
                <div style={styles.productName}>{product.name}</div>
                <div style={styles.productPrice}>{product.price}</div>
                <div style={styles.productDesc}>{product.description}</div>
              </button>
            )
          })}
        </div>

        <button
          onClick={handlePurchase}
          disabled={isProcessing}
          style={primaryBtnStyle}
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
    backgroundColor: colors.white,
  },
  content: {
    padding: `${spacing.xxxl}px ${spacing.lg}px`,
  },
  heroTitle: {
    ...font.h1,
    textAlign: 'center',
    marginBottom: `${spacing.sm}px`,
    color: colors.text,
  },
  heroDesc: {
    ...font.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: `${spacing.xxl}px`,
  },
  features: {
    padding: `${spacing.xl}px`,
    backgroundColor: colors.bg,
    borderRadius: `${radius.lg}px`,
    marginBottom: `${spacing.xxl}px`,
  },
  featureRow: {
    display: 'flex',
    alignItems: 'center',
    gap: `${spacing.md}px`,
    padding: `${spacing.sm}px 0`,
  },
  featureCheck: {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    backgroundColor: colors.green,
    color: colors.white,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 800,
    flexShrink: 0,
  },
  featureText: {
    ...font.body,
    color: colors.text,
  },
  products: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${spacing.md}px`,
    marginBottom: `${spacing.xxl}px`,
  },
  productCard: {
    position: 'relative',
    padding: `${spacing.xl}px`,
    borderRadius: `${radius.lg}px`,
    border: `1px solid ${colors.border}`,
    backgroundColor: colors.white,
    cursor: 'pointer',
    textAlign: 'left',
  },
  productSelected: {
    borderColor: colors.blue,
    backgroundColor: colors.blueLight,
  },
  badge: {
    position: 'absolute',
    top: '-10px',
    right: `${spacing.lg}px`,
    padding: `${spacing.xs}px ${spacing.md}px`,
    backgroundColor: colors.red,
    color: colors.white,
    borderRadius: `${radius.full}px`,
    ...font.small,
    fontWeight: 700,
  },
  productName: {
    ...font.bodyBold,
    fontWeight: 700,
    marginBottom: '4px',
    color: colors.text,
  },
  productPrice: {
    ...font.h2,
    color: colors.blue,
    marginBottom: '4px',
  },
  productDesc: {
    ...font.caption,
    color: colors.textSecondary,
  },
  // Active premium
  activeCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: `${spacing.xxxxl}px ${spacing.xxl}px`,
    textAlign: 'center',
  },
  activeCircle: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: colors.green,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: `${spacing.lg}px`,
  },
  activeCheck: {
    fontSize: '28px',
    color: colors.white,
    fontWeight: 700,
  },
  activeTitle: {
    ...font.h2,
    color: colors.text,
    marginBottom: `${spacing.sm}px`,
  },
  activeDesc: {
    ...font.body,
    color: colors.textSecondary,
  },
}
