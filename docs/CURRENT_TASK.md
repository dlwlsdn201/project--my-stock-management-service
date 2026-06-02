# Current Task — 현재 작업 지시서

## 0. 작업 요약

Post-MVP Unit 12 — mock session 상태와 route guard 구현

이번 작업은 MVP 릴리즈 후보 이후 첫 후속 작업이다. 인증 없이 내부 화면에 직접 접근 가능한 현재 구조를 보완하고, Unit 3의 mock 로그인 결과를 앱 전역 session 상태와 라우트 보호 정책에 연결한다.

## 1. 반드시 읽을 문서

- `AGENTS.md`
- `PRD.mdc`
- `docs/PROJECT_GUIDE.md`
- `docs/WORK_LOG.md`
- `docs/REVIEW_LOG.md`
- `docs/SESSION_STATE.md`
- `.rules/project-rules_architecture.mdc`
- `.rules/project-rules_working.mdc`
- `.rules/project-rules_testing-policy.mdc`
- `.rules/project-rules_review.mdc`

## 2. 선행 상태

- Unit 11까지 MVP 릴리즈 후보 검증이 완료되어 있다.
- 로그인은 mock 인증 함수 기반으로 동작하지만, 세션 상태가 앱 전역에 저장되지 않는다.
- `/dashboard`, `/rebalance`, `/portfolio`, `/settings`, `/onboarding/brokerage`는 현재 인증 없이 직접 접근 가능하다.

## 3. 작업 범위

### 포함

- `entities/session`에 mock session 상태 모델 추가
- 로그인 성공 시 session 상태 저장
- 로그아웃 또는 세션 초기화 액션 추가(최소 테스트 가능한 형태)
- protected route guard 구현
- 신규 사용자/기존 사용자 라우팅 정책 유지
- 인증되지 않은 사용자의 내부 화면 접근 시 `/login` redirect
- 로그인 사용자가 `/login` 접근 시 적절한 내부 화면으로 redirect
- route guard 테스트 추가
- 작업 완료 후 `docs/WORK_LOG.md`, `docs/SESSION_STATE.md` 갱신

### 제외

- 실제 Supabase Auth 연동
- refresh token/session persistence
- 운영 OAuth
- 권한/RLS 서버 정책
- 커밋 생성

## 4. 설계 결정

- MVP 후속 작업이므로 실제 인증이 아니라 mock session 상태를 앱 라우팅에 연결한다.
- 전역 클라이언트 상태는 기존 프로젝트 기준에 맞춰 Jotai를 우선 사용한다.
- route guard는 `apps/router` 또는 `widgets/app-shell`보다 라우팅 계층에 가깝게 둔다.
- 인증 상태 타입/상수는 `entities/session` SSOT로 유지한다.

## 5. 예상 변경 파일

### 신규 후보

- `src/entities/session/model/sessionAtom.ts`
- `src/entities/session/model/sessionState.ts` 또는 동등 파일
- `src/apps/router/ProtectedRoute.tsx`
- `src/apps/router/PublicOnlyRoute.tsx`

### 수정 후보

- `src/features/auth-login/ui/LoginForm.tsx`
- `src/apps/router/routes.config.tsx`
- `src/apps/router/router.test.tsx`
- `src/entities/session/index.ts`
- `docs/WORK_LOG.md`
- `docs/SESSION_STATE.md`

## 6. 구현 규칙

- FSD 의존성 방향 준수
- deep import 금지, public API 경유
- `any` 금지
- React 컴포넌트는 화살표 함수
- 인증 실패/redirect는 사용자에게 과도한 계정 존재 정보를 노출하지 않는다.

## 7. 필수 구현 상세

### 7.1 session 상태

- 로그인 여부
- 사용자 상태(`new`/`existing`)
- AI 무료 제안 잔여 횟수
- session clear 액션

### 7.2 route guard

- 비로그인 사용자가 내부 route 접근 시 `/login`으로 redirect
- 로그인 사용자가 `/login` 접근 시:
  - 신규 사용자: `/onboarding/brokerage`
  - 기존 사용자: `/dashboard`
- `/onboarding/brokerage` 접근 정책은 신규 사용자 우선 허용, 기존 사용자도 재연동 목적으로 접근 가능하게 둘지 문서에 결정 사항을 남긴다.

### 7.3 테스트

- 비로그인 상태에서 `/dashboard` 접근 시 `/login` 화면
- 비로그인 상태에서 `/rebalance`, `/portfolio`, `/settings` 접근 시 `/login` 화면
- 기존 사용자 로그인 후 `/dashboard` 이동 및 session 저장
- 신규 사용자 로그인 후 `/onboarding/brokerage` 이동 및 session 저장
- 로그인 상태에서 `/login` 접근 시 내부 route redirect

## 8. 테스트 및 검증

작업 완료 전 아래 명령 실행:

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
git diff --check
```

## 9. 완료 기준

- 인증되지 않은 내부 route 접근이 차단된다.
- 로그인 성공 결과가 앱 session 상태에 반영된다.
- 기존 Unit 3 로그인 흐름이 깨지지 않는다.
- route guard 테스트가 핵심 정책을 방어한다.
- `WORK_LOG.md`, `SESSION_STATE.md` 최신화
