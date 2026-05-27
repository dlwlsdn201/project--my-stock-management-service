# Unit 1 Handoff — 도메인 모델과 계산 로직

## 0. 문서 목적

이 문서는 Claude Code가 Unit 1 작업을 시작할 때 필요한 도메인 결정, 파일 책임, 계산 정책을 빠르게 복구하기 위한 인수인계 문서다.

## 1. 작업 목표

- AssetFlow AI MVP의 portfolio, brokerage, rebalancing 도메인 타입과 상수를 `entities` 레이어에 만든다.
- 대시보드, 설정, 리밸런싱, 포트폴리오 관리 화면이 공유할 mock 데이터와 순수 계산 함수를 만든다.
- UI와 API 구현 전에 금액, 비중, 목표 비중 차이 계산 기준을 SSOT로 고정한다.

## 2. 현재 상태

- Unit 0은 Vite + React 19 + TypeScript 앱 기반을 만들고 `PASS WITH WARNINGS`로 통과했다.
- `src/entities/index.ts`는 아직 실제 slice를 export하지 않는다.
- `src/shared/config/routes.ts`는 라우트 상수를 제공한다.
- `src/apps/router/index.tsx`는 placeholder 라우트를 렌더링한다.
- 이번 Unit은 UI를 구현하지 않는다.

## 3. 반드시 읽을 파일

- `AGENTS.md`
- `PRD.mdc`
- `docs/CURRENT_TASK.md`
- `docs/PROJECT_GUIDE.md`
- `.rules/project-rules_architecture.mdc`
- `.rules/project-rules_naming.mdc`
- `.rules/project-rules_testing-policy.mdc`

## 4. 참고할 기존 구현

- `src/entities/index.ts`: entity public API 갱신 대상
- `src/shared/config/routes.ts`: 상수 정의 스타일 참고
- `src/shared/config/routes.test.ts`: Vitest co-location 테스트 스타일 참고
- `tsconfig.app.json`: `@entities`, `@shared` alias 사용 가능

## 5. 핵심 로직

- 보유 자산 평가액: `quantity * currentPrice`
- 현재 비중: `assetGroupValue / totalPortfolioValue * 100`
- 목표 비중 차이: `targetPercent - currentPercent`
- 조정 필요 금액: `totalPortfolioValue * gapPercent / 100`
- 허용 오차: `0.5%p`
- 예상 자산 가치: `totalValue * (1 + annualReturnPercent / 100) ** (months / 12)`
- 반올림: 비중은 소수점 2자리

## 6. 예상 변경 파일

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
- `src/entities/index.ts`
- `index.html` (들여쓰기 정리만 허용)
- `docs/WORK_LOG.md`
- `docs/SESSION_STATE.md`

## 7. 테스트 기준

- `calculatePortfolioSummary`: 빈 배열, 총 평가액, 자산군별 비중
- `calculateAllocationGap`: 증가, 감소, 유지 액션과 조정 금액
- `applyInvestmentPreset`: 공격형, 중립형, 방어형 합계 100%
- `calculateExpectedValue`: 3개월, 6개월, 12개월 복리 예상값

## 8. 주의 사항

- `any`를 쓰지 않는다.
- `entities`에서 `features`, `widgets`, `pages`, `apps`를 import하지 않는다.
- API fetcher와 hook은 만들지 않는다.
- mock 데이터는 UI가 읽기 좋은 label을 포함하되 계산 기준은 type-safe한 enum 또는 literal union 상수를 참조한다.
- 투자 추천 mock에는 수익 보장 아님 고지를 포함한다.
