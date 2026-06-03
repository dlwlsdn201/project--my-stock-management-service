# Current Task — 현재 작업 지시서

## 0. 작업 요약

Post-MVP Unit 18 — 다크 테마/모바일 QA 보강

이번 작업은 이미 구현된 주요 화면이 다크 모드와 모바일 폭에서 깨지지 않도록 UI 품질을 보강하고, 검증 가능한 테스트와 QA 기록을 남기는 작업이다. 새 도메인 기능을 추가하지 않고, 레이아웃 안정성·색상 토큰·접근성 회귀 방어에 집중한다.

## 1. 반드시 읽을 문서

- `AGENTS.md`
- `PRD.mdc`
- `docs/PROJECT_GUIDE.md`
- `docs/WORK_LOG.md`
- `docs/REVIEW_LOG.md`
- `docs/SESSION_STATE.md`
- `docs/superpowers/plans/2026-06-03-unit18-dark-mobile-qa.md`
- `.rules/project-rules_architecture.mdc`
- `.rules/project-rules_working.mdc`
- `.rules/project-rules_testing-policy.mdc`
- `.rules/project-rules_review.mdc`

## 2. 선행 상태

- Unit 17까지 커밋/푸시 완료: `139c90f`
- 앱은 React 19 + Vite + React Router v7 + Jotai + Tailwind v4 기반이다.
- 라이트/다크 토큰은 `src/apps/styles/index.css`와 `useTheme`로 구성되어 있다.
- 주요 화면은 구현 완료됐지만, 다크 테마와 모바일 실측 증빙은 아직 부족하다.

## 3. 작업 범위

### 포함

- 앱 쉘 모바일 레이아웃 보강
- 헤더/사이드바 모바일 overflow 방어
- 주요 화면의 고정 색상(`text-red-*`, `bg-red-*`, `text-green-*`, `text-blue-*`)을 디자인 토큰 기반으로 정리
- 로그인, 온보딩, 대시보드, 리밸런싱, 포트폴리오, 설정 화면의 모바일 폭 텍스트/버튼 overflow 방어
- RTL 테스트로 핵심 class/접근성/레이아웃 회귀 방어
- `WORK_LOG.md`, `SESSION_STATE.md`에 QA 결과 기록

### 제외

- 새 도메인 기능 추가
- Supabase 또는 외부 API 연동
- 실제 AI provider 호출
- 라우트 구조 대규모 변경
- 디자인 시스템 전면 재작성
- shadcn/ui CLI 추가 설치
- 커밋 생성

## 4. 우선 점검 파일

- `src/widgets/app-shell/ui/AppShell.tsx`
- `src/widgets/app-header/ui/AppHeader.tsx`
- `src/widgets/app-sidebar/ui/AppSidebar.tsx`
- `src/pages/login/ui/LoginPage.tsx`
- `src/shared/ui/FieldMessage.tsx`
- `src/shared/ui/ErrorState.tsx`
- `src/features/auth-login/ui/LoginForm.tsx`
- `src/features/brokerage-onboarding/ui/BrokerageOnboardingPanel.tsx`
- `src/features/dashboard-overview/model/constants.ts`
- `src/features/portfolio-management/model/constants.ts`
- `src/features/rebalancing-proposal/ui/RebalancingProposalPanel.tsx`
- `src/features/settings-portfolio/ui/AiSettingsSection.tsx`
- `src/features/settings-portfolio/ui/ManualAssetsSection.tsx`
- `src/features/settings-portfolio/ui/TargetAllocationSection.tsx`

## 5. 구현 지침

### 5.1 색상 토큰

- 다크 테마에서 대비가 깨질 수 있는 하드코딩 색상은 CSS 변수 기반으로 전환한다.
- 권장 예:
  - 오류/위험: `text-[hsl(var(--destructive))]`
  - 오류 배경: `bg-[hsl(var(--destructive)/0.12)]`
  - 성공/긍정: 필요 시 `--success`, `--success-foreground` 토큰을 `index.css`에 추가하거나 기존 semantic token으로 대체
  - 매수/매도처럼 금융 방향 색상은 색상만으로 의미를 전달하지 말고 기존 텍스트 라벨을 유지한다.
- 토큰 추가 시 라이트/다크 값을 모두 정의한다.

### 5.2 모바일 레이아웃

- 앱 쉘은 768px 미만 또는 `max-lg` 구간에서 콘텐츠가 가로로 터지지 않아야 한다.
- `AppHeader`는 제목/설명과 액션 영역이 좁은 폭에서 겹치지 않아야 한다.
- `AppSidebar`는 모바일에서 가로 스크롤이 필요한 경우 명시적으로 `overflow-x-auto`를 둔다.
- 주요 content padding은 작은 화면에서 과도하지 않게 조정한다. 예: `p-4 sm:p-6`.
- 버튼 묶음은 좁은 폭에서 `flex-wrap` 또는 `flex-col`로 자연스럽게 내려가야 한다.
- 테이블은 기존처럼 `overflow-x-auto`를 유지하되 셀 텍스트가 버튼/헤더를 침범하지 않아야 한다.

### 5.3 테스트

최소 테스트 보강:

- `AppShell` 또는 `AppHeader/AppSidebar` 테스트에 모바일 방어 class 검증 추가
- `FieldMessage` 또는 관련 shared UI 테스트에 destructive/success token class 검증 추가
- 설정/리밸런싱/온보딩 중 하나 이상에서 모바일 버튼 그룹 wrap 또는 class 회귀 테스트 추가

테스트는 class 문자열 전체 스냅샷이 아니라, 핵심 class 포함 여부나 접근성 role/label 중심으로 검증한다.

### 5.4 QA 기록

`WORK_LOG.md`에 아래를 기록한다.

- 수정한 반응형 지점
- 정리한 색상 토큰 지점
- 검증 명령 결과
- 브라우저 실측 여부

브라우저 실측이 가능하면 아래 route를 라이트/다크와 모바일 폭에서 확인한다.

- `/login`
- `/dashboard`
- `/onboarding/brokerage`
- `/rebalance`
- `/portfolio`
- `/settings`

## 6. 필수 검증

작업 완료 전 아래 명령을 실행한다.

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
git diff --check
```

가능하면 추가 smoke:

```bash
pnpm exec vite --host 127.0.0.1
```

브라우저에서 375px, 768px, 1440px 중 최소 2개 폭을 확인하고 결과를 `WORK_LOG.md`에 기록한다.

## 7. 완료 기준

- 주요 화면에서 다크 모드 색상 대비를 해치는 하드코딩 색상 사용이 줄어든다.
- 앱 쉘/헤더/사이드바가 모바일 폭에서 겹치지 않는다.
- 주요 버튼/폼/테이블이 모바일 폭에서 화면 밖으로 비정상 확장되지 않는다.
- 관련 RTL 테스트가 추가 또는 갱신된다.
- `WORK_LOG.md`, `SESSION_STATE.md`가 최신화된다.
- 필수 검증 5종이 통과한다.
