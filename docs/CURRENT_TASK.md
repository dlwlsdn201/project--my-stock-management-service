# Current Task — 현재 작업 지시서

## 0. 작업 요약

Unit 1 — AssetFlow AI MVP의 도메인 모델, 상수, mock 데이터, 순수 계산 로직을 SSOT로 구축한다.

이번 Unit은 화면 UI, API fetcher, TanStack Query hook을 구현하지 않는다. 이후 대시보드, 설정, 리밸런싱, 포트폴리오 관리 화면이 모두 같은 타입과 계산 함수를 참조할 수 있도록 `entities` 레이어에 안정적인 도메인 기반을 만든다.

## 1. 반드시 읽을 문서

- `AGENTS.md`
- `PRD.mdc`
- `docs/PROJECT_GUIDE.md`
- `docs/WORK_LOG.md`
- `docs/REVIEW_LOG.md`
- `docs/SESSION_STATE.md`
- `docs/handoff/unit-1-domain-model-handoff.md`
- `.rules/project-rules_architecture.mdc`
- `.rules/project-rules_working.mdc`
- `.rules/project-rules_naming.mdc`
- `.rules/project-rules_testing-policy.mdc`
- `.rules/project-rules_api-response-interface.mdc`
- `.rules/project-rules_review.mdc`

## 2. 선행 상태

- Unit 0은 `PASS WITH WARNINGS` 상태로 완료됐다.
- 현재 앱은 Vite + React 19 + TypeScript 기반이며 `src/entities`, `src/shared`, path alias, Vitest가 준비되어 있다.
- Unit 0 Warning 중 `index.html` 들여쓰기 정리는 이번 Unit에서 같이 처리해도 된다.
- shadcn/ui 초기화, MSW service worker 생성, 화면 구현은 이번 Unit 범위가 아니다.

## 3. 작업 범위

### 포함

- portfolio, brokerage, rebalancing 도메인 타입 정의
- 도메인 상수와 프리셋 정의
- MVP mock 데이터 작성
- 총 자산 가치 계산
- 자산군별 현재 비중 계산
- 목표 비중 차이 계산
- 투자 성향 프리셋 적용
- 3개월, 6개월, 12개월 예상 자산 가치 계산
- 순수 계산 로직 테스트 작성
- `src/entities/index.ts` public API 갱신
- 작업 완료 후 `docs/WORK_LOG.md`, `docs/SESSION_STATE.md` 갱신

### 제외

- 실제 API Fetcher 구현
- TanStack Query hook 구현
- MSW handler 상세 구현
- 로그인, 온보딩, 대시보드, 리밸런싱, 설정 UI 구현
- Supabase 연동
- 실시간 시세 또는 환율 연동
- AI 모델 호출 또는 실제 투자 자문 로직
- 범위 밖 스타일 리팩터링

## 4. 도메인 정책

- 금액 계산은 MVP에서 모두 KRW 기준 mock 데이터로 처리한다. 환율 변환 로직은 만들지 않는다.
- 보유 자산의 현재 평가액은 `quantity * currentPrice`로 계산한다.
- 비중은 0~100 사이의 퍼센트 숫자로 통일한다.
- 비중 반올림은 소수점 2자리로 통일한다.
- 목표 비중 합계 기준은 100%다.
- 목표 비중과 현재 비중 차이의 허용 오차는 0.5%p로 둔다.
- 자산 타입은 `stock`, `etf`, `bond`, `cash`, `alternative`로 둔다.
- 리밸런싱 비교용 자산군은 `equity`, `bond`, `cash-and-alternative`로 둔다.
- `stock`과 `etf`는 `equity` 그룹으로 집계한다.
- `cash`와 `alternative`는 `cash-and-alternative` 그룹으로 집계한다.
- 투자 성향은 `aggressive`, `balanced`, `defensive` 3종으로 둔다.
- 예상 자산 가치는 연 기대 수익률을 기간 월수에 맞춰 복리 계산한다.
- 추천 결과와 mock 문구에는 "투자 판단 보조 정보이며 수익을 보장하지 않는다"는 고지 문구를 포함한다.

## 5. 예상 변경 파일

### 신규 후보

- `src/entities/portfolio/model/types.ts`
- `src/entities/portfolio/model/constants.ts`
- `src/entities/portfolio/model/mockPortfolio.ts`
- `src/entities/portfolio/model/calculatePortfolioSummary.ts`
- `src/entities/portfolio/model/calculatePortfolioSummary.test.ts`
- `src/entities/portfolio/model/calculateAllocationGap.ts`
- `src/entities/portfolio/model/calculateAllocationGap.test.ts`
- `src/entities/portfolio/model/applyInvestmentPreset.ts`
- `src/entities/portfolio/model/applyInvestmentPreset.test.ts`
- `src/entities/portfolio/model/calculateExpectedValue.ts`
- `src/entities/portfolio/model/calculateExpectedValue.test.ts`
- `src/entities/portfolio/index.ts`
- `src/entities/brokerage/model/types.ts`
- `src/entities/brokerage/model/constants.ts`
- `src/entities/brokerage/model/mockBrokerages.ts`
- `src/entities/brokerage/index.ts`
- `src/entities/rebalancing/model/types.ts`
- `src/entities/rebalancing/model/constants.ts`
- `src/entities/rebalancing/model/mockRecommendations.ts`
- `src/entities/rebalancing/index.ts`
- `docs/handoff/unit-1-domain-model-handoff.md`

### 수정 후보

- `src/entities/index.ts`
- `index.html` (Unit 0 Warning 들여쓰기 정리만 허용)
- `docs/WORK_LOG.md`
- `docs/SESSION_STATE.md`

## 6. 구현 규칙

- FSD 규칙을 지킨다. `entities`는 `shared`만 참조할 수 있고, `apps`, `pages`, `widgets`, `features`를 참조하지 않는다.
- 각 entity slice 외부 노출은 해당 slice의 `index.ts`와 `src/entities/index.ts`를 경유한다.
- slice 내부 파일 간 상대 import는 허용한다.
- TypeScript 타입에 `any`를 사용하지 않는다.
- magic number와 magic string은 `constants.ts`에 둔다.
- 계산 함수는 순수 함수로 작성한다. React hook, 브라우저 API, localStorage, 날짜 현재값 의존성을 넣지 않는다.
- exported 계산 함수에는 간결한 JSDoc을 작성하고 `@returns`를 포함한다.
- mock 데이터는 UI가 바로 활용할 수 있을 만큼 충분히 현실적인 값을 가진다.
- 테스트는 구현 세부가 아니라 입력 대비 결과를 검증한다.
- 실패 테스트를 먼저 작성하고, 최소 구현으로 통과시킨 뒤 필요한 정리를 한다.
- 커밋은 사용자가 명시적으로 요청하기 전까지 만들지 않는다.

## 7. 필수 구현 상세

### 7.1 Portfolio

필수 타입:

- `CurrencyCode`
- `AssetType`
- `AllocationGroup`
- `InvestmentProfile`
- `HoldingAsset`
- `TargetAllocation`
- `AllocationBreakdown`
- `AllocationGap`
- `PortfolioSummary`
- `ExpectedValuePoint`

필수 상수:

- `BASE_CURRENCY_CODE`
- `TARGET_ALLOCATION_TOTAL_PERCENT`
- `PERCENT_DECIMAL_PLACES`
- `ALLOCATION_TOLERANCE_PERCENT`
- `SIMULATION_PERIOD_MONTHS`
- `ANNUAL_EXPECTED_RETURN_BY_PROFILE`
- `INVESTMENT_PRESET_ALLOCATIONS`
- `ASSET_TYPE_TO_ALLOCATION_GROUP`

필수 함수:

- `calculatePortfolioSummary(holdings: HoldingAsset[]): PortfolioSummary`
- `calculateAllocationGap(summary: PortfolioSummary, targetAllocation: TargetAllocation): AllocationGap[]`
- `applyInvestmentPreset(profile: InvestmentProfile): TargetAllocation`
- `calculateExpectedValue(totalValue: number, annualReturnPercent: number, periodMonths: number[]): ExpectedValuePoint[]`

### 7.2 Brokerage

필수 타입:

- `BrokerageProvider`
- `BrokerageConnectionStatus`
- `BrokerageConnectionStep`
- `BrokerageAccount`

필수 상수:

- `BROKERAGE_PROVIDERS`
- `BROKERAGE_CONNECTION_STEPS`
- `SECURITY_BADGES`

필수 mock:

- 키움증권, 토스증권, 미래에셋증권, 삼성증권 mock provider
- 연결 완료 1개, 연결 대기 또는 실패 상태 1개 이상

### 7.3 Rebalancing

필수 타입:

- `RebalancingAction`
- `RebalancingReasonCode`
- `RebalancingRecommendationItem`
- `RebalancingScenario`
- `StockActionRecommendation`

필수 상수:

- `REBALANCING_ACTION_LABELS`
- `REBALANCING_REASON_LABELS`
- `REBALANCING_DISCLOSURE`

필수 mock:

- 자산군 단위 추천 3개 이상
- 종목 단위 AI 액션 추천 4개 이상
- 추천 근거 reason code 3종 이상
- 3개월, 6개월, 12개월 예상 결과

## 8. 테스트 및 검증

아래 테스트를 최소 포함한다.

- 총 평가액이 `quantity * currentPrice` 합계로 계산된다.
- 자산군별 비중 합계가 100%에 근접한다.
- 목표 비중 차이가 `targetPercent - currentPercent`로 계산된다.
- 허용 오차 이내 차이는 `hold` 액션으로 분류된다.
- 공격형, 중립형, 방어형 프리셋이 합계 100%의 목표 비중을 반환한다.
- 예상 자산 가치가 기간별 복리 기대 수익률을 반영한다.
- 빈 holdings 입력 시 총액 0과 빈 breakdown을 반환한다.

작업 완료 전 아래 명령을 실행하고 결과를 `WORK_LOG.md`에 기록한다.

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

## 12. 재리뷰 결과

2026-05-27 GPT 2차 검증 리뷰 결과: PASS WITH WARNINGS.

- C1 resolved: 삼성전자 종목 추천 mock이 `sell` 액션과 비중 초과 설명으로 수정됐다.
- W1 resolved: `index.html` charset meta 태그 들여쓰기가 정리됐다.
- 보완 테스트 확인: `src/entities/rebalancing/model/mockRecommendations.test.ts`가 종목별 action 정합성을 검증한다.
- 남은 Warning: rebalancing 테스트의 허용 오차 상수 중복과 현재 비중 합계 검증 정밀도는 Unit 5 이전 보강 대상으로 남긴다.

Unit 1은 완료로 보고 커밋 및 Unit 2 착수가 가능하다.

## 9. 완료 기준

- 도메인 타입, 상수, mock 데이터가 entity public API로 노출된다.
- 계산 로직 테스트가 통과한다.
- `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, `git diff --check`가 통과한다.
- Unit 2~8에서 참조할 수 있는 mock portfolio, brokerage, rebalancing 데이터가 준비된다.
- `docs/WORK_LOG.md`에 변경 파일, 구현 내용, 검증 결과, 남은 리스크, 리뷰 요청 포인트가 기록된다.
- `docs/SESSION_STATE.md`가 최신 상태로 갱신된다.

## 10. 완료 보고 형식

Claude Code는 작업 완료 후 `WORK_LOG.md` 상단에 아래 항목을 기록한다.

- 작업 일자
- 작업 단위명: Unit 1 — 도메인 모델, 상수, mock 데이터, 계산 로직 SSOT 구축
- 작업 브랜치
- 변경 파일
- 구현 내용
- 테스트 및 검증 결과
- 남은 리스크
- 리뷰 요청 포인트

`SESSION_STATE.md`에는 현재 브랜치, 마지막 완료 작업, 미완료 작업, 커밋 여부, worktree 주의사항, 다음 액션을 기록한다.

## 11. 리뷰 결과 및 보완 지시

2026-05-27 GPT 리뷰 결과: NOT PASS.

아래 Critical 1건을 보완한 뒤 Unit 1 재리뷰를 요청한다.

- `src/entities/rebalancing/model/mockRecommendations.ts`의 삼성전자 종목 추천 mock이 현재 비중 39%, 목표 비중 35%인데 `action: 'hold'`와 "허용 범위(0.5%p) 내" 설명을 사용한다. Unit 1 정책상 허용 오차는 0.5%p이므로 데이터, 액션, 설명을 일관되게 수정한다.

보완 범위:

- 삼성전자 종목 추천의 `action`, `currentWeightPercent`, `targetWeightPercent`, `reasonSummary` 정합성 수정
- 종목 단위 mock recommendation action 정합성 테스트 추가
- `index.html` 들여쓰기 정리
- `docs/WORK_LOG.md`, `docs/SESSION_STATE.md` 갱신

보완 후 아래 명령을 재실행하고 결과를 문서에 기록한다.

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
