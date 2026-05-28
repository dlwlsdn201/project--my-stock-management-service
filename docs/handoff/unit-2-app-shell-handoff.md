# Unit 2 Handoff — 앱 쉘과 라우팅 기반

## 0. 문서 목적

이 문서는 Claude Code가 Unit 2 작업을 시작할 때 필요한 현재 앱 구조, 레이아웃 결정, 테스트 기준을 빠르게 이해하기 위한 인수인계 문서다.

## 1. 작업 목표

- Unit 3~8 기능 화면이 공통으로 사용할 앱 쉘과 route 구조를 만든다.
- 로그인 전용 화면과 인증 후 내부 화면의 레이아웃을 분리한다.
- 사이드바, 헤더, theme toggle, 최소 shared UI primitive를 만든다.

## 2. 현재 상태

- `src/apps/router/index.tsx`는 모든 route element를 inline placeholder로 가지고 있다.
- `src/shared/config/routes.ts`는 route path 상수를 제공한다.
- `src/entities/*`에는 Unit 1 도메인 타입과 mock 데이터가 있다.
- `src/pages/index.ts`, `src/widgets/index.ts`, `src/shared/ui/README.md`는 아직 실질 UI를 export하지 않는다.
- Tailwind CSS v4와 CSS variables는 `src/apps/styles/index.css`에 준비되어 있다.

## 3. 반드시 읽을 파일

- `AGENTS.md`
- `PRD.mdc`
- `docs/CURRENT_TASK.md`
- `docs/PROJECT_GUIDE.md`
- `.rules/project-rules_architecture.mdc`
- `.rules/project-rules_shared-components.mdc`
- `.rules/project-rules_testing-policy.mdc`

## 4. 참고할 기존 구현

- `src/apps/App.tsx`: provider와 router 조합 위치
- `src/apps/router/index.tsx`: 현재 route 목록
- `src/shared/config/routes.ts`: route path SSOT
- `src/apps/styles/index.css`: light/dark CSS variable token
- `src/entities/portfolio/model/mockPortfolio.ts`: placeholder 수치가 필요할 때 읽기 전용 참고 가능

## 5. 핵심 설계

- `apps/router`에서 route와 layout을 조합한다.
- `pages/*`는 화면별 placeholder 컴포넌트만 소유한다.
- `widgets/app-shell`은 내부 화면 공통 frame을 소유한다.
- `widgets/app-sidebar`는 navigation list와 active 상태를 소유한다.
- `widgets/app-header`는 page title과 theme toggle을 소유한다.
- `shared/ui`는 반복 primitive만 소유한다.
- theme은 `document.documentElement`의 `dark` class로 적용한다.

## 6. 예상 변경 파일

- `src/shared/config/navigation.ts`
- `src/shared/config/theme.ts`
- `src/shared/ui/Button.tsx`
- `src/shared/ui/Surface.tsx`
- `src/shared/ui/MetricValue.tsx`
- `src/shared/ui/EmptyState.tsx`
- `src/shared/ui/index.ts`
- `src/widgets/app-shell/index.ts`
- `src/widgets/app-shell/ui/AppShell.tsx`
- `src/widgets/app-sidebar/index.ts`
- `src/widgets/app-sidebar/ui/AppSidebar.tsx`
- `src/widgets/app-header/index.ts`
- `src/widgets/app-header/ui/AppHeader.tsx`
- `src/pages/login/index.ts`
- `src/pages/login/ui/LoginPage.tsx`
- `src/pages/dashboard/index.ts`
- `src/pages/dashboard/ui/DashboardPage.tsx`
- `src/pages/onboarding-brokerage/index.ts`
- `src/pages/onboarding-brokerage/ui/OnboardingBrokeragePage.tsx`
- `src/pages/rebalance/index.ts`
- `src/pages/rebalance/ui/RebalancePage.tsx`
- `src/pages/portfolio/index.ts`
- `src/pages/portfolio/ui/PortfolioPage.tsx`
- `src/pages/settings/index.ts`
- `src/pages/settings/ui/SettingsPage.tsx`
- `src/apps/router/index.tsx`
- `src/pages/index.ts`
- `src/widgets/index.ts`
- `src/shared/index.ts`
- `docs/WORK_LOG.md`
- `docs/SESSION_STATE.md`

## 7. 테스트 기준

- route redirect: `/` → `/login`
- app shell: `/dashboard`에서 navigation, header, main landmark 렌더링
- active nav: 현재 route에 맞는 link가 `aria-current="page"`를 가진다.
- theme toggle: 클릭 시 root `dark` class와 `aria-pressed`가 바뀐다.

## 8. 주의 사항

- 기능 화면을 앞당겨 구현하지 않는다.
- 로그인 폼, brokerage connect, dashboard chart, rebalancing detail은 placeholder로만 둔다.
- shadcn/ui CLI나 추가 패키지 설치를 하지 않는다.
- route path는 `ROUTES`를 참조한다.
- UI 텍스트는 PRD의 화면 이름과 CTA 후보를 참고하되, 설명성 안내 문구를 과하게 넣지 않는다.
- 테스트는 CSS class 세부 구현보다 role, label, aria state, route 결과를 검증한다.
