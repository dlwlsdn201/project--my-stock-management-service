# Review Log — 리뷰 결과 로그

## 0. 운영 규칙

- GPT는 구현 결과와 `WORK_LOG.md`를 기준으로 리뷰한다.
- 리뷰는 버그, 요구사항 누락, 아키텍처 위반, 테스트 공백을 우선한다.
- Critical은 반드시 보완 작업으로 되돌린다.
- Warning은 기능 완료를 막지 않는 경우 후속 작업으로 넘길 수 있다.

## 1. 리뷰 결과

---

## 2026-05-30 / Unit 3 — 인증 UI와 mock 로그인 플로우 구현 (1차 리뷰 보완 완료)

### 보완 완료 사항

- `feature/unit3-auth-login` 브랜치를 `main`에 머지
- `src/entities/session`, `src/features/auth-login` 전체 구현 완료
- `LoginSuccessResult` 및 `MockAccount`에 `aiTrialRemainingCount: number` 필드 추가
- `DEFAULT_AI_TRIAL_COUNT = 3` 상수 추가
- MOCK_ACCOUNTS: 신규 사용자 `aiTrialRemainingCount: 3`, 기존 사용자 `aiTrialRemainingCount: 1`
- 54 tests / 11 files PASS (워크스페이스 기준 재검증 완료)
- **2차 리뷰 요청 필요**

---

## 2026-05-28 / Unit 3 — 인증 UI와 mock 로그인 플로우 구현 (1차 리뷰)

### 최종 판단

- NOT PASS

### Critical

- [C1] Unit 3 구현물이 현재 워크스페이스에 존재하지 않는다. `src/entities/session`, `src/features/auth-login` 경로가 없고, `src/entities/index.ts`도 session slice를 export하지 않는다. 따라서 mock 인증 타입, mock login 함수, 신규/기존 사용자 분기, AI 무료 제안 기본 횟수 정책을 검증할 수 없다.
- [C2] `src/pages/login/ui/LoginPage.tsx`가 여전히 Unit 2 placeholder 상태다. 현재 화면은 비활성화된 `로그인 (준비 중)` 버튼만 렌더링하며, PRD/Unit 3 요구사항인 5:5 분할 레이아웃, 이메일/비밀번호 로그인 폼, 카카오 mock 로그인 버튼, 보안/투자 고지 문구를 충족하지 않는다.
- [C3] Unit 3 테스트가 없다. 요청된 `features/auth-login/ui/LoginForm.test.tsx`와 로그인 7개 핵심 케이스가 현재 테스트 목록에 포함되지 않았고, 실제 `pnpm test` 결과도 10 files / 47 tests로 Unit 2 상태와 동일하다. 사용자가 전달한 "54 tests, 11 files" 검증 결과와 현재 워크스페이스 상태가 일치하지 않는다.

### Warning

- [W1] `docs/WORK_LOG.md`와 `docs/SESSION_STATE.md`에 Unit 3 작업 완료 결과가 기록되어 있지 않다. 현재 문서상 Unit 3은 여전히 `PLANNED / NOT REQUESTED` 상태다.
- [W2] 현재 `git status --short`에는 `PRD.mdc`, `docs/PROJECT_GUIDE.md`, `docs/CURRENT_TASK.md` 등 문서 변경만 보이며, Unit 3 코드 변경 파일은 확인되지 않는다. Claude Code가 다른 브랜치 또는 다른 worktree에 작업했을 가능성이 있다.

### 검증 결과

- `pnpm test`: PASS, 10 files / 47 tests
- `pnpm lint`: PASS
- `pnpm typecheck`: PASS, `tsc -b --noEmit`
- `pnpm build`: PASS, `tsc -b && vite build`, 121 modules transformed
- `git diff --check`: PASS

### 보완 요청

- Claude Code가 실제 작업한 브랜치 또는 worktree가 현재 워크스페이스에 반영되어 있는지 먼저 확인한다.
- 현재 워크스페이스 기준으로 Unit 3 구현 파일을 추가한다: `src/entities/session`, `src/features/auth-login`, `src/pages/login/ui/LoginPage.tsx` 업데이트, 관련 public API 갱신.
- 신규 사용자 session mock에 `aiTrialRemainingCount: 3` 또는 동등한 무료 제안 횟수 필드를 포함한다.
- 로그인 테스트 7개를 추가하고, 검증 결과가 실제로 11 files / 54 tests 수준으로 증가하는지 확인한다.
- 보완 후 `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, `git diff --check`를 다시 실행하고 `WORK_LOG.md`, `SESSION_STATE.md`를 갱신한다.

### 후속 권장 사항

- 코드 리뷰 요청 시 붙여넣은 코드가 아니라 현재 워크스페이스 파일 상태를 기준으로 재요청한다.
- 작업 브랜치가 분리되어 있다면 해당 브랜치를 현재 작업 디렉터리에 checkout 또는 merge한 뒤 재리뷰를 요청한다.

---

## 2026-05-28 / Unit 2 — 공통 앱 쉘, 라우팅, 테마, 레이아웃 기반 구축 (4차 재리뷰)

### 최종 판단

- PASS WITH WARNINGS

### Critical

- 없음

### Warning

- [W1] `docs/WORK_LOG.md:74`에서 `src/apps/router/router.test.tsx` 설명이 아직 "라우터 통합 테스트 5개"로 남아 있다. 현재 실제 테스트는 6개(`/` redirect 케이스 포함)이므로 문서 수치를 최신 상태로 맞추는 것이 좋다.
- [W2] `src/apps/router/AppShellLayout.tsx:13`은 `routePath === item.path` 직접 일치 매핑만 사용한다. 현재 flat route에서는 문제 없지만, 하위 경로가 추가되면 title/description 조회 누락 가능성이 있다.

### 검증 결과

- `pnpm test`: PASS, 10 files / 47 tests
- `pnpm lint`: PASS
- `pnpm typecheck`: PASS, `tsc -b --noEmit`
- `pnpm build`: PASS, `tsc -b && vite build`, 121 modules transformed
- `git diff --check`: PASS

### 보완 확인

- 이전 Critical(C1, C2, C3)는 유지 해소 상태로 확인됨.
- AppShell slot 패턴, shared public API 경유, `APP_ROUTES` 재사용 + `/` redirect 테스트가 코드와 테스트 결과에서 확인됨.

### 후속 권장 사항

- Unit 2 커밋/푸시 진행 가능.
- Unit 3 착수 전 `WORK_LOG.md`의 테스트 개수 표기를 실제 값(6개)으로 정리한다.

---

## 2026-05-28 / Unit 2 — 공통 앱 쉘, 라우팅, 테마, 레이아웃 기반 구축 (3차 재리뷰)

### 최종 판단

- PASS WITH WARNINGS

### Critical

- 없음

### Warning

- [W1] `src/apps/router/AppShellLayout.tsx:13`에서 `routePath` 기반으로 `NAV_ITEMS.find`를 수행해 title/description을 조회한다. 현재 라우트는 flat 구조라 문제 없지만, 향후 child route(`'/dashboard/...'`)가 추가되면 직접 일치 비교만으로는 메타 매핑이 누락될 수 있다. `pathname` 기반 prefix 매칭 또는 route meta SSOT를 별도 구성하면 확장성이 좋아진다.
- [W2] `docs/WORK_LOG.md`의 Unit 2 "신규 생성 파일" 설명에 `src/widgets/app-shell/ui/AppShell.tsx`를 여전히 "AppHeader, AppSidebar 조합"으로 서술하고 있다. 실제 구현은 slot 패턴으로 변경되었으므로 문서 설명을 최신 구조와 맞추는 것이 좋다.

### 검증 결과

- `pnpm test`: PASS, 10 files / 47 tests
- `pnpm lint`: PASS
- `pnpm typecheck`: PASS, `tsc -b --noEmit`
- `pnpm build`: PASS, `tsc -b && vite build`, 121 modules transformed
- `git diff --check`: PASS

### 보완 확인

- C1 resolved: `AppShell`에서 sibling widget 직접 import 제거, slot 패턴으로 전환됨 (`src/widgets/app-shell/ui/AppShell.tsx`)
- C2 resolved: widgets 외부에서 shared deep import 제거, `@shared` public API 및 shared 내부 상대 경로로 정리됨 (`src/widgets/app-header/ui/AppHeader.tsx`, `src/widgets/app-sidebar/ui/AppSidebar.tsx`, `src/shared/lib/useTheme.ts`)
- C3 resolved: `APP_ROUTES` 분리 후 라우터 테스트에서 동일 config 재사용, `/` → `/login` redirect 테스트 추가됨 (`src/apps/router/routes.config.tsx`, `src/apps/router/router.test.tsx`)

### 후속 권장 사항

- Unit 2 커밋/푸시 진행 가능.
- Unit 3 착수 전 `WORK_LOG.md`의 Unit 2 파일 설명을 실제 slot 기반 구조로 정리한다.
- Unit 3 또는 Unit 10에서 라우트 메타 매핑 전략(직접 일치 vs prefix/route meta)을 확정한다.

---

## 2026-05-28 / Unit 2 — 공통 앱 쉘, 라우팅, 테마, 레이아웃 기반 구축 (재검증)

### 최종 판단

- NOT PASS

### Critical

- [C1] `src/widgets/app-shell/ui/AppShell.tsx:2-4`가 `@shared/lib/useTheme`, `@widgets/app-header`, `@widgets/app-sidebar`를 직접 import한다. `CURRENT_TASK.md`는 `widgets/*`가 entities/shared만 import해야 한다고 명시했고, `.rules/project-rules_architecture.mdc`도 같은 레이어 cross-import를 금지한다. `AppShell`은 app-header/app-sidebar sibling widget slice를 직접 조합하지 말고, `apps/router` 또는 app 레벨 layout에서 `AppShell`, `AppHeader`, `AppSidebar`, `useTheme`를 조합하도록 재구성해야 한다.
- [C2] `src/widgets/app-sidebar/ui/AppSidebar.tsx:2`, `src/widgets/app-sidebar/ui/AppSidebar.test.tsx:4`, `src/widgets/app-header/ui/AppHeader.tsx:1`, `src/shared/lib/useTheme.ts:2`가 public API를 우회해 `@shared/config/*` 또는 `@shared/lib/useTheme` 내부 경로를 직접 참조한다. `src/shared/index.ts`와 `src/shared/lib/index.ts`가 이미 export를 제공하므로 외부 레이어는 `@shared` 또는 segment public API를 경유해야 한다. shared 내부 참조는 상대 경로로 정리한다.
- [C3] `src/apps/router/router.test.tsx:9-24`가 실제 `AppRouter` 라우트 정의를 검증하지 않고 별도 `createMemoryRouter` 구성을 재작성한다. 특히 `CURRENT_TASK.md`의 최소 테스트 항목인 `/` 진입 시 `/login` redirect 검증이 없고, 테스트 라우트의 `/`는 `element: null`이라 실제 redirect 요구사항을 방어하지 못한다. 실제 route config를 재사용할 수 있게 분리하고 `/` redirect 테스트를 추가해야 한다.

### Warning

- [W1] `src/apps/router/index.tsx:11-17`의 `PAGE_TITLES`가 `src/shared/config/navigation.ts`의 navigation label/path와 분리되어 있다. Unit 2 지시의 "필요한 label/config는 navigation.ts에 둔다" 기준과 SSOT 원칙을 고려하면 title/description 같은 route meta도 navigation config로 통합하는 편이 안전하다.
- [W2] `src/widgets/app-header/ui/AppHeader.tsx:10`, `src/widgets/app-sidebar/ui/AppSidebar.tsx:4`, `src/widgets/app-sidebar/ui/AppSidebar.tsx:23`, `src/widgets/app-shell/ui/AppShell.tsx:12` 등 React 컴포넌트가 `function` 선언으로 작성되어 있다. 프로젝트 네이밍 규칙은 React 컴포넌트는 화살표 함수가 필수라고 명시하므로 보완 시 함께 정리한다.
- [W3] `docs/WORK_LOG.md`와 `docs/SESSION_STATE.md`는 아직 Unit 2 리뷰 상태를 `NOT REQUESTED` 또는 `GPT 리뷰 대기`로 기록하고 있다. 보완 완료 후 Claude Code가 실제 리뷰 상태와 검증 결과로 갱신해야 한다.

### 검증 결과

- `pnpm test`: PASS, 10 files / 46 tests
- `pnpm lint`: PASS
- `pnpm typecheck`: PASS, `tsc -b --noEmit`
- `pnpm build`: PASS, `tsc -b && vite build`, 119 modules transformed
- `git diff --check`: PASS

### 보완 요청

- `AppShell`이 sibling widget slice를 import하지 않도록 구조를 변경한다. 권장안: `AppShell`은 skip link, shell frame, `main#main-content`, `header`/`sidebar` slot만 담당하고, `apps/router`의 layout 컴포넌트가 `useTheme`, `AppHeader`, `AppSidebar`, page outlet을 조합한다.
- shared public API 위반을 정리한다. 외부 레이어는 `@shared` 또는 공개 segment index만 사용하고, shared 내부 파일끼리는 상대 경로를 사용한다.
- 실제 라우트 정의를 테스트에서 재사용할 수 있게 `APP_ROUTES` 또는 router factory를 분리한 뒤, `/` -> `/login` redirect를 테스트로 추가한다.
- 보완 후 `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, `git diff --check`를 다시 실행하고 `WORK_LOG.md`, `SESSION_STATE.md`를 갱신한다.

### 후속 권장 사항

- route title/description은 `NAV_ITEMS` 또는 별도 `ROUTE_META`로 navigation config에 통합한다.
- React 컴포넌트 선언은 프로젝트 규칙에 맞게 `export const ComponentName = (...) =>` 패턴으로 정리한다.

---

## 2026-05-27 / Unit 1 — 도메인 모델, 상수, mock 데이터, 계산 로직 SSOT 구축 (재리뷰)

### 최종 판단

- PASS WITH WARNINGS

### Critical

- 없음

### Warning

- [W1] `src/entities/rebalancing/model/mockRecommendations.test.ts:4`에서 `const TOLERANCE_PERCENT = 0.5`를 직접 리터럴로 선언하고 있다. `ALLOCATION_TOLERANCE_PERCENT` 상수가 `entities/portfolio/model/constants.ts`에 이미 존재하지만, entities 간 cross-import 금지 규칙으로 직접 import가 불가능하다. 허용 오차 정책이 바뀔 경우 테스트가 구현과 다른 기준으로 검증하게 된다. Unit 5에서 `ALLOCATION_TOLERANCE_PERCENT`를 `shared`로 이동할 때 함께 처리한다.
- [W2] `mockRecommendations.test.ts:32`의 `toBeCloseTo(100, 0)` 정밀도가 ±0.5를 허용해 느슨하다. 소수점 비중 값이 추가될 때 잘못된 데이터가 통과할 수 있으므로 정밀도를 1 이상으로 높이는 것이 방어적이다.

### 검증 결과

- `pnpm test`: PASS, 6 files / 29 tests
- `pnpm lint`: PASS
- `pnpm typecheck`: PASS, `tsc -b --noEmit`
- `pnpm build`: PASS, `tsc -b && vite build`
- `git diff --check`: PASS

### 보완 확인

- C1 (1차 NOT PASS) resolved: 삼성전자 `action: 'sell'`, `reasonSummary` 수정 완료
- W1 (1차 Warning) resolved: `index.html` charset meta 태그 들여쓰기 4칸으로 정리 완료
- 종목 단위 action 정합성 테스트 (`mockRecommendations.test.ts`) 추가 완료

### 후속 권장 사항

- Unit 1 커밋 및 Unit 2 착수 가능.
- `ALLOCATION_TOLERANCE_PERCENT` 상수는 Unit 5 이전에 `shared`로 이동을 검토한다.
- `mockRecommendations.test.ts`의 현재 비중 합계 검증은 Unit 5 전까지 정밀도를 1 이상으로 높인다.
- `AllocationGroup` 타입의 rebalancing 로컬 재선언은 Unit 5 착수 전에 `shared` 이동 여부를 재판단한다.
- `entities/index.ts`의 `export *`는 5개 이상 슬라이스 추가 시 명시 export 전환을 검토한다.

---

## 2026-05-27 / Unit 1 — 도메인 모델, 상수, mock 데이터, 계산 로직 SSOT 구축 (1차 리뷰)

### 최종 판단

- NOT PASS

### Critical

- [C1] `src/entities/rebalancing/model/mockRecommendations.ts:38`의 삼성전자 종목 추천 action이 `hold`인데, 같은 항목의 `currentWeightPercent`는 39이고 `targetWeightPercent`는 35라 차이가 -4%p다. Unit 1 정책의 허용 오차는 0.5%p이고, 이미 `calculateAllocationGap`은 허용 오차 초과 과잉을 `sell`로 분류한다. 또한 `reasonSummary`는 "허용 범위(0.5%p) 내"라고 설명해 데이터와 설명이 동시에 모순된다. 이 mock은 이후 포트폴리오 관리 화면의 AI 액션 SSOT가 되므로 보완해야 한다.

### Warning

- [W1] `index.html:4`의 `<meta charset>` 들여쓰기가 여전히 깨져 있다. Unit 0 Warning을 이번 Unit에서 정리했다고 `WORK_LOG.md`에 기록했지만 실제 diff는 정리되지 않았다.
- [W2] `docs/SESSION_STATE.md:36`은 `pnpm test` 결과를 25 tests로 기록했지만, GPT 재검증 결과는 26 tests였다. `WORK_LOG.md`의 26 tests 기록과 맞추는 것이 좋다.
- [W3] `calculateAllocationGap`의 `adjustmentAmount`는 절댓값이다. 설계 의도 자체는 수용 가능하지만, 이후 UI에서 매수/매도 방향을 `action`과 함께 해석해야 하므로 JSDoc 또는 타입 주석에 명확히 남기는 것이 좋다.

### 검증 결과

- `pnpm test`: PASS, 5 files / 26 tests
- `pnpm lint`: PASS
- `pnpm typecheck`: PASS, `tsc -b --noEmit`
- `pnpm build`: PASS, `tsc -b && vite build`
- `git diff --check`: PASS

### 보완 요청

- 삼성전자 종목 추천 mock의 `action`, `currentWeightPercent`, `targetWeightPercent`, `reasonSummary`를 서로 일관되게 수정한다. 현재 39% vs 목표 35%를 유지한다면 `sell` 계열 설명이어야 한다. `hold`를 유지하려면 차이를 0.5%p 이내로 조정해야 한다.
- 종목 단위 mock recommendation 정합성을 검증하는 테스트를 추가한다. 최소한 `action`이 `currentWeightPercent`와 `targetWeightPercent` 차이, `ALLOCATION_TOLERANCE_PERCENT` 정책과 충돌하지 않는지 검증한다.
- `index.html` 들여쓰기를 정리한다.
- `docs/SESSION_STATE.md`, `docs/WORK_LOG.md`의 검증 결과와 남은 리스크를 실제 상태에 맞게 갱신한다.

### 후속 권장 사항

- `AllocationGroup`을 rebalancing slice에 로컬 재선언한 것은 이번 Unit의 blocker로 보지 않는다. 다만 Unit 5 이후 portfolio와 rebalancing이 같은 입력으로 결합될 때 shared 또는 portfolio public type 재사용 여부를 다시 판단한다.
- `entities/index.ts`의 `export *`는 현재 slice 수와 명명 충돌 상태에서는 수용 가능하다. 타입/상수명이 충돌하기 시작하면 명시 export로 전환한다.

---

## 2026-05-26 / Unit 0 — 1차 보완 재리뷰

### 최종 판단

- PASS WITH WARNINGS

### Critical

- 없음

### Warning

- [W1] `index.html:5`의 들여쓰기가 깨져 있다. 기능 문제는 아니지만 스캐폴딩 품질 기준상 정리하는 것이 좋다.
- [W2] shadcn/ui CLI 초기화, MSW service worker 생성, Tailwind v4와 shadcn/ui 호환성 검증은 아직 후속 Unit으로 남아 있다. Unit 0 완료를 막지는 않지만 Unit 1~2에서 반드시 확인해야 한다.

### 검증 결과

- `pnpm lint`: PASS
- `pnpm test`: PASS, `src/shared/config/routes.test.ts` 1개 테스트 통과
- `pnpm typecheck`: PASS, `tsc -b --noEmit`로 references 포함 검증
- `pnpm build`: PASS, `tsc -b && vite build` 성공
- `git diff --check`: PASS

### 보완 확인

- C1 resolved: `package.json:12`의 `typecheck`가 `tsc -b --noEmit`로 변경되어 references 기반 TypeScript 검증이 수행된다.
- C2 resolved: `src/apps/router/index.tsx:2`의 `ROUTES` import가 `@shared` public API 경유로 변경됐다.
- W1 resolved: `index.html`의 Vite 기본 favicon 참조가 제거됐다.

### 후속 권장 사항

- Unit 1 착수 가능.
- Unit 2 이전에 `index.html` 포맷을 정리하고, shadcn/ui 초기화 방식과 Tailwind v4 호환성을 확정한다.

---

## 2026-05-26 / Unit 0 — 프로젝트 스캐폴딩과 개발 도구 구성

### 최종 판단

- NOT PASS

### Critical

- [C1] `package.json:12`의 `typecheck` 스크립트가 실제 앱/설정 소스를 검증하지 않는다. 루트 `tsconfig.json:2`가 `files: []`이고 references만 가진 solution-style 구성인데 `tsc --noEmit`을 실행하고 있어, `pnpm exec tsc --noEmit --listFiles` 결과가 비어 있었다. Unit 0 완료 기준의 `pnpm typecheck`가 false positive가 되므로 `tsc -b` 또는 동등하게 references를 검증하는 명령으로 수정해야 한다.
- [C2] `src/apps/router/index.tsx:2`가 `@shared/config/routes`를 직접 import한다. `src/shared/index.ts:2`에서 이미 public API로 `ROUTES`를 노출하고 있으므로, FSD의 "외부 노출은 index.ts만, deep import 금지" 규칙에 맞게 `@shared` public API를 통해 import해야 한다.

### Warning

- [W1] `index.html:5`에 Vite 기본 favicon(`/vite.svg`) 참조가 남아 있다. 현재 저장소에 해당 asset이 없어 브라우저에서 404가 발생할 수 있고, AssetFlow AI 브랜딩 기준에도 맞지 않는다. Unit 0 보완 또는 Unit 2 UI 작업 전 제거/교체가 필요하다.

### 검증 결과

- `pnpm lint`: PASS
- `pnpm test`: PASS, `src/shared/config/routes.test.ts` 1개 테스트 통과
- `pnpm typecheck`: exit code 0이나, `tsc --noEmit --listFiles` 결과가 비어 있어 검증 명령으로 유효하지 않음
- `pnpm build`: PASS, `tsc -b && vite build` 성공
- `git diff --check`: PASS

### 보완 요청

- `package.json`의 `typecheck` 스크립트를 references까지 검증하는 명령으로 수정한다.
- `src/apps/router/index.tsx`의 `ROUTES` import를 `@shared` public API 경유로 수정한다.
- 수정 후 `pnpm lint`, `pnpm test`, `pnpm typecheck`, `pnpm build`, `git diff --check`를 재실행하고 `docs/WORK_LOG.md`, `docs/SESSION_STATE.md`를 갱신한다.

### 후속 권장 사항

- Vite 기본 favicon은 이번 보완에서 제거하거나, 늦어도 Unit 2 화면 구현 전 AssetFlow AI용 asset으로 교체한다.
- `AGENTS.md`의 ReleaseHub 제품 설명은 Unit 0 범위 밖이므로 이번 리뷰의 blocker로 보지 않지만, 기능 구현이 본격화되기 전 AssetFlow AI 기준으로 정리하는 것이 좋다.

---

## YYYY-MM-DD / Unit X — 리뷰 대상

### 최종 판단

- TODO: PASS / PASS WITH WARNINGS / NOT PASS

### Critical

- TODO: 없으면 "없음"으로 기록한다.

### Warning

- TODO: 없으면 "없음"으로 기록한다.

### 검증 결과

- TODO

### 보완 요청

- TODO

### 후속 권장 사항

- TODO
