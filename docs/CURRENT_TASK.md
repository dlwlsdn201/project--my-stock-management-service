# Current Task — 현재 작업 지시서

## 0. 작업 요약

Post-MVP Unit 19 — 리밸런싱 허용 오차 정책 SSOT 및 mock 추천 테스트 정밀도 보강

이번 작업은 Unit 1 리뷰에서 남은 `mockRecommendations.test.ts` 경고를 해소한다. 현재 종목 추천 mock 테스트는 허용 오차 `0.5`를 테스트 내부에 직접 선언하고, 현재 비중 합계 검증도 `toBeCloseTo(100, 0)`로 느슨하다. 허용 오차 정책을 shared 기준으로 이관하고, portfolio 계산 로직과 rebalancing mock 테스트가 같은 정책을 참조하게 만든다.

## 1. 반드시 읽을 문서

- `AGENTS.md`
- `PRD.mdc`
- `docs/PROJECT_GUIDE.md`
- `docs/WORK_LOG.md`
- `docs/REVIEW_LOG.md`
- `docs/SESSION_STATE.md`
- `docs/superpowers/plans/2026-06-03-unit19-allocation-policy-ssot.md`
- `.rules/project-rules_architecture.mdc`
- `.rules/project-rules_working.mdc`
- `.rules/project-rules_testing-policy.mdc`
- `.rules/project-rules_review.mdc`

## 2. 선행 상태

- Unit 18까지 커밋/푸시 완료: `76b2ef0`
- `ALLOCATION_TOLERANCE_PERCENT`는 현재 `src/entities/portfolio/model/constants.ts`에 있다.
- `src/entities/rebalancing/model/mockRecommendations.test.ts`는 FSD cross-import 회피 때문에 `TOLERANCE_PERCENT = 0.5`를 직접 선언하고 있다.
- `mockRecommendations.test.ts`의 현재 비중 합계 검증은 `toBeCloseTo(100, 0)`로 정밀도가 낮다.

## 3. 작업 범위

### 포함

- 허용 오차 정책을 shared 레이어에 SSOT로 정의
- portfolio 계산 로직이 shared 허용 오차 정책을 참조하도록 변경
- rebalancing mock 테스트가 shared 허용 오차 정책을 참조하도록 변경
- `mockRecommendations.test.ts`의 현재 비중 합계 검증 정밀도 강화
- 관련 public API export 정리
- `WORK_LOG.md`, `SESSION_STATE.md` 갱신

### 제외

- mock 추천 데이터 값 변경
- 리밸런싱 알고리즘 변경
- 실제 AI 추천 호출 구현
- Supabase 또는 외부 API 연동
- UI 변경
- 신규 패키지 설치
- 커밋 생성

## 4. 권장 설계

### 4.1 shared 정책 파일

권장 신규 파일:

- `src/shared/config/allocationPolicy.ts`

권장 내용:

```ts
export const ALLOCATION_TOLERANCE_PERCENT = 0.5;
```

`src/shared/index.ts`에서 public API로 export한다.

### 4.2 portfolio 기존 API 호환

기존 코드가 `@entities/portfolio`에서 `ALLOCATION_TOLERANCE_PERCENT`를 import할 수 있으므로, `src/entities/portfolio/model/constants.ts`에서는 shared 상수를 re-export하거나 import 후 export한다.

예:

```ts
export { ALLOCATION_TOLERANCE_PERCENT } from '@shared';
```

단, 순환 의존이 생기지 않는지 확인한다. `shared`는 `entities`를 import하지 않아야 한다.

### 4.3 테스트 정밀도

`src/entities/rebalancing/model/mockRecommendations.test.ts`:

- `const TOLERANCE_PERCENT = 0.5` 제거
- `ALLOCATION_TOLERANCE_PERCENT`를 `@shared`에서 import
- 현재 비중 합계 검증을 `toBeCloseTo(100, 1)` 이상으로 강화

## 5. 필수 검증

작업 완료 전 아래 명령을 실행한다.

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
git diff --check
```

추가 권장 targeted test:

```bash
pnpm test src/entities/rebalancing/model/mockRecommendations.test.ts src/entities/portfolio/model/calculateAllocationGap.test.ts src/entities/portfolio/model/calculateHoldingWeightRows.test.ts
```

## 6. 완료 기준

- 허용 오차 `0.5` 정책이 shared SSOT에서 정의된다.
- portfolio 계산 로직과 rebalancing mock 테스트가 같은 허용 오차 상수를 참조한다.
- `mockRecommendations.test.ts`에 하드코딩된 `TOLERANCE_PERCENT = 0.5`가 없다.
- 현재 비중 합계 테스트 정밀도가 `toBeCloseTo(100, 1)` 이상이다.
- FSD 의존성 방향 위반이 없다.
- 필수 검증 5종이 통과한다.
- `WORK_LOG.md`, `SESSION_STATE.md`가 최신화된다.
