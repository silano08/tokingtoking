import React from 'react'
import type { TargetWord } from '@/types/chat'

interface WordStatusBarProps {
  targetWords: TargetWord[]
  wordsUsed: Record<string, boolean>
}

export const WordStatusBar: React.FC<WordStatusBarProps> = ({
  targetWords,
  wordsUsed,
}) => {
  return (
    <div style={styles.container}>
      <div style={styles.label}>오늘의 단어</div>
      <div style={styles.wordList}>
        {targetWords.map((word) => {
          const isUsed = wordsUsed[word.word] ?? false
          return (
            <div
              key={word.id}
              style={{
                ...styles.wordChip,
                ...(isUsed ? styles.wordUsed : styles.wordPending),
              }}
            >
              <span style={styles.checkMark}>{isUsed ? '✅' : '☐'}</span>
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
    padding: '12px 16px',
    backgroundColor: '#F5F6F8',
    borderBottom: '1px solid #E5E8EB',
  },
  label: {
    fontSize: '12px',
    color: '#6B7684',
    marginBottom: '8px',
    fontWeight: 600,
  },
  wordList: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  wordChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    borderRadius: '16px',
    fontSize: '14px',
    fontWeight: 500,
  },
  wordUsed: {
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
  },
  wordPending: {
    backgroundColor: '#FFFFFF',
    color: '#333D4B',
    border: '1px solid #E5E8EB',
  },
  checkMark: {
    fontSize: '14px',
  },
  wordText: {
    fontSize: '14px',
  },
}
