# Review Log — 리뷰 결과 로그

## 0. 운영 규칙

- GPT는 구현 결과와 `WORK_LOG.md`를 기준으로 리뷰한다.
- 리뷰는 버그, 요구사항 누락, 아키텍처 위반, 테스트 공백을 우선한다.
- Critical은 반드시 보완 작업으로 되돌린다.
- Warning은 기능 완료를 막지 않는 경우 후속 작업으로 넘길 수 있다.

## 1. 리뷰 결과

---

## 2026-06-03 / Unit 18 — 다크 테마/모바일 QA 보강 (2차 재검증)

### 최종 판단

- PASS

### Critical

- 없음

### Warning

- 없음

### 검증 결과

- `pnpm test`: PASS, 26 files / 181 tests
- `pnpm lint`: PASS
- `pnpm typecheck`: PASS, `tsc -b --noEmit`
- `pnpm build`: PASS, 429 modules transformed
- `git diff --check`: PASS

### 보완 확인

- [C1 해소] `src/features/brokerage-onboarding/ui/BrokerageOnboardingPanel.test.tsx`에 feature-level 모바일 class guard 테스트 2개가 추가됐다.
- 온보딩 스테퍼가 `flex-col`과 `sm:flex-row` 클래스를 갖는지 검증한다.
- 연결 실패 `role="alert"` 영역이 `flex-col`과 `sm:flex-row` 클래스를 갖는지 검증한다.
- [W1 해소] `docs/SESSION_STATE.md`의 Unit 18 상태가 C1 보완 완료/재검증 대기로 정리됐다. 재검증 결과에 맞춰 PASS 상태로 갱신한다.
- [W2 유지] 브라우저 실측은 여전히 미완료이나, 이번 Unit 완료를 막는 차단 조건으로 보지 않는다. RTL class guard와 필수 검증 5종은 통과했다.

### 후속 권장 사항

- Unit 18은 커밋/푸시 진행 가능.
- 실제 브라우저 viewport 실측은 후속 QA 또는 최종 검증 단계에서 `/login`, `/dashboard`, `/settings` 중심으로 수행한다.

---

## 2026-06-03 / Unit 18 — 다크 테마/모바일 QA 보강 (1차 리뷰)

### 최종 판단

- NOT PASS

### Critical

- [C1] feature-level 모바일 class guard 테스트가 누락됐다. `docs/CURRENT_TASK.md:91-95`는 최소 테스트 보강 항목으로 "설정/리밸런싱/온보딩 중 하나 이상에서 모바일 버튼 그룹 wrap 또는 class 회귀 테스트 추가"를 명시한다. 실제 구현은 `AiSettingsSection`의 API key 입력 그룹을 `flex flex-col gap-2 sm:flex-row`로 바꾸고, `BrokerageOnboardingPanel`의 스테퍼와 에러 영역을 모바일 대응 class로 바꿨지만, 추가된 테스트는 `FieldMessage`, `AppShell`, `AppHeader`, `AppSidebar`에만 있다. 변경된 feature 화면 중 하나 이상에 대해 class guard 테스트를 추가해야 Unit 18의 최소 테스트 기준을 충족한다.
  - 근거: `docs/CURRENT_TASK.md:91-95`, `src/features/settings-portfolio/ui/AiSettingsSection.tsx:120`, `src/features/brokerage-onboarding/ui/BrokerageOnboardingPanel.tsx:57`, `src/features/brokerage-onboarding/ui/BrokerageOnboardingPanel.tsx:131`
  - 보완: `SettingsPortfolioPanel.test.tsx` 또는 `BrokerageOnboardingPanel.test.tsx`에 모바일 대응 class 검증을 추가한다. 예: API key 입력 그룹이 `flex-col`과 `sm:flex-row`를 갖는지, 또는 온보딩 스테퍼가 `flex-col`과 `sm:flex-row`를 갖는지 검증한다.

### Warning

- [W1] `docs/SESSION_STATE.md:23`의 미완료 작업 문구가 모순된다. "다크 테마 픽셀 QA, 모바일(<768) 실측 증빙"을 완료 처리하면서 동시에 `Unit 18 진행 예정`을 붙이고 있다. 현재 브라우저 직접 실측은 미완료이고 RTL class guard로 대체한 상태이므로, "Unit 18 보완 대기" 또는 "브라우저 실측 미완료"로 정리하는 편이 정확하다.
- [W2] 브라우저 실측은 아직 완료되지 않았다. GPT 재검증 중 `pnpm exec vite --host 127.0.0.1` dev server는 정상 기동했지만, in-app Browser가 `iab` 세션을 제공하지 않아 라우트별 실제 viewport 확인은 수행하지 못했다. 필수 검증 실패는 아니지만, Unit 18의 QA 성격상 후속으로 실제 브라우저 또는 E2E 도구에서 375px/768px 확인을 권장한다.

### 검증 결과

- `pnpm test`: PASS, 26 files / 179 tests
- `pnpm lint`: PASS
- `pnpm typecheck`: PASS, `tsc -b --noEmit`
- `pnpm build`: PASS, 429 modules transformed
- `git diff --check`: PASS
- `pnpm exec vite --host 127.0.0.1`: PASS, dev server started at `http://127.0.0.1:5173/`
- Browser smoke: NOT VERIFIED, in-app Browser unavailable (`iab` 세션 없음)

### 보완 요청

- feature-level 모바일 class guard 테스트를 1개 이상 추가한다.
- `docs/SESSION_STATE.md`의 Unit 18 미완료 작업/리뷰 상태를 실제 상태와 맞춘다.
- 보완 후 `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, `git diff --check`를 재실행하고 `WORK_LOG.md`, `SESSION_STATE.md`를 갱신한다.

### 후속 권장 사항

- 보완 이후 다시 재검증 리뷰를 요청한다.
- 가능하면 실제 브라우저에서 `/login`, `/dashboard`, `/settings`만이라도 375px과 1440px 폭으로 확인한다.

---

## 2026-06-03 / Unit 17 — MSW 브라우저 워커 준비 (2차 재검증)

### 최종 판단

- PASS

### Critical

- 없음

### Warning

- 없음

### 검증 결과

- `pnpm test`: PASS, 24 files / 167 tests
- `pnpm lint`: PASS
- `pnpm typecheck`: PASS, `tsc -b --noEmit`
- `pnpm build`: PASS, 429 modules transformed
- `git diff --check`: PASS

### 보완 확인

- [W1 해소] `src/main.tsx`에서 `startMockWorker()` promise에 `catch((err: unknown) => console.warn(...))`가 추가되어 MSW 시작 실패 시 unhandled rejection으로 남지 않는다.
- [W2 해소] `package.json` trailing newline이 복구됐다.
- `public/mockServiceWorker.js` 존재 확인.
- `startMockWorker()`는 `import.meta.env.DEV && import.meta.env.VITE_ENABLE_MSW === 'true'` 조건에서만 dynamic import로 browser worker를 로드한다.
- Production build 산출물에 `msw/browser`, `setupWorker`, `worker.start` 문자열이 포함되지 않아 production 자동 실행 리스크는 확인되지 않았다.
- `src/main.tsx`는 `@shared` public API에서 `startMockWorker`를 import하므로 FSD deep import 위반은 확인되지 않았다.

### 후속 권장 사항

- Unit 17은 커밋/푸시 진행 가능.
- Unit 18 착수 전 별도 브라우저 DevTools 또는 E2E 환경에서 service worker registration 직접 판독을 추가 실측하면 더 좋다.

---

## 2026-06-03 / Unit 16 — 포트폴리오 종목별 계산 SSOT 이관 (1차 리뷰)

### 최종 판단

- PASS

### Critical

- 없음

### Warning

- 없음

### Suggestion

- [S1] `PortfolioManagementPanel`은 데이터 소스는 portfolio entity로 이관했지만, 액션 라벨/색상/고지 문구는 여전히 `@entities/rebalancing`에서 가져온다. 현재 Unit 범위에서는 mock 추천 데이터 의존 제거가 핵심이므로 허용 가능하다. 이후 포트폴리오 관리 화면의 표현 책임을 더 명확히 하려면 action label/tone 상수를 shared 또는 portfolio feature constants로 옮기는 후속 정리를 검토할 수 있다.

### 검증 결과

- `pnpm test`: PASS, 24 files / 167 tests
- `pnpm lint`: PASS
- `pnpm typecheck`: PASS, `tsc -b --noEmit`
- `pnpm build`: PASS, `tsc -b && vite build`, 195 modules transformed
- `git diff --check`: PASS

### 보완 확인

- `entities/portfolio`에 `HoldingWeightAction`, `HoldingTargetWeight`, `HoldingWeightRow` 타입 추가 확인
- `calculateHoldingWeightRows`가 holdings 평가액 기반 현재 비중, `current - target` gap, buy/sell/hold action을 산출하는 점 확인
- `MOCK_HOLDING_TARGET_WEIGHTS`, `MOCK_HOLDING_WEIGHT_ROWS`가 portfolio mock 데이터에 추가된 점 확인
- `PortfolioManagementPanel` 기본 데이터가 `MOCK_HOLDING_WEIGHT_ROWS`로 전환된 점 확인
- `PortfolioManagementPanel`에서 `MOCK_STOCK_ACTION_RECOMMENDATIONS`와 `StockActionRecommendation` 의존이 제거된 점 확인
- 계산 함수 테스트와 포트폴리오 관리 화면 회귀 테스트가 추가/갱신된 점 확인
- `docs/WORK_LOG.md`, `docs/SESSION_STATE.md`에 Unit 16 결과가 반영된 점 확인

### 후속 권장 사항

- Unit 16은 커밋/푸시 진행 가능.
- 다음 Claude 구현 가능 작업은 Unit 17 MSW 브라우저 워커 준비 또는 Unit 18 다크/모바일 QA 보강.

---

## 2026-06-03 / Unit 15 — 수동 자산 persistence 전환 (2차 재리뷰)

### 최종 판단

- PASS

### Critical

- 없음

### Warning

- 없음

### Suggestion

- 없음

### 검증 결과

- `pnpm test`: PASS, 23 files / 156 tests
- `pnpm lint`: PASS
- `pnpm typecheck`: PASS, `tsc -b --noEmit`
- `pnpm build`: PASS, `tsc -b && vite build`, 194 modules transformed
- `git diff --check`: PASS

### 보완 확인

- [C1 해소] 수동 자산 생성/수정/삭제 성공 메시지 구현 확인:
  - `MANUAL_ASSET_ADD_SUCCESS`
  - `MANUAL_ASSET_UPDATE_SUCCESS`
  - `MANUAL_ASSET_DELETE_SUCCESS`
- 성공 메시지가 `ManualAssetsSection`의 `successMessage` 상태와 `FieldMessage tone="success"`로 표시됨 확인
- `SettingsPortfolioPanel.test.tsx`에 생성/수정/삭제 성공 메시지 테스트 3개 추가 확인
- [W1 해소] `docs/WORK_LOG.md`가 성공/실패 메시지 구현 및 1차 리뷰 보완 내용을 실제 구현과 일치하게 기록함 확인
- [S1 해소] `handleEdit` 인자 타입이 `ManualAsset`으로 변경됨 확인
- [S2 해소] 수동 자산 성공/실패 메시지가 `features/settings-portfolio/model/constants.ts`에 상수화됨 확인

### 후속 권장 사항

- Unit 15는 커밋/푸시 진행 가능.
- 다음 Claude 구현 가능 작업은 Unit 16 포트폴리오 종목별 계산 SSOT 이관.

---

## 2026-06-03 / Unit 15 — 수동 자산 persistence 전환 (1차 리뷰)

### 최종 판단

- NOT PASS

### Critical

- [C1] 수동 자산 생성/수정/삭제 성공 메시지가 구현되지 않았다. `docs/CURRENT_TASK.md`는 저장/수정/삭제 성공 및 실패 UX 메시지를 포함 범위로 명시하고, `ManualAssetsSection UI` 상세에서도 성공 시 폼 초기화·편집 모드 해제와 함께 성공 메시지 표시를 요구한다. 현재 `ManualAssetsSection`은 성공 시 `setForm(EMPTY_FORM)`과 `setEditingId(null)`만 수행하고, 실패 메시지만 `errorMessage`로 표시한다. `SettingsPortfolioPanel.test.tsx`도 추가/수정/삭제 성공 메시지를 검증하지 않아 요구사항 누락을 방어하지 못한다.
  - 근거: `docs/CURRENT_TASK.md` 38, 56, 137행 / `src/features/settings-portfolio/ui/ManualAssetsSection.tsx` 67-81, 95-105, 159행
  - 보완: 생성/수정/삭제 성공 메시지 상태를 추가하고, 성공 시 각각 표시되도록 구현한다. 예: `자산을 추가했습니다.`, `자산을 수정했습니다.`, `자산을 삭제했습니다.` 테스트도 3개 추가한다.

### Warning

- [W1] `docs/WORK_LOG.md`는 `ManualAssetsSection`에 “성공/실패 메시지 추가”가 반영되었다고 기록하지만 실제 구현은 실패 메시지만 있다. C1 보완 후 작업 로그 표현도 실제 구현과 일치하도록 수정해야 한다.

### Suggestion

- [S1] `ManualAssetsSection`의 `handleEdit` 인자 타입이 inline object 타입이다. `ManualAsset`이 entity 타입으로 승격되었으므로 `import type { ManualAsset } from '@entities/portfolio'`를 사용하면 타입 SSOT 의도가 더 명확하다.
- [S2] 수동 자산 validation/성공/실패 메시지는 현재 컴포넌트 내부 문자열이다. 반복 사용이 늘어나면 `features/settings-portfolio/model/constants.ts`로 이동해 메시지 SSOT를 맞추는 편이 좋다.

### 검증 결과

- `pnpm test`: PASS, 23 files / 153 tests
- `pnpm lint`: PASS
- `pnpm typecheck`: PASS, `tsc -b --noEmit`
- `pnpm build`: PASS, `tsc -b && vite build`, 194 modules transformed
- `git diff --check`: PASS

### 보완 확인

- 타입 SSOT 승격은 확인됨:
  - `src/entities/portfolio/model/types.ts`
  - `src/features/settings-portfolio/model/types.ts`
- persistence port/fetcher/hook 구조는 Unit 9 패턴에 맞게 구현됨:
  - `src/entities/portfolio/api/manualAssetStore.ts`
  - `src/entities/portfolio/api/manualAssetApi.ts`
  - `src/entities/portfolio/hook/useManualAssets.ts`
- feature UI가 store/fetcher를 직접 import하지 않고 hook만 사용하는 점 확인
- `SettingsPortfolioPanel`에서 `ManualAssetsSection`을 `ApiQueryBoundary`로 감싼 점 확인
- CRUD 실패 테스트는 추가되었지만, CRUD 성공 메시지 테스트가 없음

### 후속 권장 사항

- Unit 15는 C1 보완 전 커밋하지 않는다.
- 보완 후 재리뷰 필요.

---

## 2026-06-03 / Unit 14 — 로그아웃 UI와 세션 종료 흐름 (1차 리뷰)

### 최종 판단

- PASS

### Critical

- 없음

### Warning

- 없음

### Suggestion

- [S1] `AppHeader`가 `LogoutButton`을 직접 import하면서 `AppHeader` 단위 테스트에도 Router/Jotai Provider 래핑이 필요해졌다. 현재 규모에서는 허용 가능하지만, 헤더 액션이 더 늘어나면 `actions` slot prop으로 분리해 header 자체를 더 순수한 조합 컴포넌트로 유지하는 방식을 검토할 수 있다.

### 검증 결과

- `pnpm test`: PASS, 21 files / 134 tests
- `pnpm lint`: PASS
- `pnpm typecheck`: PASS, `tsc -b --noEmit`
- `pnpm build`: PASS, `tsc -b && vite build`, 191 modules transformed
- `git diff --check`: PASS

### 보완 확인

- 로그아웃 feature slice 신설 확인:
  - `src/features/auth-logout/ui/LogoutButton.tsx`
  - `src/features/auth-logout/ui/LogoutButton.test.tsx`
  - `src/features/auth-logout/index.ts`
- `LogoutButton`이 `clearSessionAtom` 호출 후 `ROUTES.LOGIN`으로 이동하는 흐름 확인
- 앱 내부 헤더에만 로그아웃 UI가 노출되도록 `AppShellLayout`에서 `showLogout` 전달 확인
- 로그인 화면 미노출 조건은 `AppHeader` 기본값 `showLogout = false`와 테스트로 방어됨 확인
- `docs/WORK_LOG.md`, `docs/SESSION_STATE.md`에 Unit 14 결과가 반영된 점 확인

### 후속 권장 사항

- Unit 14는 커밋/푸시 진행 가능.
- 다음 Claude 구현 가능 작업은 `docs/NEXT_TASK_DRAFT.md` 기준 Unit 15 수동 자산 persistence 전환.

---

## 2026-06-02 / Unit 13 — AI 설정 상태와 무료 제안 정책 배선 (2차 재리뷰)

### 최종 판단

- PASS

### Critical

- 없음

### Warning

- [W1] `src/entities/settings/model/aiSettingsAtom.ts`의 전역 상태가 `modelId`와 `isApiKeyConnected`만 보유한다. 반면 `AiSettingsSection`은 마스킹 표시용 `savedKey`를 컴포넌트 로컬 state에만 둔다. 설정 화면 재마운트 후 전역 상태는 `connected`인데 저장된 key 마스킹 표시는 사라지고 입력 폼이 다시 노출될 수 있다. 원문 key를 저장하지 않는 정책은 유지하되, `maskedApiKey` 같은 표시 전용 값을 전역 상태에 포함하는 보완을 권장한다.
  - **[해소 2026-06-02]** `AiSettings`에 `maskedApiKey: string | null` 필드 추가. `saveApiKeyAtom`에서 key 원문을 마스킹한 값을 저장, `clearApiKeyAtom`에서 null로 초기화. `maskedApiKeyAtom` 파생 atom 추가. `AiSettingsSection`의 로컬 `savedKey` 제거 → `maskedApiKeyAtom` 읽기로 전환(재마운트 후 복원됨). `aiSettingsAtom.test.ts`에 마스킹 저장/삭제/재마운트 복원 테스트 3개 추가.
- [W2] `src/entities/settings/index.ts` slice public API는 존재하지만 `src/entities/index.ts`에는 settings slice가 export되지 않았다. 현재 코드는 `@entities/settings` 경유라 동작하지만, 기존 `entities/index.ts`가 다른 slice를 모두 재노출하는 패턴이므로 일관성 차원에서 `export * from './settings';` 추가를 권장한다.
  - **[해소 2026-06-02]** `src/entities/index.ts`에 `export * from './settings';` 추가.

### 검증 결과

- `pnpm test`: PASS, 20 files / 129 tests
- `pnpm lint`: PASS
- `pnpm typecheck`: PASS, `tsc -b --noEmit`
- `pnpm build`: PASS, `tsc -b && vite build`, 189 modules transformed
- `git diff --check`: PASS

### 보완 확인

- `entities/settings` 신설 및 AI 설정 타입/상수/atom SSOT화 확인:
  - `src/entities/settings/model/types.ts`
  - `src/entities/settings/model/constants.ts`
  - `src/entities/settings/model/aiSettingsAtom.ts`
  - `src/entities/settings/index.ts`
- 무료 제안 횟수 차감 atom 추가 확인:
  - `src/entities/session/model/sessionAtom.ts`
- 설정 화면과 리밸런싱 화면의 상태 배선 확인:
  - `src/features/settings-portfolio/ui/AiSettingsSection.tsx`
  - `src/features/rebalancing-proposal/ui/RebalancingProposalPanel.tsx`
- 테스트 보강 확인:
  - `src/entities/settings/model/aiSettingsAtom.test.ts`
  - `src/entities/session/model/sessionAtom.test.ts`
  - `src/features/settings-portfolio/ui/SettingsPortfolioPanel.test.tsx`
  - `src/features/rebalancing-proposal/ui/RebalancingProposalPanel.test.tsx`

### 후속 권장 사항

- Unit 13은 커밋/푸시 진행 가능.

---

## 2026-06-02 / Unit 12 — mock session 상태와 route guard 구현 (1차 리뷰)

### 최종 판단

- PASS WITH WARNINGS

### Critical

- 없음

### Warning

- [W1] 세션은 의도대로 메모리 전용 Jotai 상태이며 새로고침 시 초기화된다. 현재 Unit 제외 범위와 맞지만, 운영/데모 환경에서 새로고침 후 내부 route 접근이 `/login`으로 돌아가는 동작은 `SESSION_STATE.md`의 후속 리스크로 계속 유지해야 한다.
- [W2] `.claude/launch.json`이 untracked 상태로 남아 있다. 커스텀 에디터 설정 파일이므로 커밋 대상에서 제외하거나 `.gitignore` 정책을 별도로 결정해야 한다.

### 검증 결과

- `pnpm test`: PASS, 19 files / 111 tests
- `pnpm lint`: PASS
- `pnpm typecheck`: PASS, `tsc -b --noEmit`
- `pnpm build`: PASS, `tsc -b && vite build`, 185 modules transformed
- `git diff --check`: PASS

### 보완 확인

- session 상태 SSOT 추가 확인:
  - `src/entities/session/model/sessionAtom.ts`
  - `src/entities/session/model/types.ts`
  - `src/entities/session/index.ts`
- route guard 적용 확인:
  - `src/apps/router/ProtectedRoute.tsx`
  - `src/apps/router/PublicOnlyRoute.tsx`
  - `src/apps/router/routes.config.tsx`
- 로그인 성공 시 session 저장 확인:
  - `src/features/auth-login/ui/LoginForm.tsx`
- 테스트 보강 확인:
  - `src/entities/session/model/sessionAtom.test.ts`
  - `src/apps/router/router.test.tsx`

### 후속 권장 사항

- Unit 12 커밋/푸시 진행 가능.
- 다음 후속 작업은 `SESSION_STATE.md`의 잔여 리스크 중 Supabase 실제 어댑터 연결 또는 API key 저장/보안 정책 확정 중 하나를 선택한다.

---

## 2026-06-02 / Unit 11 — 최종 검증, 문서 정리, 릴리즈 후보 정리 (1차 리뷰)

### 최종 판단

- PASS

### Critical

- 없음

### Important

- 없음

### Suggestion

- 없음

### 검증 결과

- `pnpm test`: PASS, 18 files / 99 tests
- `pnpm lint`: PASS
- `pnpm typecheck`: PASS, `tsc -b --noEmit`
- `pnpm build`: PASS, `tsc -b && vite build`, 178 modules transformed
- `git diff --check`: PASS

### 보완 확인

- 코드 변경 없이 최종 통합 검증/문서 정리 중심으로 Unit 11 범위를 수행한 점 확인
- `WORK_LOG.md`의 Unit 11 섹션에 시나리오 점검, 잔여 리스크 분류, 릴리즈 후보 체크리스트가 반영된 점 확인
- `SESSION_STATE.md` 갱신으로 현재 상태 및 다음 액션이 최신화된 점 확인

### 후속 권장 사항

- Unit 11은 커밋/푸시 진행 가능.

---

## 2026-06-01 / Unit 10 — 접근성/반응형/상태 UI 품질 보강 (2차 재리뷰)

### 최종 판단

- PASS

### Critical

- 없음

### Important

- 없음

### Suggestion

- 없음

### 검증 결과

- `pnpm test`: PASS, 18 files / 99 tests
- `pnpm lint`: PASS
- `pnpm typecheck`: PASS, `tsc -b --noEmit`
- `pnpm build`: PASS, `tsc -b && vite build`, 178 modules transformed
- `git diff --check`: PASS

### 보완 확인

- 이전 W1 해소 확인: 해상도 1280/1024/768 실측 점검 결과가 `WORK_LOG.md` Unit 10 보완 섹션에 기록됨.
- 다이얼로그 접근성 보강(`Modal`) 및 테스트(포커스 이동/ESC/aria 연결) 유지 확인.
- API key 입력의 `aria-invalid`/`aria-describedby` 연결 및 오류 메시지 id 연결 유지 확인.

### 후속 권장 사항

- Unit 10 커밋/푸시 진행 가능.

---

## 2026-06-01 / Unit 10 — 접근성/반응형/상태 UI 품질 보강 (1차 리뷰)

### 최종 판단

- PASS WITH WARNINGS

### Critical

- 없음

### Warning

- [W1] 반응형 품질 보강은 코드 레벨 가드(`break-words`, `min-w-0`, `flex-wrap`)로 반영되었지만, 1280/1024/768 실측 뷰포트 스크린샷 기반 검증 증거는 아직 없다. Unit 11 최종 검증에서 브라우저 실측 점검 로그를 남기는 것을 권장한다.
  - **[해소 2026-06-01]** Unit 11 이연 대신 본 Unit에서 직접 실측: Vite dev 서버 + 프리뷰로 1280/1024/768 점검(dashboard/portfolio/settings/rebalance). 문서 가로 오버플로우 없음, 테이블 `overflow-x-auto` contain, 비교 카드 동일 높이(146px) 확인. 측정값·표는 `WORK_LOG.md` Unit 10 「1차 리뷰 보완」에 기록.

### 검증 결과

- `pnpm test`: PASS, 18 files / 99 tests
- `pnpm lint`: PASS
- `pnpm typecheck`: PASS, `tsc -b --noEmit`
- `pnpm build`: PASS, `tsc -b && vite build`, 178 modules transformed
- `git diff --check`: PASS

### 보완 확인

- `Modal` 공통 프리미티브 도입 및 팝업 교체 확인:
  - `src/shared/ui/common/Modal.tsx`
  - `src/features/rebalancing-proposal/ui/RebalancingProposalPanel.tsx`
- 다이얼로그 접근성 테스트 보강 확인(포커스 이동, ESC 닫기+복귀, aria 연결):
  - `src/features/rebalancing-proposal/ui/RebalancingProposalPanel.test.tsx`
- 폼 오류 aria 연결 보강 확인:
  - `src/features/settings-portfolio/ui/AiSettingsSection.tsx`
  - `src/shared/ui/FieldMessage.tsx`
  - `src/features/settings-portfolio/ui/SettingsPortfolioPanel.test.tsx`

### 후속 권장 사항

- Unit 10은 커밋/푸시 진행 가능.
- Unit 11에서 실측 반응형 체크리스트(해상도별 캡처/점검표)를 포함해 최종 품질 검증을 완료한다.

---

## 2026-06-01 / Unit 9 — Supabase 연동 후보 검증과 persistence 전환 (2차 재리뷰)

### 최종 판단

- PASS

### Critical

- 없음

### Important

- 없음

### Suggestion

- `ApiQueryBoundary`가 `settings-portfolio`에 도입되었으므로, Unit 10에서 동일 패턴을 다른 suspense 조회 지점에도 확대 적용하면 로딩/에러 UX 일관성이 좋아진다.

### 검증 결과

- `pnpm test`: PASS, 18 files / 95 tests
- `pnpm lint`: PASS
- `pnpm typecheck`: PASS, `tsc -b --noEmit`
- `pnpm build`: PASS, `tsc -b && vite build`, 177 modules transformed
- `git diff --check`: PASS

### 보완 확인

- 이전 C1 해소: mutation `onSuccess`가 `invalidateQueries`만 수행하도록 변경됨  
  - `src/entities/portfolio/hook/useTargetAllocation.ts`
- 이전 C2 해소: 조회 훅이 `useSuspenseQuery` 기반으로 전환되고, 상위 boundary(`ApiQueryBoundary`) 적용됨  
  - `src/entities/portfolio/hook/useTargetAllocation.ts`
  - `src/features/settings-portfolio/ui/SettingsPortfolioPanel.tsx`
  - `src/shared/ui/common/ApiQueryBoundary.tsx`
- 테스트 안정화 확인: 환경 의존 단정 제거  
  - `src/entities/portfolio/api/targetAllocationStore.test.ts`

### 후속 권장 사항

- Unit 9는 커밋/푸시 진행 가능.

---

## 2026-06-01 / Unit 9 — Supabase 연동 후보 검증과 persistence 전환 (1차 리뷰)

### 최종 판단

- NOT PASS

### Critical

- [C1] `src/entities/portfolio/hook/useTargetAllocation.ts`의 mutation `onSuccess`가 `queryClient.setQueryData(...)`를 직접 수행한다. 현재 프로젝트 규칙(3단계 API: mutation `onSuccess`는 invalidate만 담당)에 위배된다. `onSuccess`에서 `invalidateQueries({ queryKey: TARGET_ALLOCATION_QUERY_KEY })`로 전환해야 한다.
  - **[해소 2026-06-01]** `useUpdateTargetAllocation`의 `onSuccess`를 `invalidateQueries({ queryKey: TARGET_ALLOCATION_QUERY_KEY })`만 수행하도록 수정. 성공/실패 UX는 features 호출부(`TargetAllocationSection`)의 `mutateAsync` try/catch로 분리(§5-2 레이어 분리 준수).
- [C2] 동일 파일의 조회 훅이 `useQuery`를 사용하고 있다. 프로젝트 규칙(조회는 `useSuspenseQuery` + 상위 Boundary 사용)과 불일치한다. Suspense 기반으로 전환하거나, 이번 Unit에서 Suspense 미적용 사유와 예외 범위를 문서에 명시해야 한다.
  - **[해소 2026-06-01]** 조회 훅을 `useSuspenseTargetAllocation`(`useSuspenseQuery`)으로 전환, 네이밍 `useSuspense{Entity}` 적용. 표준 `<ApiQueryBoundary>`(+ `ApiErrorFallback`)를 `shared/ui/common`에 신규 스캐폴딩(첫 데이터-페칭 Unit)하고 `SettingsPortfolioPanel`에서 `TargetAllocationSection`을 감쌈.

### Warning

- [W1] `src/entities/portfolio/api/targetAllocationStore.test.ts`의 `isSupabaseConfigured() === false` 단정은 실행 환경에 env가 주입되면 깨질 수 있다. 테스트의 목적은 fallback 동작이므로 환경 의존 단정은 분리하거나 mock 처리하는 편이 안전하다.
  - **[해소 2026-06-01]** env 의존 단정(`isSupabaseConfigured()` 호출/import)을 제거하고, 기본(미설정 fallback) 어댑터의 read 동작만 검증하도록 변경.

### 검증 결과

- `pnpm test`: PASS, 18 files / 95 tests
- `pnpm lint`: PASS
- `pnpm typecheck`: PASS, `tsc -b --noEmit`
- `pnpm build`: PASS, `tsc -b && vite build`, 176 modules transformed
- `git diff --check`: PASS

### 보완 확인

- Unit 9 전환 대상(목표 비중 persistence) 구현 자체는 확인:
  - `src/entities/portfolio/api/targetAllocationStore.ts`
  - `src/entities/portfolio/api/targetAllocationApi.ts`
  - `src/entities/portfolio/hook/useTargetAllocation.ts`
  - `src/features/settings-portfolio/ui/TargetAllocationSection.tsx`
- 테스트 추가 확인:
  - `src/entities/portfolio/api/targetAllocationStore.test.ts`
  - `src/entities/portfolio/hook/useTargetAllocation.test.tsx`
  - `src/features/settings-portfolio/ui/SettingsPortfolioPanel.test.tsx` (목표 비중 저장 성공/실패 케이스 추가)

### 보완 요청

- `useSaveTargetAllocationMutation`의 `onSuccess`를 invalidate-only 패턴으로 수정한다.
- 조회 훅을 `useSuspenseQuery`로 전환하고, `TargetAllocationSection` 상위에 Suspense/Boundary를 배치한다. 만약 이번 Unit에서 범위 외라면 `CURRENT_TASK.md`/`WORK_LOG.md`에 예외 사유를 명시하고 다음 Unit에 이관한다.
- 환경 의존 테스트 단정을 제거하거나 mock 주입으로 안정화한다.

---

## 2026-06-01 / Unit 8 — 주식 포트폴리오 관리 구현 (2차 재리뷰)

### 최종 판단

- PASS

### Critical

- 없음

### Important

- 없음

### Suggestion

- `stocks` 데이터 소스는 현재 `MOCK_STOCK_ACTION_RECOMMENDATIONS` 기반이다. Unit 9에서 실제 보유 종목 + 목표 비중 계산 SSOT로 전환 시, 현재 `PortfolioManagementPanel`의 props 구조는 유지하고 entities 계층의 데이터 조합만 교체하는 방식이 안전하다.

### 검증 결과

- `pnpm test`: PASS, 16 files / 87 tests
- `pnpm lint`: PASS
- `pnpm typecheck`: PASS, `tsc -b --noEmit`
- `pnpm build`: PASS, `tsc -b && vite build`, 172 modules transformed
- `git diff --check`: PASS

### 보완 확인

- 이전 W1 해소 확인: 액션 톤 상수 SSOT 통합 완료 (`REBALANCING_ACTION_TONE_CLASSES`를 `entities/rebalancing`로 승격)
  - `src/entities/rebalancing/model/constants.ts`
  - `src/entities/rebalancing/index.ts`
  - `src/features/portfolio-management/ui/PortfolioManagementPanel.tsx`
  - `src/features/rebalancing-proposal/ui/RebalancingProposalPanel.tsx`
- Unit 8 핵심 구현/테스트(6개) 유지 확인

### 후속 권장 사항

- Unit 8은 커밋/푸시 진행 가능.

---

## 2026-06-01 / Unit 8 — 주식 포트폴리오 관리 구현 (1차 리뷰)

### 최종 판단

- PASS WITH WARNINGS

### Critical

- 없음

### Warning

- [W1] `src/features/portfolio-management/model/constants.ts`에 `ACTION_TONE_CLASSES`가 재정의되어 Unit 7(`rebalancing-proposal`)과 중복된다. WORK_LOG에 기록한 대로 3회 이상 중복 기준을 충족했으므로, 다음 보완에서 `entities/rebalancing` 또는 `shared`로 승격해 SSOT 통합을 권장한다.
  - **[해소 2026-06-01]** `entities/rebalancing`에 `REBALANCING_ACTION_TONE_CLASSES`로 승격(`REBALANCING_ACTION_LABELS`와 co-locate), 두 feature의 로컬 `ACTION_TONE_CLASSES` 제거 후 `@entities/rebalancing` public API 경유로 통일. 87 tests / lint / typecheck / build / diff-check 전체 PASS.
- [W2] 현재 테이블 데이터는 `MOCK_STOCK_ACTION_RECOMMENDATIONS`를 그대로 사용한다. 향후 실제 포트폴리오 기준 정합성을 위해 보유 종목(`holdings`) + 목표 비중 기반 per-stock 계산 경로로 이관 계획을 명시하는 것이 좋다.
  - **[이관 계획 명시 2026-06-01]** `WORK_LOG.md` Unit 8 「1차 리뷰 보완」에 이관 계획 기재: `entities/portfolio`에 종목별 목표 비중 소스 + per-stock 계산 함수(`calculateHoldingWeights` 가칭) 신설 → 패널은 계산 결과 props 주입, 추천 mock 의존 제거. 적용은 보유 종목 계산 경로가 도입되는 Unit 9 범위로 이관.

### 검증 결과

- `pnpm test`: PASS, 16 files / 87 tests
- `pnpm lint`: PASS
- `pnpm typecheck`: PASS, `tsc -b --noEmit`
- `pnpm build`: PASS, `tsc -b && vite build`, 172 modules transformed
- `git diff --check`: PASS

### 보완 확인

- `PortfolioPage` placeholder 제거 후 관리 패널 연결 확인: `src/pages/portfolio/ui/PortfolioPage.tsx`
- Unit 8 범위 구현 확인: 종목 테이블(현재/목표/차이/AI 액션), Empty/Error 상태, 리밸런싱 이동 CTA
- 테스트 6개 추가 확인: `src/features/portfolio-management/ui/PortfolioManagementPanel.test.tsx`

### 후속 권장 사항

- Unit 8 커밋/푸시 진행 가능.
- Unit 9 착수 전 액션 톤 상수 SSOT 통합 여부를 먼저 결정한다.

---

## 2026-06-01 / Unit 7 — AI 리밸런싱 제안 구현 (1차 리뷰)

### 최종 판단

- PASS WITH WARNINGS

### Critical

- 없음

### Warning

- [W1] `src/features/rebalancing-proposal/ui/RebalancingProposalPanel.tsx`의 팝업 내 설정 이동 CTA가 `<a href="/settings">`로 구현되어 SPA 내비게이션 대신 전체 페이지 리로드가 발생할 수 있다. 앱 라우팅 일관성을 위해 `Link` 또는 라우터 네비게이션으로 맞추는 것을 권장한다.
  - **[해소 2026-06-01]** 설정 이동 CTA를 react-router `Link to={ROUTES.SETTINGS}`로 교체. 테스트는 `MemoryRouter` 래핑(`renderPanel` 헬퍼)으로 라우터 컨텍스트를 제공하며 `href="/settings"` 검증 유지. 커밋 전 보완 완료.
- [W2] API key 연동 유도 다이얼로그는 열기/닫기 동작은 구현되어 있으나, focus trap/ESC 닫기 같은 키보드 보강은 아직 없다. Unit 10 접근성 보강 시 우선 반영 필요.
  - **[이연]** 리뷰 판단대로 Unit 10 접근성 보강 범위로 이연. `SESSION_STATE.md` 미완료 작업에 등록.

### 검증 결과

- `pnpm test`: PASS, 15 files / 81 tests
- `pnpm lint`: PASS
- `pnpm typecheck`: PASS, `tsc -b --noEmit`
- `pnpm build`: PASS, `tsc -b && vite build`, 169 modules transformed
- `git diff --check`: PASS

### 보완 확인

- `RebalancePage` placeholder 제거 후 제안 패널 연결 확인: `src/pages/rebalance/ui/RebalancePage.tsx`
- 구현 범위 확인: 현재/추천 구성 비교, 추천 근거, 3/6/12개월 시뮬레이션, 무료 잔여 횟수 표시, 잔여 0회 시 연동 유도 팝업+차단
- Unit 7 테스트 6개 추가 확인: `src/features/rebalancing-proposal/ui/RebalancingProposalPanel.test.tsx`

### 후속 권장 사항

- Unit 7 커밋/푸시 진행 가능.
- Unit 8 착수 전 설정 이동 CTA를 SPA 라우팅 방식으로 정리하는 소규모 보완을 권장한다.

---

## 2026-05-31 / Unit 6 — 포트폴리오 대시보드 구현 (1차 리뷰)

### 최종 판단

- PASS WITH WARNINGS

### Critical

- 없음

### Warning

- [W1] `src/features/dashboard-overview/ui/DashboardOverviewPanel.tsx`에서 `formatKrw`, `resolveDirection`, `getHoldingValue`가 컴포넌트 내부 유틸로 존재한다. Unit 7~8에서 동일 계산/표기 로직 재사용 가능성이 높으므로, 중복이 3회 이상 발생하면 `entities/portfolio/model` 또는 `shared/lib`로 승격하는 기준을 미리 `WORK_LOG.md`에 남기는 것이 좋다.
- [W2] `src/features/dashboard-overview/ui/DashboardOverviewPanel.test.tsx`의 KPI 검증이 기본 mock 값(`20,000,000원`, `상승`)에 고정되어 있다. 현재는 통과 기준으로 충분하지만, 데이터 주입형 테스트 1개(커스텀 `summary`/`previousTotalValue`)를 추가하면 향후 mock 변경 내성을 높일 수 있다.

### 검증 결과

- `pnpm test`: PASS, 14 files / 74 tests
- `pnpm lint`: PASS
- `pnpm typecheck`: PASS, `tsc -b --noEmit`
- `pnpm build`: PASS, `tsc -b && vite build`, 166 modules transformed
- `git diff --check`: PASS

### 보완 확인

- `DashboardPage` placeholder 제거 후 `DashboardOverviewPanel` 연결 확인: `src/pages/dashboard/ui/DashboardPage.tsx`
- Unit 6 요구 섹션 구현 확인: KPI, 자산군 비중, 주요 보유 종목, AI 진단 요약, Empty/Error 상태
- Unit 6 테스트 5개 추가 확인: `src/features/dashboard-overview/ui/DashboardOverviewPanel.test.tsx`

### 후속 권장 사항

- Unit 6 커밋/푸시 진행 가능.
- Unit 7 착수 전, 대시보드/리밸런싱 공통 숫자 포맷팅 유틸 재사용 기준을 문서화한다.

---

## 2026-05-31 / Unit 5 — 설정: 수동 자산·목표 비중·AI 모델/API Key UI 구현 (2차 리뷰)

### 최종 판단

- PASS WITH WARNINGS

### Critical

- 없음

### Warning

- [W1] `src/features/settings-portfolio/ui/AiSettingsSection.tsx`의 API key는 여전히 컴포넌트 로컬 상태만 사용한다. Unit 6 이전에 저장 범위(세션/로컬/서버)와 보안 정책(암호화/전송/폐기)을 `PRD.mdc`, `PROJECT_GUIDE.md`와 함께 SSOT로 확정해야 한다.

### 검증 결과

- `pnpm test`: PASS, 13 files / 69 tests
- `pnpm lint`: PASS
- `pnpm typecheck`: PASS, `tsc -b --noEmit`
- `pnpm build`: PASS, `tsc -b && vite build`, 158 modules transformed
- `git diff --check`: PASS

### 보완 확인

- 기존 Warning [W2] 해소 확인: `src/shared/ui/FieldMessage.tsx` 도입으로 에러 메시지의 `role="alert"` 기준이 컴포넌트 단에서 통일됨.
- Unit 5 기능(수동 자산 CRUD, 목표 비중 조정/프리셋, AI 모델/API key 설정)과 테스트(`SettingsPortfolioPanel.test.tsx` 9개) 정상 동작 확인.

### 후속 권장 사항

- Unit 5는 커밋/푸시 진행 가능.
- Unit 6 착수 시 API key 저장/보안 정책 결정을 먼저 문서화하고 구현에 반영한다.

---

## 2026-05-31 / Unit 5 — 설정: 수동 자산·목표 비중·AI 모델/API Key UI 구현 (1차 리뷰)

### 최종 판단

- PASS WITH WARNINGS

### Critical

- 없음

### Warning

- [W1] `src/features/settings-portfolio/ui/AiSettingsSection.tsx`는 API Key를 UI 로컬 상태 기준으로만 관리한다. Unit 6~7 착수 전에 저장 위치(메모리/스토리지/서버), 마스킹 정책, 삭제 정책을 `PROJECT_GUIDE.md`와 구현 기준으로 SSOT 고정이 필요하다.
- [W2] `src/features/settings-portfolio/ui/*` 섹션 간 에러/상태 안내 텍스트의 접근성 표기(`role="alert"` 적용 기준)가 완전히 통일되지는 않았다. 다음 보완 시 에러 메시지 컴포넌트 기준을 통일하는 것이 좋다.

### 검증 결과

- `pnpm test`: PASS, 13 files / 69 tests
- `pnpm lint`: PASS
- `pnpm typecheck`: PASS, `tsc -b --noEmit`
- `pnpm build`: PASS, `tsc -b && vite build`, 158 modules transformed
- `git diff --check`: PASS

### 보완 확인

- Unit 5 범위 구현 확인: 수동 자산 CRUD, 목표 비중 및 투자성향 프리셋, AI 모델 선택 + API Key 마스킹/저장/삭제 UI
- 관련 테스트 확인: `src/features/settings-portfolio/ui/SettingsPortfolioPanel.test.tsx` (9 tests)
- 설정 페이지 연결 확인: `src/pages/settings/ui/SettingsPage.tsx`

### 후속 권장 사항

- Unit 5는 커밋/푸시 진행 가능.
- Unit 6 착수 전 API Key 저장/보안 정책을 문서와 코드 기준으로 확정한다.

---

## 2026-05-31 / Unit 4 — 증권사 연동 온보딩과 mock 연결 상태 구현 (1차 리뷰)

### 최종 판단

- PASS WITH WARNINGS

### Critical

- 없음

### Warning

- [W1] `src/features/brokerage-onboarding/ui/BrokerageOnboardingPanel.tsx:181`에서 보안 배지 아이콘으로 `🔒` 이모지를 직접 사용한다. 접근성은 충족하지만 컴포넌트 일관성 관점에서는 아이콘 컴포넌트 또는 텍스트 배지 스타일로 통일하는 편이 유지보수에 유리하다.
- [W2] `src/entities/brokerage/model/constants.ts:37-39`의 보안 문구가 PRD의 표현(예: `금융보안원 가이드라인 준수`, `데이터 제3자 미제공`)과 다르다. 기능 이슈는 아니지만 제품 문구 SSOT 관점에서 정합성을 맞추는 것이 좋다.

### 검증 결과

- `pnpm test`: PASS, 12 files / 60 tests
- `pnpm lint`: PASS
- `pnpm typecheck`: PASS, `tsc -b --noEmit`
- `pnpm build`: PASS, `tsc -b && vite build`, 145 modules transformed
- `git diff --check`: PASS

### 보완 확인

- 온보딩 page placeholder 제거 확인: `src/pages/onboarding-brokerage/ui/OnboardingBrokeragePage.tsx`
- 증권사 선택/검색/연결 성공/연결 실패/재시도/나중에 하기 플로우 확인: `src/features/brokerage-onboarding/ui/BrokerageOnboardingPanel.tsx`
- in-memory mock 연결 함수 확인: `src/entities/brokerage/api/connectBrokerage.ts`
- Unit 4 핵심 테스트 추가 확인: `src/features/brokerage-onboarding/ui/BrokerageOnboardingPanel.test.tsx` (6 tests)

### 후속 권장 사항

- Unit 4는 커밋/푸시 진행 가능.
- Unit 5 착수 전 보안 배지 문구를 PRD와 맞추는 정리 커밋을 고려한다.

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

## 2026-06-03 / Unit 17 — MSW 브라우저 워커 준비 (1차 리뷰)

### 최종 판단

- PASS WITH WARNINGS

### Critical

- 없음

### Warning

- [W1] `src/main.tsx:9`의 `void startMockWorker().finally(...)` 구조는 MSW 시작 실패 시 앱 렌더링은 진행하지만, `startMockWorker()`가 reject되면 `finally()`가 반환하는 promise도 reject되어 unhandled rejection이 남을 수 있다. 개발 환경 opt-in 기능이라 차단하지는 않지만, 다음 보완 시 `catch`를 추가해 실패 로그를 명시적으로 흡수하는 편이 안전하다.
- [W2] `package.json`이 `msw init --save` 이후 trailing newline 없이 끝난다. 기능 문제는 아니며 `git diff --check`도 통과하지만, 저장소 포맷 일관성 차원에서 커밋 전 정리하는 것이 좋다.

### 검증 결과

- `pnpm test`: PASS, 24 files / 167 tests
- `pnpm lint`: PASS
- `pnpm typecheck`: PASS, `tsc -b --noEmit`
- `pnpm build`: PASS, 429 modules transformed
- `git diff --check`: PASS
- `VITE_ENABLE_MSW=true pnpm exec vite --host 127.0.0.1`: PASS, dev server started at `http://127.0.0.1:5173/`
- Browser smoke: PASS, login page DOM rendered in dev server. 단, Browser 런타임의 page global 접근 제한으로 service worker registration 목록 직접 판독은 완료하지 못했다.

### 보완 요청

- 차단 보완 없음.
- 선택 보완: `main.tsx`의 worker bootstrap promise에 `catch`를 추가해 MSW 시작 실패 시 unhandled rejection을 방지한다.
- 선택 보완: `package.json` trailing newline을 복구한다.

### 후속 권장 사항

- Unit 17은 커밋 가능.
- Unit 18 다크 테마/모바일 QA 착수 전, `VITE_ENABLE_MSW=true` 환경에서 DevTools Application 탭 또는 E2E 도구로 `mockServiceWorker.js` 등록 상태를 한 번 더 실측하면 좋다.

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
