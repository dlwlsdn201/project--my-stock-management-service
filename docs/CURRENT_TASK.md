# Current Task — 현재 작업 지시서

## 0. 작업 요약

Post-MVP Unit 16 — 포트폴리오 종목별 계산 SSOT 이관

이번 작업은 포트폴리오 관리 화면의 종목별 현재 비중/목표 비중/차이/액션 산출 근거를 `entities/rebalancing` mock 추천 데이터에서 분리하고, `entities/portfolio`의 보유 종목(`MOCK_HOLDINGS`)과 종목별 목표 비중 매핑을 결합하는 계산 함수로 이관한다.

## 1. 반드시 읽을 문서

- `AGENTS.md`
- `PRD.mdc`
- `docs/PROJECT_GUIDE.md`
- `docs/WORK_LOG.md`
- `docs/REVIEW_LOG.md`
- `docs/SESSION_STATE.md`
- `docs/superpowers/plans/2026-06-03-unit16-portfolio-stock-weights.md`
- `.rules/project-rules_architecture.mdc`
- `.rules/project-rules_working.mdc`
- `.rules/project-rules_testing-policy.mdc`
- `.rules/project-rules_review.mdc`

## 2. 선행 상태

- Unit 8에서 `PortfolioManagementPanel`이 종목별 현재 비중/목표 비중/차이/AI 액션 테이블을 구현했다.
- 현재 기본 데이터는 `entities/rebalancing`의 `MOCK_STOCK_ACTION_RECOMMENDATIONS`를 사용한다.
- Unit 8 리뷰 로그에서 이 구조는 임시로 허용되었고, 후속으로 `MOCK_HOLDINGS` + 목표 비중 기반 per-stock 계산 SSOT 이관이 필요하다고 기록되었다.
- Unit 15에서 수동 자산 persistence 전환이 완료되어 portfolio entity 계층의 데이터 소유권이 더 명확해졌다.

## 3. 작업 범위

### 포함

- portfolio entity에 종목별 목표 비중 매핑 mock 추가
- portfolio entity에 종목별 현재 비중/목표 비중/차이/액션 계산 함수 추가
- 포트폴리오 관리 화면 기본 데이터 소스를 `MOCK_HOLDINGS` 기반 계산 결과로 전환
- `PortfolioManagementPanel` 타입을 portfolio entity 계산 결과 타입 기준으로 정리
- 계산 함수 테스트 추가
- 포트폴리오 관리 화면 테스트를 새 데이터 경로에 맞게 갱신
- 작업 완료 후 `docs/WORK_LOG.md`, `docs/SESSION_STATE.md` 갱신

### 제외

- 실제 시세 API 연동
- 수동 자산 persistence 데이터를 포트폴리오 테이블에 합산
- AI 모델 호출 또는 실제 추천 생성
- 리밸런싱 제안 화면의 추천 근거 테이블 변경
- Supabase adapter 구현
- 커밋 생성

## 4. 설계 지침

- `entities/portfolio`는 `entities/rebalancing`을 import하지 않는다. 같은 레이어 cross-import 금지 규칙을 지킨다.
- 종목별 액션 타입은 portfolio entity 내부에서 `'buy' | 'sell' | 'hold'` union으로 정의한다.
- 액션 판단 기준은 현재 비중과 목표 비중 차이를 기준으로 한다.
  - `currentWeightPercent - targetWeightPercent > tolerance`: `sell`
  - `targetWeightPercent - currentWeightPercent > tolerance`: `buy`
  - 그 외: `hold`
- tolerance는 기존 `ALLOCATION_TOLERANCE_PERCENT`를 재사용하거나 종목 단위 별도 상수로 명확히 정의한다.
- feature UI는 계산 함수나 mock을 직접 deep import하지 않고 `@entities/portfolio` public API를 경유한다.
- `PortfolioManagementPanel`은 여전히 props로 테스트용 rows/status 주입이 가능해야 한다.

## 5. 예상 변경 파일

### 신규 후보

- `src/entities/portfolio/model/calculateHoldingWeightRows.ts`
- `src/entities/portfolio/model/calculateHoldingWeightRows.test.ts`

### 수정 후보

- `src/entities/portfolio/model/types.ts`
- `src/entities/portfolio/model/constants.ts`
- `src/entities/portfolio/model/mockPortfolio.ts`
- `src/entities/portfolio/index.ts`
- `src/features/portfolio-management/ui/PortfolioManagementPanel.tsx`
- `src/features/portfolio-management/ui/PortfolioManagementPanel.test.tsx`
- `docs/WORK_LOG.md`
- `docs/SESSION_STATE.md`

## 6. 필수 구현 상세

### 6.1 타입

예상 타입:

```ts
export type HoldingWeightAction = 'buy' | 'sell' | 'hold';

export interface HoldingTargetWeight {
  ticker: string;
  targetWeightPercent: number;
}

export interface HoldingWeightRow {
  ticker: string;
  name: string;
  currentWeightPercent: number;
  targetWeightPercent: number;
  gapPercent: number;
  action: HoldingWeightAction;
}
```

### 6.2 계산 함수

- 입력:
  - `holdings: HoldingAsset[]`
  - `targetWeights: HoldingTargetWeight[]`
- 출력:
  - `HoldingWeightRow[]`
- 현재 비중은 `holding.quantity * holding.currentPrice / totalValue * 100`으로 계산한다.
- `gapPercent`는 `currentWeightPercent - targetWeightPercent`로 계산한다. 기존 포트폴리오 테이블의 `+` 표시는 목표보다 초과 보유를 의미한다.
- totalValue가 0이면 빈 배열을 반환한다.
- targetWeight가 없는 ticker는 `0` 또는 명시된 기본 정책으로 처리하고 테스트에 기록한다.

### 6.3 Mock 데이터

- `MOCK_HOLDING_TARGET_WEIGHTS`를 `entities/portfolio/model/mockPortfolio.ts` 또는 적절한 portfolio model 파일에 추가한다.
- 기존 `MOCK_HOLDINGS`의 ticker와 맞는 목표 비중을 제공한다.
- 기본 포트폴리오 화면 rows는 `calculateHoldingWeightRows(MOCK_HOLDINGS, MOCK_HOLDING_TARGET_WEIGHTS)`로 산출한다.

### 6.4 UI 전환

- `PortfolioManagementPanel`은 더 이상 `MOCK_STOCK_ACTION_RECOMMENDATIONS`를 기본값으로 사용하지 않는다.
- 액션 라벨/색상은 기존 UI와 동일하게 유지할 수 있으나, 데이터 출처는 portfolio entity 계산 결과여야 한다.
- Empty/Error 상태와 리밸런싱 CTA 동작은 유지한다.

### 6.5 테스트

필수 테스트:

- 계산 함수가 holdings 평가액 기준 현재 비중을 산출한다.
- 계산 함수가 목표 비중과 차이(`current - target`)를 산출한다.
- 초과 보유는 `sell`, 부족 보유는 `buy`, 허용 오차 이내는 `hold`를 반환한다.
- 빈 holdings 또는 totalValue 0 입력 시 빈 배열을 반환한다.
- 포트폴리오 관리 화면이 portfolio entity 계산 결과 기반 rows를 렌더링한다.
- 기존 Empty/Error/CTA 테스트는 유지한다.
- `MOCK_STOCK_ACTION_RECOMMENDATIONS` 의존이 `PortfolioManagementPanel`에서 제거된다.

## 7. 구현 규칙

- FSD 의존성 방향 준수
- 같은 레이어 entity 간 cross-import 금지
- deep import 금지, public API 경유
- `any` 금지
- 계산 정책/허용 오차는 상수로 관리
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

- `PortfolioManagementPanel` 기본 데이터가 `MOCK_HOLDINGS` 기반 계산 결과로 전환된다.
- 종목별 current/target/gap/action 산출이 portfolio entity 계산 함수로 SSOT화된다.
- 계산 함수와 UI 회귀 테스트가 추가/갱신된다.
- Unit 8에서 남긴 per-stock 계산 SSOT 후속 리스크가 해소된다.
- `WORK_LOG.md`, `SESSION_STATE.md`가 최신화된다.
