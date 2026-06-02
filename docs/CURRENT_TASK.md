# Current Task — 현재 작업 지시서

## 0. 작업 요약

Post-MVP Unit 15 — 수동 자산 persistence 전환

이번 작업은 설정 화면의 수동 자산 입력/편집/삭제 기능을 컴포넌트 local state에서 entity 계층의 persistence port + TanStack Query hook 구조로 전환한다. 실제 Supabase 저장은 제외하고, Unit 9의 목표 비중 저장 구조와 동일하게 in-memory store를 기본 adapter로 사용한다.

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

- Unit 5에서 `ManualAssetsSection`이 수동 자산 CRUD UI를 구현했다.
- 현재 수동 자산 목록은 `ManualAssetsSection` 내부 `useState`에만 저장되어 페이지 이탈/재마운트 시 소실된다.
- Unit 9에서 목표 비중은 `targetAllocationStore` + api fetcher + TanStack Query hook 구조로 persistence port가 마련되었다.
- Unit 14에서 로그아웃 UI와 세션 종료 흐름이 완료되었다.

## 3. 작업 범위

### 포함

- `ManualAsset` 타입을 portfolio entity 계층으로 승격
- 수동 자산 in-memory store 구현
- 수동 자산 조회/생성/수정/삭제 api fetcher 구현
- 수동 자산 TanStack Query hook 구현
- `ManualAssetsSection`을 local list state 대신 query/mutation 기반으로 전환
- 저장/수정/삭제 성공 및 실패 UX 메시지 구현
- 관련 단위/통합 테스트 추가
- 작업 완료 후 `docs/WORK_LOG.md`, `docs/SESSION_STATE.md` 갱신

### 제외

- 실제 Supabase table 생성 및 `@supabase/supabase-js` adapter 구현
- 브라우저 localStorage/sessionStorage persistence
- 수동 자산을 대시보드/리밸런싱/포트폴리오 계산에 반영
- AI 추천 로직 변경
- 커밋 생성

## 4. 설계 지침

- Unit 9의 `targetAllocationStore`, `targetAllocationApi`, `useTargetAllocation` 패턴을 따른다.
- fetcher는 `entities/portfolio/api`에 두고 React hook을 사용하지 않는다.
- hook은 `entities/portfolio/hook`에 두고 TanStack Query만 담당한다.
- feature UI는 hook만 사용하고 store/fetcher를 직접 import하지 않는다.
- mutation hook의 `onSuccess`는 invalidate만 담당한다. 성공/실패 메시지는 feature UI에서 처리한다.
- 테스트에서는 `configureManualAssetStore`, `resetManualAssetStore` 같은 adapter seam으로 store를 격리한다.
- route 문자열, magic string, magic number는 기존 상수 또는 신규 상수로 관리한다.

## 5. 예상 변경 파일

### 신규 후보

- `src/entities/portfolio/api/manualAssetStore.ts`
- `src/entities/portfolio/api/manualAssetStore.test.ts`
- `src/entities/portfolio/api/manualAssetApi.ts`
- `src/entities/portfolio/hook/useManualAssets.ts`
- `src/entities/portfolio/hook/useManualAssets.test.tsx`

### 수정 후보

- `src/entities/portfolio/model/types.ts`
- `src/entities/portfolio/index.ts`
- `src/features/settings-portfolio/model/types.ts`
- `src/features/settings-portfolio/ui/ManualAssetsSection.tsx`
- `src/features/settings-portfolio/ui/SettingsPortfolioPanel.test.tsx`
- `docs/WORK_LOG.md`
- `docs/SESSION_STATE.md`

## 6. 필수 구현 상세

### 6.1 타입 SSOT

- `ManualAsset`은 `entities/portfolio/model/types.ts`로 승격한다.
- `features/settings-portfolio/model/types.ts`는 하위 호환이 필요하면 type re-export만 유지한다.
- 수동 자산 입력 payload는 entity api/model에서 별도 타입으로 정의한다.

예상 타입:

```ts
export interface ManualAsset {
  id: string;
  ticker: string;
  name: string;
  quantity: number;
  avgPrice: number;
}

export interface ManualAssetPayload {
  ticker: string;
  name: string;
  quantity: number;
  avgPrice: number;
}
```

### 6.2 Persistence store

- 기본 store는 in-memory로 구현한다.
- `read`는 배열 복사본을 반환한다.
- `create`는 새 id를 발급하고 생성된 asset을 반환한다.
- `update`는 id가 존재할 때만 수정한다.
- `delete`는 id가 존재하지 않아도 UI가 깨지지 않도록 멱등 처리하거나, 실패 정책을 명확히 테스트한다.
- 테스트 격리를 위해 configure/reset 함수를 제공한다.

### 6.3 API fetcher

- `readManualAssets`
- `createManualAsset`
- `updateManualAsset`
- `deleteManualAsset`

Fetcher는 활성 store에 위임한다.

### 6.4 Query hook

- query key는 `['portfolio', 'manual-assets'] as const`로 정의한다.
- 조회는 `useSuspenseQuery`를 사용한다.
- 생성/수정/삭제 mutation은 성공 시 해당 query key를 invalidate한다.
- mutation UX 메시지는 hook 내부가 아니라 feature UI에서 처리한다.

### 6.5 ManualAssetsSection UI

- 자산 목록은 `useSuspenseManualAssets` 결과를 사용한다.
- 추가/수정/삭제는 mutation hook을 사용한다.
- 폼 입력 local state와 `editingId`, validation state는 유지 가능하다.
- 성공 시 폼 초기화, 편집 모드 해제, 성공 메시지 표시.
- 실패 시 폼 값을 유지하고 에러 메시지 표시.
- 빈 목록 문구는 기존 문구를 유지한다.

### 6.6 테스트

필수 테스트:

- store: read가 seed 복사본을 반환한다.
- store: create 후 read 목록에 반영된다.
- store: update 후 해당 asset이 변경된다.
- store: delete 후 해당 asset이 제거된다.
- hook: 조회 훅이 저장된 수동 자산을 반환한다.
- hook: create/update/delete 성공 시 query invalidate로 목록이 갱신된다.
- UI: 수동 자산 추가 성공 시 목록에 표시된다.
- UI: 수정 성공 시 목록 값이 바뀐다.
- UI: 삭제 성공 시 목록에서 제거된다.
- UI: 생성/수정/삭제 실패 시 에러 메시지를 표시하고 입력 상태를 부적절하게 초기화하지 않는다.
- UI: 필수값/숫자 validation은 기존 동작을 유지한다.

## 7. 구현 규칙

- FSD 의존성 방향 준수
- deep import 금지, public API 경유
- `any` 금지
- entity api fetcher에서 hook 사용 금지
- feature UI에서 store/fetcher 직접 import 금지
- 불필요한 신규 패키지 설치 금지
- 기존 shared UI 우선 사용

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

- 수동 자산 목록이 entity persistence port를 통해 관리된다.
- `ManualAssetsSection`이 local list state 대신 query/mutation 기반으로 동작한다.
- 수동 자산 CRUD 성공/실패가 테스트로 방어된다.
- FSD/API 3단계 규칙을 위반하지 않는다.
- `WORK_LOG.md`, `SESSION_STATE.md`가 최신화된다.
