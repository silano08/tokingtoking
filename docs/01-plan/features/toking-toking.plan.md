# TokingToking (토킹토킹) Planning Document

> **Summary**: 앱인토스 기반 AI 영어 어휘 학습 앱 - 대화를 통해 자연스럽게 단어를 익히는 서비스
>
> **Project**: TokingToking
> **Version**: 0.1.0
> **Author**: gayeonwon
> **Date**: 2026-02-21
> **Status**: Draft

---

## 1. Overview

### 1.1 Purpose

영어 어휘 학습을 AI 대화 기반으로 제공하는 앱인토스 서비스.
단순 암기가 아닌, AI와의 자연스러운 대화 속에서 주어진 단어를 맥락에 맞게 사용하며 체득하는 방식.

- **무료 유저**: 채팅(텍스트) 기반으로 3개 어휘를 대화 내에서 자연스럽게 사용하도록 유도
- **유료 유저**: 스피킹 연습 (음성 입력 → AI 피드백 + 답장) 추가 제공

### 1.2 Background

- **타겟 플랫폼**: 토스 앱인토스 (Apps in Toss) - 3,000만 토스 사용자 접근 가능
- **벤치마크**: 말해보카 (영어 단어 학습 + 대화형 학습)
- **차별점**: 토스 앱 내에서 별도 설치 없이 즉시 접근, AI 실시간 대화 기반 학습
- **수익 모델**: 무료(채팅) + 유료(스피킹) Freemium 구조

### 1.3 Related Documents

- 앱인토스 개발자 문서: https://developers-apps-in-toss.toss.im/intro/overview.html
- 앱인토스 SDK 레퍼런스: https://developers-apps-in-toss.toss.im/bedrock/reference/framework/
- 토스 로그인 가이드: https://developers-apps-in-toss.toss.im/login/develop.html
- IAP 가이드: https://developers-apps-in-toss.toss.im/iap/develop.html

---

## 2. Scope

### 2.1 In Scope

- [x] 레벨 테스트 (앱 최초 진입 시 유저 수준 자동 분류)
- [x] AI 채팅 기반 어휘 학습 (무료 - 텍스트)
- [x] AI 스피킹 연습 (유료 - 음성 입출력 + 피드백)
- [x] 수준별 어휘 DB 및 랜덤 출제
- [x] 토스 로그인 연동
- [x] IAP 결제 (유료 구독)
- [x] 학습 기록 및 진도 관리
- [x] 대화 내 단어 사용 감지 및 피드백

### 2.2 Out of Scope

- 단어장/북마크 기능 (v2)
- 소셜 기능 (친구 대결, 랭킹) (v2)
- 영어 외 다른 언어 지원 (v2)
- 푸시 알림 기반 리마인더 (v2)
- 광고 수익 모델 (v2)

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | **레벨 테스트**: 최초 진입 시 10~15문제 객관식/빈칸 테스트 → 자동 레벨 분류 (Beginner/Intermediate/Advanced) | High | Pending |
| FR-02 | **어휘 출제**: 유저 레벨에 맞는 단어 3개를 랜덤 선정하여 세션마다 제공 | High | Pending |
| FR-03 | **AI 채팅 (무료)**: 텍스트 기반 대화. AI가 자연스러운 상황을 설정하고, 유저가 주어진 3개 단어를 대화 속에서 사용하도록 유도 | High | Pending |
| FR-04 | **단어 사용 감지**: 유저가 대화에서 목표 단어를 올바른 맥락으로 사용했는지 AI가 판별 & 체크표시 | High | Pending |
| FR-05 | **AI 스피킹 (유료)**: 음성 입력 → STT → AI 응답 → TTS. 발음/문법/어휘 사용에 대한 피드백 제공 | High | Pending |
| FR-06 | **토스 로그인**: OAuth 2.0 기반 토스 로그인 (앱인토스 필수) | High | Pending |
| FR-07 | **IAP 결제**: 유료 구독 (스피킹 기능 언락). 월간/연간 플랜 | High | Pending |
| FR-08 | **학습 기록**: 세션별 학습 단어, 사용 성공 여부, 학습 일수 기록 | Medium | Pending |
| FR-09 | **레벨 재측정**: 학습 데이터 기반 자동 레벨 조정 또는 수동 재테스트 | Medium | Pending |
| FR-10 | **세션 완료 화면**: 3개 단어 모두 사용 성공 시 세션 완료 요약 (사용 문장, 피드백) | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| Performance | AI 응답 시간 < 3초 (채팅), < 5초 (스피킹) | API 응답 시간 모니터링 |
| Security | mTLS 인증, 사용자 데이터 AES-256-GCM 암호화 (앱인토스 필수) | 앱인토스 보안 검수 |
| UX | TDS (Toss Design System) 준수 (앱인토스 비게임 필수) | 앱인토스 디자인 검수 |
| Availability | 서버 가용성 99.5% | 모니터링 |
| Compatibility | Android 7+, iOS 16+ (앱인토스 기본 요건) | 디바이스 테스트 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] 레벨 테스트 → 레벨 분류 → 단어 출제 → AI 채팅 플로우 완성
- [ ] 유료 결제 → 스피킹 기능 활성화 플로우 완성
- [ ] 토스 로그인 연동 및 사용자 데이터 저장
- [ ] 앱인토스 검수 기준 충족 (운영/디자인/기능/보안 4단계)
- [ ] Sandbox 환경에서 전체 플로우 테스트 완료

### 4.2 Quality Criteria

- [ ] AI 대화 품질: 목표 단어를 자연스럽게 유도하는 대화 성공률 > 85%
- [ ] STT/TTS 정확도 > 90% (유료 스피킹)
- [ ] 앱인토스 검수 통과 (디자인, 보안, 기능)
- [ ] 빌드 성공 (.ait 파일 생성)

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| AI API 비용 증가 | High | High | 무료 유저 일일 세션 제한 (3회/일), 프롬프트 최적화로 토큰 절약 |
| AI 응답 품질 불안정 | High | Medium | 체계적인 System Prompt 설계, 단어 사용 감지 로직 별도 구현 |
| STT/TTS 정확도 부족 | Medium | Medium | Web Speech API 우선 사용, 필요시 Whisper API로 전환 |
| 앱인토스 검수 탈락 | High | Medium | TDS 완벽 준수, 다크패턴 금지 규칙 사전 체크리스트 |
| 사업자등록 미비 | High | Low | 토스 로그인/결제 사용 위해 사업자등록 필수 - 사전 준비 |
| mTLS 인증서 설정 오류 | Medium | Medium | 앱인토스 콘솔에서 인증서 발급 → 서버 사전 테스트 |
| 무료 AI API 제한/중단 | Medium | Medium | ChatGPT API를 기본으로, 대안으로 Gemini API (무료 티어) 검토 |

---

## 6. Architecture Considerations

### 6.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | Simple structure | Static sites, portfolios | ☐ |
| **Dynamic** | Feature-based modules, BaaS integration | Web apps with backend, SaaS MVPs | ☑ |
| **Enterprise** | Strict layer separation, DI, microservices | High-traffic systems | ☐ |

### 6.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| **플랫폼** | WebView / React Native | **WebView (Vite + React + TS)** | 웹 기술 기반으로 빠른 개발, WebView에서 Web Speech API 활용 가능 |
| **앱인토스 SDK** | @apps-in-toss/web-framework | **@apps-in-toss/web-framework** | WebView 기반 선택에 따른 필수 |
| **디자인 시스템** | TDS (@toss/tds-mobile) | **@toss/tds-mobile** | 앱인토스 비게임 앱 필수 사항 |
| **백엔드** | Python (FastAPI) / Node.js (Express) | **Python (FastAPI)** | AI API 연동에 최적, 빠른 개발, 유저 요청 반영 |
| **DB** | PostgreSQL / SQLite / Supabase | **Supabase (PostgreSQL)** | 무료 티어 활용, 인증/DB/스토리지 통합, RLS 지원 |
| **AI API** | ChatGPT API / Gemini API / Claude API | **ChatGPT API (gpt-4o-mini)** | 비용 효율적, 대화 품질 우수. 대안: Gemini 1.5 Flash (무료 티어) |
| **STT** | Web Speech API / Whisper API | **Web Speech API** (1차), Whisper (fallback) | 무료, 브라우저 내장, 추가 비용 없음 |
| **TTS** | Web Speech API / OpenAI TTS | **Web Speech API** (1차), OpenAI TTS (유료) | 무료 우선, 품질 필요시 OpenAI TTS |
| **상태 관리** | Zustand / Context API | **Zustand** | 가볍고 직관적 |
| **API 클라이언트** | fetch / axios + react-query | **axios + TanStack Query** | 캐싱, 리트라이 자동화 |

### 6.3 Clean Architecture Approach

```
Selected Level: Dynamic

시스템 아키텍처:
┌─────────────────────────────────────────────────────────────┐
│  앱인토스 (토스 앱 내 WebView)                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Frontend (Vite + React + TypeScript)               │    │
│  │  @apps-in-toss/web-framework + @toss/tds-mobile     │    │
│  │                                                     │    │
│  │  pages/                                             │    │
│  │  ├── index.tsx          (홈/세션 시작)                │    │
│  │  ├── level-test.tsx     (레벨 테스트)                 │    │
│  │  ├── chat.tsx           (채팅 학습 - 무료)            │    │
│  │  ├── speaking.tsx       (스피킹 학습 - 유료)          │    │
│  │  ├── session-result.tsx (세션 결과)                   │    │
│  │  ├── subscribe.tsx      (구독 결제)                   │    │
│  │  └── mypage.tsx         (학습 기록/설정)              │    │
│  └─────────────────────────────────────────────────────┘    │
│                          │ HTTPS                            │
│                          ▼                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Backend (Python FastAPI)                           │    │
│  │                                                     │    │
│  │  /api/auth/       → 토스 로그인 OAuth 처리           │    │
│  │  /api/level-test/ → 레벨 테스트 문제 출제/채점        │    │
│  │  /api/vocab/      → 레벨별 단어 출제                 │    │
│  │  /api/chat/       → AI 대화 (ChatGPT API 프록시)     │    │
│  │  /api/speaking/   → 스피킹 피드백 (유료 전용)         │    │
│  │  /api/iap/        → IAP 주문 상태 확인               │    │
│  │  /api/history/    → 학습 기록 CRUD                   │    │
│  └─────────────────────────────────────────────────────┘    │
│       │ mTLS              │ HTTPS                           │
│       ▼                   ▼                                 │
│  ┌──────────┐    ┌────────────────┐                         │
│  │ 앱인토스  │    │  Supabase      │                         │
│  │ API 서버  │    │  (PostgreSQL)  │                         │
│  │ 토스로그인│    │  users, vocab, │                         │
│  │ IAP 검증  │    │  sessions,     │                         │
│  └──────────┘    │  history       │                         │
│                  └────────────────┘                         │
│                          │                                  │
│                  ┌────────────────┐                         │
│                  │  OpenAI API    │                         │
│                  │  (ChatGPT)     │                         │
│                  └────────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

### 6.4 핵심 유저 플로우

```
[최초 진입]
토스 앱 → 앱인토스 → 토스 로그인 → 레벨 테스트 (10~15문제)
→ 레벨 자동 분류 (Beginner/Intermediate/Advanced) → 홈

[무료 학습 세션 (채팅)]
홈 → "학습 시작" → 레벨 맞춤 단어 3개 제시
→ AI 채팅 시작 (상황 설정) → 대화하며 단어 사용
→ 단어 사용 시 체크 ✓ → 3개 모두 사용 → 세션 완료 화면

[유료 학습 세션 (스피킹)]
홈 → "스피킹 연습" → 구독 확인 (미구독 시 결제 페이지)
→ 레벨 맞춤 단어 3개 제시 → AI 음성 대화 시작
→ 유저 음성 입력 → STT → AI 분석 (발음/문법/어휘 피드백)
→ AI 음성 응답 (TTS) → 반복 → 세션 완료 (상세 피드백)
```

---

## 7. Convention Prerequisites

### 7.1 Existing Project Conventions

- [ ] `CLAUDE.md` has coding conventions section
- [ ] `docs/01-plan/conventions.md` exists (Phase 2 output)
- [ ] ESLint configuration
- [ ] Prettier configuration
- [ ] TypeScript configuration (`tsconfig.json`)

### 7.2 Conventions to Define/Verify

| Category | Current State | To Define | Priority |
|----------|---------------|-----------|:--------:|
| **Naming** | Missing | 컴포넌트: PascalCase, 함수: camelCase, 파일: kebab-case | High |
| **Folder structure** | Missing | pages/ features/ components/ services/ types/ | High |
| **Import order** | Missing | React → 3rd party → @toss → features → local | Medium |
| **Environment variables** | Missing | .env 파일 기반, VITE_ prefix (클라이언트) | Medium |
| **Error handling** | Missing | try-catch + 사용자 친화적 에러 메시지 | Medium |

### 7.3 Environment Variables Needed

| Variable | Purpose | Scope | To Be Created |
|----------|---------|-------|:-------------:|
| `VITE_API_URL` | 백엔드 API URL | Client | ☑ |
| `OPENAI_API_KEY` | ChatGPT API 키 | Server | ☑ |
| `SUPABASE_URL` | Supabase 프로젝트 URL | Server | ☑ |
| `SUPABASE_KEY` | Supabase anon/service key | Server | ☑ |
| `TOSS_MTLS_CERT` | 앱인토스 mTLS 인증서 경로 | Server | ☑ |
| `TOSS_MTLS_KEY` | 앱인토스 mTLS 키 경로 | Server | ☑ |
| `AES_DECRYPTION_KEY` | 토스 로그인 개인정보 복호화 키 | Server | ☑ |

### 7.4 Pipeline Integration

| Phase | Status | Document Location | Command |
|-------|:------:|-------------------|---------|
| Phase 1 (Schema) | ☐ | `docs/01-plan/schema.md` | `/phase-1-schema` |
| Phase 2 (Convention) | ☐ | `docs/01-plan/conventions.md` | `/phase-2-convention` |

---

## 8. AI API Strategy

### 8.1 Primary: OpenAI ChatGPT API

| Model | Use Case | Estimated Cost |
|-------|----------|---------------|
| `gpt-4o-mini` | 일반 채팅 대화, 단어 사용 감지, 레벨 테스트 채점 | ~$0.15/1M input, ~$0.60/1M output |
| `gpt-4o` | 스피킹 피드백 (발음/문법 분석) - 유료 전용 | ~$2.50/1M input, ~$10/1M output |

### 8.2 Alternative: Google Gemini API (무료 티어)

| Model | Free Tier Limit | Use Case |
|-------|----------------|----------|
| `gemini-2.0-flash` | 15 RPM, 1M TPM, 1500 RPD | 무료 유저 채팅 대화 (비용 절감) |

### 8.3 System Prompt 설계 방향

```
[채팅 모드 System Prompt 핵심]
- Role: 친근한 영어 회화 파트너
- 유저 레벨에 맞는 난이도로 대화
- 주어진 3개 단어를 자연스럽게 사용할 수 있는 상황 설정
- 유저가 단어를 사용하면 인식하고 자연스럽게 반응
- 유저가 단어를 사용하지 않으면 은근히 유도
- 응답은 JSON 형태: { message, wordUsage: { word1: boolean, word2: boolean, word3: boolean }, hint? }

[스피킹 모드 System Prompt 핵심]
- 위 + 발음/문법/어휘 사용에 대한 피드백 추가
- 응답 JSON: { message, feedback: { pronunciation, grammar, vocabulary }, wordUsage, encouragement }
```

---

## 9. 어휘 DB 설계 방향

### 9.1 레벨 분류

| Level | CEFR | 어휘 수준 | 예시 |
|-------|------|----------|------|
| Beginner | A1-A2 | 기초 생활 영어 (~1,500단어) | apple, happy, go, school |
| Intermediate | B1-B2 | 일상/업무 영어 (~3,000단어) | negotiate, perspective, implement |
| Advanced | C1-C2 | 고급/학술 영어 (~5,000단어) | ubiquitous, meticulous, paradigm |

### 9.2 단어 데이터 구조

```json
{
  "id": "uuid",
  "word": "negotiate",
  "level": "intermediate",
  "pos": "verb",
  "definition_ko": "협상하다",
  "definition_en": "to discuss something in order to reach an agreement",
  "example_sentence": "We need to negotiate the terms of the contract.",
  "pronunciation": "/nɪˈɡoʊʃieɪt/",
  "category": "business",
  "difficulty_score": 5
}
```

---

## 10. 앱인토스 플랫폼 제약사항 체크리스트

| 제약사항 | 상태 | 비고 |
|---------|:----:|------|
| 토스 로그인만 사용 (외부 SSO 불가) | ☑ 준수 | OAuth 2.0 기반 |
| TDS (Toss Design System) 필수 | ☑ 준수 | @toss/tds-mobile 사용 |
| iframe 사용 금지 | ☑ 준수 | iframe 미사용 |
| 다크모드 미지원 (라이트모드만) | ☑ 준수 | 라이트모드 고정 |
| mTLS 인증서 필수 (서버 API) | ☑ 준수 | 콘솔에서 발급 |
| 사업자등록 필요 (로그인/결제) | ⚠️ 확인 필요 | 사전 준비 필요 |
| 다크패턴 금지 | ☑ 준수 | 명확한 CTA, 쉬운 종료 |
| Sandbox 테스트 필수 | ☑ 계획 | 검수 전 완료 |
| 빌드: .ait 파일 업로드 | ☑ 계획 | `npm run build` |

---

## 11. Next Steps

1. [ ] Design 문서 작성 (`toking-toking.design.md`) → 상세 UI/API 설계
2. [ ] 사업자등록 확인 (토스 로그인/IAP 필수 요건)
3. [ ] 앱인토스 콘솔 워크스페이스 생성
4. [ ] 어휘 DB 초기 데이터 구축 (레벨별 최소 100단어)
5. [ ] AI System Prompt 프로토타이핑 및 테스트
6. [ ] 프로젝트 초기화 (Vite + React + TS + 앱인토스 SDK)

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-21 | Initial draft | gayeonwon |
