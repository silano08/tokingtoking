# TokingToking (토킹토킹)

AI 영어 어휘 학습 앱 - 앱인토스 (Apps in Toss) 미니앱

## 주요 기능

- **레벨 테스트**: 15문항 레벨 테스트 → 자동 레벨 배정 (초급/중급/고급)
- **채팅 학습 (무료)**: 3개 단어를 대화 속에서 자연스럽게 사용하도록 AI가 유도
- **스피킹 학습 (Premium)**: 음성 입력 → Groq Whisper 전사 → AI 발음/문법/어휘 피드백
- **학습 기록**: 연속 학습, 완료 세션, 통계 확인

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Vite + React 18 + TypeScript |
| Backend | Python FastAPI |
| Database | Supabase (PostgreSQL) |
| AI (Chat) | OpenAI gpt-4o-mini |
| AI (Speaking) | OpenAI gpt-4o |
| STT | Groq Whisper Large v3 Turbo (<1초 전사) |
| TTS | Web Speech API |
| State | Zustand |
| 결제 | Apps in Toss IAP |

## 시작하기

### 1. 환경 변수 설정

```bash
# Backend
cp backend/.env.example backend/.env
# .env 파일에 실제 키 입력

# Frontend
cp frontend/.env.local.example frontend/.env.local
```

### 2. Backend 실행

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. DB 마이그레이션 & 시드

```bash
# Supabase SQL Editor에서 실행:
# backend/db/migrations/001_initial_schema.sql

# 시드 데이터 삽입:
cd backend
python -m db.seed
```

### 4. Frontend 실행

```bash
cd frontend
npm install
npm run dev
```

→ http://localhost:5173 에서 확인

## 프로젝트 구조

```
tokingtoking/
├── backend/
│   ├── main.py              # FastAPI 앱 진입점
│   ├── config.py             # 환경 변수 설정
│   ├── db/
│   │   ├── supabase_client.py
│   │   ├── seed.py           # 시드 데이터 스크립트
│   │   └── migrations/       # SQL 스키마
│   ├── middleware/
│   │   ├── auth.py           # JWT 인증
│   │   └── premium.py        # 프리미엄 검증
│   ├── models/               # Pydantic 모델
│   ├── routers/              # API 라우터 7개
│   ├── services/             # 비즈니스 로직
│   │   ├── chat_service.py       # AI 대화 핵심 로직
│   │   ├── transcription_service.py  # Groq Whisper STT
│   │   └── ...
│   └── prompts/              # AI 시스템 프롬프트
├── frontend/
│   ├── src/
│   │   ├── pages/            # 7개 페이지
│   │   ├── components/       # 재사용 컴포넌트
│   │   ├── services/         # API 클라이언트
│   │   ├── store/            # Zustand 상태 관리
│   │   ├── types/            # TypeScript 타입
│   │   └── utils/            # 유틸리티 (TTS 등)
│   └── index.html
└── data/seed/                # 시드 데이터 (어휘 105개, 문제 15개)
```

## API 엔드포인트

| Method | Path | 설명 |
|--------|------|------|
| POST | /api/auth/login | 토스 로그인 |
| GET | /api/auth/me | 내 정보 |
| GET | /api/level-test/questions | 레벨 테스트 문제 |
| POST | /api/level-test/submit | 레벨 테스트 제출 |
| GET | /api/vocab/random | 랜덤 단어 조회 |
| POST | /api/chat/session | 채팅 세션 시작 |
| POST | /api/chat/message | 채팅 메시지 전송 |
| POST | /api/speaking/message | 스피킹 메시지 (텍스트) |
| POST | /api/speaking/transcribe | 스피킹 음성 전사+응답 |
| POST | /api/iap/verify | IAP 구매 검증 |
| GET | /api/iap/subscription | 구독 상태 |
| GET | /api/history/sessions | 학습 기록 |
| GET | /api/history/stats | 학습 통계 |
| GET | /api/health | 헬스 체크 |

## Groq Whisper 음성 파이프라인

```
[사용자 음성] → [MediaRecorder 녹음]
    → [Groq Whisper v3 Turbo: <1초 전사, $0.04/hr]
    → [LLM 후처리: 학습 어휘 기반 교정]
    → [AI 대화 응답 + 발음/문법 피드백]
    → [TTS 재생]
```
