# Project Guide — AssetFlow AI MVP

## 0. 문서 목적

이 문서는 AssetFlow AI MVP 구현을 위한 최상위 작업 기준이다. AI 모델과 개발자는 작업 전 이 문서를 읽고 프로젝트 목적, 포함/제외 범위, 기술 원칙, 단위 작업 순서, 검증 기준을 확인한다.

제품 요구사항의 단일 기준은 루트 `PRD.mdc`이다. 이 문서는 `PRD.mdc`를 구현 가능한 단위 작업으로 분해한다.

## 1. 프로젝트 목적

AssetFlow AI는 증권사 연동 또는 수동 입력으로 수집한 보유 자산 정보를 기반으로, 사용자가 현재 포트폴리오 상태를 이해하고 목표 투자 성향에 맞는 리밸런싱 방향을 검토할 수 있게 하는 AI 기반 주식 포트폴리오 진단 서비스이다.

### 핵심 사용자

- 20대 초보 투자자: 보유 종목 편중과 리밸런싱 필요성을 쉬운 설명으로 알고 싶은 사용자
- 30~40대 직장인 투자자: 여러 자산을 한 화면에서 관리하고 정기적으로 목표 비중을 점검하려는 사용자
- 50~60대 은퇴 자산 관리자: 안정성 중심으로 자산 비중을 관리하고 큰 글씨와 명확한 안내를 선호하는 사용자

### 핵심 사용 시나리오

1. 사용자는 로그인 후 증권사를 연결하거나 수동 입력을 선택한다.
2. 사용자는 대시보드에서 총 자산, 전일 대비 변동, 자산 배분, 주요 보유 종목을 확인한다.
3. 사용자는 목표 비중 대비 현재 포트폴리오가 얼마나 벗어났는지 확인한다.
4. 사용자는 AI 리밸런싱 제안에서 현재 구성과 추천 구성을 비교한다.
5. 사용자는 포트폴리오 관리 화면에서 종목별 비중 차이와 AI 액션을 검토한다.
6. 사용자는 설정 화면에서 수동 자산과 목표 리밸런싱 비율을 관리한다.

## 2. MVP 포함 범위

- React 기반 데스크톱 우선 웹 프로토타입
- 카카오/일반 로그인 UI와 mock 인증 흐름
- 증권사 연동 온보딩 UI와 mock 연결 상태
- 키움증권, 토스증권, 미래에셋증권, 삼성증권 선택 카드
- 수동 자산 추가, 편집, 삭제
- 목표 리밸런싱 비율 설정
- 공격형, 중립형, 방어형 프리셋
- 포트폴리오 대시보드
- 총 자산 가치, 전일 대비 변동, 자산 배분, 주요 보유 종목
- AI 포트폴리오 진단 요약
- 자산군 단위 AI 리밸런싱 제안
- 현재 자산 구성과 AI 추천 구성 비교
- 3개월 후, 6개월 후, 12개월 후 예상 결과 표시
- 주식 포트폴리오 관리 테이블
- 종목별 현재 비중, 목표 비중 차이, AI 액션 추천
- AI 모델 선택 및 개인 API 키 설정 UI
- API 키 미설정 사용자 대상 기본 무료 AI 제안 3회
- 무료 3회 소진 후 개인 API 키 연동 유도 팝업
- 라이트/다크 모드
- MSW 기반 mock API
- 핵심 순수 계산 로직과 주요 화면 흐름 테스트

## 3. MVP 제외 범위

- 실제 주문 실행
- 자동 매매
- 실제 투자 자문 또는 일임 운용
- 실시간 시세 보장
- 실제 증권사 API 운영 연동
- 실제 카카오 OAuth 운영 연동
- 세금 최적화 계산
- 연금, 보험, 부동산 등 비상장 자산 상세 분석
- 가족 계정 또는 공동 관리 권한
- 모바일 앱 전용 UX
- AI 모델 API 운영 연동

## 4. 기술 및 아키텍처 원칙

### 기술 스택

- React 19
- Next.js: SSR 또는 라우팅/배포 요구가 확정될 경우 사용한다. 단순 프로토타입 단계에서는 Vite도 허용하되, 선택한 프레임워크를 `CURRENT_TASK.md`에 명시한다.
- TypeScript
- TanStack Query
- React Hook Form
- Zod 또는 동등한 스키마 검증 도구
- Jotai
- shadcn/ui
- shadcn chart 컴포넌트, Recharts, Chart.js 중 프로젝트에 실제 도입한 차트 도구
- Supabase: 인증, DB, 서버리스 백엔드 후보. MVP 초기에는 mock API를 먼저 구현하고, Supabase 연동은 별도 Unit에서 진행한다.
- Vitest
- React Testing Library
- MSW

### FSD 레이어 원칙

프로젝트는 Feature-Sliced Design을 기본으로 한다.

```text
apps → pages → widgets → features → entities → shared
```

- 상위 레이어는 하위 레이어만 import한다.
- 같은 레이어의 다른 slice를 직접 import하지 않는다.
- 외부 노출은 각 slice의 `index.ts`를 통해서만 한다.
- deep import를 금지한다.
- API Fetcher는 `entities/*/api`에 둔다.
- TanStack Query hook은 `entities/*/hook`에 둔다.
- 사용자 액션과 UX 피드백은 `features/*/ui`에서 처리한다.
- 페이지 라우트는 조합만 담당하고 비즈니스 로직을 갖지 않는다.

### 상태 관리 기준

- 서버 상태: TanStack Query
- 필터, 검색어, 테마, UI 상태: Jotai 또는 searchParams
- 폼 상태: React Hook Form
- 입력 검증: Zod schema
- 단순 로컬 UI 상태: `useState`
- 포트폴리오 계산 로직: `shared/lib` 또는 `entities/portfolio/model`의 순수 함수

### API 및 mock 원칙

- MVP 초기는 MSW mock API로 화면과 도메인 흐름을 완성한다.
- API 계약, 타입, mock 데이터는 SSOT로 관리한다.
- Fetcher 단독 테스트보다 hook/MSW 통합 테스트를 우선한다.
- 조회는 `useSuspenseQuery`와 상위 Boundary를 기본으로 한다.
- 변경은 mutation hook과 features의 `mutateAsync` 호출로 분리한다.
- mutation hook의 `onSuccess`는 invalidate만 담당한다.

### UI 원칙

- 데스크톱 우선 레이아웃을 구현한다.
- 로그인은 브랜딩 카드와 로그인 폼의 5:5 분할 레이아웃을 따른다.
- 내부 화면은 사이드바, 상단 유틸, 메인 콘텐츠 구조를 공유한다.
- 리밸런싱 화면의 현재 구성 카드와 AI 추천 구성 카드는 같은 높이로 비교 가능해야 한다.
- 다크/라이트 모드는 동일한 정보 구조를 유지한다.
- 색상만으로 상승/하락이나 위험 상태를 표현하지 않고, 텍스트와 아이콘을 함께 사용한다.
- 중장년층 가독성을 위해 핵심 수치와 CTA는 충분한 크기와 대비를 확보한다.

### 보안 및 정책 원칙

- 실제 민감 데이터는 MVP mock 단계에서 사용하지 않는다.
- 증권사 토큰, API 키, 세션 토큰을 클라이언트 저장소에 평문 저장하지 않는다.
- 추천 결과에는 투자 판단 보조 정보이며 수익을 보장하지 않는다는 고지를 포함한다.
- 실제 외부 API 또는 Supabase 연동 시 `.env` 기반 환경 변수와 서버 측 처리를 우선한다.
- AI 제안 호출은 기본적으로 사용자 개인 구독 API 키를 사용한다.
- API 키 미설정 사용자는 기본 무료 AI 제안을 최대 3회까지만 제공한다.
- 무료 횟수 소진 후에는 AI 제안 요청 시 API 키 연동 안내 팝업을 노출하고, 설정 화면 연동 전까지 추가 제안을 제한한다.

## 5. MVP 단위 작업 계획

| Unit | 목적 | 우선순위 | 선행 Unit | 상태 |
| --- | --- | --- | --- | --- |
| Unit 0 | 프로젝트 스캐폴딩과 개발 도구 구성 | P0 | 없음 | DONE |
| Unit 1 | 도메인 모델, 상수, mock 데이터, 계산 로직 SSOT 구축 | P0 | Unit 0 | DONE |
| Unit 2 | 공통 앱 쉘, 라우팅, 테마, 레이아웃 기반 구축 | P0 | Unit 0, Unit 1 | READY |
| Unit 3 | 인증 UI와 mock 로그인 플로우 구현 | P0 | Unit 2 | TODO |
| Unit 4 | 증권사 연동 온보딩과 mock 연결 상태 구현 | P0 | Unit 2, Unit 3 | TODO |
| Unit 5 | 수동 자산 입력과 목표 비중 설정 구현 | P0 | Unit 1, Unit 2 | TODO |
| Unit 6 | 포트폴리오 대시보드 구현 | P0 | Unit 1, Unit 2, Unit 5 | TODO |
| Unit 7 | AI 리밸런싱 제안 구현 | P0 | Unit 1, Unit 5, Unit 6 | TODO |
| Unit 8 | 주식 포트폴리오 관리 구현 | P1 | Unit 1, Unit 5, Unit 7 | TODO |
| Unit 9 | Supabase 연동 후보 검증과 persistence 전환 | P1 | Unit 1~8 | TODO |
| Unit 10 | 접근성, 반응형, 에러/빈 상태 품질 보강 | P1 | Unit 2~8 | TODO |
| Unit 11 | 최종 검증, 문서 정리, 릴리즈 후보 정리 | P1 | Unit 0~10 | TODO |

## 6. Unit 상세 계획

### Unit 0 — 프로젝트 스캐폴딩과 개발 도구 구성

#### 목표

구현 가능한 React 프로젝트 기반을 만들고 lint, test, typecheck, 스타일 도구를 실행 가능하게 한다.

#### 주요 작업

- 프레임워크 선택: Next.js 또는 Vite 중 하나를 확정한다.
- TypeScript, ESLint, Prettier, Vitest, React Testing Library, MSW를 구성한다.
- shadcn/ui와 스타일 시스템을 구성한다.
- path alias를 설정한다.
- FSD 디렉토리 기본 구조를 만든다.
- 기본 라우트 또는 페이지 엔트리를 만든다.

#### 예상 파일

- `package.json`
- `tsconfig.json`
- `vite.config.ts` 또는 `next.config.ts`
- `vitest.config.ts`
- `src/apps`
- `src/pages`
- `src/widgets`
- `src/features`
- `src/entities`
- `src/shared`
- `src/shared/config`
- `src/shared/ui`
- `src/shared/lib`

#### 완료 기준

- `pnpm lint`가 실행된다.
- `pnpm test`가 실행된다.
- `pnpm typecheck`가 실행된다.
- 기본 화면이 로컬 dev server에서 렌더링된다.

### Unit 1 — 도메인 모델, 상수, mock 데이터, 계산 로직 SSOT 구축

#### 목표

MVP의 모든 화면이 공유할 자산, 목표 비중, 리밸런싱 추천, 증권사 연결 모델을 한 곳에 정의한다.

#### 주요 작업

- PRD의 데이터 모델을 TypeScript 타입으로 정리한다.
- 자산군, 투자 성향, AI 액션, 증권사 provider 상수를 정의한다.
- mock 사용자, mock 보유 자산, mock 목표 비중, mock 추천 결과를 작성한다.
- 총 자산 가치 계산 함수를 작성한다.
- 자산군별 현재 비중 계산 함수를 작성한다.
- 목표 비중 차이 계산 함수를 작성한다.
- 프리셋 적용 함수를 작성한다.
- 예상 자산 가치 계산 함수를 작성한다.

#### 예상 파일

- `src/entities/portfolio/model/types.ts`
- `src/entities/portfolio/model/constants.ts`
- `src/entities/portfolio/model/calculatePortfolioSummary.ts`
- `src/entities/portfolio/model/calculateAllocationGap.ts`
- `src/entities/portfolio/model/applyInvestmentPreset.ts`
- `src/entities/portfolio/model/calculateExpectedValue.ts`
- `src/entities/portfolio/model/mockPortfolio.ts`
- `src/entities/portfolio/index.ts`
- `src/entities/brokerage/model/types.ts`
- `src/entities/brokerage/model/constants.ts`
- `src/entities/brokerage/model/mockBrokerages.ts`
- `src/entities/brokerage/index.ts`
- `src/entities/rebalancing/model/types.ts`
- `src/entities/rebalancing/model/constants.ts`
- `src/entities/rebalancing/model/mockRecommendations.ts`
- `src/entities/rebalancing/index.ts`

#### 테스트 기준

- 총 자산 가치가 `quantity * currentPrice` 합계로 계산된다.
- 자산군별 비중 합계가 100%에 근접한다.
- 목표 비중 차이가 현재 비중과 목표 비중의 차이로 계산된다.
- 공격형, 중립형, 방어형 프리셋이 기대 비중을 반환한다.
- 예상 자산 가치가 기간별 기대 수익률을 반영한다.
- 빈 holdings 입력 시 총액 0과 빈 breakdown을 반환한다.

#### 완료 기준

- 도메인 타입과 mock 데이터가 public API로 노출된다.
- 계산 로직 테스트가 통과한다.
- magic number와 magic string은 상수로 분리된다.
- MVP mock 추천에는 투자 판단 보조 정보이며 수익을 보장하지 않는다는 고지가 포함된다.

### Unit 2 — 공통 앱 쉘, 라우팅, 테마, 레이아웃 기반 구축

#### 목표

모든 내부 화면이 공유할 라우팅, 사이드바, 상단 유틸, 테마 구조를 만든다.

#### 주요 작업

- 라우트 목록을 상수로 정의한다.
- 로그인 레이아웃과 인증 후 앱 레이아웃을 분리한다.
- 사이드바 메뉴를 구현한다.
- 상단 유틸 영역을 구현한다.
- 라이트/다크 모드 토큰과 전환 상태를 구현한다.
- 공통 카드, 섹션 헤더, 수치 표시, 빈 상태, 에러 상태 컴포넌트를 정리한다.
- 라우트별 page slice를 만들고 inline placeholder를 제거한다.

#### 예상 파일

- `src/shared/config/routes.ts`
- `src/shared/config/navigation.ts`
- `src/shared/config/theme.ts`
- `src/shared/ui/Button.tsx`
- `src/shared/ui/Surface.tsx`
- `src/shared/ui/MetricValue.tsx`
- `src/shared/ui/EmptyState.tsx`
- `src/widgets/app-shell/ui/AppShell.tsx`
- `src/widgets/app-sidebar/ui/AppSidebar.tsx`
- `src/widgets/app-header/ui/AppHeader.tsx`
- `src/apps/router`
- `src/pages/login/ui/LoginPage.tsx`
- `src/pages/dashboard/ui/DashboardPage.tsx`
- `src/pages/onboarding-brokerage/ui/OnboardingBrokeragePage.tsx`
- `src/pages/rebalance/ui/RebalancePage.tsx`
- `src/pages/portfolio/ui/PortfolioPage.tsx`
- `src/pages/settings/ui/SettingsPage.tsx`

#### 테스트 기준

- `/` 진입 시 `/login`으로 이동한다.
- 주요 라우트 메뉴가 렌더링된다.
- 현재 라우트에 맞는 메뉴 active 상태가 표시된다.
- 테마 전환 시 루트 theme class 또는 data attribute가 변경된다.

#### 완료 기준

- `/login`, `/onboarding/brokerage`, `/dashboard`, `/rebalance`, `/portfolio`, `/settings` 라우트 진입점이 존재한다.
- 내부 화면은 동일한 앱 쉘을 공유한다.
- 로그인 화면은 내부 앱 쉘을 사용하지 않는다.

### Unit 3 — 인증 UI와 mock 로그인 플로우 구현

#### 목표

로그인 화면과 mock 인증 상태를 구현해 사용자 플로우 진입점을 만든다.

#### 주요 작업

- 로그인 폼 schema를 정의한다.
- 이메일/비밀번호 로그인 UI를 구현한다.
- 카카오 로그인 버튼 UI를 구현한다.
- mock login mutation을 만든다.
- 로그인 성공 시 신규 사용자는 온보딩으로, 기존 사용자는 대시보드로 이동하게 한다.
- 로그인 실패 메시지를 폼 하단에 표시한다.
- 보안 안내 문구를 로그인 화면에 배치한다.
- API 키 미설정 신규 사용자의 무료 AI 제안 횟수(3회) 초기 상태를 세션 mock에 포함한다.

#### 예상 파일

- `src/entities/session/model/types.ts`
- `src/entities/session/api/login.ts`
- `src/entities/session/hook/useLogin.ts`
- `src/entities/session/model/mockSession.ts`
- `src/features/auth-login/ui/LoginForm.tsx`
- `src/pages/login/ui/LoginPage.tsx`
- `src/shared/api/mocks/sessionHandlers.ts`

#### 테스트 기준

- 빈 이메일/비밀번호는 유효성 오류를 표시한다.
- 올바른 mock 계정은 로그인 성공 상태를 만든다.
- 잘못된 mock 계정은 실패 문구를 표시한다.
- 카카오 로그인 버튼 클릭 시 mock provider login이 호출된다.

#### 완료 기준

- 로그인 화면이 PRD의 5:5 분할 레이아웃을 따른다.
- 인증 실패 상태에서 화면이 유지된다.
- 인증 성공 후 라우팅이 동작한다.
- 신규 사용자 세션의 `aiTrialRemainingCount` 기본값(3)이 설정된다.

### Unit 5 — 수동 자산 입력과 목표 비중 설정 구현

#### 목표

수동 자산 입력, 목표 비중 설정과 함께 AI 모델/개인 API 키 설정 기능을 제공한다.

#### 주요 작업(추가)

- 설정 화면에 AI 모델 선택 UI를 추가한다. (GPT, Gemini, Claude 등)
- 개인 API 키 입력/수정/삭제 UI를 추가한다.
- API 키 상태(미설정/연동됨/오류)를 표시한다.
- API 키는 마스킹 표기로 노출한다.

#### 완료 기준(추가)

- 사용자가 설정 화면에서 AI 모델과 개인 API 키를 관리할 수 있다.
- API 키 저장 상태가 화면에서 명확히 확인된다.

### Unit 7 — AI 리밸런싱 제안 구현

#### 목표(추가)

AI 제안 화면에서 API 키 정책과 무료 제안 횟수 정책을 함께 구현한다.

#### 주요 작업(추가)

- API 키 미설정 시 기본 무료 AI 제안 호출 로직을 적용한다.
- 무료 제안 잔여 횟수(최대 3회)를 UI에 표시한다.
- 무료 횟수 소진 시 API 키 연동 유도 팝업을 표시한다.
- 팝업에서 설정 화면으로 이동할 수 있게 연결한다.

#### 완료 기준(추가)

- API 키 미설정 사용자는 3회까지만 AI 제안을 받을 수 있다.
- 4회차부터는 API 키 연동 팝업이 표시되고 제안이 차단된다.

### Unit 4 — 증권사 연동 온보딩과 mock 연결 상태 구현

#### 목표

지원 증권사 선택, 검색, 연결 진행 상태, 실패/성공 상태를 구현한다.

#### 주요 작업

- 증권사 목록 query hook을 만든다.
- 증권사 연결 mutation hook을 만든다.
- 온보딩 단계 표시 UI를 구현한다.
- 증권사 카드 UI를 구현한다.
- 증권사 검색 필터를 구현한다.
- `나중에 하기` 액션을 설정 화면 또는 대시보드 빈 상태로 연결한다.
- 연결 실패 상태와 재시도 액션을 구현한다.
- 보안 배지와 개인정보 안내 문구를 배치한다.

#### 예상 파일

- `src/entities/brokerage/api/readBrokerages.ts`
- `src/entities/brokerage/api/connectBrokerage.ts`
- `src/entities/brokerage/hook/useSuspenseBrokerages.ts`
- `src/entities/brokerage/hook/useConnectBrokerage.ts`
- `src/features/brokerage-connect/ui/BrokerageCard.tsx`
- `src/features/brokerage-connect/ui/BrokerageConnectPanel.tsx`
- `src/pages/onboarding-brokerage/ui/OnboardingBrokeragePage.tsx`
- `src/shared/api/mocks/brokerageHandlers.ts`

#### 테스트 기준

- 지원 증권사 4개가 렌더링된다.
- 검색어 입력 시 증권사 목록이 필터링된다.
- 연결하기 클릭 시 연결 진행 상태가 표시된다.
- mock 실패 응답 시 실패 문구와 재시도 버튼이 보인다.
- `나중에 하기` 클릭 시 수동 입력 플로우로 이동한다.

#### 완료 기준

- 온보딩 3단계 흐름이 UI에 표시된다.
- 연결 성공/실패/건너뛰기 상태가 모두 표현된다.

### Unit 5 — 수동 자산 입력과 목표 비중 설정 구현

#### 목표

증권사 연동 없이도 사용자가 자산을 입력하고 목표 리밸런싱 비율을 설정할 수 있게 한다.

#### 주요 작업

- 수동 자산 입력 schema를 정의한다.
- 자산 생성, 수정, 삭제 mock mutation을 만든다.
- 현재 보유 자산 query hook을 만든다.
- 목표 비중 query/mutation hook을 만든다.
- 수동 자산 추가 폼을 구현한다.
- 목표 비중 슬라이더를 구현한다.
- 공격형, 중립형, 방어형 프리셋을 구현한다.
- 목표 비중 총합 100% 검증 또는 자동 보정을 구현한다.
- 현재 보유 자산 테이블을 구현한다.

#### 예상 파일

- `src/entities/portfolio/api/readHoldings.ts`
- `src/entities/portfolio/api/createManualHolding.ts`
- `src/entities/portfolio/api/updateManualHolding.ts`
- `src/entities/portfolio/api/deleteManualHolding.ts`
- `src/entities/portfolio/api/readTargetAllocation.ts`
- `src/entities/portfolio/api/updateTargetAllocation.ts`
- `src/entities/portfolio/hook/useSuspenseHoldings.ts`
- `src/entities/portfolio/hook/useCreateManualHolding.ts`
- `src/entities/portfolio/hook/useUpdateTargetAllocation.ts`
- `src/features/manual-asset-form/ui/ManualAssetForm.tsx`
- `src/features/target-allocation-editor/ui/TargetAllocationEditor.tsx`
- `src/pages/settings/ui/SettingsPage.tsx`
- `src/shared/api/mocks/portfolioHandlers.ts`

#### 테스트 기준

- 필수값 누락 시 입력 오류가 표시된다.
- 수량과 평균 단가는 양수만 허용한다.
- 자산 추가 성공 시 목록 query가 invalidate된다.
- 프리셋 클릭 시 목표 비중 값이 반영된다.
- 목표 비중 총합이 100%가 아니면 저장 오류 또는 자동 보정이 동작한다.

#### 완료 기준

- 설정 화면에서 수동 자산과 목표 비중을 관리할 수 있다.
- 목표 비중은 대시보드와 리밸런싱 계산에서 참조 가능한 형태로 저장된다.

### Unit 6 — 포트폴리오 대시보드 구현

#### 목표

사용자가 전체 자산 상태와 AI 진단 요약을 한 화면에서 확인할 수 있게 한다.

#### 주요 작업

- 포트폴리오 요약 query hook을 만든다.
- 총 자산 가치 카드와 전일 대비 변동 표시를 구현한다.
- AI 포트폴리오 진단 카드를 구현한다.
- 자산 배분 카드 또는 차트를 구현한다.
- 주요 보유 종목 테이블을 구현한다.
- `지금 리밸런싱하기` CTA와 `전체보기` CTA를 연결한다.
- 연결 계좌 없음, 수동 자산 없음, 동기화 실패 상태를 구현한다.

#### 예상 파일

- `src/entities/portfolio/api/readPortfolioSummary.ts`
- `src/entities/portfolio/hook/useSuspensePortfolioSummary.ts`
- `src/widgets/portfolio-summary/ui/PortfolioSummaryCards.tsx`
- `src/widgets/asset-allocation/ui/AssetAllocationChart.tsx`
- `src/widgets/ai-diagnosis/ui/AiDiagnosisCard.tsx`
- `src/widgets/top-holdings/ui/TopHoldingsTable.tsx`
- `src/pages/dashboard/ui/DashboardPage.tsx`

#### 테스트 기준

- 총 자산 가치가 mock holdings 기준으로 표시된다.
- 목표 비중 이탈 문구가 표시된다.
- 자산 배분 비중이 자산군별로 표시된다.
- 주요 보유 종목 3~5개가 표시된다.
- CTA 클릭 시 올바른 라우트로 이동한다.

#### 완료 기준

- 대시보드 첫 화면에서 총 자산, AI 진단, 자산 배분, 주요 종목을 확인할 수 있다.

### Unit 7 — AI 리밸런싱 제안 구현

#### 목표

현재 자산 구성과 AI 추천 구성을 비교하고 기간별 예상 결과와 추천 근거를 제공한다.

#### 주요 작업

- 리밸런싱 추천 query/mutation hook을 만든다.
- 현재 자산 구성 카드와 AI 추천 구성 카드를 구현한다.
- 두 비교 카드의 높이와 정보 구조를 맞춘다.
- 기간 선택값 `3개월 후`, `6개월 후`, `12개월 후`를 구현한다.
- 예상 자산 가치와 예상 수익을 표시한다.
- AI 추천 근거 테이블을 구현한다.
- 투자 판단 고지 영역을 구현한다.
- 추천 생성 중, 추천 실패, 목표 비중 미설정 상태를 구현한다.

#### 예상 파일

- `src/entities/rebalancing/model/types.ts`
- `src/entities/rebalancing/api/readRebalancingRecommendation.ts`
- `src/entities/rebalancing/hook/useSuspenseRebalancingRecommendation.ts`
- `src/features/rebalancing-period-select/ui/RebalancingPeriodSelect.tsx`
- `src/widgets/rebalancing-comparison/ui/RebalancingComparisonCards.tsx`
- `src/widgets/rebalancing-reasons/ui/RebalancingReasonTable.tsx`
- `src/pages/rebalance/ui/RebalancePage.tsx`
- `src/shared/api/mocks/rebalancingHandlers.ts`

#### 테스트 기준

- 현재 구성과 추천 구성이 같은 자산군 기준으로 표시된다.
- 기간 선택 시 예상 자산 가치가 변경된다.
- 추천 근거 테이블에 이유 문구가 표시된다.
- 목표 비중이 없으면 목표 설정 안내가 표시된다.
- 추천 실패 시 재시도 가능한 에러 상태가 표시된다.

#### 완료 기준

- 사용자는 자산군 단위 추천과 기간별 예상 결과를 검토할 수 있다.

### Unit 8 — 주식 포트폴리오 관리 구현

#### 목표

보유 종목별 현재 상태, 목표 비중 차이, AI 액션 추천을 관리할 수 있게 한다.

#### 주요 작업

- 종목 테이블 컬럼을 정의한다.
- 종목 검색과 섹터 필터를 구현한다.
- `TICKER / NAME`, `SECTOR`, `PRICE`, `DAY CHG`, `TOTAL GAIN`, `WEIGHT GAP` 컬럼을 구현한다.
- 섹터별 목표 비중 편집 UI를 구현한다.
- 종목별 더보기 메뉴를 구현한다.
- AI 액션 배지와 추천 사유 표시를 구현한다.
- 빈 목록, 필터 결과 없음, 저장 실패 상태를 구현한다.

#### 예상 파일

- `src/features/portfolio-filter/ui/PortfolioFilter.tsx`
- `src/features/sector-target-editor/ui/SectorTargetEditor.tsx`
- `src/widgets/holding-table/ui/HoldingTable.tsx`
- `src/widgets/stock-action-recommendations/ui/StockActionPanel.tsx`
- `src/pages/portfolio/ui/PortfolioPage.tsx`

#### 테스트 기준

- 보유 종목 테이블이 PRD 컬럼을 포함한다.
- 검색어 입력 시 종목 목록이 필터링된다.
- 목표 비중 차이가 양수/음수 부호와 함께 표시된다.
- AI 액션이 `매수`, `매도`, `유지` 중 하나로 표시된다.
- 필터 결과가 없을 때 빈 상태가 표시된다.

#### 완료 기준

- 사용자는 종목 단위로 현재 비중, 목표 비중 차이, AI 액션을 확인할 수 있다.

### Unit 9 — Supabase 연동 후보 검증과 persistence 전환

#### 목표

mock API로 완성한 MVP 흐름 중 저장이 필요한 데이터를 Supabase 기반으로 전환할 수 있는지 검증한다.

#### 주요 작업

- Supabase 사용 범위를 확정한다.
- 사용자, 보유 자산, 목표 비중, 증권사 연결, 추천 결과 테이블 초안을 설계한다.
- RLS 정책 후보를 설계한다.
- mock API 계약과 Supabase schema의 필드명을 맞춘다.
- 수동 자산과 목표 비중 저장부터 실제 persistence 전환을 검증한다.

#### 예상 파일

- `supabase/migrations`
- `src/shared/api/client/supabaseClient.ts`
- `src/entities/portfolio/api/*`
- `src/entities/session/api/*`

#### 테스트 기준

- 타입 생성 또는 schema 타입이 TypeScript와 호환된다.
- 수동 자산 생성/조회/수정/삭제가 동일한 UI 계약으로 동작한다.
- 목표 비중 저장과 조회가 동작한다.
- 인증되지 않은 사용자는 보호 데이터에 접근하지 못한다.

#### 완료 기준

- Supabase 전환 가능성과 남은 리스크가 `WORK_LOG.md`에 기록된다.
- 실제 외부 연동이 MVP 범위를 넘어가면 mock 유지 결정을 문서화한다.

### Unit 10 — 접근성, 반응형, 에러/빈 상태 품질 보강

#### 목표

MVP의 주요 화면이 데스크톱 기준으로 안정적으로 보이고, 기본 접근성과 실패 상태를 방어하게 한다.

#### 주요 작업

- 주요 버튼과 입력에 접근 가능한 이름을 부여한다.
- 테이블 헤더와 상태 영역의 semantic markup을 점검한다.
- 라이트/다크 모드 대비를 점검한다.
- 1440px, 1280px, 1024px 폭에서 레이아웃을 확인한다.
- 카드/테이블 텍스트 overflow를 점검한다.
- 공통 에러, 빈 상태, 로딩 상태를 정리한다.

#### 예상 파일

- `src/shared/ui/*`
- `src/widgets/*`
- `src/pages/*`
- 관련 테스트 파일

#### 테스트 기준

- 핵심 CTA는 role/name으로 조회 가능하다.
- 테이블 헤더와 행 정보가 테스트에서 의미 있게 조회된다.
- 빈 상태와 에러 상태가 각 화면에서 표시된다.
- 테마 전환 후 주요 텍스트가 사라지지 않는다.

#### 완료 기준

- 주요 화면의 접근성/반응형 리스크가 문서화되고, Critical UI 깨짐이 없다.

### Unit 11 — 최종 검증, 문서 정리, 릴리즈 후보 정리

#### 목표

MVP 구현 결과를 PRD와 대조하고, 다음 개발자가 이어서 작업할 수 있도록 문서를 정리한다.

#### 주요 작업

- PRD 포함 범위와 구현 결과를 매핑한다.
- `CURRENT_TASK.md`, `WORK_LOG.md`, `REVIEW_LOG.md`, `SESSION_STATE.md`를 최신화한다.
- 테스트, lint, typecheck, build 결과를 기록한다.
- 남은 리스크와 다음 작업 후보를 `NEXT_TASK_DRAFT.md`에 작성한다.
- MVP 데모 경로와 계정 정보를 문서화한다.

#### 예상 파일

- `docs/CURRENT_TASK.md`
- `docs/WORK_LOG.md`
- `docs/REVIEW_LOG.md`
- `docs/SESSION_STATE.md`
- `docs/NEXT_TASK_DRAFT.md`
- `docs/handoff/*`

#### 테스트 기준

- `pnpm lint`
- `pnpm test`
- `pnpm typecheck`
- `pnpm build`
- `git diff --check`

#### 완료 기준

- PRD 요구사항별 구현 상태가 추적 가능하다.
- 다음 작업자가 문서만 읽고 현재 상태와 다음 액션을 이해할 수 있다.

## 7. 단위 작업 운영 규칙

### 착수 전

1. `PRD.mdc`를 읽고 해당 Unit이 어떤 요구사항을 구현하는지 확인한다.
2. `docs/PROJECT_GUIDE.md`에서 Unit의 목표와 선행 Unit을 확인한다.
3. `docs/CURRENT_TASK.md`에 이번 Unit의 포함/제외 범위와 예상 변경 파일을 작성한다.
4. 관련 `.rules` 문서를 읽는다.
5. 코드가 이미 존재하면 기존 패턴을 먼저 따른다.

### 작업 중

- 요청 범위 밖 리팩터링을 하지 않는다.
- 도메인 타입, 상수, API 계약, mock 데이터는 SSOT를 유지한다.
- FSD public API를 통해 import한다.
- deep import를 만들지 않는다.
- 테스트가 필요한 순수 로직과 핵심 UI 흐름은 먼저 실패 테스트를 작성한다.
- 새 라이브러리 도입은 `CURRENT_TASK.md`에 이유와 대안을 기록한다.

### 완료 후

1. Unit별 검증 명령을 실행한다.
2. 결과를 `docs/WORK_LOG.md`에 기록한다.
3. 리뷰가 필요한 경우 `docs/REVIEW_LOG.md`에 리뷰 요청 또는 결과를 기록한다.
4. 다음 작업 후보를 `docs/NEXT_TASK_DRAFT.md`에 반영한다.
5. 세션 종료 전 `docs/SESSION_STATE.md`를 갱신한다.

## 8. Definition of Done

- 구현 결과가 `PRD.mdc`의 요구사항과 추적 가능하다.
- 변경 범위가 `CURRENT_TASK.md`와 일치한다.
- FSD 레이어 의존성과 public API 규칙을 지킨다.
- API 계약, 도메인 타입, mock 데이터가 중복 정의되지 않는다.
- 핵심 순수 로직은 단위 테스트로 검증된다.
- 핵심 UI 흐름은 React Testing Library와 MSW로 검증된다.
- 변경 파일 기준 lint가 통과한다.
- TypeScript typecheck가 통과한다.
- UI 변경은 로컬 브라우저에서 주요 화면을 확인한다.
- 남은 리스크가 `WORK_LOG.md` 또는 `NEXT_TASK_DRAFT.md`에 기록된다.
- 리뷰 결과가 필요한 경우 `REVIEW_LOG.md`에 기록된다.

## 9. 리뷰 기준

- PRD 요구사항 누락 여부
- MVP 포함/제외 범위 위반 여부
- FSD 레이어 의존성 위반 여부
- public API 미사용 또는 deep import 여부
- API 계약, 타입, mock 데이터 정합성
- 상태 관리 기준 위반 여부
- Query invalidate 범위와 mutation UX 분리 여부
- 로딩, 에러, 빈 상태 처리 여부
- 라이트/다크 모드 정보 구조 일관성
- 테이블과 핵심 CTA의 접근성
- 중장년층 가독성 기준 충족 여부
- 투자 판단 고지와 보안 메시지 누락 여부
- 테스트가 핵심 계산과 핵심 사용자 흐름을 방어하는지
- magic number, magic string, `any`, 임시 TODO 잔존 여부

## 10. 추천 작업 순서

### Phase 1 — 기반 구축

- Unit 0: 프로젝트 스캐폴딩과 개발 도구 구성
- Unit 1: 도메인 모델, 상수, mock 데이터, 계산 로직 SSOT 구축
- Unit 2: 공통 앱 쉘, 라우팅, 테마, 레이아웃 기반 구축

### Phase 2 — 핵심 입력과 조회 흐름

- Unit 3: 인증 UI와 mock 로그인 플로우 구현
- Unit 4: 증권사 연동 온보딩과 mock 연결 상태 구현
- Unit 5: 수동 자산 입력과 목표 비중 설정 구현
- Unit 6: 포트폴리오 대시보드 구현

### Phase 3 — 리밸런싱 가치 구현

- Unit 7: AI 리밸런싱 제안 구현
- Unit 8: 주식 포트폴리오 관리 구현

### Phase 4 — 저장소와 품질 강화

- Unit 9: Supabase 연동 후보 검증과 persistence 전환
- Unit 10: 접근성, 반응형, 에러/빈 상태 품질 보강
- Unit 11: 최종 검증, 문서 정리, 릴리즈 후보 정리

## 11. 모델별 역할

### GPT

- 프로젝트 관리
- 작업 계획 수립
- 기능 설계
- 작업 단위 분해
- 리뷰 및 피드백
- `PROJECT_GUIDE.md`, `CURRENT_TASK.md`, `NEXT_TASK_DRAFT.md`, `REVIEW_LOG.md`, `docs/handoff/*` 갱신

### Claude Code

- 코드 구현
- 코드 수정 및 보완
- 검증 명령 실행
- `WORK_LOG.md`, `SESSION_STATE.md` 갱신

## 12. 다음 문서 작업 후보

`PROJECT_GUIDE.md` 기준이 확정되면 다음 순서로 작업 문서를 갱신한다.

1. `docs/CURRENT_TASK.md`: Unit 0 착수 지시서로 갱신
2. `docs/NEXT_TASK_DRAFT.md`: Unit 1 후보와 선행 조건으로 갱신
3. `docs/WORK_LOG.md`: Unit 목록 상태 테이블을 AssetFlow AI 기준으로 갱신
4. `AGENTS.md`: ReleaseHub 설명을 AssetFlow AI 설명으로 교체
