# Next Task Draft — 다음 작업 초안

## 0. 문서 목적

이 문서는 Unit 11 이후 이어질 첫 후속 작업 후보를 정리한다. 현재 우선순위는 MVP 릴리즈 후보에서 확인된 미해결 리스크 중 사용자 흐름에 직접 영향을 주는 route guard와 mock session 상태 배선이다.

## 1. 다음 작업 후보

Post-MVP Unit 12 — mock session 상태와 route guard 구현

## 2. 배경

Unit 11 최종 검증에서 MVP 데모 가능 상태는 확인되었지만, 인증 없이 내부 화면에 직접 접근할 수 있는 구조가 잔여 리스크로 남았다. Unit 3의 mock 로그인 결과를 앱 전역 session 상태에 저장하고, 내부 route를 보호하는 guard가 필요하다.

## 3. 예상 범위

### 포함 후보

- `entities/session` session 상태 타입/atom 추가
- 로그인 성공 시 session 저장
- session clear 액션
- protected route guard
- public-only login route guard
- route guard 테스트
- `WORK_LOG.md`, `SESSION_STATE.md` 갱신

### 제외 후보

- 실제 Supabase Auth
- OAuth 운영 연동
- token persistence
- refresh token
- 서버 RLS/권한 정책

## 4. 설계 메모

예상 구조:

```text
src/entities/session/
  model/sessionAtom.ts
  model/types.ts
  index.ts

src/apps/router/
  ProtectedRoute.tsx
  PublicOnlyRoute.tsx
  routes.config.tsx
  router.test.tsx
```

정책:

- 비로그인 사용자의 내부 route 접근은 `/login`으로 redirect한다.
- 로그인 사용자의 `/login` 접근은 사용자 상태에 따라 `/dashboard` 또는 `/onboarding/brokerage`로 redirect한다.
- 신규/기존 사용자 분기는 기존 Unit 3 mock 로그인 정책을 유지한다.

## 5. 예상 검증

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
git diff --check
```
