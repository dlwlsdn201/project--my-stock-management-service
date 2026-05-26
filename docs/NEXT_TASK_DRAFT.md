# Next Task Draft — 다음 작업 초안

## 0. 문서 목적

이 문서는 Unit 0 완료 후 이어서 착수할 가능성이 높은 Unit 1 작업 후보를 정리한다. Unit 0 리뷰가 PASS 또는 PASS WITH WARNINGS 상태가 된 뒤, 이 내용을 `CURRENT_TASK.md`로 승격한다.

## 1. 다음 작업 후보

Unit 1 — 도메인 모델, 상수, mock 데이터, 계산 로직 SSOT 구축

목표는 AssetFlow AI MVP의 모든 화면이 공유할 portfolio, brokerage, rebalancing 도메인 타입과 순수 계산 로직을 먼저 고정하는 것이다.

## 2. 선행 작업과의 연결점

- Unit 0에서 React + TypeScript + 테스트 환경이 정상 구성되어야 한다.
- Unit 0에서 `src/entities`, `src/shared`, path alias, Vitest setup이 준비되어야 한다.
- Unit 1은 UI 구현 전 단계이며, 이후 Unit 5~8의 데이터 계산 기준이 된다.
- Unit 1 결과는 대시보드, 리밸런싱, 포트폴리오 관리, 설정 화면이 모두 참조하는 SSOT가 된다.

## 3. 예상 범위

### 포함 후보

- PRD의 데이터 모델을 TypeScript 타입으로 변환
- AssetFlow 도메인 상수 정의
- mock user, mock brokerage, mock holdings, mock target allocation, mock recommendation 작성
- 총 자산 가치 계산
- 자산군별 현재 비중 계산
- 목표 비중 차이 계산
- 투자 성향 프리셋 적용
- 3개월/6개월/12개월 예상 자산 가치 계산
- 순수 계산 로직 테스트

### 제외 후보

- 실제 API Fetcher 구현
- TanStack Query hook 구현
- MSW handler 상세 구현
- 화면 컴포넌트 구현
- 로그인/온보딩/대시보드 UI 구현
- Supabase 연동

## 4. 설계 메모

예상 slice 구조:

```text
src/entities/portfolio/
  model/
    types.ts
    constants.ts
    mockPortfolio.ts
    calculatePortfolioSummary.ts
    calculateAllocationGap.ts
    applyInvestmentPreset.ts
    calculateExpectedValue.ts
  index.ts

src/entities/brokerage/
  model/
    types.ts
    constants.ts
    mockBrokerages.ts
  index.ts

src/entities/rebalancing/
  model/
    types.ts
    constants.ts
    mockRecommendations.ts
  index.ts
```

테스트는 도메인 함수와 같은 위치에 co-location으로 둘 수 있다. 테스트 파일명은 프로젝트 설정에 맞춰 `*.test.ts`를 사용한다.

핵심 정책:

- magic number는 상수로 둔다.
- 금액과 비중 계산 함수는 순수 함수로 유지한다.
- 비중은 퍼센트 단위 숫자로 통일한다.
- 가격 계산은 MVP에서 단순히 `quantity * currentPrice` 기준으로 한다.
- AI 추천 문구는 mock recommendation 데이터에 포함한다.

## 5. 착수 전 결정 필요 사항

1. Unit 0에서 선택한 테스트 파일 위치와 alias 설정이 Unit 1 구조와 충돌하지 않는지 확인한다.
2. 비중 소수점 반올림 단위를 상수로 정한다.
3. `CASH`와 `ALTERNATIVE`를 별도 자산군으로 둘지, UI 표시에서 `CASH_AND_ALTERNATIVE`로 합쳐 보여줄지 결정한다.
4. KRW와 USD 혼합 자산의 환율 처리는 MVP에서 고정 mock 환율을 둘지, 같은 통화로 정규화된 mock 데이터를 사용할지 결정한다.

## 6. 예상 검증

```bash
pnpm test -- --run
```

```bash
pnpm lint
```

```bash
pnpm typecheck
```

```bash
git diff --check
```
