# Current Task — 현재 작업 지시서

## 0. 작업 요약

Unit 4 — 증권사 연동 온보딩과 mock 연결 상태 구현

이번 Unit은 로그인 이후 사용자가 증권사를 선택하고 연결 과정을 진행할 수 있는 온보딩 UI와 mock 상태 흐름을 구현한다. 실제 증권사 API 연동은 하지 않고, 단계 표시/성공/실패/나중에 하기 플로우를 검증 가능한 상태로 만든다.

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

- Unit 3 인증 UI와 mock 로그인 플로우는 구현되어 있다.
- 로그인 성공 시 신규 사용자 `/onboarding/brokerage`, 기존 사용자 `/dashboard` 분기 라우팅이 동작한다.
- Unit 2에서 공통 앱 쉘, 라우팅, 테마 구조가 정리되어 있다.

## 3. 작업 범위

### 포함

- `entities/brokerage`의 기존 타입/상수/mock 데이터 활용 또는 최소 보강
- 온보딩 페이지 UI 고도화 (증권사 선택, 단계 표시, 보안 배지)
- 연결 상태 mock 흐름 구현 (idle/loading/success/error)
- 증권사 검색 필드(로컬 필터)
- `나중에 하기` 동작 구현
- 연결 실패 시 재시도 동작 구현
- 핵심 플로우 테스트 작성
- 작업 완료 후 `docs/WORK_LOG.md`, `docs/SESSION_STATE.md` 갱신

### 제외

- 실제 증권사 OAuth/API 연동
- TanStack Query/MSW 기반 네트워크 통신
- 실제 사용자 자산 동기화
- route guard 전면 도입
- 커밋 생성

## 4. 설계 결정

- 연결 요청은 in-memory mock async 함수로 처리한다.
- 증권사 목록은 `entities/brokerage/model/mockBrokerages.ts`를 우선 SSOT로 사용한다.
- 상태 모델은 단순 상태 머신(`idle | connecting | connected | failed`)으로 유지한다.
- 실패 상태는 화면 유지 + 오류 문구 + 재시도 버튼을 제공한다.
- `나중에 하기`는 대시보드로 이동시켜 로그인 이후 흐름을 막지 않는다.
- 하단에 보안 배지/문구를 표시한다.

## 5. 예상 변경 파일

### 신규 후보

- `src/features/brokerage-onboarding/index.ts`
- `src/features/brokerage-onboarding/ui/BrokerageOnboardingPanel.tsx`
- `src/features/brokerage-onboarding/ui/BrokerageOnboardingPanel.test.tsx`

### 수정 후보

- `src/pages/onboarding-brokerage/ui/OnboardingBrokeragePage.tsx`
- `src/features/index.ts`
- `src/entities/brokerage/model/mockBrokerages.ts` (필요 시 상태 필드 보강)
- `docs/WORK_LOG.md`
- `docs/SESSION_STATE.md`

## 6. 구현 규칙

- FSD 의존성 방향을 지킨다.
- `features/brokerage-onboarding`은 `entities/brokerage`와 `shared`만 import한다.
- deep import 금지, public API 경유 원칙 준수.
- `any` 사용 금지.
- React 컴포넌트는 화살표 함수로 작성한다.
- 상태 표시를 색상만으로 전달하지 않는다. 텍스트/아이콘을 함께 제공한다.
- 테스트는 사용자 행동 기준으로 작성한다.

## 7. 필수 구현 상세

### 7.1 온보딩 UI

- 상단에 3단계 진행 상태를 표시한다: `1 증권사 선택`, `2 간편 인증`, `3 데이터 동기화`
- 증권사 카드는 최소 4개(키움, 토스, 미래에셋, 삼성)를 노출한다.
- 각 카드에 증권사명, 설명, `연결하기` 버튼을 둔다.
- 검색 입력값으로 카드 목록을 필터링할 수 있어야 한다.

### 7.2 연결 상태

- `연결하기` 클릭 시 connecting 상태로 전환
- 성공 시 connected 상태 메시지 표시 후 대시보드 이동 버튼 활성화 또는 자동 이동
- 실패 시 오류 문구 + 재시도 버튼 표시
- `나중에 하기` 클릭 시 대시보드 이동

### 7.3 보안 메시지

- 화면 하단에 최소 3개 보안 배지를 표시한다.
- 예시: `256비트 암호화`, `금융보안 가이드 준수`, `데이터 제3자 미제공`

## 8. 테스트 및 검증

아래 테스트를 최소 포함한다.

- 증권사 카드 렌더링
- 검색 입력 시 필터링 동작
- 연결 성공 플로우
- 연결 실패 시 오류 및 재시도 노출
- `나중에 하기` 라우팅 동작

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

## 9. 완료 기준

- 온보딩 페이지가 placeholder가 아니라 실제 선택/상태 UI를 가진다.
- 증권사 연결 mock 흐름(성공/실패/재시도/나중에 하기)이 동작한다.
- 핵심 테스트가 추가되어 흐름을 방어한다.
- `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, `git diff --check`가 통과한다.
- `docs/WORK_LOG.md`, `docs/SESSION_STATE.md`가 최신 상태로 갱신된다.
