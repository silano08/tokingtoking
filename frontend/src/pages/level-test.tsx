import React, { useEffect, useState } from 'react'
import { ProgressBar } from '@/components/ProgressBar'
import { useAuthStore } from '@/store/authStore'
import { levelTestService } from '@/services/levelTestService'
import type { LevelTestQuestion, LevelTestResult } from '@/types/levelTest'

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
      alert('문제를 불러오는데 실패했습니다.')
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
      alert('제출에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && questions.length === 0) {
    return (
      <div style={styles.center}>
        <div>문제를 불러오는 중...</div>
      </div>
    )
  }

  if (result) {
    return (
      <div style={styles.page}>
        <div style={styles.resultContainer}>
          <div style={styles.resultEmoji}>🎉</div>
          <div style={styles.resultTitle}>레벨 테스트 완료!</div>
          <div style={styles.resultScore}>
            {result.score} / {result.total}
          </div>
          <div style={styles.resultLevel}>{result.message}</div>
          <button
            onClick={() => (window.location.href = '/')}
            style={styles.startButton}
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
      <div style={styles.header}>
        <span style={styles.headerTitle}>레벨 테스트</span>
      </div>

      <ProgressBar
        current={currentIndex + 1}
        total={questions.length}
        label="Question"
      />

      <div style={styles.questionArea}>
        <div style={styles.questionText}>{question?.question_text}</div>

        <div style={styles.options}>
          {question?.options?.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectOption(option)}
              style={{
                ...styles.optionButton,
                ...(selectedOption === option ? styles.selectedOption : {}),
              }}
            >
              <span style={styles.optionCircle}>
                {selectedOption === option ? '●' : '○'}
              </span>
              {option}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.footer}>
        <button
          onClick={handleNext}
          disabled={!selectedOption || isLoading}
          style={{
            ...styles.nextButton,
            opacity: selectedOption ? 1 : 0.5,
          }}
        >
          {currentIndex < questions.length - 1 ? '다음 →' : '제출하기'}
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
    backgroundColor: '#FFFFFF',
  },
  center: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: '1px solid #E5E8EB',
  },
  headerTitle: {
    fontSize: '17px',
    fontWeight: 700,
  },
  questionArea: {
    flex: 1,
    padding: '24px 16px',
  },
  questionText: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#333D4B',
    marginBottom: '24px',
    lineHeight: '1.5',
  },
  options: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  optionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid #E5E8EB',
    backgroundColor: '#FFFFFF',
    fontSize: '15px',
    color: '#333D4B',
    cursor: 'pointer',
    textAlign: 'left' as const,
  },
  selectedOption: {
    borderColor: '#3182F6',
    backgroundColor: '#EBF4FF',
  },
  optionCircle: {
    fontSize: '16px',
    color: '#3182F6',
  },
  footer: {
    padding: '16px',
    borderTop: '1px solid #E5E8EB',
  },
  nextButton: {
    width: '100%',
    height: '52px',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: '#3182F6',
    color: '#FFFFFF',
    fontSize: '17px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  resultContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    padding: '24px',
    textAlign: 'center' as const,
  },
  resultEmoji: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  resultTitle: {
    fontSize: '24px',
    fontWeight: 800,
    marginBottom: '12px',
  },
  resultScore: {
    fontSize: '18px',
    color: '#3182F6',
    fontWeight: 700,
    marginBottom: '8px',
  },
  resultLevel: {
    fontSize: '16px',
    color: '#6B7684',
    marginBottom: '32px',
  },
  startButton: {
    width: '100%',
    maxWidth: '320px',
    height: '52px',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: '#3182F6',
    color: '#FFFFFF',
    fontSize: '17px',
    fontWeight: 700,
    cursor: 'pointer',
  },
}
