import React from 'react'
import type { TargetWord } from '@/types/chat'
import { colors, spacing, radius, font } from '@/styles/tokens'

interface WordStatusBarProps {
  targetWords: TargetWord[]
  wordsUsed: Record<string, boolean>
}

export const WordStatusBar: React.FC<WordStatusBarProps> = ({
  targetWords,
  wordsUsed,
}) => {
  const usedCount = Object.values(wordsUsed).filter(Boolean).length
  const total = targetWords.length

  return (
    <div style={styles.container}>
      <div style={styles.headerRow}>
        <span style={styles.label}>목표 단어</span>
        <span style={styles.counter}>{usedCount} / {total}</span>
      </div>
      <div style={styles.wordList}>
        {targetWords.map((word) => {
          const isUsed = wordsUsed[word.word] ?? false
          return (
            <div
              key={word.id}
              style={{
                ...styles.chip,
                ...(isUsed ? styles.chipUsed : styles.chipPending),
              }}
            >
              <span style={{
                ...styles.checkIcon,
                ...(isUsed ? styles.checkDone : styles.checkEmpty),
              }}>
                {isUsed ? '\u2713' : ''}
              </span>
              <span style={styles.wordText}>{word.word}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: `${spacing.md}px ${spacing.lg}px`,
    backgroundColor: colors.white,
    borderBottom: `2px solid ${colors.border}`,
  },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: `${spacing.sm}px`,
  },
  label: {
    ...font.small,
    color: colors.textSecondary,
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
  },
  counter: {
    ...font.caption,
    fontWeight: 700,
    color: colors.green,
  },
  wordList: {
    display: 'flex',
    gap: `${spacing.sm}px`,
    flexWrap: 'wrap',
  },
  chip: {
    display: 'flex',
    alignItems: 'center',
    gap: `${spacing.xs}px`,
    padding: `${spacing.sm}px ${spacing.md}px`,
    borderRadius: `${radius.full}px`,
    ...font.caption,
    fontWeight: 600,
    transition: 'all 0.3s ease',
  },
  chipUsed: {
    backgroundColor: colors.greenBg,
    color: colors.greenDark,
    border: `2px solid ${colors.green}`,
  },
  chipPending: {
    backgroundColor: colors.white,
    color: colors.text,
    border: `2px solid ${colors.border}`,
  },
  checkIcon: {
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 700,
  },
  checkDone: {
    backgroundColor: colors.green,
    color: colors.white,
  },
  checkEmpty: {
    border: `2px solid ${colors.border}`,
    backgroundColor: colors.white,
  },
  wordText: {
    ...font.caption,
    fontWeight: 600,
  },
}
