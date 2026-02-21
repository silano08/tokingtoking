import React from 'react'

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
        <div style={styles.label}>
          {label} {current} / {total}
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
      <div style={styles.percentage}>{percentage}%</div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '12px 16px',
  },
  label: {
    fontSize: '13px',
    color: '#6B7684',
    marginBottom: '6px',
  },
  track: {
    height: '8px',
    backgroundColor: '#E5E8EB',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#3182F6',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  percentage: {
    fontSize: '12px',
    color: '#6B7684',
    textAlign: 'right' as const,
    marginTop: '4px',
  },
}
