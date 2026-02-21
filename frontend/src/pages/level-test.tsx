import React, { useEffect, useState } from 'react'
import { ProgressBar } from '@/components/ProgressBar'
import { useAuthStore } from '@/store/authStore'
import { levelTestService } from '@/services/levelTestService'
import { toast } from '@/store/toastStore'
import type { LevelTestQuestion, LevelTestResult } from '@/types/levelTest'
import { colors, spacing, radius, font, shadows, primaryBtnStyle } from '@/styles/tokens'

export default function LevelTestPage() {
  const { updateUser } = useAuthStore()
  const [questions, setQuestions] = useState<LevelTestQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [result, setResult] = useState<LevelTestResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadQuestions()
  }, [])

  const loadQuestions = async () => {
    try {
      const data = await levelTestService.getQuestions()
      setQuestions(data.questions)
    } catch {
      toast.error('문제를 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectOption = (option: string) => {
    setSelectedOption(option)
  }

  const handleNext = () => {
    if (!selectedOption) return

    const question = questions[currentIndex]
    if (!question) return

    const newAnswers = { ...answers, [question.id]: selectedOption }
    setAnswers(newAnswers)
    setSelectedOption(null)

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      submitTest(newAnswers)
    }
  }

  const submitTest = async (finalAnswers: Record<string, string>) => {
    setIsLoading(true)
    try {
      const answerList = Object.entries(finalAnswers).map(([qId, answer]) => ({
        question_id: qId,
        answer,
      }))
      const testResult = await levelTestService.submitAnswers(answerList)
      setResult(testResult)
      updateUser({ level: testResult.assigned_level as any })
    } catch {
      toast.error('제출에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && questions.length === 0) {
    return (
      <div style={styles.center}>
        <div style={styles.loadingText}>문제를 불러오는 중...</div>
      </div>
    )
  }

  if (result) {
    return (
      <div style={styles.page}>
        <div style={styles.resultContainer}>
          <div style={styles.resultCircle}>
            <span style={styles.resultScore}>
              {result.score}/{result.total}
            </span>
          </div>
          <div style={styles.resultTitle}>레벨 테스트 완료!</div>
          <div style={styles.resultMessage}>{result.message}</div>
          <button
            onClick={() => (window.location.href = '/')}
            style={primaryBtnStyle}
          >
            학습 시작하기
          </button>
        </div>
      </div>
    )
  }

  const question = questions[currentIndex]

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.headerTitle}>레벨 테스트</span>
      </div>

      <ProgressBar current={currentIndex + 1} total={questions.length} label="Question" />

      {/* Question */}
      <div style={styles.questionArea}>
        <div style={styles.questionText}>{question?.question_text}</div>

        <div style={styles.options}>
          {question?.options?.map((option, idx) => {
            const isSelected = selectedOption === option
            return (
              <button
                key={idx}
                onClick={() => handleSelectOption(option)}
                style={{
                  ...styles.optionBtn,
                  ...(isSelected ? styles.optionSelected : {}),
                }}
              >
                <span style={{
                  ...styles.radio,
                  ...(isSelected ? styles.radioSelected : {}),
                }}>
                  {isSelected && <span style={styles.radioDot} />}
                </span>
                <span style={styles.optionText}>{option}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <button
          onClick={handleNext}
          disabled={!selectedOption || isLoading}
          style={primaryBtnStyle}
        >
          {currentIndex < questions.length - 1 ? '다음' : '제출하기'}
        </button>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: colors.white,
  },
  center: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
  },
  loadingText: {
    ...font.body,
    color: colors.textSecondary,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: `${spacing.md}px ${spacing.lg}px`,
    borderBottom: `2px solid ${colors.border}`,
  },
  headerTitle: {
    ...font.h3,
    color: colors.text,
  },
  questionArea: {
    flex: 1,
    padding: `${spacing.xxl}px ${spacing.lg}px`,
  },
  questionText: {
    ...font.h2,
    color: colors.text,
    marginBottom: `${spacing.xxl}px`,
  },
  options: {
    display: 'flex',
    flexDirection: 'column',
    gap: `${spacing.md}px`,
  },
  optionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: `${spacing.md}px`,
    width: '100%',
    padding: `${spacing.lg}px`,
    borderRadius: `${radius.lg}px`,
    border: `2px solid ${colors.border}`,
    backgroundColor: colors.white,
    ...font.body,
    color: colors.text,
    cursor: 'pointer',
    textAlign: 'left',
    boxShadow: shadows.card,
    marginBottom: '2px',
  },
  optionSelected: {
    borderColor: colors.blue,
    backgroundColor: colors.blueLight,
    boxShadow: `0 4px 0 ${colors.blueDark}`,
  },
  radio: {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    border: `2px solid ${colors.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  radioSelected: {
    borderColor: colors.blue,
    backgroundColor: colors.white,
  },
  radioDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: colors.blue,
  },
  optionText: {
    flex: 1,
  },
  footer: {
    padding: `${spacing.lg}px`,
    borderTop: `2px solid ${colors.border}`,
  },
  // Result
  resultContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    padding: `${spacing.xxl}px`,
    textAlign: 'center',
    animation: 'scaleIn 0.5s ease-out',
  },
  resultCircle: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    backgroundColor: colors.greenBg,
    border: `4px solid ${colors.green}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: `${spacing.xxl}px`,
  },
  resultScore: {
    fontSize: '24px',
    fontWeight: 800,
    color: colors.green,
  },
  resultTitle: {
    ...font.h1,
    color: colors.text,
    marginBottom: `${spacing.sm}px`,
  },
  resultMessage: {
    ...font.body,
    color: colors.textSecondary,
    marginBottom: `${spacing.xxxl}px`,
  },
}
