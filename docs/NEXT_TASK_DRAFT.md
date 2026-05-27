# Next Task Draft — 다음 작업 초안

## 0. 문서 목적

이 문서는 Unit 1 완료 후 이어서 착수할 가능성이 높은 Unit 2 작업 후보를 정리한다. Unit 1 리뷰가 PASS 또는 PASS WITH WARNINGS 상태가 된 뒤, 이 내용을 `CURRENT_TASK.md`로 승격한다.

## 1. 다음 작업 후보

Unit 2 — 공통 앱 쉘, 라우팅, 테마, 레이아웃 기반 구축

목표는 AssetFlow AI MVP의 모든 내부 화면이 공유할 앱 레이아웃, 라우팅 구조, 라이트/다크 테마 기반, 공통 UI primitive를 만드는 것이다.

## 2. 선행 작업과의 연결점

- Unit 0에서 Vite, React Router, Tailwind CSS 기반이 준비됐다.
- Unit 1에서 portfolio, brokerage, rebalancing 도메인 타입과 mock 데이터가 준비되어야 한다.
- Unit 2는 실제 기능 화면 구현 전 단계이며, Unit 3~8의 페이지가 공통 레이아웃을 재사용하도록 한다.
- Unit 2에서 `index.html` 들여쓰기 Warning도 함께 정리할 수 있다.

## 3. 예상 범위

### 포함 후보

- 로그인 레이아웃과 인증 후 앱 레이아웃 분리
- AppShell, AppSidebar, AppHeader 구조 작성
- 라우트별 placeholder page slice 작성
- 라이트/다크 모드 class 또는 data attribute 전환
- 공통 카드, 버튼, 섹션 헤더, 수치 표시, 빈 상태 컴포넌트 기반 작성
- 주요 nav item과 active 상태 구현
- 기본 접근성 속성 추가

### 제외 후보

- 실제 로그인 폼 구현
- 증권사 연동 플로우 구현
- 대시보드 데이터 시각화 구현
- 리밸런싱 추천 상세 UI 구현
- 포트폴리오 테이블 구현
- shadcn/ui 전체 컴포넌트 대량 도입

## 4. 설계 메모

예상 구조:

```text
src/pages/login/
  index.ts
  ui/LoginPage.tsx

src/pages/dashboard/
  index.ts
  ui/DashboardPage.tsx

src/pages/onboarding-brokerage/
  index.ts
  ui/OnboardingBrokeragePage.tsx

src/pages/rebalance/
  index.ts
  ui/RebalancePage.tsx

src/pages/portfolio/
  index.ts
  ui/PortfolioPage.tsx

src/pages/settings/
  index.ts
  ui/SettingsPage.tsx

src/widgets/app-shell/
  index.ts
  ui/AppShell.tsx

src/widgets/app-sidebar/
  index.ts
  ui/AppSidebar.tsx

src/widgets/app-header/
  index.ts
  ui/AppHeader.tsx

src/shared/ui/
  Button.tsx
  Surface.tsx
  MetricValue.tsx
  EmptyState.tsx
```

핵심 정책:

- 화면별 실제 기능 구현은 placeholder 수준으로 유지한다.
- 공통 레이아웃은 Unit 3~8에서 기능 UI를 얹을 수 있게 여백과 영역만 안정화한다.
- 테마 토큰은 Unit 0의 CSS variables를 우선 활용한다.
- 접근성 label과 landmark를 초기에 잡아둔다.

## 5. 착수 전 결정 필요 사항

1. shadcn/ui CLI를 Unit 2에서 실제로 초기화할지, 자체 최소 shared UI로 먼저 갈지 결정한다.
2. 테마 상태를 `localStorage`에 저장할지, MVP에서는 현재 세션 상태만 사용할지 결정한다.
3. 라우트 보호 mock 정책을 Unit 2에서 둘지, Unit 3 인증 플로우에서 둘지 결정한다.
4. 사이드바 반응형 동작을 Unit 2에서 어디까지 구현할지 결정한다.

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
