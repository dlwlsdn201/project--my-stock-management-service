# Current Task — 현재 작업 지시서

## 0. 작업 요약

Unit 8 — 주식 포트폴리오 관리 구현

이번 Unit은 `portfolio` 화면을 실제 관리 화면으로 구현한다. 종목별 현재 비중/목표 비중/차이/AI 액션을 테이블로 제공하고, 제안 검토 흐름을 리밸런싱 화면과 연결한다.

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

- Unit 7 AI 리밸런싱 제안 화면이 구현되어 있다.
- Unit 5 목표 비중 설정 UI가 구현되어 있다.
- Unit 1 포트폴리오 계산/리밸런싱 mock 데이터가 준비되어 있다.

## 3. 작업 범위

### 포함

- `PortfolioPage`를 실제 포트폴리오 관리 화면으로 구현
- 종목 테이블: 종목명/티커, 현재 비중, 목표 비중, 차이, AI 액션
- 비중 차이 강조(텍스트 + 색상) 및 정렬 가능한 구조
- `전체보기`/`지금 리밸런싱하기` 연계 흐름 정리(적어도 라우팅 경로 연결)
- Empty/Error 상태 처리
- Unit 8 핵심 테스트 작성
- 작업 완료 후 `docs/WORK_LOG.md`, `docs/SESSION_STATE.md` 갱신

### 제외

- 실제 주문 실행
- 자동매매
- 서버 저장/동기화
- 커밋 생성

## 4. 설계 결정

- Unit 8은 Unit 1 mock 데이터 + 계산 로직으로 테이블 완성도를 우선 확보한다.
- AI 액션 라벨/톤은 `entities/rebalancing` SSOT를 재사용한다.
- 표 컴포넌트는 접근성 우선(`table`, `thead`, `tbody`, scope, caption 또는 aria-label)으로 구현한다.

## 5. 예상 변경 파일

### 신규 후보

- `src/features/portfolio-management/index.ts`
- `src/features/portfolio-management/ui/PortfolioManagementPanel.tsx`
- `src/features/portfolio-management/ui/PortfolioManagementPanel.test.tsx`
- `src/features/portfolio-management/model/constants.ts` (필요 시)

### 수정 후보

- `src/pages/portfolio/ui/PortfolioPage.tsx`
- `src/features/index.ts`
- `src/entities/portfolio/index.ts` (필요 시 export 보강)
- `docs/WORK_LOG.md`
- `docs/SESSION_STATE.md`

## 6. 구현 규칙

- FSD 의존성 방향 준수 (`features` → `entities/shared`)
- deep import 금지, public API 경유
- `any` 금지
- React 컴포넌트는 화살표 함수
- 매직넘버/매직스트링 상수화
- 차이값은 색상 단독 표현 금지(문구/기호 포함)

## 7. 필수 구현 상세

### 7.1 종목 관리 테이블

- 컬럼: 종목, 현재 비중, 목표 비중, 차이, AI 액션
- 차이는 `+/-` 부호 포함
- 액션은 매수/매도/유지 라벨 표기

### 7.2 요약/연계

- 총 종목 수 또는 편중 경고 요약 제공
- 리밸런싱 화면 이동 CTA 제공

### 7.3 상태 처리

- 보유 종목 없음: EmptyState
- 데이터 오류: ErrorState

## 8. 테스트 및 검증

아래 테스트를 최소 포함한다.

- 종목 테이블 컬럼/행 렌더링
- 비중 차이(+/-) 렌더링
- AI 액션 라벨 렌더링
- Empty 상태 렌더링
- Error 상태 렌더링
- 리밸런싱 이동 CTA 경로 검증

작업 완료 전 아래 명령 실행:

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
git diff --check
```

## 9. 완료 기준

- Portfolio 페이지가 placeholder가 아니라 실제 관리 테이블 화면으로 동작
- 종목별 현재/목표/차이/AI 액션이 확인 가능
- 핵심 테스트 통과
- `WORK_LOG.md`, `SESSION_STATE.md` 최신화
