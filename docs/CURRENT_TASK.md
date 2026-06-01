# Current Task — 현재 작업 지시서

## 0. 작업 요약

Unit 7 — AI 리밸런싱 제안 구현

이번 Unit은 `rebalance` 화면을 실제 제안 화면으로 구현한다. 현재 구성과 AI 추천 구성을 비교하고, 추천 근거/시뮬레이션/무료 3회 정책/API key 연동 유도 팝업까지 포함한다.

## 1. 반드시 읽을 문서

- `AGENTS.md`
- `PRD.mdc`
- `docs/PROJECT_GUIDE.md`
- `docs/WORK_LOG.md`
- `docs/REVIEW_LOG.md`
- `docs/SESSION_STATE.md`
- `.rules/project-rules_architecture.mdc`
- `.rules/project-rules_working.mdc`
- `.rules/project-rules_naming.mdc`
- `.rules/project-rules_testing-policy.mdc`
- `.rules/project-rules_review.mdc`

## 2. 선행 상태

- Unit 6 대시보드 구현이 완료되어 대시보드의 진단 요약과 연계 가능한 상태다.
- Unit 5에서 AI 모델/API key 설정 UI가 구현되어 있다.
- Unit 3 session mock에는 `aiTrialRemainingCount`가 포함되어 있다.
- Unit 1 리밸런싱 mock/상수/예상가치 계산 로직이 준비되어 있다.

## 3. 작업 범위

### 포함

- `RebalancePage`를 실제 리밸런싱 제안 화면으로 구현
- 현재 자산 구성 vs AI 추천 구성 비교 카드(동일 높이)
- AI 추천 근거 테이블/리스트(종목별 매수·매도 사유)
- 3개월/6개월/12개월 시뮬레이션 요약
- 무료 제안 잔여 횟수 표시
- API key 미설정 + 무료 소진 시 연동 유도 팝업 표시 및 제안 차단
- Unit 7 핵심 테스트 작성
- 작업 완료 후 `docs/WORK_LOG.md`, `docs/SESSION_STATE.md` 갱신

### 제외

- 실제 외부 AI API 호출
- 실제 주문/자동매매 실행
- 서버 영속화
- 커밋 생성

## 4. 설계 결정

- Unit 7은 mock 기반으로 제안 화면 완성도를 우선한다.
- 무료 3회 정책은 session mock 필드(`aiTrialRemainingCount`)를 참조해 분기한다.
- API key 연동 여부는 Unit 5 설정 상태와 연결 가능한 형태로 props/state 인터페이스를 우선 설계한다.
- 차단 상태에서 제안 CTA는 비활성 또는 guard 처리하고 안내 팝업으로 설정 화면 이동 경로를 제공한다.

## 5. 예상 변경 파일

### 신규 후보

- `src/features/rebalancing-proposal/index.ts`
- `src/features/rebalancing-proposal/ui/RebalancingProposalPanel.tsx`
- `src/features/rebalancing-proposal/ui/RebalancingProposalPanel.test.tsx`
- `src/features/rebalancing-proposal/model/types.ts` (필요 시)
- `src/features/rebalancing-proposal/model/constants.ts` (필요 시)

### 수정 후보

- `src/pages/rebalance/ui/RebalancePage.tsx`
- `src/features/index.ts`
- `src/entities/rebalancing/index.ts` (필요 시 export 보강)
- `docs/WORK_LOG.md`
- `docs/SESSION_STATE.md`

## 6. 구현 규칙

- FSD 의존성 방향 준수 (`features` → `entities/shared`)
- deep import 금지, public API 경유
- `any` 금지
- React 컴포넌트는 화살표 함수
- 매직넘버/매직스트링 상수화
- 비교 카드 2개는 동일 높이 유지
- 상태 표현은 색상 단독 금지(텍스트 포함)

## 7. 필수 구현 상세

### 7.1 제안 비교 섹션

- 현재 자산 구성 카드
- AI 추천 구성 카드
- 두 카드 시각 높이 일치

### 7.2 추천 근거 섹션

- 종목/액션(매수/매도/유지)/사유 표시
- 사유 텍스트는 PRD 기준 설명 가능 수준 유지

### 7.3 시뮬레이션 섹션

- 3개월/6개월/12개월 예상 가치 및 수익

### 7.4 무료 3회 + API key 정책

- API key 미설정 시 무료 잔여 횟수 표시
- 무료 횟수 0일 때 제안 요청 차단
- 차단 시 API key 연동 유도 팝업 표시
- 팝업에서 설정 화면 이동 CTA 제공

## 8. 테스트 및 검증

아래 테스트를 최소 포함한다.

- 현재 구성/추천 구성 비교 섹션 렌더링
- 추천 근거 목록 렌더링
- 시뮬레이션(3/6/12개월) 렌더링
- API key 미설정 + 잔여 횟수 > 0 표시
- API key 미설정 + 잔여 횟수 0일 때 팝업/차단 동작
- API key 설정 상태에서 차단 없이 제안 표시

작업 완료 전 아래 명령 실행:

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
git diff --check
```

## 9. 완료 기준

- Rebalance 페이지가 placeholder가 아니라 제안 비교/근거/시뮬레이션 화면으로 동작
- 무료 3회 정책 + API key 연동 유도 팝업 정책 반영
- 핵심 테스트 통과
- `WORK_LOG.md`, `SESSION_STATE.md` 최신화
