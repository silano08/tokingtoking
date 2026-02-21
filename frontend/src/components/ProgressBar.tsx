import React from 'react'
import { colors, spacing, radius, font } from '@/styles/tokens'

interface ProgressBarProps {
  current: number
  total: number
  label?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  label,
}) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0

  return (
    <div style={styles.container}>
      {label && (
        <div style={styles.header}>
          <span style={styles.label}>{label}</span>
          <span style={styles.counter}>{current} / {total}</span>
        </div>
      )}
      <div style={styles.track}>
        <div
          style={{
            ...styles.fill,
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: `${spacing.md}px ${spacing.lg}px`,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: `${spacing.sm}px`,
  },
  label: {
    ...font.caption,
    color: colors.textSecondary,
  },
  counter: {
    ...font.caption,
    fontWeight: 700,
    color: colors.green,
  },
  track: {
    height: '12px',
    backgroundColor: colors.surface,
    borderRadius: `${radius.full}px`,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.green,
    borderRadius: `${radius.full}px`,
    transition: 'width 0.4s ease',
    animation: 'progressFill 0.6s ease-out',
  },
}
