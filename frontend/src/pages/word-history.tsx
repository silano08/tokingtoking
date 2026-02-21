import React, { useEffect, useState } from 'react'
import api from '@/services/api'
import { colors, spacing, radius, font, headerStyle, backBtnStyle, headerTitleStyle } from '@/styles/tokens'

interface WordEntry {
  id: string
  word: string
  pos: string
  definition_ko: string
}

interface DayHistory {
  date: string
  session_count: number
  words: WordEntry[]
}

export default function WordHistoryPage() {
  const [history, setHistory] = useState<DayHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [totalDays, setTotalDays] = useState(0)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      const { data } = await api.get('/history/word-history')
      setHistory(data.history)
      setTotalDays(data.total_days)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    const month = d.getMonth() + 1
    const day = d.getDate()
    const weekdays = ['일', '월', '화', '수', '목', '금', '토']
    const weekday = weekdays[d.getDay()]
    return { display: `${month}월 ${day}일 (${weekday})`, isToday: dateStr === new Date().toISOString().split('T')[0] }
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={headerStyle}>
        <button onClick={() => window.history.back()} style={backBtnStyle}>
          &#8592;
        </button>
        <span style={headerTitleStyle}>단어 학습 기록</span>
      </div>

      <div style={styles.content}>
        {/* Summary */}
        <div style={styles.summary}>
          <div style={styles.summaryNumber}>{totalDays}</div>
          <div style={styles.summaryLabel}>일 학습</div>
        </div>

        {loading ? (
          <div style={styles.loadingContainer}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={styles.skeleton} />
            ))}
          </div>
        ) : history.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyTitle}>아직 학습 기록이 없어요</div>
            <div style={styles.emptyDesc}>첫 학습을 시작해보세요!</div>
            <button
              onClick={() => (window.location.href = '/')}
              style={styles.emptyBtn}
            >
              학습 시작하기
            </button>
          </div>
        ) : (
          <div style={styles.timeline}>
            {history.map((day, dayIdx) => {
              const { display, isToday } = formatDate(day.date)
              return (
                <div key={day.date} style={styles.dayBlock}>
                  {/* Timeline dot and line */}
                  <div style={styles.timelineGutter}>
                    <div style={{
                      ...styles.timelineDot,
                      backgroundColor: isToday ? colors.blue : colors.border,
                    }} />
                    {dayIdx < history.length - 1 && (
                      <div style={styles.timelineLine} />
                    )}
                  </div>

                  {/* Day content */}
                  <div style={styles.dayContent}>
                    <div style={styles.dayHeader}>
                      <span style={{
                        ...styles.dayDate,
                        color: isToday ? colors.blue : colors.text,
                      }}>
                        {isToday ? '오늘' : display}
                      </span>
                      <span style={styles.daySessionCount}>
                        {day.session_count}회 학습
                      </span>
                    </div>

                    <div style={styles.wordGrid}>
                      {day.words.map((word) => (
                        <div key={word.id} style={styles.wordItem}>
                          <div style={styles.wordItemHeader}>
                            <span style={styles.wordItemText}>{word.word}</span>
                            <span style={styles.wordItemPos}>{word.pos}</span>
                          </div>
                          <div style={styles.wordItemDef}>{word.definition_ko}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
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
    padding: `${spacing.lg}px`,
  },
  // Summary
  summary: {
    display: 'flex',
    alignItems: 'baseline',
    gap: `${spacing.xs}px`,
    marginBottom: `${spacing.xxl}px`,
    padding: `${spacing.lg}px`,
    backgroundColor: colors.blueLight,
    borderRadius: `${radius.lg}px`,
  },
  summaryNumber: {
    fontSize: '32px',
    fontWeight: 800,
    color: colors.blue,
  },
  summaryLabel: {
    ...font.bodyBold,
    color: colors.blueDark,
  },
  // Loading
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${spacing.md}px`,
  },
  skeleton: {
    height: '80px',
    borderRadius: `${radius.md}px`,
    backgroundColor: colors.bg,
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  // Empty
  emptyState: {
    textAlign: 'center',
    padding: `${spacing.xxxxl}px ${spacing.xxl}px`,
  },
  emptyTitle: {
    ...font.h3,
    color: colors.text,
    marginBottom: `${spacing.sm}px`,
  },
  emptyDesc: {
    ...font.body,
    color: colors.textSecondary,
    marginBottom: `${spacing.xxl}px`,
  },
  emptyBtn: {
    padding: `${spacing.md}px ${spacing.xxl}px`,
    borderRadius: `${radius.lg}px`,
    border: 'none',
    backgroundColor: colors.blue,
    color: colors.white,
    ...font.bodyBold,
    cursor: 'pointer',
  },
  // Timeline
  timeline: {
    display: 'flex',
    flexDirection: 'column',
  },
  dayBlock: {
    display: 'flex',
    gap: `${spacing.md}px`,
  },
  timelineGutter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '20px',
    flexShrink: 0,
  },
  timelineDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    flexShrink: 0,
    marginTop: '4px',
  },
  timelineLine: {
    width: '2px',
    flex: 1,
    backgroundColor: colors.border,
    marginTop: `${spacing.xs}px`,
    marginBottom: `${spacing.xs}px`,
  },
  dayContent: {
    flex: 1,
    paddingBottom: `${spacing.xxl}px`,
  },
  dayHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: `${spacing.md}px`,
  },
  dayDate: {
    ...font.bodyBold,
    fontWeight: 700,
  },
  daySessionCount: {
    ...font.small,
    color: colors.textTertiary,
  },
  wordGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${spacing.sm}px`,
  },
  wordItem: {
    padding: `${spacing.md}px`,
    backgroundColor: colors.bg,
    borderRadius: `${radius.lg}px`,
  },
  wordItemHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: `${spacing.sm}px`,
    marginBottom: '2px',
  },
  wordItemText: {
    ...font.bodyBold,
    fontWeight: 700,
    color: colors.text,
  },
  wordItemPos: {
    ...font.small,
    color: colors.textTertiary,
    backgroundColor: colors.white,
    padding: `0 ${spacing.sm}px`,
    borderRadius: `${radius.sm}px`,
  },
  wordItemDef: {
    ...font.caption,
    color: colors.textSecondary,
  },
}
