# Current Task — 현재 작업 지시서

## 0. 작업 요약

Post-MVP Unit 20 — 세션과 AI 설정 메타데이터 persistence 보강

현재 mock 인증 세션과 AI 설정은 Jotai 메모리 상태에만 저장된다. 새로고침하면 로그인 세션, 무료 AI 제안 잔여 횟수, AI 모델 선택, API key 연동 표시 상태가 초기화된다. 이번 작업은 브라우저 storage 기반 persistence를 추가해 MVP 흐름의 연속성을 높인다.

단, 보안 원칙상 API key 원문은 절대 `localStorage`, `sessionStorage`, Jotai atom, 테스트 fixture, 문서 예시 어디에도 저장하지 않는다. 저장 가능한 값은 세션 mock 정보, 무료 횟수, AI 모델 ID, API key 연결 여부, 표시 전용 마스킹 값뿐이다.

## 1. 반드시 읽을 문서

- `AGENTS.md`
- `PRD.mdc`
- `docs/PROJECT_GUIDE.md`
- `docs/WORK_LOG.md`
- `docs/REVIEW_LOG.md`
- `docs/SESSION_STATE.md`
- `docs/NEXT_TASK_DRAFT.md`
- `docs/superpowers/plans/2026-06-03-unit20-session-ai-settings-persistence.md`
- `.rules/project-rules_architecture.mdc`
- `.rules/project-rules_working.mdc`
- `.rules/project-rules_testing-policy.mdc`
- `.rules/project-rules_api-spec-contract.mdc`
- `.rules/project-rules_review.mdc`

## 2. 선행 상태

- Unit 19 커밋/푸시 완료: `cebea72`
- `sessionAtom`은 현재 메모리 전용이며 `Session | null`을 직접 저장한다.
- `aiSettingsAtom`은 현재 메모리 전용이며 API key 원문은 저장하지 않고 `maskedApiKey`만 저장한다.
- `saveApiKeyAtom`은 key 원문을 받아 마스킹 값으로 변환한 뒤 `isApiKeyConnected`만 true로 전환한다.
- 로그인/리밸런싱/설정 UI는 이미 `sessionAtom`, `aiSettingsAtom`, `decrementAiTrialAtom`, `saveApiKeyAtom`, `clearApiKeyAtom`에 연결되어 있다.

## 3. 작업 범위

### 포함

- 브라우저 storage 접근 helper 추가
- `sessionAtom` 초기값을 session storage에서 복원
- `sessionAtom` write 시 session storage 저장/삭제 반영
- `decrementAiTrialAtom`, `clearSessionAtom`이 persistence 상태까지 함께 갱신되도록 보장
- `aiSettingsAtom` 초기값을 local storage에서 복원
- `setAiModelAtom`, `saveApiKeyAtom`, `clearApiKeyAtom`이 persistence 상태까지 함께 갱신되도록 보장
- storage parse 실패, schema 불일치, 브라우저 storage 미지원 상황에서 안전하게 기본값으로 fallback
- session/settings atom 테스트 보강
- `WORK_LOG.md`, `SESSION_STATE.md` 갱신

### 제외

- API key 원문 저장
- 실제 AI provider 호출
- 실제 Supabase 저장/암호화
- 실제 인증 토큰 저장
- OAuth 또는 외부 API 연동
- UI 변경
- 신규 패키지 설치
- 커밋 생성

## 4. 권장 설계

### 4.1 shared storage helper

권장 신규 파일:

- `src/shared/lib/browserStorage.ts`

역할:

- `window`가 없는 환경에서 storage 접근을 시도하지 않는다.
- JSON parse 실패 시 fallback을 반환한다.
- validate 함수로 저장된 값의 최소 shape를 확인한다.
- storage write/remove 실패는 앱을 중단시키지 않는다.

`src/shared/index.ts`에서 public API로 export한다.

### 4.2 session persistence

권장 storage:

- `sessionStorage`

권장 key:

- `assetflow.session`

권장 파일:

- `src/entities/session/model/constants.ts`
- `src/entities/session/model/sessionAtom.ts`
- `src/entities/session/model/sessionAtom.test.ts`

검증해야 할 동작:

- 기본 storage가 비어 있으면 `sessionAtom`은 `null`이다.
- 유효한 세션이 storage에 있으면 atom 초기값으로 복원된다.
- `store.set(sessionAtom, session)`은 storage에 저장한다.
- `clearSessionAtom`은 atom과 storage를 모두 비운다.
- `decrementAiTrialAtom`은 잔여 횟수와 storage 값을 함께 갱신한다.
- 잘못된 JSON 또는 shape가 다른 값은 무시하고 `null`로 fallback한다.

### 4.3 AI settings persistence

권장 storage:

- `localStorage`

권장 key:

- `assetflow.ai-settings`

권장 파일:

- `src/entities/settings/model/constants.ts`
- `src/entities/settings/model/aiSettingsAtom.ts`
- `src/entities/settings/model/aiSettingsAtom.test.ts`

검증해야 할 동작:

- 기본 storage가 비어 있으면 GPT 모델, API key 미연결 상태다.
- 유효한 설정이 storage에 있으면 atom 초기값으로 복원된다.
- `setAiModelAtom`은 modelId와 storage 값을 함께 갱신한다.
- `saveApiKeyAtom`은 API key 원문을 저장하지 않고 `maskedApiKey`와 연결 상태만 저장한다.
- `clearApiKeyAtom`은 연결 상태와 마스킹 값을 지우고 storage에도 반영한다.
- 잘못된 JSON 또는 지원하지 않는 modelId는 기본값으로 fallback한다.

## 5. 필수 검증

작업 완료 전 아래 명령을 실행한다.

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
git diff --check
```

추가 권장 targeted test:

```bash
pnpm test src/entities/session/model/sessionAtom.test.ts src/entities/settings/model/aiSettingsAtom.test.ts
```

## 6. 완료 기준

- 새로고침 이후에도 mock 세션과 무료 AI 제안 잔여 횟수를 복원할 수 있다.
- 새로고침 이후에도 AI 모델 선택과 API key 연결 표시 메타데이터를 복원할 수 있다.
- API key 원문은 어떤 storage에도 저장되지 않는다.
- storage 오류/손상 데이터가 앱 런타임 오류로 이어지지 않는다.
- FSD 의존성 방향 위반이 없다.
- public API를 경유하며 deep import가 없다.
- 필수 검증 5종이 통과한다.
- `WORK_LOG.md`, `SESSION_STATE.md`가 최신화된다.
