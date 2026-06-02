# Current Task — 현재 작업 지시서

## 0. 작업 요약

Post-MVP Unit 14 — 로그아웃 UI와 세션 종료 흐름 구현

이번 작업은 Unit 12에서 준비된 `clearSessionAtom`을 실제 UI와 라우팅 흐름에 연결한다. 로그인한 사용자가 앱 내부 화면에서 명확하게 로그아웃할 수 있어야 하며, 로그아웃 후에는 세션이 제거되고 `/login`으로 이동해야 한다.

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

- Unit 12에서 `sessionAtom`, `isAuthenticatedAtom`, `clearSessionAtom`, `ProtectedRoute`, `PublicOnlyRoute`가 구현되었다.
- Unit 13에서 AI 설정 상태와 무료 제안 정책이 session/settings 상태에 연결되었다.
- 현재 앱 내부 헤더(`AppHeader`)에는 테마 토글만 있으며 로그아웃 액션 UI는 없다.
- `clearSessionAtom`은 로그아웃 구현을 위한 seam으로 이미 공개 API에 노출되어 있다.

## 3. 작업 범위

### 포함

- 앱 내부 화면에서 접근 가능한 로그아웃 버튼 또는 액션 UI 추가
- 로그아웃 클릭 시 `clearSessionAtom` 호출
- 로그아웃 후 `/login`으로 이동
- 로그인 전용 화면에는 로그아웃 UI가 노출되지 않도록 유지
- 로그아웃 흐름 테스트 추가
- 작업 완료 후 `docs/WORK_LOG.md`, `docs/SESSION_STATE.md` 갱신

### 제외

- 실제 서버 logout API 호출
- refresh token 폐기
- 세션 persistence 구현
- 로그인/회원가입 UI 추가 확장
- 커밋 생성

## 4. 설계 지침

- 로그아웃은 사용자 액션이므로 `features/auth-logout` 슬라이스로 분리하는 방식을 우선 검토한다.
- `AppHeader`는 앱 내부 헤더 조합 역할을 유지하고, 실제 로그아웃 동작은 feature 컴포넌트가 담당하도록 한다.
- `widgets` 레이어에서 `features/auth-logout`을 import하는 것은 FSD 의존성 방향상 허용된다.
- `features/auth-logout`은 `@entities/session`의 `clearSessionAtom`과 `@shared`의 `ROUTES`, `Button`만 참조하는 구조를 우선한다.
- 버튼 레이블은 색상이나 아이콘만으로 의미를 전달하지 않는다.

## 5. 예상 변경 파일

### 신규 후보

- `src/features/auth-logout/ui/LogoutButton.tsx`
- `src/features/auth-logout/ui/LogoutButton.test.tsx`
- `src/features/auth-logout/index.ts`

### 수정 후보

- `src/widgets/app-header/ui/AppHeader.tsx`
- `src/widgets/app-header/ui/AppHeader.test.tsx`
- `src/features/index.ts`
- `docs/WORK_LOG.md`
- `docs/SESSION_STATE.md`

## 6. 필수 구현 상세

### 6.1 로그아웃 액션

- 클릭 시 `clearSessionAtom`을 호출한다.
- 세션 제거 후 `ROUTES.LOGIN`으로 이동한다.
- 중복 클릭에 따른 오류가 없어야 한다.

### 6.2 UI 배치

- 앱 내부 `AppHeader` 우측 액션 영역에 배치한다.
- 기존 테마 토글과 충돌하지 않는 간격을 유지한다.
- `/login` 화면에는 노출되지 않아야 한다.

### 6.3 테스트

- 로그아웃 버튼이 앱 내부 헤더에 표시된다.
- 로그아웃 클릭 시 session이 `null`이 된다.
- 로그아웃 클릭 후 `/login` 화면으로 이동한다.
- 로그인 화면에는 로그아웃 버튼이 표시되지 않는다.
- 기존 테마 토글 테스트가 깨지지 않는다.

## 7. 구현 규칙

- FSD 의존성 방향 준수
- deep import 금지, public API 경유
- `any` 금지
- route 문자열은 `ROUTES`를 참조
- 기존 shared `Button` 사용 우선
- 불필요한 신규 패키지 설치 금지

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

- 로그인한 사용자가 앱 내부 화면에서 로그아웃할 수 있다.
- 로그아웃 후 세션이 제거되고 `/login`으로 이동한다.
- 로그인 화면에는 로그아웃 UI가 노출되지 않는다.
- 관련 테스트가 추가되고 전체 검증 명령이 통과한다.
- `WORK_LOG.md`, `SESSION_STATE.md`가 최신화된다.
