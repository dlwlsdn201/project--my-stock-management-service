# Next Task Draft — 다음 작업 초안

## 0. 문서 목적

이 문서는 Unit 2 완료 후 이어서 착수할 가능성이 높은 Unit 3 작업 후보를 정리한다. Unit 2 리뷰가 PASS 또는 PASS WITH WARNINGS 상태가 된 뒤, 이 내용을 `CURRENT_TASK.md`로 승격한다.

## 1. 다음 작업 후보

Unit 3 — 인증 UI와 mock 로그인 플로우 구현

목표는 AssetFlow AI의 로그인 화면을 PRD의 5:5 분할 레이아웃에 맞춰 구현하고, 이메일/비밀번호 및 카카오 mock 로그인 플로우를 만든다.

## 2. 선행 작업과의 연결점

- Unit 2에서 로그인 page slice와 앱 레이아웃 분리가 완료되어야 한다.
- Unit 2에서 route placeholder와 theme 구조가 준비되어야 한다.
- Unit 3은 실제 외부 OAuth가 아니라 mock 인증 상태와 라우팅 흐름만 구현한다.
- 로그인 성공 후 신규 사용자는 `/onboarding/brokerage`, 기존 사용자는 `/dashboard`로 이동한다.

## 3. 예상 범위

### 포함 후보

- session entity 타입과 mock session 데이터
- mock login 함수 또는 mutation 후보
- 이메일/비밀번호 로그인 UI
- 카카오 로그인 버튼 UI
- 로그인 실패 상태 표시
- 로그인 성공 후 라우팅
- 보안 안내 메시지와 5:5 브랜딩 레이아웃
- 로그인 폼 테스트

### 제외 후보

- 실제 카카오 OAuth 연동
- Supabase auth 연동
- refresh token/session persistence
- route guard 전체 구현
- 증권사 연결 플로우

## 4. 설계 메모

예상 구조:

```text
src/entities/session/
  model/types.ts
  model/constants.ts
  model/mockSession.ts
  api/login.ts
  index.ts

src/features/auth-login/
  index.ts
  ui/LoginForm.tsx
  ui/LoginForm.test.tsx

src/pages/login/ui/LoginPage.tsx
```

핵심 정책:

- MVP mock 로그인은 실제 보안 로직이 아니다.
- 인증 실패 시 화면을 유지하고 명확한 오류 문구를 표시한다.
- 카카오 로그인은 버튼 클릭 시 mock provider login으로 처리한다.
- form 상태는 React Hook Form을 우선 사용한다.

## 5. 착수 전 결정 필요 사항

1. mock 계정을 어떤 fixture로 둘지 결정한다.
2. mock session을 Jotai로 둘지, Unit 3에서는 local state로 둘지 결정한다.
3. 로그인 성공 후 신규/기존 사용자 구분 기준을 mock 데이터에 둘지 결정한다.
4. route guard는 Unit 3에서 최소 처리할지 Unit 4 이후로 미룰지 결정한다.

## 6. 예상 검증

```bash
pnpm test
```

```bash
pnpm lint
```

```bash
pnpm typecheck
```

```bash
pnpm build
```

```bash
git diff --check
```
