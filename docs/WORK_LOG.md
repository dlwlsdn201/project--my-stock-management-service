---

## Unit 3 — 인증 UI와 mock 로그인 플로우 구현

- 작업 일자: 2026-05-28
- 작업 브랜치: feature/unit3-auth-login

### 변경 파일

신규:
- src/entities/session/model/types.ts
- src/entities/session/model/constants.ts
- src/entities/session/model/mockSession.ts
- src/entities/session/api/login.ts
- src/entities/session/index.ts
- src/features/auth-login/ui/LoginForm.tsx
- src/features/auth-login/ui/LoginForm.test.tsx
- src/features/auth-login/index.ts

수정:
- src/entities/index.ts (session export 추가)
- src/features/index.ts (auth-login export 추가)
- src/pages/login/ui/LoginPage.tsx (5:5 레이아웃 + LoginForm 조합)

### 구현 내용

- `entities/session` 슬라이스: UserStatus/LoginResult discriminated union, MockAccount 타입, LOGIN_ERROR_MESSAGES 상수, MOCK_ACCOUNTS fixture (신규/기존 사용자), loginWithEmail/loginWithKakao in-memory 순수 async 함수
- `features/auth-login/LoginForm`: RHF native validate + zod safeParse 조합 (resolvers 없음), useNavigate 라우팅 분기, 별도 isKakaoLoading 상태, isFormDisabled 동시 제출 방지, role="alert" 접근성
- `pages/login/LoginPage`: flex min-h-screen 5:5 분할 레이아웃, 브랜딩 패널(h1, 특징 목록, 투자 고지), 폼 패널(LoginForm, 보안 안내)

### 테스트 및 검증 결과

| 명령 | 결과 |
| --- | --- |
| `pnpm test` | ✅ PASS (53 tests, 11 files) |
| `pnpm lint` | ✅ PASS |
| `pnpm typecheck` | ✅ PASS |
| `pnpm build` | ✅ PASS (139 modules) |
| `git diff --check` | ✅ PASS |

### 남은 리스크

- mock 계정 credentials이 소스 코드에 노출됨 (MVP 범위 내 의도적 결정)
- route guard 미구현: 인증 없이 /dashboard 직접 접근 가능 (Unit 4 이후 처리)
- loginWithKakao는 항상 기존 사용자 반환 (신규 카카오 사용자 시나리오 미지원)

### GPT 리뷰 요청 포인트

1. entities/session public API 범위 적절성 (MOCK_ACCOUNTS fixture 외부 노출 여부)
2. loginWithKakao가 항상 'existing' 반환하는 것이 Unit 3 범위 내 적합한지
3. LoginForm에서 useNavigate 직접 사용 vs onLoginSuccess prop 패턴 선택 근거

---

# Work Log — 작업 결과 로그

## 0. 운영 규칙

- Claude Code는 단위 작업 완료 시 이 문서 상단에 결과를 추가한다.
- 변경 파일, 구현 내용, 검증 결과, 남은 리스크를 기록한다.
- 기존 오류와 신규 오류를 구분해 기록한다.
- 리뷰 결과 자체는 `REVIEW_LOG.md`에 기록한다.
- 진행 현황 표는 Unit 상태가 바뀔 때 함께 갱신한다.

## 1. 진행 현황

| Unit | 상태 | 담당 | 리뷰 상태 | 비고 |
| --- | --- | --- | --- | --- |
| Unit 0 — 프로젝트 스캐폴딩과 개발 도구 구성 | DONE | Claude Code | PASS WITH WARNINGS | 2026-05-26 GPT 재리뷰 통과 |
| Unit 1 — 도메인 모델, 상수, mock 데이터, 계산 로직 SSOT 구축 | DONE | Claude Code | PASS WITH WARNINGS | 2026-05-27 GPT 재리뷰 통과 |
| Unit 2 — 공통 앱 쉘, 라우팅, 테마, 레이아웃 기반 구축 | DONE | Claude Code | PASS WITH WARNINGS | 2026-05-28 GPT 3차 리뷰 통과 |
| Unit 3 — 인증 UI와 mock 로그인 플로우 구현 | PLANNED | Claude Code | NOT REQUESTED | Unit 2 이후 |
| Unit 4 — 증권사 연동 온보딩과 mock 연결 상태 구현 | PLANNED | Claude Code | NOT REQUESTED | Unit 2, Unit 3 이후 |
| Unit 5 — 수동 자산 입력과 목표 비중 설정 구현 | PLANNED | Claude Code | NOT REQUESTED | Unit 1, Unit 2 이후 |
| Unit 6 — 포트폴리오 대시보드 구현 | PLANNED | Claude Code | NOT REQUESTED | Unit 1, Unit 2, Unit 5 이후 |
| Unit 7 — AI 리밸런싱 제안 구현 | PLANNED | Claude Code | NOT REQUESTED | Unit 1, Unit 5, Unit 6 이후 |
| Unit 8 — 주식 포트폴리오 관리 구현 | PLANNED | Claude Code | NOT REQUESTED | Unit 1, Unit 5, Unit 7 이후 |
| Unit 9 — Supabase 연동 후보 검증과 persistence 전환 | PLANNED | Claude Code | NOT REQUESTED | Unit 1~8 이후 |
| Unit 10 — 접근성, 반응형, 에러/빈 상태 품질 보강 | PLANNED | Claude Code | NOT REQUESTED | Unit 2~8 이후 |
| Unit 11 — 최종 검증, 문서 정리, 릴리즈 후보 정리 | PLANNED | Claude Code | NOT REQUESTED | Unit 0~10 이후 |

## 2. 단위 작업 결과

---

### Unit 2 — 공통 앱 쉘, 라우팅, 테마, 레이아웃 기반 구축

- **작업 일자**: 2026-05-28
- **작업 단위명**: Unit 2 — 공통 앱 쉘, 라우팅, 테마, 레이아웃 기반 구축
- **작업 브랜치**: `main`

#### 변경 파일

**신규 생성**

| 파일 | 설명 |
| --- | --- |
| `src/shared/config/navigation.ts` | NAV_ITEMS 배열 (5개 메뉴, NavItem 타입) |
| `src/shared/config/theme.ts` | Theme 타입, DEFAULT_THEME 상수 |
| `src/shared/lib/useTheme.ts` | light/dark 토글 훅, documentElement class 적용 |
| `src/shared/lib/index.ts` | shared/lib 레이어 public API |
| `src/shared/lib/useTheme.test.ts` | useTheme 훅 3개 테스트 (초기값, dark 적용, 복귀) |
| `src/shared/ui/Button.tsx` | primary/secondary/ghost variant 버튼 |
| `src/shared/ui/Surface.tsx` | 카드/패널용 as=section or div 래퍼 |
| `src/shared/ui/MetricValue.tsx` | label, value, optional description 표시 컴포넌트 |
| `src/shared/ui/EmptyState.tsx` | title, description, optional action 영역 |
| `src/shared/ui/index.ts` | shared/ui 레이어 public API |
| `src/widgets/app-header/ui/AppHeader.tsx` | 페이지 title, 설명, 테마 토글 버튼 포함 헤더 |
| `src/widgets/app-header/ui/AppHeader.test.tsx` | AppHeader 5개 테스트 (title, description, aria-pressed, toggle) |
| `src/widgets/app-header/index.ts` | app-header slice public API |
| `src/widgets/app-sidebar/ui/AppSidebar.tsx` | 5개 nav link, useLocation으로 aria-current 적용 |
| `src/widgets/app-sidebar/ui/AppSidebar.test.tsx` | AppSidebar 4개 테스트 (렌더링, active, inactive, 경로 변경) |
| `src/widgets/app-sidebar/index.ts` | app-sidebar slice public API |
| `src/widgets/app-shell/ui/AppShell.tsx` | skip link, header/sidebar slot, main#main-content 레이아웃 (slot 패턴, sibling import 없음) |
| `src/widgets/app-shell/index.ts` | app-shell slice public API |
| `src/pages/login/ui/LoginPage.tsx` | 로그인 placeholder |
| `src/pages/login/index.ts` | login slice public API |
| `src/pages/dashboard/ui/DashboardPage.tsx` | 대시보드 placeholder |
| `src/pages/dashboard/index.ts` | dashboard slice public API |
| `src/pages/onboarding-brokerage/ui/OnboardingBrokeragePage.tsx` | 증권사 연동 placeholder |
| `src/pages/onboarding-brokerage/index.ts` | onboarding-brokerage slice public API |
| `src/pages/rebalance/ui/RebalancePage.tsx` | 리밸런싱 placeholder |
| `src/pages/rebalance/index.ts` | rebalance slice public API |
| `src/pages/portfolio/ui/PortfolioPage.tsx` | 포트폴리오 placeholder |
| `src/pages/portfolio/index.ts` | portfolio slice public API |
| `src/pages/settings/ui/SettingsPage.tsx` | 설정 placeholder |
| `src/pages/settings/index.ts` | settings slice public API |
| `src/apps/router/router.test.tsx` | 라우터 통합 테스트 6개 (/ redirect, login, main landmark, nav, aria-current) |

**수정**

| 파일 | 설명 |
| --- | --- |
| `src/shared/index.ts` | navigation, theme, lib, ui re-export 추가 |
| `src/widgets/index.ts` | app-header, app-shell, app-sidebar re-export 추가 |
| `src/pages/index.ts` | 6개 page slice re-export 추가 |
| `src/apps/router/index.tsx` | inline placeholder → page slice + AppShell 레이아웃 조합 구조로 전환 |

#### 구현 내용

- **라우팅**: `/` → `/login` redirect, `/login` 단독 레이아웃, 5개 내부 화면은 AppShell children로 렌더링
- **AppShell**: 접근성 skip link("본문으로 건너뛰기"), AppHeader + AppSidebar + `<main id="main-content">` 조합
- **AppSidebar**: useLocation 기반 active 감지, aria-current="page" 적용, max-lg 수평 배치
- **AppHeader**: title + optional description + 테마 토글 버튼 (aria-pressed, 텍스트 레이블)
- **useTheme**: useState(light) + useEffect → documentElement.classList.toggle('dark')
- **Shared UI**: Button(3 variant), Surface(as prop), MetricValue, EmptyState — 모두 className override 지원
- **FSD 레이어 준수**: shared ← widgets ← pages ← apps/router 방향 유지; @shared/*, @widgets/* 경유 import

#### 테스트 및 검증 결과 (초기 구현)

| 명령 | 결과 | 비고 |
| --- | --- | --- |
| `pnpm test` | ✅ PASS | 10 test files, 46 tests passed |
| `pnpm lint` | ✅ PASS | 오류 없음 |
| `pnpm typecheck` | ✅ PASS | `tsc -b --noEmit` |
| `pnpm build` | ✅ PASS | dist 322KB (gzip 102KB) |
| `git diff --check` | ✅ PASS | whitespace 오류 없음 |

#### GPT Critical 보완 내역 (2026-05-28)

| 분류 | 내용 | 처리 |
| --- | --- | --- |
| C1 | AppShell이 sibling widget(app-header, app-sidebar)을 직접 import — FSD 위반 | AppShell을 slot 패턴(header/sidebar/children)으로 변경; AppShellLayout.tsx 분리; useTheme+AppHeader+AppSidebar 조합을 apps/router로 이동 |
| C2 | 외부 레이어에서 `@shared/config/*`, `@shared/lib/useTheme` deep import | widgets는 `@shared` 공개 API 경유로 수정; shared 내부는 상대 경로(`../config/theme`) 사용 |
| C3 | router.test.tsx가 실제 APP_ROUTES 미사용, `/` redirect 테스트 누락 | APP_ROUTES를 routes.config.tsx로 분리 export; router.test.tsx에서 import 재사용; `/` → `/login` redirect 테스트 추가 |
| W1 | PAGE_TITLES가 navigation.ts와 분리 — SSOT 위반 | NavItem에 description 필드 추가; NAV_ITEMS에 통합; AppShellLayout에서 navItem 조회로 대체 |
| W2 | React 컴포넌트가 function 선언 — 프로젝트 규칙 위반 | 모든 컴포넌트를 화살표 함수 패턴으로 변환 |

#### 테스트 및 검증 결과 (GPT Critical 보완 후)

| 명령 | 결과 | 비고 |
| --- | --- | --- |
| `pnpm test` | ✅ PASS | 10 test files, 47 tests passed (redirect 테스트 +1) |
| `pnpm lint` | ✅ PASS | 오류/경고 없음 |
| `pnpm typecheck` | ✅ PASS | `tsc -b --noEmit` |
| `pnpm build` | ✅ PASS | dist 322KB (gzip 102KB) |
| `git diff --check` | ✅ PASS | whitespace 오류 없음 |

#### 남은 리스크

| 리스크 | 설명 | 대응 |
| --- | --- | --- |
| 반응형 사이드바 | max-lg CSS 처리만 있고 실제 모바일 overflow 테스트 미검증 | Unit 10 반응형 보강 단계에서 처리 |
| theme persistence 미구현 | localStorage 저장 미포함 (Unit 2 의도적 제외) | Unit 3 또는 Unit 5에서 sessionStorage/localStorage 도입 검토 |

#### 리뷰 요청 포인트

- `useTheme`가 AppShellLayout에 직접 들어있어 layout이 theme state를 소유하는 구조 — Unit 3 인증 컨텍스트 추가 시 theme provider 분리 필요 여부
- router.test.tsx가 `createMemoryRouter`로 실제 page 컴포넌트를 마운트하는 통합 방식 — 향후 테스트 속도 관리 여부

---

### Unit 1 — 도메인 모델, 상수, mock 데이터, 계산 로직 SSOT 구축

- **작업 일자**: 2026-05-27
- **작업 단위명**: Unit 1 — 도메인 모델, 상수, mock 데이터, 계산 로직 SSOT 구축
- **작업 브랜치**: `main`

#### 변경 파일

**신규 생성**

| 파일 | 설명 |
| --- | --- |
| `src/entities/portfolio/model/types.ts` | CurrencyCode, AssetType, AllocationGroup 등 portfolio 도메인 타입 |
| `src/entities/portfolio/model/constants.ts` | BASE_CURRENCY_CODE, INVESTMENT_PRESET_ALLOCATIONS 등 portfolio 상수 |
| `src/entities/portfolio/model/mockPortfolio.ts` | 5종목 mock holdings, mock 목표 비중, mock portfolio summary |
| `src/entities/portfolio/model/calculatePortfolioSummary.ts` | 총 평가액 및 자산군별 비중 계산 순수 함수 |
| `src/entities/portfolio/model/calculatePortfolioSummary.test.ts` | calculatePortfolioSummary 6개 테스트 |
| `src/entities/portfolio/model/calculateAllocationGap.ts` | 목표 비중 차이 및 리밸런싱 액션 계산 순수 함수 |
| `src/entities/portfolio/model/calculateAllocationGap.test.ts` | calculateAllocationGap 6개 테스트 |
| `src/entities/portfolio/model/applyInvestmentPreset.ts` | 투자 성향 프리셋 목표 비중 반환 순수 함수 |
| `src/entities/portfolio/model/applyInvestmentPreset.test.ts` | applyInvestmentPreset 4개 테스트 (3개 프리셋 합계 100%) |
| `src/entities/portfolio/model/calculateExpectedValue.ts` | 기간별 복리 예상 자산 가치 계산 순수 함수 |
| `src/entities/portfolio/model/calculateExpectedValue.test.ts` | calculateExpectedValue 6개 테스트 (3/6/12개월) |
| `src/entities/portfolio/index.ts` | portfolio slice public API |
| `src/entities/brokerage/model/types.ts` | BrokerageProvider, BrokerageAccount 등 brokerage 도메인 타입 |
| `src/entities/brokerage/model/constants.ts` | 4개 증권사 BROKERAGE_PROVIDERS, SECURITY_BADGES 상수 |
| `src/entities/brokerage/model/mockBrokerages.ts` | 연결완료(키움) + 실패(토스) mock 계좌 2개 |
| `src/entities/brokerage/index.ts` | brokerage slice public API |
| `src/entities/rebalancing/model/types.ts` | RebalancingAction, RebalancingRecommendationItem 등 rebalancing 타입 |
| `src/entities/rebalancing/model/constants.ts` | 액션/사유 레이블, 투자 판단 고지 문구 |
| `src/entities/rebalancing/model/mockRecommendations.ts` | 자산군 추천 3개, 종목 추천 5개, 3/6/12개월 시나리오 mock |
| `src/entities/rebalancing/index.ts` | rebalancing slice public API |

**수정**

| 파일 | 설명 |
| --- | --- |
| `src/entities/index.ts` | 3개 entity slice re-export 추가 |
| `index.html` | Unit 0 Warning: `<meta>` 태그 들여쓰기 정리 |

#### 구현 내용

- **FSD 레이어 준수**: `entities`는 `shared`만 참조, slice 간 cross-import 없음
- **순수 계산 함수 4개**: `calculatePortfolioSummary`, `calculateAllocationGap`, `applyInvestmentPreset`, `calculateExpectedValue`
- **도메인 정책 구현**: 비중 소수점 2자리, 허용 오차 0.5%p, 복리 계산, KRW 기준
- **mock 데이터**: 총 20,000,000 KRW 포트폴리오 (삼성전자·SK하이닉스·KODEX200·국고채·MMF)
- **투자 고지 문구**: `REBALANCING_DISCLOSURE`에 포함, mock 추천 데이터에서 참조
- **타입 안전성**: `any` 미사용, literal union type 기반 상수 참조

#### 테스트 및 검증 결과

| 명령 | 결과 | 비고 |
| --- | --- | --- |
| `pnpm test` | ✅ PASS | 6 test files, 29 tests passed (GPT 재보완 후) |
| `pnpm lint` | ✅ PASS | 오류 없음 |
| `pnpm typecheck` | ✅ PASS | `tsc -b --noEmit` |
| `pnpm build` | ✅ PASS | dist 316KB (gzip 100KB) |
| `git diff --check` | ✅ PASS | whitespace 오류 없음 |

#### 남은 리스크

| 리스크 | 설명 | 대응 |
| --- | --- | --- |
| `AllocationGroup` 타입 중복 | rebalancing types.ts에 로컬 타입 선언으로 cross-import 회피함. 구조적 타입 호환은 되지만 공식 공유 타입이 아님 | Unit 5+ 에서 공유 필요성 확인 시 `shared/types`로 이동 검토 |
| mock 데이터 정합성 | `MOCK_PORTFOLIO_SUMMARY`의 값은 `MOCK_HOLDINGS`를 직접 계산하지 않고 하드코딩됨 | `calculatePortfolioSummary.test.ts`에 정합성 가드 테스트 추가로 방어 |
| `entities/index.ts` export * | 슬라이스 증가 시 이름 충돌 가능성 | Unit 5+ 에서 슬라이스 추가 시 충돌 여부 모니터링 |

#### 코드 리뷰 반영 내역 (2026-05-27)

| 분류 | 내용 | 처리 |
| --- | --- | --- |
| Critical (1차) | `MOCK_REBALANCING_SCENARIOS` 수치가 `calculateExpectedValue` 공식과 불일치 | 수정 완료 (6% 연수익, 2천만 기준 정확한 복리 계산값 적용) |
| Important (1차) | KODEX 200 `action: 'hold'` vs gapPercent +2.5%p 모순 | `action: 'buy'`로 수정 |
| Important (1차) | `MOCK_PORTFOLIO_SUMMARY`와 `MOCK_HOLDINGS` 정합성 가드 테스트 미비 | `calculatePortfolioSummary.test.ts`에 정합성 검증 테스트 추가 |
| Critical (GPT) | 삼성전자 `action: 'hold'` vs gap -4%p 모순 (허용 오차 0.5%p 초과) | `action: 'sell'`, `reasonSummary` 수정 |
| GPT 보완 지시 | 종목 단위 mock action 정합성 테스트 추가 | `mockRecommendations.test.ts` 신규 생성 (3개 테스트) |
| GPT 보완 지시 | `index.html` charset meta 태그 들여쓰기 8칸 오류 | 4칸으로 수정 |
| Suggestion | `AllocationGroup` rebalancing 로컬 재선언 → shared 이동 권장 | 현 상태 유지, Unit 5+ 이후 shared 이동 검토 |
| Suggestion | `adjustmentAmount` 절댓값 방식 → JSDoc에 규칙 명시 권장 | 리뷰 요청 포인트로 남김 (설계 의도 보존) |

#### 리뷰 요청 포인트 (GPT 검토용)

1. `AllocationGroup` 타입을 rebalancing 슬라이스에서 로컬 재선언한 방식 vs. `shared`로 이동하는 방식의 적합성
2. `calculateAllocationGap`에서 `adjustmentAmount`를 절댓값으로 계산한 설계 의도가 이후 Unit에서도 적합한지 확인
3. `entities/index.ts`의 `export *` 방식이 슬라이스 증가 시 충돌 위험을 감수할 만한지

---

### Unit 0 — 프로젝트 스캐폴딩과 개발 도구 구성

- **작업 일자**: 2026-05-26
- **작업 브랜치**: `main`

#### 변경 파일

**신규 생성**

| 파일 | 설명 |
| --- | --- |
| `package.json` | pnpm 기반 스크립트 및 의존성 정의 |
| `index.html` | Vite 앱 엔트리 HTML |
| `vite.config.ts` | Vite + React + Tailwind v4 플러그인, path alias |
| `vitest.config.ts` | Vitest + RTL + jsdom 설정, path alias |
| `tsconfig.json` | TypeScript project references 루트 |
| `tsconfig.app.json` | 앱 소스 TypeScript 설정, path alias |
| `tsconfig.node.json` | Vite/Vitest 설정 파일용 TypeScript |
| `eslint.config.js` | ESLint flat config (ts-eslint, react-hooks, react-refresh) |
| `.prettierrc` | Prettier 포맷 설정 |
| `postcss.config.js` | PostCSS 빈 설정 (Tailwind는 Vite 플러그인으로 처리) |
| `src/vite-env.d.ts` | Vite 클라이언트 타입 참조 (CSS import 허용) |
| `src/main.tsx` | React 19 StrictMode 앱 마운트 엔트리 |
| `src/apps/App.tsx` | AppProviders + AppRouter 조합 루트 컴포넌트 |
| `src/apps/router/index.tsx` | createBrowserRouter 기반 기본 라우팅 (6개 라우트 placeholder) |
| `src/apps/providers/AppProviders.tsx` | TanStack Query QueryClientProvider 래퍼 |
| `src/apps/styles/index.css` | Tailwind v4 import + shadcn/ui CSS 변수 (라이트/다크) |
| `src/pages/index.ts` | pages 레이어 public API (빈 배럴) |
| `src/widgets/index.ts` | widgets 레이어 public API (빈 배럴) |
| `src/features/index.ts` | features 레이어 public API (빈 배럴) |
| `src/entities/index.ts` | entities 레이어 public API (빈 배럴) |
| `src/shared/index.ts` | shared 레이어 public API (routes re-export) |
| `src/shared/config/routes.ts` | ROUTES 상수 (6개 라우트 경로) |
| `src/shared/config/routes.test.ts` | ROUTES 상수 smoke 테스트 |
| `src/shared/api/mocks/handlers.ts` | MSW handler (health-check mock만 포함) |
| `src/shared/api/mocks/browser.ts` | MSW browser worker 설정 |
| `src/shared/api/mocks/server.ts` | MSW node server 설정 (테스트용) |
| `src/shared/test/setupTests.ts` | Vitest setupFiles — jest-dom import + MSW server 생명주기 |
| `src/shared/ui/README.md` | shared/ui 레이어 설명 |
| `src/shared/lib/README.md` | shared/lib 레이어 설명 |

**수정**

- `docs/WORK_LOG.md` (이 문서)
- `docs/SESSION_STATE.md`

#### 구현 내용

- **프레임워크**: Vite 6 + React 19 + TypeScript 5.7 SPA (SSR 미사용)
- **스타일**: Tailwind CSS v4 (`@tailwindcss/vite` 플러그인) + shadcn/ui CSS 변수 기반 라이트/다크 토큰 준비
- **라우팅**: React Router DOM v7 `createBrowserRouter`, 6개 라우트 placeholder
- **상태 관리 기반**: TanStack Query v5 `QueryClientProvider` 준비
- **FSD 레이어**: `apps`, `pages`, `widgets`, `features`, `entities`, `shared` 디렉토리 + 각 `index.ts` public API
- **Path alias**: `@apps`, `@pages`, `@widgets`, `@features`, `@entities`, `@shared` (tsconfig + vite + vitest 모두 반영)
- **MSW**: handler(health-check), browser worker, node server 기본 구조
- **테스트**: Vitest + RTL + jest-dom + MSW 서버 생명주기 setupTests 구성
- **패키지 빌드 승인**: `pnpm.onlyBuiltDependencies` 로 `esbuild`, `msw` 자동 승인

#### 검증 결과 (초기 — 2026-05-26 v1)

| 명령 | 결과 | 비고 |
| --- | --- | --- |
| `pnpm typecheck` | ❌ INVALID | `tsc --noEmit`이 references 검증 안 함 (false positive) |
| `pnpm test` | ✅ PASS | 1 test file, 1 test passed (routes smoke test) |
| `pnpm lint` | ✅ PASS | 오류 없음 |
| `pnpm build` | ✅ PASS | dist 316KB (gzip 100KB) |
| `git diff --check` | ✅ PASS | whitespace 오류 없음 |

#### GPT 리뷰 NOT PASS — 보완 내역 (2026-05-26 v2)

| 항목 | 내용 |
| --- | --- |
| C1 수정 | `package.json` `typecheck` 스크립트: `tsc --noEmit` → `tsc -b --noEmit` |
| C2 수정 | `src/apps/router/index.tsx` `ROUTES` import: `@shared/config/routes` → `@shared` (public API 경유) |
| C2 보조 | `tsconfig.app.json` paths에 와일드카드 없는 레이어 alias 추가 (`@shared`, `@pages`, …) |
| C2 보조 | `src/apps/index.ts` 신규 생성 (apps 레이어 public API) |
| W1 처리 | `index.html` Vite 기본 favicon 참조 제거 |

#### 검증 결과 (보완 후 — 2026-05-26 v2)

| 명령 | 결과 | 비고 |
| --- | --- | --- |
| `pnpm typecheck` | ✅ PASS | `tsc -b --noEmit` — references 포함 검증 |
| `pnpm test` | ✅ PASS | 1 test file, 1 test passed |
| `pnpm lint` | ✅ PASS | 오류 없음 |
| `pnpm build` | ✅ PASS | dist 316KB (gzip 100KB) |
| `git diff --check` | ✅ PASS | whitespace 오류 없음 |

#### 남은 리스크

| 리스크 | 설명 | 대응 |
| --- | --- | --- |
| shadcn/ui 컴포넌트 미설치 | CLI로 컴포넌트 개별 설치 필요 | Unit 2에서 shadcn init 및 컴포넌트 추가 |
| MSW Service Worker 파일 미생성 | 브라우저 MSW는 `msw init` 명령으로 `public/mockServiceWorker.js` 생성 필요 | Unit 1 이후 MSW 실제 사용 시 실행 |
| Tailwind v4 CSS 변수 shadcn 호환성 | shadcn/ui v2+ Tailwind v4 지원 확인 필요 | Unit 2 shadcn init 시점 검증 |
| `postcss.config.js` 빈 파일 잔존 | shadcn CLI 호환성을 위해 남겨둠 | Unit 2에서 실제 필요 여부 재확인 후 삭제 또는 유지 |

#### 리뷰 요청 포인트 (재리뷰)

1. `tsconfig.app.json`의 와일드카드 없는 alias(`@shared` 등)와 와일드카드 alias(`@shared/*`)가 함께 존재하는 구조가 적절한지 확인
2. Tailwind v4 `@tailwindcss/vite` 플러그인 방식이 shadcn/ui CLI와 호환되는지 확인
3. `src/apps/styles/index.css`의 CSS 변수 토큰이 shadcn/ui 공식 기준과 일치하는지 확인
