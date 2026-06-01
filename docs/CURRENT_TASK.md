# Current Task — 현재 작업 지시서

## 0. 작업 요약

Unit 10 — 접근성, 반응형, 에러/빈 상태 품질 보강

이번 Unit은 Unit 2~9까지 구현된 주요 화면의 접근성(a11y), 데스크톱 중심 반응형 안정성, 에러/빈 상태 일관성을 점검하고 보강한다.

## 1. 반드시 읽을 문서

- `AGENTS.md`
- `PRD.mdc`
- `docs/PROJECT_GUIDE.md`
- `docs/WORK_LOG.md`
- `docs/REVIEW_LOG.md`
- `docs/SESSION_STATE.md`
- `.rules/project-rules_architecture.mdc`
- `.rules/project-rules_working.mdc`
- `.rules/project-rules_testing-policy.mdc`
- `.rules/project-rules_review.mdc`

## 2. 선행 상태

- Unit 9까지 핵심 기능 구현이 완료되어 있다.
- `ApiQueryBoundary`, `ErrorState`, `EmptyState` 등 공통 상태 UI가 도입되어 있다.

## 3. 작업 범위

### 포함

- 핵심 화면(`login`, `dashboard`, `onboarding`, `rebalance`, `portfolio`, `settings`) 접근성 점검/보완
- 테이블/폼/CTA의 aria 속성 및 키보드 탐색성 보강
- 다이얼로그(특히 API key 유도 팝업) 접근성 보강(포커스/ESC)
- 데스크톱 기준 레이아웃 깨짐, 텍스트 오버플로우, 카드 높이 불균형 보정
- 에러/빈/로딩 상태 UI 표준화
- Unit 10 테스트 보강
- 작업 완료 후 `docs/WORK_LOG.md`, `docs/SESSION_STATE.md` 갱신

### 제외

- 신규 비즈니스 기능 추가
- 모바일 앱 전용 UX 리디자인
- 커밋 생성

## 4. 설계 결정

- 공통 패턴 우선: `ApiQueryBoundary`, `FieldMessage`, `ErrorState`, `EmptyState`를 기준으로 통일한다.
- 접근성 보강은 “동작 보존 + 표현 강화” 원칙으로 진행한다.
- 테스트는 스타일 스냅샷보다 사용자 상호작용(역할/이름/키보드 동작) 검증에 집중한다.

## 5. 예상 변경 파일

### 수정 후보

- `src/features/rebalancing-proposal/ui/RebalancingProposalPanel.tsx` (dialog a11y)
- `src/features/portfolio-management/ui/PortfolioManagementPanel.tsx` (table/cta a11y)
- `src/features/settings-portfolio/ui/*` (폼 피드백/로딩 상태)
- `src/shared/ui/common/*` (필요 시 공통 a11y 유틸)
- 관련 테스트 파일
- `docs/WORK_LOG.md`
- `docs/SESSION_STATE.md`

## 6. 구현 규칙

- FSD 의존성/공개 API 규칙 준수
- `any` 금지
- 색상 단독 상태 표현 금지(텍스트 동반)
- 키보드-only 사용자 기준으로 주요 플로우 조작 가능해야 함

## 7. 필수 구현 상세

### 7.1 접근성

- 다이얼로그: `role="dialog"`, `aria-modal`, 포커스 이동/복귀, ESC 닫기
- 테이블: caption/columnheader 정합성 유지
- 폼: label, error `role="alert"`, 설명 연결(`aria-describedby`) 점검

### 7.2 반응형/레이아웃

- 주요 화면 1280px/1024px/768px에서 레이아웃 깨짐 점검
- 텍스트 오버플로우/버튼 줄바꿈/카드 높이 이슈 보정

### 7.3 상태 UI 일관성

- 로딩/빈/에러 상태 문구와 동작 기준 통일
- 재시도 액션 유무 기준 정리

## 8. 테스트 및 검증

아래 테스트를 최소 포함한다.

- 다이얼로그 키보드 동작(열기/닫기/ESC)
- 핵심 CTA 접근 가능한 role/name 검증
- 에러/빈 상태 role/문구 검증
- 필요 시 라우팅 회귀 테스트

작업 완료 전 아래 명령 실행:

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
git diff --check
```

## 9. 완료 기준

- 핵심 화면에 Critical 접근성 이슈가 없음
- 주요 해상도에서 레이아웃 깨짐이 없음
- 에러/빈 상태 처리 기준이 일관됨
- 테스트/검증 통과
- `WORK_LOG.md`, `SESSION_STATE.md` 최신화
