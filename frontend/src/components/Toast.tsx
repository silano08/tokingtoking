import React from 'react'
import { useToastStore, type ToastType } from '@/store/toastStore'
import { colors, spacing, radius, font } from '@/styles/tokens'

const BG: Record<ToastType, string> = {
  info: colors.text,
  success: colors.greenDark,
  error: colors.red,
  premium: `linear-gradient(135deg, #6366F1, ${colors.purple})`,
}

const LABELS: Record<ToastType, string> = {
  info: 'i',
  success: '\u2713',
  error: '!',
  premium: '\u2605',
}

export default function ToastContainer() {
  const { toasts, dismiss } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div style={styles.container}>
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            ...styles.toast,
            background: BG[t.type],
          }}
          onClick={() => !t.action && dismiss(t.id)}
        >
          <div style={styles.content}>
            <span style={styles.iconCircle}>{LABELS[t.type]}</span>
            <span style={styles.message}>{t.message}</span>
          </div>
          {t.action && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                t.action!.onClick()
                dismiss(t.id)
              }}
              style={styles.actionBtn}
            >
              {t.action.label}
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'fixed',
    top: `${spacing.lg}px`,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 10000,
    display: 'flex',
    flexDirection: 'column',
    gap: `${spacing.sm}px`,
    width: '90%',
    maxWidth: '360px',
  },
  toast: {
    borderRadius: `${radius.lg}px`,
    padding: `14px ${spacing.lg}px`,
    color: colors.textOnPrimary,
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
    animation: 'slideDown 0.3s ease-out',
    cursor: 'pointer',
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    gap: `${spacing.sm}px`,
  },
  iconCircle: {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255,255,255,0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 800,
    flexShrink: 0,
  },
  message: {
    ...font.caption,
    fontWeight: 500,
    lineHeight: '1.4',
    flex: 1,
    color: 'inherit',
  },
  actionBtn: {
    marginTop: `${spacing.sm}px`,
    width: '100%',
    padding: `${spacing.sm}px`,
    borderRadius: `${radius.sm}px`,
    border: 'none',
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: colors.textOnPrimary,
    ...font.caption,
    fontWeight: 700,
    cursor: 'pointer',
  },
}
