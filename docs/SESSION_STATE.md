# Session State — 세션 재개 상태

## 0. 문서 목적

이 문서는 세션이 끊기거나 다음 날 작업을 이어갈 때 현재 상태를 빠르게 복구하기 위한 문서다.

## 1. 현재 상태

- 현재 브랜치: `main`
- 현재 작업: Post-MVP Unit 20 GPT 1차 리뷰 PASS (커밋 전)
- 마지막 완료 작업: Unit 20 세션/AI 설정 메타데이터 persistence 구현 및 GPT 리뷰 PASS (2026-06-03)
- 커밋 여부: Unit 20 미커밋 (GPT 리뷰 PASS — 커밋 가능), 직전 커밋 `cebea72`(Unit 19)
- 리뷰 상태: Unit 20 PASS

## 2. 미완료 작업

- ~~로그아웃 UI 구현~~ → **[Unit 14 완료]**
- ~~수동 자산 persistence 전환~~ → **[Unit 15 완료]**
- ~~종목 테이블 per-stock 계산 SSOT 이관(`MOCK_HOLDINGS` + 목표 비중 결합)~~ → **[Unit 16 완료]**
- ~~`mockRecommendations.test.ts` 비중 합계 검증 정밀도 보강~~ → **[Unit 19 완료]**
- ~~`msw init` 명령으로 `public/mockServiceWorker.js` 생성~~ → **[Unit 17 완료]**
- ~~세션/AI설정 persistence (새로고침 시 초기화)~~ → **[Unit 20 PASS, 커밋 대기]**
- ~~다크 테마/모바일 QA 보강~~ → **[Unit 18 PASS, 브라우저 실측은 후속 QA 권장]**
- 실제 `@supabase/supabase-js` 어댑터(`createSupabaseTargetAllocationStore`, `createSupabaseManualAssetStore`) 연결 — 현재 in-memory mock fallback
- 실제 외부 AI provider 호출 및 API key 서버 저장/암호화 정책 확정 — 사용자 결정 필요
- ~~Unit 7 후속: 무료 잔여 횟수/API key 연동 상태 배선~~ → **[Unit 13 완료]**
- ~~API key 저장 위치/마스킹/삭제 정책 SSOT화~~ → **[Unit 13 완료]**

## 3. 신규/수정 파일 목록 (Unit 20 — 구현 완료)

신규:
- `src/shared/lib/browserStorage.ts` (local/session storage 안전 JSON read/write/remove helper)
- `docs/superpowers/plans/2026-06-03-unit20-session-ai-settings-persistence.md`

수정:
- `src/shared/lib/index.ts` (browserStorage export 추가 — `@shared/lib`·`@shared` 노출)
- `src/entities/session/model/constants.ts` (`SESSION_STORAGE_KEY` 추가)
- `src/entities/session/model/sessionAtom.ts` (sessionStorage 복원/저장/삭제, sentinel lazy 복원)
- `src/entities/session/model/sessionAtom.test.ts` (복원/저장/삭제/차감/손상·shape fallback 테스트)
- `src/entities/settings/model/constants.ts` (`AI_SETTINGS_STORAGE_KEY` 추가)
- `src/entities/settings/model/aiSettingsAtom.ts` (localStorage persistence, API key 원문 미저장 보장)
- `src/entities/settings/model/aiSettingsAtom.test.ts` (복원/모델 변경/마스킹 저장/삭제/손상 fallback/원문 미저장 테스트)
- `src/shared/test/setupTests.ts` (`afterEach` storage 초기화 — 테스트 간 persistence 누수 차단)
- `docs/WORK_LOG.md`
- `docs/SESSION_STATE.md`

참고: 계획 원안의 `src/shared/index.ts` 직접 수정 대신 `src/shared/lib/index.ts`에 추가 — `src/shared/index.ts`는 이미 `export * from './lib'`로 재노출하므로 public API 동일. 또한 모듈 로드 평가 → store별 sentinel lazy 복원으로 변경(테스트 정확성). 상세는 WORK_LOG Unit 20 참고.

## 3-1. 신규/수정 파일 목록 (Unit 19)

신규:
- `src/shared/config/allocationPolicy.ts` (`ALLOCATION_TOLERANCE_PERCENT` SSOT)

수정:
- `src/shared/index.ts` (allocationPolicy export 추가)
- `src/entities/portfolio/model/constants.ts` (로컬 리터럴 제거 → `@shared` re-export)
- `src/entities/rebalancing/model/mockRecommendations.test.ts` (하드코딩 0.5 제거 → `@shared`, `toBeCloseTo(100, 1)`)

## 3-2. 신규/수정 파일 목록 (Unit 18)

신규:
- `src/shared/ui/FieldMessage.test.tsx` (6개 테스트)
- `src/widgets/app-shell/ui/AppShell.test.tsx` (4개 테스트)

수정 (색상 토큰):
- `src/apps/styles/index.css` (`--success` 토큰 추가)
- `src/shared/ui/FieldMessage.tsx` (토큰 기반 색상 전환)
- `src/shared/ui/ErrorState.tsx` (destructive 토큰)
- `src/entities/rebalancing/model/constants.ts` (buy→primary, sell→destructive)
- `src/features/dashboard-overview/model/constants.ts` (up→destructive, down→primary)
- `src/features/portfolio-management/model/constants.ts` (over→destructive, under→primary)
- `src/features/rebalancing-proposal/ui/RebalancingProposalPanel.tsx` (destructive 토큰)
- `src/features/auth-login/ui/LoginForm.tsx` (destructive 토큰)
- `src/features/brokerage-onboarding/ui/BrokerageOnboardingPanel.tsx` (destructive 토큰)
- `src/features/settings-portfolio/ui/AiSettingsSection.tsx` (destructive 토큰)

수정 (모바일 레이아웃):
- `src/widgets/app-shell/ui/AppShell.tsx` (p-4 sm:p-6)
- `src/widgets/app-header/ui/AppHeader.tsx` (min-h-14 flex-wrap truncate)
- `src/widgets/app-sidebar/ui/AppSidebar.tsx` (max-lg:overflow-x-auto, shrink-0)
- `src/widgets/app-header/ui/AppHeader.test.tsx` (flex-wrap class guard)
- `src/widgets/app-sidebar/ui/AppSidebar.test.tsx` (overflow-x-auto class guard)
- `src/pages/login/ui/LoginPage.tsx` (모바일 패딩 축소)
- `src/features/brokerage-onboarding/ui/BrokerageOnboardingPanel.tsx` (스테퍼 flex-col sm:flex-row)
- `src/features/settings-portfolio/ui/AiSettingsSection.tsx` (입력 그룹 flex-col sm:flex-row)
- `src/features/settings-portfolio/ui/ManualAssetsSection.tsx` (자산 목록 flex-col sm:flex-row)
- `src/features/settings-portfolio/ui/TargetAllocationSection.tsx` (저장 행 flex-wrap)

## 3-3. 신규/수정 파일 목록 (Unit 17)

신규:
- `public/mockServiceWorker.js` (MSW CLI 생성, 수동 편집 금지)
- `src/shared/api/mocks/startWorker.ts`

수정:
- `src/main.tsx` (startMockWorker 호출)
- `src/shared/index.ts` (startMockWorker re-export)
- `eslint.config.js` (`public/` ignore 추가)
- `package.json` (`msw.workerDirectory` 자동 추가)

## 3-4. 신규/수정 파일 목록 (Unit 16)

신규:
- `src/entities/portfolio/model/calculateHoldingWeightRows.ts`
- `src/entities/portfolio/model/calculateHoldingWeightRows.test.ts`

수정:
- `src/entities/portfolio/model/types.ts` (HoldingWeightAction, HoldingTargetWeight, HoldingWeightRow 추가)
- `src/entities/portfolio/model/mockPortfolio.ts` (MOCK_HOLDING_TARGET_WEIGHTS, MOCK_HOLDING_WEIGHT_ROWS 추가)
- `src/entities/portfolio/index.ts` (새 타입·함수·mock re-export)
- `src/features/portfolio-management/ui/PortfolioManagementPanel.tsx` (rows prop 전환, MOCK_STOCK_ACTION_RECOMMENDATIONS 제거)
- `src/features/portfolio-management/ui/PortfolioManagementPanel.test.tsx` (HoldingWeightRow fixture 추가, 8개로 확장)

## 3-5. 신규/수정 파일 목록 (Unit 15)

신규:
- `src/entities/portfolio/api/manualAssetStore.ts`
- `src/entities/portfolio/api/manualAssetStore.test.ts`
- `src/entities/portfolio/api/manualAssetApi.ts`
- `src/entities/portfolio/hook/useManualAssets.ts`
- `src/entities/portfolio/hook/useManualAssets.test.tsx`

수정:
- `src/entities/portfolio/model/types.ts` (ManualAsset, ManualAssetPayload 추가)
- `src/entities/portfolio/index.ts` (타입·store·api·hook re-export 추가)
- `src/features/settings-portfolio/model/types.ts` (ManualAsset 로컬 정의 제거 → entity re-export)
- `src/features/settings-portfolio/model/constants.ts` (MANUAL_ASSET_LOAD_ERROR 추가)
- `src/features/settings-portfolio/ui/ManualAssetsSection.tsx` (local state → query/mutation 전환)
- `src/features/settings-portfolio/ui/SettingsPortfolioPanel.tsx` (ManualAssetsSection ApiQueryBoundary 래핑)
- `src/features/settings-portfolio/ui/SettingsPortfolioPanel.test.tsx` (수동 자산 테스트 7개로 확장)

## 3-6. 신규/수정 파일 목록 (Unit 14)

신규:
- `src/features/auth-logout/ui/LogoutButton.tsx`
- `src/features/auth-logout/ui/LogoutButton.test.tsx`
- `src/features/auth-logout/index.ts`

수정:
- `src/widgets/app-header/ui/AppHeader.tsx` (`showLogout` prop + LogoutButton 조건부 렌더)
- `src/widgets/app-header/ui/AppHeader.test.tsx` (Provider/Router 래핑, 로그아웃 테스트 2개 추가)
- `src/apps/router/AppShellLayout.tsx` (`showLogout` 전달)
- `src/features/index.ts` (`auth-logout` 추가)

## 4. 검증 결과 요약

### Unit 20 최종 검증 (2026-06-03)

| 명령 | 결과 |
| --- | --- |
| `pnpm test` | ✅ PASS (193 tests, 26 files, 0 failures) |
| `pnpm test` (targeted: sessionAtom + aiSettingsAtom) | ✅ PASS (25 tests, 2 files) |
| `pnpm lint` | ✅ PASS |
| `pnpm typecheck` | ✅ PASS |
| `pnpm build` | ✅ PASS (431 modules, gzip JS 144.61 kB) |
| `git diff --check` | ✅ PASS |

### Unit 19 최종 검증 (2026-06-03)

| 명령 | 결과 |
| --- | --- |
| `pnpm test` | ✅ PASS (181 tests, 26 files, 0 failures) |
| `pnpm lint` | ✅ PASS |
| `pnpm typecheck` | ✅ PASS |
| `pnpm build` | ✅ PASS (430 modules, gzip JS 144.20 kB) |
| `git diff --check` | ✅ PASS |

### Unit 17 최종 검증 (2026-06-03)

| 명령 | 결과 |
| --- | --- |
| `pnpm test` | ✅ PASS (167 tests, 24 files, 0 failures) |
| `pnpm lint` | ✅ PASS |
| `pnpm typecheck` | ✅ PASS |
| `pnpm build` | ✅ PASS (429 modules transformed, gzip JS 144.06 kB) |
| `git diff --check` | ✅ PASS |
| `VITE_ENABLE_MSW=true pnpm exec vite --host 127.0.0.1` | ✅ PASS (dev server 기동 및 로그인 페이지 DOM 렌더링 확인, SW 등록 목록 직접 판독 미완료) |

### Unit 18 최종 검증 (2026-06-03, C1 보완 후)

| 명령 | 결과 |
| --- | --- |
| `pnpm test` | ✅ PASS (181 tests, 26 files, 0 failures) |
| `pnpm lint` | ✅ PASS |
| `pnpm typecheck` | ✅ PASS |
| `pnpm build` | ✅ PASS (429 modules, gzip JS 144.18 kB) |
| `git diff --check` | ✅ PASS |
| 브라우저 실측 | 미수행 (CI 환경, RTL class guard로 대체) |

### Unit 16 최종 검증 (2026-06-03)

| 명령 | 결과 |
| --- | --- |
| `pnpm test` | ✅ PASS (167 tests, 24 files, 0 failures) |
| `pnpm lint` | ✅ PASS |
| `pnpm typecheck` | ✅ PASS |
| `pnpm build` | ✅ PASS (195 modules, gzip JS 143.39 kB) |
| `git diff --check` | ✅ PASS |

### Unit 15 최종 검증 (2026-06-03, 1차 리뷰 보완 후)

| 명령 | 결과 |
| --- | --- |
| `pnpm test` | ✅ PASS (156 tests, 23 files, 0 failures) |
| `pnpm lint` | ✅ PASS |
| `pnpm typecheck` | ✅ PASS |
| `pnpm build` | ✅ PASS (194 modules, gzip JS 143.19 kB) |
| `git diff --check` | ✅ PASS |

### Unit 14 최종 검증 (2026-06-03)

| 명령 | 결과 |
| --- | --- |
| `pnpm test` | ✅ PASS (134 tests, 21 files, 0 failures) |
| `pnpm lint` | ✅ PASS |
| `pnpm typecheck` | ✅ PASS |
| `pnpm build` | ✅ PASS (191 modules, gzip JS 142.75 kB) |
| `git diff --check` | ✅ PASS |

### Unit 13 최종 검증 (2026-06-02)

| 명령 | 결과 |
| --- | --- |
| `pnpm test` | ✅ PASS (129 tests, 20 files, 0 failures) |
| `pnpm lint` | ✅ PASS |
| `pnpm typecheck` | ✅ PASS |
| `pnpm build` | ✅ PASS (189 modules, gzip JS 142.70 kB) |
| `git diff --check` | ✅ PASS |

## 5. 다음 액션

1. Unit 20 변경사항 기반 GPT 검증 리뷰 요청
2. 리뷰 PASS 시 커밋/푸시
3. 이후 Unit 21 또는 사용자 직접 작업 큐로 전환

## 6. 재개 시 읽을 문서

- `AGENTS.md`
- `PRD.mdc`
- `docs/PROJECT_GUIDE.md`
- `docs/CURRENT_TASK.md`
- `docs/WORK_LOG.md`
- `docs/REVIEW_LOG.md`
- `docs/SESSION_STATE.md`
