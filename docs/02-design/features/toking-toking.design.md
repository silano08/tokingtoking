# TokingToking (토킹토킹) Design Document

> **Summary**: 앱인토스 기반 AI 영어 어휘 학습 앱 - 상세 설계
>
> **Project**: TokingToking
> **Version**: 0.1.0
> **Author**: gayeonwon
> **Date**: 2026-02-21
> **Status**: Draft
> **Planning Doc**: [toking-toking.plan.md](../../01-plan/features/toking-toking.plan.md)

### Pipeline References

| Phase | Document | Status |
|-------|----------|--------|
| Phase 1 | Schema Definition | N/A (본 문서에 포함) |
| Phase 2 | Coding Conventions | N/A (본 문서에 포함) |
| Phase 3 | Mockup | N/A (본 문서에 포함) |
| Phase 4 | API Spec | N/A (본 문서에 포함) |

---

## 1. Overview

### 1.1 Design Goals

- 앱인토스 WebView 환경에서 최적화된 채팅/스피킹 학습 경험 제공
- TDS (Toss Design System) 기반 일관된 UI
- AI API 비용 최소화를 위한 효율적인 프롬프트 및 스트리밍 설계
- 무료 → 유료 전환을 자연스럽게 유도하는 UX
- 확장 가능한 어휘 DB 및 레벨 시스템

### 1.2 Design Principles

- **모바일 퍼스트**: 토스 앱 내 WebView 환경에 최적화
- **점진적 공개**: 핵심 기능(채팅) 무료 → 고급 기능(스피킹) 유료
- **최소 지연**: AI 응답 스트리밍, 낙관적 UI 업데이트
- **데이터 기반 학습**: 유저 성과 데이터 기반 레벨 자동 조정

---

## 2. Architecture

### 2.1 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    토스 앱 (Android / iOS)                       │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              앱인토스 WebView Container                    │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │         Frontend (Vite + React + TS)                │  │  │
│  │  │         @apps-in-toss/web-framework                 │  │  │
│  │  │         @toss/tds-mobile                            │  │  │
│  │  │                                                     │  │  │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │  │  │
│  │  │  │ Zustand  │ │ TanStack │ │ Web Speech API   │   │  │  │
│  │  │  │ (State)  │ │ Query    │ │ (STT/TTS - 유료) │   │  │  │
│  │  │  └──────────┘ └──────────┘ └──────────────────┘   │  │  │
│  │  └───────────────────────┬─────────────────────────────┘  │  │
│  └──────────────────────────┼────────────────────────────────┘  │
└─────────────────────────────┼───────────────────────────────────┘
                              │ HTTPS (REST API)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Backend (Python FastAPI)                       │
│                   Hosted: Railway / Render                       │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │ Auth     │  │ Chat     │  │ Vocab    │  │ Subscription │   │
│  │ Router   │  │ Router   │  │ Router   │  │ Router       │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘   │
│       │              │             │                │           │
│  ┌────▼─────────────▼─────────────▼────────────────▼───────┐   │
│  │                   Service Layer                          │   │
│  │  auth_service │ chat_service │ vocab_service │ iap_svc   │   │
│  └────┬──────────────┬─────────────┬───────────────┬───────┘   │
│       │              │             │                │           │
│  ┌────▼──────┐ ┌─────▼─────┐ ┌────▼──────┐ ┌──────▼───────┐   │
│  │ Toss API  │ │ OpenAI    │ │ Supabase  │ │ Toss IAP    │   │
│  │ (mTLS)    │ │ API       │ │ Client    │ │ API (mTLS)  │   │
│  └───────────┘ └───────────┘ └───────────┘ └──────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

```
[채팅 학습 플로우]
User Input (text)
  → Frontend (메시지 전송)
  → POST /api/chat/message
  → chat_service: 대화 이력 + 목표 단어 컨텍스트 구성
  → OpenAI API (gpt-4o-mini) - System Prompt + 대화 이력
  → AI 응답 (JSON: message + wordUsage + hint)
  → Frontend: 메시지 렌더링 + 단어 사용 상태 업데이트
  → 3개 단어 모두 사용 → 세션 완료

[스피킹 학습 플로우]
User Voice Input
  → Web Speech API (STT) → 텍스트 변환
  → POST /api/speaking/message (transcribed text)
  → chat_service: 대화 이력 + 피드백 요청 구성
  → OpenAI API (gpt-4o) - 피드백 포함 System Prompt
  → AI 응답 (JSON: message + feedback + wordUsage)
  → Frontend: 피드백 표시 + TTS 재생
```

### 2.3 Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| Frontend | @apps-in-toss/web-framework | 앱인토스 SDK (로그인, IAP, 네비게이션) |
| Frontend | @toss/tds-mobile | TDS UI 컴포넌트 |
| Frontend | Zustand | 클라이언트 상태 관리 |
| Frontend | TanStack Query | 서버 상태 관리, API 캐싱 |
| Backend | FastAPI | HTTP 서버 프레임워크 |
| Backend | openai (Python SDK) | ChatGPT API 연동 |
| Backend | supabase-py | Supabase DB 클라이언트 |
| Backend | httpx | 앱인토스 API mTLS 통신 |
| Backend | pydantic | 요청/응답 데이터 검증 |

---

## 3. Data Model

### 3.1 Entity Definitions

```typescript
// 사용자 (토스 로그인 연동)
interface User {
  id: string;                    // UUID (내부 PK)
  toss_user_key: string;         // 토스 로그인 userKey (unique)
  level: 'beginner' | 'intermediate' | 'advanced';
  is_premium: boolean;           // 유료 구독 여부
  premium_expires_at: string | null;  // 구독 만료일
  total_sessions: number;        // 총 학습 세션 수
  streak_days: number;           // 연속 학습 일수
  last_study_date: string | null;
  created_at: string;
  updated_at: string;
}

// 어휘
interface Vocabulary {
  id: string;                    // UUID
  word: string;                  // 영단어
  level: 'beginner' | 'intermediate' | 'advanced';
  pos: string;                   // 품사 (noun, verb, adj, adv)
  definition_ko: string;         // 한국어 뜻
  definition_en: string;         // 영어 뜻
  example_sentence: string;      // 예문
  pronunciation: string;         // 발음 기호
  category: string;              // 카테고리 (daily, business, academic)
  difficulty_score: number;      // 난이도 (1-10)
}

// 레벨 테스트 문제
interface LevelTestQuestion {
  id: string;                    // UUID
  question_type: 'multiple_choice' | 'fill_blank';
  question_text: string;         // 문제 텍스트
  options: string[] | null;      // 객관식 선택지 (4개)
  correct_answer: string;        // 정답
  level: 'beginner' | 'intermediate' | 'advanced';
  difficulty_score: number;      // 난이도 (1-10)
}

// 학습 세션
interface StudySession {
  id: string;                    // UUID
  user_id: string;               // FK → users
  mode: 'chat' | 'speaking';    // 학습 모드
  target_words: string[];        // 목표 단어 3개 (vocab IDs)
  words_used: Record<string, boolean>;  // 단어별 사용 성공 여부
  is_completed: boolean;         // 세션 완료 여부
  started_at: string;
  completed_at: string | null;
}

// 채팅 메시지
interface ChatMessage {
  id: string;                    // UUID
  session_id: string;            // FK → study_sessions
  role: 'user' | 'assistant';
  content: string;               // 메시지 내용
  feedback: SpeakingFeedback | null;  // 스피킹 모드 피드백
  word_usage_snapshot: Record<string, boolean>;  // 이 메시지 시점의 단어 사용 상태
  created_at: string;
}

// 스피킹 피드백 (유료 전용)
interface SpeakingFeedback {
  pronunciation: string;         // 발음 피드백
  grammar: string;               // 문법 피드백
  vocabulary: string;            // 어휘 사용 피드백
  score: number;                 // 종합 점수 (1-10)
}

// IAP 구독 기록
interface Subscription {
  id: string;                    // UUID
  user_id: string;               // FK → users
  order_id: string;              // 앱인토스 IAP 주문 ID
  product_id: string;            // 상품 ID (monthly/yearly)
  status: 'active' | 'expired' | 'cancelled' | 'refunded';
  started_at: string;
  expires_at: string;
  created_at: string;
}
```

### 3.2 Entity Relationships

```
[User] 1 ──── N [StudySession]
  │                    │
  │                    └── 1 ──── N [ChatMessage]
  │
  └── 1 ──── N [Subscription]

[Vocabulary] N ──── M [StudySession] (target_words)

[LevelTestQuestion] (독립 - 유저와 직접 관계 없음)
```

### 3.3 Database Schema (Supabase PostgreSQL)

```sql
-- 사용자 테이블
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  toss_user_key TEXT UNIQUE NOT NULL,
  level TEXT NOT NULL DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  is_premium BOOLEAN NOT NULL DEFAULT false,
  premium_expires_at TIMESTAMPTZ,
  total_sessions INTEGER NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 0,
  last_study_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 어휘 테이블
CREATE TABLE vocabularies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  pos TEXT NOT NULL,
  definition_ko TEXT NOT NULL,
  definition_en TEXT NOT NULL,
  example_sentence TEXT NOT NULL,
  pronunciation TEXT,
  category TEXT NOT NULL DEFAULT 'daily',
  difficulty_score INTEGER NOT NULL DEFAULT 5 CHECK (difficulty_score BETWEEN 1 AND 10),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(word, level)
);

-- 레벨 테스트 문제 테이블
CREATE TABLE level_test_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'fill_blank')),
  question_text TEXT NOT NULL,
  options JSONB,
  correct_answer TEXT NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  difficulty_score INTEGER NOT NULL DEFAULT 5 CHECK (difficulty_score BETWEEN 1 AND 10),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 학습 세션 테이블
CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('chat', 'speaking')),
  target_words UUID[] NOT NULL,
  words_used JSONB NOT NULL DEFAULT '{}',
  is_completed BOOLEAN NOT NULL DEFAULT false,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 채팅 메시지 테이블
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES study_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  feedback JSONB,
  word_usage_snapshot JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 구독 테이블
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'refunded')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_users_toss_key ON users(toss_user_key);
CREATE INDEX idx_vocab_level ON vocabularies(level);
CREATE INDEX idx_sessions_user ON study_sessions(user_id);
CREATE INDEX idx_messages_session ON chat_messages(session_id);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
```

---

## 4. API Specification

### 4.1 Endpoint List

| Method | Path | Description | Auth | Premium |
|--------|------|-------------|:----:|:-------:|
| POST | `/api/auth/login` | 토스 로그인 (authCode → token) | - | - |
| POST | `/api/auth/refresh` | 토큰 갱신 | ✅ | - |
| POST | `/api/auth/logout` | 로그아웃 | ✅ | - |
| GET | `/api/auth/me` | 내 정보 조회 | ✅ | - |
| GET | `/api/level-test/questions` | 레벨 테스트 문제 조회 | ✅ | - |
| POST | `/api/level-test/submit` | 레벨 테스트 제출/채점 | ✅ | - |
| GET | `/api/vocab/random` | 레벨 맞춤 단어 3개 랜덤 조회 | ✅ | - |
| POST | `/api/chat/session` | 채팅 세션 시작 | ✅ | - |
| POST | `/api/chat/message` | 채팅 메시지 전송 + AI 응답 | ✅ | - |
| GET | `/api/chat/session/:id` | 세션 상세 조회 | ✅ | - |
| POST | `/api/speaking/message` | 스피킹 메시지 + 피드백 | ✅ | ✅ |
| POST | `/api/iap/verify` | IAP 구매 검증 | ✅ | - |
| GET | `/api/iap/subscription` | 구독 상태 조회 | ✅ | - |
| GET | `/api/history/sessions` | 학습 기록 목록 | ✅ | - |
| GET | `/api/history/stats` | 학습 통계 | ✅ | - |

### 4.2 Detailed API Specifications

#### 4.2.1 POST `/api/auth/login`

토스 로그인 OAuth 코드를 받아 서버에서 토큰 교환 후 내부 JWT 발급.

**Request:**
```json
{
  "authorization_code": "string",
  "referrer": "DEFAULT" | "sandbox"
}
```

**Response (200 OK):**
```json
{
  "access_token": "string (내부 JWT)",
  "user": {
    "id": "uuid",
    "level": "beginner",
    "is_premium": false,
    "total_sessions": 0,
    "streak_days": 0
  },
  "is_new_user": true
}
```

**Flow:**
1. 클라이언트에서 `appLogin()` 호출 → `authorizationCode` 획득
2. 서버에서 앱인토스 API로 토큰 교환 (mTLS)
3. `userKey`로 내부 유저 조회/생성
4. 내부 JWT 발급하여 반환

---

#### 4.2.2 GET `/api/level-test/questions`

레벨 테스트 문제 랜덤 출제 (각 레벨에서 5문제씩, 총 15문제).

**Response (200 OK):**
```json
{
  "questions": [
    {
      "id": "uuid",
      "question_type": "multiple_choice",
      "question_text": "What does 'negotiate' mean?",
      "options": ["To argue", "To discuss to reach an agreement", "To ignore", "To celebrate"],
      "level": "intermediate",
      "order": 1
    }
  ],
  "total_count": 15
}
```

---

#### 4.2.3 POST `/api/level-test/submit`

레벨 테스트 답안 제출 → 채점 → 레벨 자동 분류.

**Request:**
```json
{
  "answers": [
    { "question_id": "uuid", "answer": "To discuss to reach an agreement" }
  ]
}
```

**Response (200 OK):**
```json
{
  "score": 10,
  "total": 15,
  "level_scores": {
    "beginner": 5,
    "intermediate": 3,
    "advanced": 2
  },
  "assigned_level": "intermediate",
  "message": "중급 레벨로 배정되었습니다!"
}
```

**채점 로직:**
- Beginner 5문제 중 4개 이상 → Intermediate 문제 채점
- Intermediate 5문제 중 3개 이상 → Advanced 문제 채점
- 최종 레벨: 가장 높은 통과 레벨

---

#### 4.2.4 GET `/api/vocab/random?count=3`

현재 유저 레벨에 맞는 단어 랜덤 출제. 최근 학습한 단어는 제외.

**Response (200 OK):**
```json
{
  "words": [
    {
      "id": "uuid",
      "word": "negotiate",
      "pos": "verb",
      "definition_ko": "협상하다",
      "definition_en": "to discuss something in order to reach an agreement",
      "example_sentence": "We need to negotiate the terms of the contract.",
      "pronunciation": "/nɪˈɡoʊʃieɪt/"
    }
  ]
}
```

---

#### 4.2.5 POST `/api/chat/session`

새 학습 세션 생성.

**Request:**
```json
{
  "mode": "chat",
  "word_ids": ["uuid1", "uuid2", "uuid3"]
}
```

**Response (201 Created):**
```json
{
  "session_id": "uuid",
  "mode": "chat",
  "target_words": [
    { "id": "uuid1", "word": "negotiate", "definition_ko": "협상하다" },
    { "id": "uuid2", "word": "perspective", "definition_ko": "관점" },
    { "id": "uuid3", "word": "implement", "definition_ko": "실행하다" }
  ],
  "initial_message": {
    "role": "assistant",
    "content": "Hey! Let's imagine we're coworkers at a tech company. We just got a new project proposal from a client. What do you think about it?",
    "word_usage": { "negotiate": false, "perspective": false, "implement": false }
  }
}
```

---

#### 4.2.6 POST `/api/chat/message`

유저 메시지 전송 → AI 응답 반환.

**Request:**
```json
{
  "session_id": "uuid",
  "content": "I think we should negotiate the deadline because it seems too tight."
}
```

**Response (200 OK):**
```json
{
  "message": {
    "role": "assistant",
    "content": "Great point! Negotiating the deadline is definitely important. From your perspective, what would be a more realistic timeline to implement the first phase?",
    "word_usage": { "negotiate": true, "perspective": false, "implement": false },
    "hint": null
  },
  "session_status": {
    "words_used": { "negotiate": true, "perspective": false, "implement": false },
    "completed_count": 1,
    "is_completed": false
  }
}
```

**세션 완료 시 (3개 모두 사용):**
```json
{
  "message": { "..." },
  "session_status": {
    "words_used": { "negotiate": true, "perspective": true, "implement": true },
    "completed_count": 3,
    "is_completed": true
  },
  "summary": {
    "session_id": "uuid",
    "duration_seconds": 180,
    "message_count": 8,
    "word_usage_details": [
      { "word": "negotiate", "used_in": "I think we should negotiate the deadline...", "feedback": "자연스럽게 사용했어요!" }
    ]
  }
}
```

---

#### 4.2.7 POST `/api/speaking/message` (유료 전용)

스피킹 모드 - STT 텍스트 + 피드백 응답.

**Request:**
```json
{
  "session_id": "uuid",
  "transcribed_text": "I think we should negoshiate the deadline.",
  "audio_duration_ms": 3200
}
```

**Response (200 OK):**
```json
{
  "message": {
    "role": "assistant",
    "content": "Good try! Let me give you some feedback. The word 'negotiate' is pronounced /nɪˈɡoʊʃieɪt/. You said 'negoshiate' - the stress should be on the second syllable. Try again: ne-GO-shi-ate. Now, from your perspective, what timeline works better?",
    "word_usage": { "negotiate": true, "perspective": false, "implement": false },
    "feedback": {
      "pronunciation": "negotiate 발음 주의: /nɪˈɡoʊʃieɪt/ - 두 번째 음절에 강세. 'negoshiate'로 발음하셨는데, 'ne-GO-shi-ate'로 연습해보세요.",
      "grammar": "문장 구조가 정확합니다. 'I think we should...' 패턴을 잘 사용했어요.",
      "vocabulary": "negotiate를 적절한 맥락에서 사용했습니다.",
      "score": 7
    }
  },
  "session_status": {
    "words_used": { "negotiate": true, "perspective": false, "implement": false },
    "completed_count": 1,
    "is_completed": false
  }
}
```

---

#### 4.2.8 POST `/api/iap/verify`

IAP 구매 검증 및 구독 활성화.

**Request:**
```json
{
  "order_id": "string",
  "product_id": "monthly_premium"
}
```

**Response (200 OK):**
```json
{
  "verified": true,
  "subscription": {
    "status": "active",
    "product_id": "monthly_premium",
    "expires_at": "2026-03-21T00:00:00Z"
  }
}
```

**Flow:**
1. 클라이언트에서 `IAP.createOneTimePurchaseOrder()` 호출
2. 구매 성공 → `IAP.completeProductGrant()` 호출
3. 서버에서 앱인토스 IAP API로 주문 상태 확인 (mTLS)
4. 구독 정보 DB 저장 및 유저 `is_premium` 업데이트

---

## 5. UI/UX Design

### 5.1 Screen Layouts

#### 홈 화면 (index.tsx)

```
┌──────────────────────────────────┐
│  TDS NavigationBar               │
│  토킹토킹              [설정 ⚙]  │
├──────────────────────────────────┤
│                                  │
│  ┌────────────────────────────┐  │
│  │  👋 안녕하세요, OO님!      │  │
│  │  현재 레벨: Intermediate   │  │
│  │  🔥 3일 연속 학습 중!      │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌────────────────────────────┐  │
│  │  오늘의 단어                │  │
│  │  ┌──────┐┌──────┐┌──────┐ │  │
│  │  │ nego ││ pers ││ impl │ │  │
│  │  │ tiate││ pect ││ ement│ │  │
│  │  │  ive ││      ││      │ │  │
│  │  └──────┘└──────┘└──────┘ │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌────────────────────────────┐  │
│  │ 💬 채팅으로 학습하기        │  │
│  │     (무료)                  │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌────────────────────────────┐  │
│  │ 🎤 스피킹으로 학습하기      │  │
│  │     (Premium)     [🔒]     │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌────────────────────────────┐  │
│  │ 📊 학습 기록 보기           │  │
│  └────────────────────────────┘  │
│                                  │
└──────────────────────────────────┘
```

#### 레벨 테스트 화면 (level-test.tsx)

```
┌──────────────────────────────────┐
│  TDS NavigationBar               │
│  ← 레벨 테스트                    │
├──────────────────────────────────┤
│                                  │
│  ┌────────────────────────────┐  │
│  │  Question 3 / 15           │  │
│  │  ████████░░░░░░░░  20%     │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌────────────────────────────┐  │
│  │                            │  │
│  │  What does 'negotiate'     │  │
│  │  mean?                     │  │
│  │                            │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌────────────────────────────┐  │
│  │ ○ To argue                 │  │
│  ├────────────────────────────┤  │
│  │ ● To discuss to reach     │  │
│  │   an agreement             │  │
│  ├────────────────────────────┤  │
│  │ ○ To ignore               │  │
│  ├────────────────────────────┤  │
│  │ ○ To celebrate            │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌────────────────────────────┐  │
│  │        다음 →               │  │
│  └────────────────────────────┘  │
│                                  │
└──────────────────────────────────┘
```

#### 채팅 학습 화면 (chat.tsx)

```
┌──────────────────────────────────┐
│  TDS NavigationBar               │
│  ← 채팅 학습                      │
├──────────────────────────────────┤
│  ┌────────────────────────────┐  │
│  │ 오늘의 단어                 │  │
│  │ ✅ negotiate  ☐ perspective │  │
│  │ ☐ implement                │  │
│  └────────────────────────────┘  │
├──────────────────────────────────┤
│                                  │
│  ┌─────────────────────────┐     │
│  │ 🤖 Hey! Let's imagine   │     │
│  │ we're coworkers at a    │     │
│  │ tech company...         │     │
│  └─────────────────────────┘     │
│                                  │
│     ┌─────────────────────────┐  │
│     │ I think we should      │  │
│     │ negotiate the deadline │  │
│     │ because...             │  │
│     └─────────────────────────┘  │
│                                  │
│  ┌─────────────────────────┐     │
│  │ 🤖 Great point! From    │     │
│  │ your perspective, what  │     │
│  │ would be a realistic... │     │
│  └─────────────────────────┘     │
│                                  │
├──────────────────────────────────┤
│  ┌──────────────────────┐ [전송] │
│  │ 메시지를 입력하세요...  │       │
│  └──────────────────────┘        │
└──────────────────────────────────┘
```

#### 스피킹 학습 화면 (speaking.tsx)

```
┌──────────────────────────────────┐
│  TDS NavigationBar               │
│  ← 스피킹 학습                    │
├──────────────────────────────────┤
│  ┌────────────────────────────┐  │
│  │ 오늘의 단어                 │  │
│  │ ✅ negotiate  ☐ perspective │  │
│  │ ☐ implement                │  │
│  └────────────────────────────┘  │
├──────────────────────────────────┤
│                                  │
│  ┌─────────────────────────┐     │
│  │ 🤖 Great try!            │     │
│  │ [🔊 음성 재생]            │     │
│  └─────────────────────────┘     │
│                                  │
│  ┌─────────────────────────────┐ │
│  │ 📝 피드백                   │ │
│  │ 발음: negotiate 강세 주의   │ │
│  │ 문법: ✅ 정확               │ │
│  │ 어휘: ✅ 자연스러운 사용     │ │
│  │ 점수: 7/10                  │ │
│  └─────────────────────────────┘ │
│                                  │
│     ┌─────────────────────────┐  │
│     │ 🎙 "I think we should  │  │
│     │ negoshiate the..."     │  │
│     └─────────────────────────┘  │
│                                  │
├──────────────────────────────────┤
│         ┌────────────┐           │
│         │  🎤 말하기  │           │
│         └────────────┘           │
│   [녹음 중... ██████░░ 3.2s]     │
└──────────────────────────────────┘
```

#### 세션 완료 화면 (session-result.tsx)

```
┌──────────────────────────────────┐
│  TDS NavigationBar               │
│  학습 완료!                       │
├──────────────────────────────────┤
│                                  │
│         🎉 수고했어요!            │
│                                  │
│  ┌────────────────────────────┐  │
│  │  오늘 학습한 단어            │  │
│  │                            │  │
│  │  ✅ negotiate              │  │
│  │  "I think we should       │  │
│  │   negotiate the deadline" │  │
│  │                            │  │
│  │  ✅ perspective            │  │
│  │  "From my perspective,    │  │
│  │   we need more time"      │  │
│  │                            │  │
│  │  ✅ implement              │  │
│  │  "Let's implement the     │  │
│  │   first phase next week"  │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌────────────────────────────┐  │
│  │  📊 학습 통계               │  │
│  │  소요 시간: 3분 24초        │  │
│  │  메시지 수: 8개             │  │
│  │  연속 학습: 4일째 🔥        │  │
│  └────────────────────────────┘  │
│                                  │
│  ┌────────────────────────────┐  │
│  │     한 번 더 학습하기       │  │
│  └────────────────────────────┘  │
│  ┌────────────────────────────┐  │
│  │       홈으로 돌아가기       │  │
│  └────────────────────────────┘  │
│                                  │
└──────────────────────────────────┘
```

### 5.2 User Flow (상세)

```
[최초 유저 플로우]
앱인토스 진입
  → appLogin() (토스 로그인)
  → POST /api/auth/login
  → is_new_user === true?
     → YES: 레벨 테스트 화면
            → 15문제 풀기
            → POST /api/level-test/submit
            → 레벨 결과 확인
            → 홈 화면
     → NO: 홈 화면

[일반 학습 플로우]
홈 화면
  → "채팅으로 학습하기" 클릭
  → GET /api/vocab/random?count=3
  → 단어 3개 확인 화면
  → POST /api/chat/session
  → 채팅 화면 (AI 첫 메시지 표시)
  → 유저 메시지 입력 → POST /api/chat/message → AI 응답
  → 반복 (단어 사용 시 ✅ 체크)
  → 3개 모두 ✅ → 세션 완료 화면

[유료 전환 플로우]
홈 화면
  → "스피킹으로 학습하기" 클릭
  → is_premium === false?
     → YES: 구독 페이지
            → IAP.getProductItemList()
            → 상품 선택 (월간/연간)
            → IAP.createOneTimePurchaseOrder()
            → 결제 성공 → POST /api/iap/verify
            → is_premium = true → 스피킹 화면
     → NO: 스피킹 화면 직접 진입
```

### 5.3 Component List

| Component | Location | Responsibility |
|-----------|----------|----------------|
| `HomePage` | pages/index.tsx | 홈 화면, 학습 시작 진입점 |
| `LevelTestPage` | pages/level-test.tsx | 레벨 테스트 UI 및 로직 |
| `ChatPage` | pages/chat.tsx | 채팅 학습 화면 (무료) |
| `SpeakingPage` | pages/speaking.tsx | 스피킹 학습 화면 (유료) |
| `SessionResultPage` | pages/session-result.tsx | 세션 완료 요약 |
| `SubscribePage` | pages/subscribe.tsx | 구독 결제 화면 |
| `MyPage` | pages/mypage.tsx | 학습 기록/설정 |
| `WordCard` | components/WordCard.tsx | 단어 카드 (체크 상태 포함) |
| `WordStatusBar` | components/WordStatusBar.tsx | 상단 단어 사용 상태 바 |
| `ChatBubble` | components/ChatBubble.tsx | 채팅 말풍선 (유저/AI) |
| `FeedbackCard` | components/FeedbackCard.tsx | 스피킹 피드백 카드 |
| `VoiceRecorder` | components/VoiceRecorder.tsx | 음성 녹음 버튼/상태 |
| `ProgressBar` | components/ProgressBar.tsx | 진행률 표시 바 |
| `QuestionCard` | components/QuestionCard.tsx | 레벨 테스트 문제 카드 |

---

## 6. AI Prompt Design

### 6.1 채팅 모드 System Prompt

```
You are a friendly English conversation partner for a Korean learner.

CONTEXT:
- User's level: {level} (beginner/intermediate/advanced)
- Target words for this session: {word1}, {word2}, {word3}
- Words already used by the user: {used_words}

YOUR ROLE:
1. Create a natural, engaging conversation scenario where the target words can be used naturally.
2. Adjust your language complexity to match the user's level.
3. When the user uses a target word correctly in context, acknowledge it naturally (don't over-praise).
4. If the user hasn't used remaining words after 3-4 exchanges, gently guide the conversation toward topics where those words fit naturally.
5. Keep responses concise (2-3 sentences max).
6. If the user makes grammar mistakes, don't correct them directly in chat mode - just model correct usage in your response.

LEVEL GUIDELINES:
- beginner: Use simple vocabulary, short sentences, everyday topics
- intermediate: Use moderate vocabulary, compound sentences, work/social topics
- advanced: Use sophisticated vocabulary, complex structures, abstract topics

RESPONSE FORMAT (JSON):
{
  "message": "Your conversational response in English",
  "word_usage": {
    "{word1}": true/false,
    "{word2}": true/false,
    "{word3}": true/false
  },
  "hint": "Optional: A subtle hint if user is struggling (null if not needed)"
}

IMPORTANT:
- Detect if the user used target words in CORRECT CONTEXT (not just mentioned them).
- word_usage should reflect cumulative status (once true, stays true).
- Never break character or mention you're an AI.
- Respond ONLY in the JSON format above.
```

### 6.2 스피킹 모드 System Prompt

```
You are an English speaking coach for a Korean learner.

CONTEXT:
- User's level: {level}
- Target words: {word1}, {word2}, {word3}
- Words already used: {used_words}
- This is SPEAKING practice: the user's text is from speech-to-text, so expect minor transcription errors.

YOUR ROLE:
1. All responsibilities from chat mode PLUS:
2. Provide pronunciation feedback when target words are used (especially if STT shows mispronunciation).
3. Provide brief grammar feedback on the user's sentence.
4. Provide vocabulary usage feedback.
5. Give a score (1-10) for overall performance of this message.
6. Be encouraging but honest.

RESPONSE FORMAT (JSON):
{
  "message": "Your conversational response in English",
  "word_usage": {
    "{word1}": true/false,
    "{word2}": true/false,
    "{word3}": true/false
  },
  "feedback": {
    "pronunciation": "Feedback on pronunciation in Korean (한국어로 작성)",
    "grammar": "Grammar feedback in Korean (한국어로 작성)",
    "vocabulary": "Vocabulary usage feedback in Korean (한국어로 작성)",
    "score": 7
  },
  "hint": null
}
```

### 6.3 레벨 판정 로직

```python
def determine_level(answers: list[dict]) -> str:
    beginner_score = sum(1 for a in answers if a['level'] == 'beginner' and a['correct'])
    intermediate_score = sum(1 for a in answers if a['level'] == 'intermediate' and a['correct'])
    advanced_score = sum(1 for a in answers if a['level'] == 'advanced' and a['correct'])

    if advanced_score >= 3:
        return 'advanced'
    elif intermediate_score >= 3:
        return 'intermediate'
    else:
        return 'beginner'
```

---

## 7. Error Handling

### 7.1 Error Code Definition

| Code | Message | Cause | Handling |
|------|---------|-------|----------|
| 400 | Invalid input | 잘못된 요청 데이터 | 입력 검증 메시지 표시 |
| 401 | Unauthorized | JWT 만료/무효 | 토스 재로그인 유도 |
| 403 | Premium required | 무료 유저가 스피킹 접근 | 구독 페이지로 이동 |
| 404 | Session not found | 존재하지 않는 세션 | 홈으로 이동 |
| 429 | Rate limit exceeded | 일일 세션 제한 초과 | "오늘 학습량을 다 채웠어요!" 메시지 |
| 500 | Internal error | 서버 오류 | "잠시 후 다시 시도해주세요" |
| 502 | AI service error | OpenAI API 오류 | "AI 서비스 일시 장애" + 재시도 버튼 |
| 503 | Service unavailable | 서버 점검 | 점검 안내 메시지 |

### 7.2 Error Response Format

```json
{
  "error": {
    "code": "PREMIUM_REQUIRED",
    "message": "스피킹 학습은 프리미엄 구독이 필요합니다.",
    "action": "REDIRECT_SUBSCRIBE"
  }
}
```

### 7.3 프론트엔드 에러 처리 전략

```typescript
// API 에러 인터셉터
const handleApiError = (error: ApiError) => {
  switch (error.code) {
    case 401:
      // 토큰 만료 → 자동 갱신 시도 → 실패 시 재로그인
      return refreshTokenOrRelogin();
    case 403:
      // 프리미엄 필요 → 구독 페이지
      return navigate('/subscribe');
    case 429:
      // 일일 제한 → 안내 모달
      return showLimitModal();
    case 502:
      // AI 오류 → 재시도 버튼
      return showRetryModal();
    default:
      return showGenericError();
  }
};
```

---

## 8. Security Considerations

- [x] **mTLS 인증**: 앱인토스 API 통신 시 상호 TLS 인증서 사용
- [x] **AES-256-GCM**: 토스 로그인 개인정보 복호화 (서버 사이드)
- [x] **JWT 인증**: 내부 API 인증, Access Token (1h) + Refresh Token (7d)
- [x] **Input Validation**: Pydantic으로 모든 요청 데이터 검증
- [x] **Rate Limiting**: 무료 유저 일일 3세션, API 분당 60회 제한
- [x] **CORS 설정**: 앱인토스 도메인만 허용
- [x] **환경변수 분리**: API 키, 인증서를 환경변수로 관리
- [x] **SQL Injection 방지**: Supabase ORM 사용, raw query 금지
- [x] **Prompt Injection 방지**: 유저 입력을 System Prompt와 분리, 입력 길이 제한 (500자)

---

## 9. Test Plan

### 9.1 Test Scope

| Type | Target | Tool |
|------|--------|------|
| API Test | FastAPI 엔드포인트 | pytest + httpx |
| DB Test | Supabase CRUD | pytest |
| AI Test | System Prompt 품질 | 수동 테스트 + 로그 분석 |
| E2E Test | 전체 유저 플로우 | 앱인토스 Sandbox |
| IAP Test | 결제/구독 플로우 | 앱인토스 Sandbox |

### 9.2 Test Cases (Key)

- [ ] **Happy Path - 채팅**: 로그인 → 단어 출제 → 채팅 → 3단어 사용 → 세션 완료
- [ ] **Happy Path - 스피킹**: 구독 → 단어 출제 → 스피킹 → 피드백 수신 → 세션 완료
- [ ] **레벨 테스트**: 15문제 풀기 → 정확한 레벨 분류
- [ ] **결제 플로우**: IAP 구매 → 서버 검증 → 프리미엄 활성화
- [ ] **에러 시나리오**: AI API 장애 시 재시도, 토큰 만료 시 자동 갱신
- [ ] **Edge Case**: 세션 중 앱 종료 → 재진입 시 세션 복구

---

## 10. Clean Architecture

### 10.1 Layer Structure

| Layer | Responsibility | Location |
|-------|---------------|----------|
| **Pages** | 라우팅, 페이지 레이아웃 | `src/pages/` |
| **Components** | 재사용 UI 컴포넌트 | `src/components/` |
| **Hooks** | 비즈니스 로직, API 연동 | `src/hooks/` |
| **Services** | API 클라이언트 함수 | `src/services/` |
| **Types** | TypeScript 타입 정의 | `src/types/` |
| **Store** | Zustand 상태 관리 | `src/store/` |
| **Utils** | 유틸리티 함수 | `src/utils/` |

### 10.2 Dependency Rules

```
Pages → Components + Hooks
Hooks → Services + Store + Types
Services → Types (API 호출)
Store → Types (상태 정의)
Components → Types (Props)
```

---

## 11. Coding Convention

### 11.1 Naming Conventions

| Target | Rule | Example |
|--------|------|---------|
| Components | PascalCase | `ChatBubble`, `WordCard` |
| Hooks | camelCase, use 접두사 | `useChat`, `useLevelTest` |
| Services | camelCase | `chatService`, `authService` |
| Types/Interfaces | PascalCase | `StudySession`, `ChatMessage` |
| Files (component) | PascalCase.tsx | `ChatBubble.tsx` |
| Files (hook) | camelCase.ts | `useChat.ts` |
| Files (service) | camelCase.ts | `chatService.ts` |
| Folders | kebab-case | `level-test/`, `session-result/` |
| Python files | snake_case.py | `chat_service.py`, `auth_router.py` |
| Python functions | snake_case | `get_random_vocab()`, `verify_iap()` |
| Python classes | PascalCase | `ChatRequest`, `UserResponse` |
| Env variables | UPPER_SNAKE_CASE | `OPENAI_API_KEY`, `SUPABASE_URL` |

### 11.2 Import Order (Frontend)

```typescript
// 1. React
import { useState, useEffect } from 'react'

// 2. Third-party libraries
import { useQuery } from '@tanstack/react-query'
import { create } from 'zustand'

// 3. Apps in Toss SDK
import { appLogin } from '@apps-in-toss/web-framework'

// 4. TDS Components
import { Button, Input } from '@toss/tds-mobile'

// 5. Internal - services/hooks/store
import { chatService } from '@/services/chatService'
import { useChat } from '@/hooks/useChat'

// 6. Internal - components
import { ChatBubble } from '@/components/ChatBubble'

// 7. Types
import type { ChatMessage } from '@/types'
```

---

## 12. Implementation Guide

### 12.1 File Structure

```
tokingtoking/
├── frontend/                          # Vite + React + TS
│   ├── granite.config.ts              # 앱인토스 설정
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── .env.local                     # VITE_API_URL
│   └── src/
│       ├── pages/                     # 앱인토스 file-based routing
│       │   ├── index.tsx              # 홈
│       │   ├── level-test.tsx         # 레벨 테스트
│       │   ├── chat.tsx               # 채팅 학습
│       │   ├── speaking.tsx           # 스피킹 학습
│       │   ├── session-result.tsx     # 세션 결과
│       │   ├── subscribe.tsx          # 구독 결제
│       │   └── mypage.tsx             # 학습 기록
│       ├── components/
│       │   ├── ChatBubble.tsx
│       │   ├── WordCard.tsx
│       │   ├── WordStatusBar.tsx
│       │   ├── FeedbackCard.tsx
│       │   ├── VoiceRecorder.tsx
│       │   ├── ProgressBar.tsx
│       │   └── QuestionCard.tsx
│       ├── hooks/
│       │   ├── useAuth.ts
│       │   ├── useChat.ts
│       │   ├── useSpeaking.ts
│       │   ├── useLevelTest.ts
│       │   ├── useVocab.ts
│       │   └── useSubscription.ts
│       ├── services/
│       │   ├── api.ts                 # axios instance
│       │   ├── authService.ts
│       │   ├── chatService.ts
│       │   ├── vocabService.ts
│       │   ├── levelTestService.ts
│       │   └── iapService.ts
│       ├── store/
│       │   ├── authStore.ts
│       │   ├── sessionStore.ts
│       │   └── subscriptionStore.ts
│       ├── types/
│       │   ├── user.ts
│       │   ├── vocab.ts
│       │   ├── chat.ts
│       │   ├── levelTest.ts
│       │   └── subscription.ts
│       └── utils/
│           ├── speech.ts              # Web Speech API 래퍼
│           └── format.ts
│
├── backend/                           # Python FastAPI
│   ├── requirements.txt
│   ├── .env                           # API keys, Supabase, mTLS
│   ├── main.py                        # FastAPI app entry
│   ├── config.py                      # 설정 (환경변수 로드)
│   ├── routers/
│   │   ├── auth.py                    # /api/auth/*
│   │   ├── level_test.py              # /api/level-test/*
│   │   ├── vocab.py                   # /api/vocab/*
│   │   ├── chat.py                    # /api/chat/*
│   │   ├── speaking.py                # /api/speaking/*
│   │   ├── iap.py                     # /api/iap/*
│   │   └── history.py                 # /api/history/*
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── chat_service.py            # AI 대화 로직 + OpenAI API
│   │   ├── vocab_service.py
│   │   ├── level_test_service.py
│   │   ├── iap_service.py
│   │   └── toss_api_service.py        # mTLS 기반 토스 API 통신
│   ├── models/
│   │   ├── user.py
│   │   ├── vocab.py
│   │   ├── session.py
│   │   ├── chat.py
│   │   └── subscription.py
│   ├── middleware/
│   │   ├── auth.py                    # JWT 인증 미들웨어
│   │   └── premium.py                 # 유료 기능 접근 제어
│   ├── prompts/
│   │   ├── chat_system.txt            # 채팅 모드 System Prompt
│   │   └── speaking_system.txt        # 스피킹 모드 System Prompt
│   └── db/
│       ├── supabase_client.py
│       └── migrations/
│           └── 001_initial_schema.sql
│
├── data/
│   └── seed/
│       ├── vocabularies.json          # 초기 어휘 데이터
│       └── level_test_questions.json  # 레벨 테스트 문제
│
└── docs/
    ├── 01-plan/features/
    │   └── toking-toking.plan.md
    └── 02-design/features/
        └── toking-toking.design.md
```

### 12.2 Implementation Order

```
Phase 1: 기반 구축 (1주)
──────────────────────
1. [ ] 프로젝트 초기화 (Vite + React + 앱인토스 SDK)
2. [ ] FastAPI 백엔드 초기화 + Supabase 연동
3. [ ] DB 스키마 생성 (migrations)
4. [ ] 토스 로그인 연동 (OAuth + mTLS)
5. [ ] JWT 인증 미들웨어

Phase 2: 핵심 기능 (2주)
──────────────────────
6. [ ] 레벨 테스트 (문제 DB + 채점 로직 + UI)
7. [ ] 어휘 DB 구축 (레벨별 최소 100단어 시드 데이터)
8. [ ] 어휘 랜덤 출제 API
9. [ ] AI 채팅 학습 (System Prompt + 대화 API + 채팅 UI)
10. [ ] 단어 사용 감지 + 상태 업데이트
11. [ ] 세션 완료 화면

Phase 3: 유료 기능 (1주)
──────────────────────
12. [ ] IAP 결제 연동 (상품 등록 + 구매 + 검증)
13. [ ] 프리미엄 접근 제어 미들웨어
14. [ ] 스피킹 학습 (STT + 피드백 Prompt + TTS + UI)
15. [ ] 구독 관리 페이지

Phase 4: 부가 기능 + 마무리 (1주)
──────────────────────
16. [ ] 학습 기록/통계 페이지
17. [ ] 연속 학습 스트릭 로직
18. [ ] 에러 핸들링 + 로딩 상태
19. [ ] TDS 디자인 점검 + 반응형 확인
20. [ ] Sandbox 테스트 + .ait 빌드
```

### 12.3 Key Dependencies (npm / pip)

**Frontend (package.json):**
```json
{
  "dependencies": {
    "@apps-in-toss/web-framework": "latest",
    "@toss/tds-mobile": "latest",
    "react": "^18",
    "react-dom": "^18",
    "zustand": "^4",
    "@tanstack/react-query": "^5",
    "axios": "^1"
  },
  "devDependencies": {
    "typescript": "^5",
    "vite": "^5",
    "@types/react": "^18"
  }
}
```

**Backend (requirements.txt):**
```
fastapi==0.115.*
uvicorn[standard]==0.34.*
openai==1.*
supabase==2.*
httpx==0.27.*
pydantic==2.*
python-jose[cryptography]==3.*
python-dotenv==1.*
```

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-21 | Initial draft | gayeonwon |
