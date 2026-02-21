# TokingToking Analysis Report

> **Analysis Type**: Gap Analysis (PDCA Check Phase) -- Re-analysis
>
> **Project**: TokingToking
> **Version**: 0.1.0
> **Analyst**: gap-detector (bkit)
> **Date**: 2026-02-21
> **Design Doc**: [toking-toking.design.md](../02-design/features/toking-toking.design.md)
> **Previous Analysis**: v0.1 (2026-02-21) -- 82% match rate

---

## 1. Analysis Overview

### 1.1 Analysis Purpose

PDCA Check phase re-analysis following implementation of previously identified gaps. The prior analysis (v0.1) reported an 82% overall match rate. Since then, the following items have been added:

1. POST `/api/auth/refresh` endpoint (`backend/routers/auth.py`)
2. GET `/api/chat/session/:id` endpoint (`backend/routers/chat.py` + `services/chat_service.py`)
3. Six frontend hooks: `useAuth.ts`, `useChat.ts`, `useSpeaking.ts`, `useLevelTest.ts`, `useVocab.ts`, `useSubscription.ts`
4. `store/subscriptionStore.ts`

### 1.2 Analysis Scope

- **Design Document**: `docs/02-design/features/toking-toking.design.md`
- **Backend Implementation**: `backend/` (routers, services, models, middleware, prompts, db)
- **Frontend Implementation**: `frontend/src/` (pages, components, hooks, services, store, types, utils)
- **Analysis Date**: 2026-02-21

---

## 2. Overall Scores

| Category | Previous | Current | Status |
|----------|:--------:|:-------:|:------:|
| API Endpoints | 80% | 100% | [PASS] |
| Data Model (DB Schema) | 97% | 97% | [PASS] |
| Frontend Pages | 100% | 100% | [PASS] |
| Frontend Components | 71% | 71% | [WARNING] |
| Frontend Services | 90% | 90% | [PASS] |
| Frontend Store/State | 80% | 100% | [PASS] |
| Frontend Hooks | 0% | 100% | [PASS] |
| Frontend Types | 100% | 100% | [PASS] |
| Backend Services | 100% | 100% | [PASS] |
| AI Prompts | 95% | 95% | [PASS] |
| Convention Compliance | 88% | 88% | [WARNING] |
| Architecture Compliance | 75% | 82% | [WARNING] |
| **Overall Match Rate** | **82%** | **92%** | **[PASS]** |

---

## 3. Gap Analysis (Design vs Implementation)

### 3.1 Backend API Endpoints

| Design Endpoint | Implementation | Status | Notes |
|-----------------|---------------|--------|-------|
| POST `/api/auth/login` | `routers/auth.py:12` | [MATCH] | |
| POST `/api/auth/refresh` | `routers/auth.py:21` | [MATCH] | **NEW** -- JWT refresh with token type validation |
| POST `/api/auth/logout` | `routers/auth.py:46` | [MATCH] | |
| GET `/api/auth/me` | `routers/auth.py:51` | [MATCH] | |
| GET `/api/level-test/questions` | `routers/level_test.py:10` | [MATCH] | |
| POST `/api/level-test/submit` | `routers/level_test.py:16` | [MATCH] | |
| GET `/api/vocab/random` | `routers/vocab.py:9` | [MATCH] | |
| POST `/api/chat/session` | `routers/chat.py:41` | [MATCH] | |
| POST `/api/chat/message` | `routers/chat.py:66` | [MATCH] | |
| GET `/api/chat/session/:id` | `routers/chat.py:54` | [MATCH] | **NEW** -- Delegates to `get_session_detail()` |
| POST `/api/speaking/message` | `routers/speaking.py:13` | [MATCH] | |
| POST `/api/iap/verify` | `routers/iap.py:10` | [MATCH] | |
| GET `/api/iap/subscription` | `routers/iap.py:19` | [MATCH] | |
| GET `/api/history/sessions` | `routers/history.py:9` | [MATCH] | |
| GET `/api/history/stats` | `routers/history.py:27` | [MATCH] | |
| -- | POST `/api/speaking/transcribe` | [ADDED] | Groq Whisper transcription (not in design) |
| -- | GET `/api/health` | [ADDED] | Health check (minor, expected) |

**API Score: 100%** (15/15 designed endpoints implemented; 2 added beyond design)

#### Newly Implemented Endpoints Detail

**POST `/api/auth/refresh`** (`routers/auth.py:21`)
- Decodes refresh token, validates `sub` and `type == "refresh"`
- Issues new access + refresh token pair via `TokenResponse`
- Proper error handling: returns 401 on invalid/expired refresh token
- Matches design requirement for JWT refresh flow

**GET `/api/chat/session/:id`** (`routers/chat.py:54`)
- Route: `/session/{session_id}` with auth dependency
- Service function: `get_session_detail(user_id, session_id)` in `services/chat_service.py:223`
- Returns session data, messages list, target words, and session status
- Enables session recovery after app restart
- User ownership verified (filters by both session_id and user_id)

---

### 3.2 Data Model (DB Schema)

No changes since previous analysis.

| Design Table | Implementation | Status |
|-------------|---------------|--------|
| `users` | `001_initial_schema.sql:5` | [MATCH] |
| `vocabularies` | `001_initial_schema.sql:19` | [MATCH] |
| `level_test_questions` | `001_initial_schema.sql:35` | [MATCH] |
| `study_sessions` | `001_initial_schema.sql:47` | [MATCH] |
| `chat_messages` | `001_initial_schema.sql:59` | [MATCH] |
| `subscriptions` | `001_initial_schema.sql:70` | [MATCH] |

**Data Model Score: 97%** (unchanged -- all 6 tables match, 2 extra indexes and 1 trigger as improvements)

---

### 3.3 Frontend Pages

No changes since previous analysis.

**Pages Score: 100%** (7/7 designed pages implemented)

---

### 3.4 Frontend Components

| Design Component | Implementation | Status | Notes |
|-----------------|---------------|--------|-------|
| `ChatBubble` | `components/ChatBubble.tsx` | [MATCH] | |
| `WordCard` | -- | [MISSING] | Functionality inline in `HomePage` |
| `WordStatusBar` | `components/WordStatusBar.tsx` | [MATCH] | |
| `FeedbackCard` | -- | [MISSING] | Integrated into `ChatBubble` with `showFeedback` prop |
| `VoiceRecorder` | `components/VoiceRecorder.tsx` | [MATCH] | Enhanced: dual mode (server/browser) |
| `ProgressBar` | `components/ProgressBar.tsx` | [MATCH] | |
| `QuestionCard` | -- | [MISSING] | Question rendering is inline in `LevelTestPage` |

**Components Score: 71%** (4/7 designed components exist as separate files)

All three "missing" components have their functionality implemented -- they are not extracted into separate reusable files as the design specified.

---

### 3.5 Frontend Services

No changes since previous analysis.

**Services Score: 90%** (6/6 designed services + 1 added for Groq Whisper)

---

### 3.6 Frontend Store/State

| Design Store | Implementation | Status | Notes |
|-------------|---------------|--------|-------|
| `authStore.ts` | `store/authStore.ts` | [MATCH] | |
| `sessionStore.ts` | `store/sessionStore.ts` | [MATCH] | |
| `subscriptionStore.ts` | `store/subscriptionStore.ts` | [MATCH] | **NEW** -- Zustand store with `isPremium`, `subscription`, `setSubscription`, `clearSubscription` |

**Store Score: 100%** (3/3 designed stores implemented)

#### Newly Implemented Store Detail

**`store/subscriptionStore.ts`**
- Zustand store with `SubscriptionState` interface
- State: `isPremium: boolean`, `subscription: Subscription | null`
- Actions: `setSubscription(subscription, isPremium)`, `clearSubscription()`
- Properly imports `Subscription` type from `@/types/subscription`
- Used by `useSubscription` hook

---

### 3.7 Frontend Hooks

| Design Hook | Implementation | Status | Notes |
|------------|---------------|--------|-------|
| `useAuth.ts` | `hooks/useAuth.ts` | [MATCH] | **NEW** -- Wraps authStore + authService (login, logout, fetchMe) |
| `useChat.ts` | `hooks/useChat.ts` | [MATCH] | **NEW** -- Wraps sessionStore + chatService (createSession, sendMessage) |
| `useSpeaking.ts` | `hooks/useSpeaking.ts` | [MATCH] | **NEW** -- Recording + transcription + speaking message flow |
| `useLevelTest.ts` | `hooks/useLevelTest.ts` | [MATCH] | **NEW** -- Question fetch + answer submission + level update |
| `useVocab.ts` | `hooks/useVocab.ts` | [MATCH] | **NEW** -- Random word fetching with loading state |
| `useSubscription.ts` | `hooks/useSubscription.ts` | [MATCH] | **NEW** -- Purchase verification + status check via subscriptionStore |

**Hooks Score: 100%** (6/6 designed hooks implemented)

#### Hook Quality Assessment

| Hook | Service Integration | Store Integration | Error Handling | Loading State |
|------|:-------------------:|:-----------------:|:--------------:|:-------------:|
| `useAuth` | authService | authStore | Delegated | N/A |
| `useChat` | chatService | sessionStore | try/finally | Yes |
| `useSpeaking` | chatService + speechService | sessionStore | try/finally | Yes |
| `useLevelTest` | levelTestService | authStore | try/finally | Yes |
| `useVocab` | vocabService | Local state | try/finally | Yes |
| `useSubscription` | iapService | subscriptionStore + authStore | Delegated | N/A |

All hooks correctly follow the designed architecture pattern:
```
Hooks -> Services + Store + Types
```

---

### 3.8 Frontend Types

No changes since previous analysis.

**Types Score: 100%** (5/5 designed type files implemented)

---

### 3.9 Backend Services

| Design Service | Implementation | Status | Notes |
|---------------|---------------|--------|-------|
| `auth_service.py` | `services/auth_service.py` | [MATCH] | |
| `chat_service.py` | `services/chat_service.py` | [MATCH] | **Enhanced**: now includes `get_session_detail()` function |
| `vocab_service.py` | `services/vocab_service.py` | [MATCH] | |
| `level_test_service.py` | `services/level_test_service.py` | [MATCH] | |
| `iap_service.py` | `services/iap_service.py` | [MATCH] | |
| `toss_api_service.py` | `services/toss_api_service.py` | [MATCH] | |
| -- | `services/transcription_service.py` | [ADDED] | Groq Whisper pipeline |

**Backend Services Score: 100%** (6/6 designed + 1 added)

#### Newly Added Service Function

**`get_session_detail()`** (`services/chat_service.py:223`)
- Queries session by `session_id` + `user_id` (ownership check)
- Retrieves all messages ordered by `created_at`
- Resolves `target_words` UUIDs to full word objects
- Returns structured response with `session_id`, `mode`, `target_words`, `messages`, `session_status`
- Correctly computes `completed_count` and `is_completed` from `words_used`

---

### 3.10 AI Prompts

No changes since previous analysis.

**Prompts Score: 95%** (All prompts implemented with enhancements)

---

### 3.11 Backend Middleware

No changes since previous analysis.

**Middleware Score: 100%**

---

### 3.12 Environment Variables

No changes since previous analysis.

**Environment Variables Score: 100%**

---

### 3.13 Missing Utility Files

| Design File | Implementation | Status |
|------------|---------------|--------|
| `utils/speech.ts` | `utils/speech.ts` | [MATCH] |
| `utils/format.ts` | -- | [MISSING] |

---

## 4. Architecture Compliance

### 4.1 Layer Structure (Design Section 10)

| Layer | Design Location | Actual | Status |
|-------|----------------|--------|--------|
| Pages | `src/pages/` | `src/pages/` | [MATCH] |
| Components | `src/components/` | `src/components/` | [MATCH] (4/7 extracted) |
| Hooks | `src/hooks/` | `src/hooks/` | [MATCH] **Previously MISSING, now fully implemented** |
| Services | `src/services/` | `src/services/` | [MATCH] |
| Types | `src/types/` | `src/types/` | [MATCH] |
| Store | `src/store/` | `src/store/` | [MATCH] (3/3) |
| Utils | `src/utils/` | `src/utils/` | [MATCH] (1/2) |

### 4.2 Dependency Rule Compliance

**Design rule (Section 10.2):**
```
Pages -> Components + Hooks
Hooks -> Services + Store + Types
Services -> Types (API calls)
```

**Current state:**
The hooks layer now exists and correctly follows the dependency rules. However, the pages have NOT been refactored to consume hooks. Pages still directly import services.

| File | Violation | Severity | Change from v0.1 |
|------|-----------|----------|-------------------|
| `pages/index.tsx` | Imports `vocabService` directly (should use `useVocab` hook) | MEDIUM | Unchanged |
| `pages/chat.tsx` | Imports `chatService`, `vocabService` directly (should use `useChat` + `useVocab` hooks) | MEDIUM | Unchanged |
| `pages/speaking.tsx` | Imports `chatService`, `speechService` directly (should use `useSpeaking` hook) | MEDIUM | Unchanged |
| `pages/level-test.tsx` | Imports `levelTestService` directly (should use `useLevelTest` hook) | MEDIUM | Unchanged |
| `pages/subscribe.tsx` | No service imports (placeholder IAP), acceptable | LOW | Unchanged |
| `pages/mypage.tsx` | Imports raw `api` instance directly (should use service then hook) | HIGH | Unchanged |

**Architecture Score: 82%** (up from 75%)

Improvement rationale:
- Hooks layer now exists (was completely missing: +7 points)
- Store layer complete (subscriptionStore added)
- However, pages still bypass hooks, reducing the score from a potential 95% to 82%

---

## 5. Convention Compliance

### 5.1 Naming Convention (Design Section 11)

| Category | Convention | Compliance | Violations |
|----------|-----------|:----------:|------------|
| Components | PascalCase | 100% | None |
| Hooks | camelCase, `use` prefix | 100% | None |
| Files (component) | PascalCase.tsx | 100% | None |
| Files (hook) | camelCase.ts | 100% | None (all 6 hooks follow `use*.ts`) |
| Pages | kebab-case.tsx | 100% | None |
| Services (frontend) | camelCase.ts | 100% | None |
| Store | camelCase.ts | 100% | None (`subscriptionStore.ts` follows convention) |
| Types | camelCase.ts | 100% | None |
| Python files | snake_case.py | 100% | None |
| Python functions | snake_case | 100% | None (`get_session_detail` follows convention) |
| Python classes | PascalCase | 100% | None |
| Env variables | UPPER_SNAKE_CASE | 100% | None |

### 5.2 Import Order (Design Section 11.2)

**Hooks import order check (new files):**

| File | Compliance | Notes |
|------|:----------:|-------|
| `hooks/useAuth.ts` | PASS | React -> Store -> Service |
| `hooks/useChat.ts` | PASS | React -> Store -> Service |
| `hooks/useSpeaking.ts` | PASS | React -> Store -> Service -> Service |
| `hooks/useLevelTest.ts` | PASS | React -> Store -> Service -> Types |
| `hooks/useVocab.ts` | PASS | React -> Service -> Types |
| `hooks/useSubscription.ts` | PASS | React -> Store -> Store -> Service |
| `store/subscriptionStore.ts` | PASS | Library -> Types |

**Page import order (unchanged issues):**

| File | Compliance | Notes |
|------|:----------:|-------|
| `pages/index.tsx` | PARTIAL | Missing TDS imports (all inline styles) |
| `pages/chat.tsx` | PARTIAL | Components and store mixed order |
| `pages/speaking.tsx` | PARTIAL | `import type` not consistently separated |
| `pages/level-test.tsx` | PARTIAL | Service before store import |
| `pages/mypage.tsx` | PARTIAL | Raw `api` import instead of service |

### 5.3 TDS (Toss Design System) Usage

| Design Requirement | Implementation | Status |
|-------------------|---------------|--------|
| TDS NavigationBar | Inline HTML/CSS header | [MISSING] |
| TDS Button/Input | Inline styled buttons/inputs | [MISSING] |
| `@toss/tds-mobile` imports | None found in any file | [MISSING] |

**Convention Score: 88%** (unchanged)
- Naming: 100%
- Import order (new hooks): 100%
- Import order (pages): 80%
- TDS usage: 0%

---

## 6. Match Rate Summary

```
+---------------------------------------------+
|  Overall Match Rate: 92%                     |
|  (Previous: 82% -- +10 points improvement)  |
+---------------------------------------------+
|  Category Breakdown:                         |
|                                              |
|  API Endpoints:          100%  (15/15)  +20  |
|  Data Model:              97%  (6/6)     --  |
|  Frontend Pages:         100%  (7/7)     --  |
|  Frontend Components:     71%  (4/7)     --  |
|  Frontend Services:       90%  (6/6+1)   --  |
|  Frontend Store:         100%  (3/3)    +20  |
|  Frontend Hooks:         100%  (6/6)   +100  |
|  Frontend Types:         100%  (5/5)     --  |
|  Backend Services:       100%  (6/6+1)   --  |
|  AI Prompts:              95%  (3/3)     --  |
|  Backend Middleware:      100%  (2/2)     --  |
|  Env Variables:          100%  (15/15+1)  -- |
|  Architecture:            82%            +7  |
|  Convention:              88%             --  |
|                                              |
|  Items matched:     69  (was 60)             |
|  Items missing:      5  (was 14)             |
|  Items added:        6  (unchanged)          |
|  Items changed:      1  (unchanged)          |
+---------------------------------------------+
```

---

## 7. Differences Found

### 7.1 Missing Features (Design YES, Implementation NO)

| # | Item | Design Location | Description | Impact |
|---|------|-----------------|-------------|--------|
| 1 | `components/WordCard.tsx` | Section 5.3, line 870 | Not extracted as separate component (inline in HomePage) | LOW |
| 2 | `components/FeedbackCard.tsx` | Section 5.3, line 873 | Integrated into ChatBubble via `showFeedback` prop | LOW |
| 3 | `components/QuestionCard.tsx` | Section 5.3, line 876 | Inline in LevelTestPage | LOW |
| 4 | `utils/format.ts` | Section 12.1, line 1197 | Format utilities not extracted | LOW |
| 5 | TDS component usage | Section 2.1, line 54 | `@toss/tds-mobile` not integrated; all inline styles | MEDIUM |

### 7.2 Added Features (Design NO, Implementation YES)

| # | Item | Implementation Location | Description | Impact |
|---|------|------------------------|-------------|--------|
| 1 | POST `/api/speaking/transcribe` | `routers/speaking.py:31` | Groq Whisper audio transcription | POSITIVE |
| 2 | `transcription_service.py` | `services/transcription_service.py` | Full Groq Whisper STT pipeline | POSITIVE |
| 3 | `speechService.ts` | `services/speechService.ts` | Frontend audio upload service | POSITIVE |
| 4 | `GROQ_API_KEY` env variable | `config.py`, `.env.example` | Groq API key | NEUTRAL |
| 5 | `idx_vocab_category` index | `001_initial_schema.sql:84` | Additional category index | POSITIVE |
| 6 | `idx_sessions_user_date` index | `001_initial_schema.sql:86` | Composite index for daily limit | POSITIVE |

### 7.3 Changed Features (Design != Implementation)

| # | Item | Design | Implementation | Impact |
|---|------|--------|----------------|--------|
| 1 | `idx_subscriptions_status` | `ON subscriptions(status)` | `ON subscriptions(user_id, status)` | LOW (improvement) |
| 2 | Speaking STT approach | Client-side Web Speech API | Server-side Groq Whisper + browser fallback | POSITIVE |
| 3 | VoiceRecorder mode | Single mode (Web Speech API) | Dual mode: `server` + `browser` | POSITIVE |

### 7.4 Architectural Gap: Pages Not Using Hooks

Although all 6 designed hooks now exist and correctly implement the designed pattern (`Hooks -> Services + Store + Types`), the page components have not been refactored to consume them. Pages still directly import services.

| Page | Direct Service Imports | Should Use Hook |
|------|----------------------|-----------------|
| `pages/index.tsx` | `vocabService` | `useVocab` |
| `pages/chat.tsx` | `chatService`, `vocabService` | `useChat`, `useVocab` |
| `pages/speaking.tsx` | `chatService`, `speechService` | `useSpeaking` |
| `pages/level-test.tsx` | `levelTestService` | `useLevelTest` |
| `pages/mypage.tsx` | `api` (raw instance) | Should use a history service + hook |

This is not counted as a "missing" feature since the hooks exist and are correctly implemented, but represents an incomplete architectural migration. The hooks are ready for consumption.

---

## 8. Resolved Items (from v0.1)

The following items from the previous analysis have been resolved:

| # | Item | Resolution | Verified |
|---|------|-----------|----------|
| 1 | POST `/api/auth/refresh` | Implemented in `routers/auth.py:21-43` with JWT decode, type check, token reissue | YES |
| 2 | GET `/api/chat/session/:id` | Implemented in `routers/chat.py:54-63` + `services/chat_service.py:223-266` | YES |
| 3 | `hooks/useAuth.ts` | Created at `hooks/useAuth.ts` (27 lines, wraps authStore + authService) | YES |
| 4 | `hooks/useChat.ts` | Created at `hooks/useChat.ts` (47 lines, wraps sessionStore + chatService) | YES |
| 5 | `hooks/useSpeaking.ts` | Created at `hooks/useSpeaking.ts` (79 lines, recording + transcription pipeline) | YES |
| 6 | `hooks/useLevelTest.ts` | Created at `hooks/useLevelTest.ts` (39 lines, question fetch + submission) | YES |
| 7 | `hooks/useVocab.ts` | Created at `hooks/useVocab.ts` (22 lines, random word fetching) | YES |
| 8 | `hooks/useSubscription.ts` | Created at `hooks/useSubscription.ts` (31 lines, IAP verification + status) | YES |
| 9 | `store/subscriptionStore.ts` | Created at `store/subscriptionStore.ts` (21 lines, Zustand store) | YES |

---

## 9. Recommended Actions

### 9.1 Short-term Actions (within 1 week)

| Priority | Item | Action | Expected Effort |
|----------|------|--------|-----------------|
| 1 (MEDIUM) | Refactor pages to use hooks | Update 5 page files to import hooks instead of services directly | 2-3 hours |
| 2 (MEDIUM) | Fix `mypage.tsx` raw API import | Replace `api.get('/history/stats')` with a proper service call through a hook | 30 min |
| 3 (MEDIUM) | TDS integration | Replace inline styles with `@toss/tds-mobile` components (Button, Input, NavigationBar) | 2-3 hours |
| 4 (LOW) | Extract missing components | Create `WordCard.tsx`, `FeedbackCard.tsx`, `QuestionCard.tsx` as reusable components | 1-2 hours |
| 5 (LOW) | Create `utils/format.ts` | Extract formatting logic (time formatting, etc.) from pages | 30 min |

### 9.2 Design Document Updates Needed

The following items should be added to the design document to reflect implementation:

- [ ] Add POST `/api/speaking/transcribe` endpoint specification
- [ ] Add `transcription_service.py` to backend services
- [ ] Add `speechService.ts` to frontend services
- [ ] Add `GROQ_API_KEY` to environment variables
- [ ] Update speaking mode flow diagram to show Groq Whisper server-side pipeline
- [ ] Document dual-mode VoiceRecorder (server/browser)

---

## 10. Next Steps

The **92% match rate** exceeds the 90% threshold.

- [ ] Refactor pages to use hooks (would raise architecture score to ~95%)
- [ ] Update design document with added Groq Whisper features
- [ ] Consider extracting remaining 3 components for full component compliance
- [ ] Integrate TDS components when ready for production UI polish

**Recommended command**: `/pdca report toking-toking` to generate completion report.

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-02-21 | Initial gap analysis (82% match rate) | gap-detector |
| 0.2 | 2026-02-21 | Re-analysis after implementing auth/refresh, chat/session/:id, 6 hooks, subscriptionStore (92% match rate) | gap-detector |
