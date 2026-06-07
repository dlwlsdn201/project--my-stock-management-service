---

## Post-MVP Unit 22 — Supabase Persistence 연결 (보완 포함)

- 작업 일자: 2026-06-04 (초기) / 2026-06-05 (보완)
- 작업 브랜치: main

### 생성된 Migration

| 파일 | 내용 | 적용 방법 |
|------|------|-----------|
| `supabase/migrations/20260604134639_create_portfolio_persistence_tables.sql` | target_allocations · manual_assets 테이블, MVP anon RLS (초기) | Supabase MCP `apply_migration` |
| `supabase/migrations/20260605103226_fix_mvp_rls_mock_user.sql` | MVP RLS 패치: anon 전체 → mock user_id 제한 (보완 C2) | Supabase MCP `apply_migration` |
| `supabase/migrations/20260605131720_fix_set_updated_at_search_path.sql` | `set_updated_at` 함수 `search_path` 명시 — security advisor W1 해소 | Supabase MCP `apply_migration` |

### 적용된 테이블 / Schema

| 테이블 | 컬럼 | 비고 |
|--------|------|------|
| `target_allocations` | id(uuid PK), user_id(uuid), equity(numeric 5,2), bond(numeric 5,2), cash_and_alternative(numeric 5,2), created_at, updated_at | user_id unique index |
| `manual_assets` | id(uuid PK), user_id(uuid), ticker(text), name(text), quantity(numeric), avg_price(numeric), created_at, updated_at | |

### RLS 정책 (보완 후)

| 테이블 | 현재 MVP 정책 | 조건 | 운영 전환 정책 |
|--------|--------------|------|----------------|
| `target_allocations` | `mvp_anon_target_allocations_mock_user` | `user_id = '00000000-0000-0000-0000-000000000001'` | `auth.uid() = user_id` 기반 authenticated 정책으로 교체 (Unit 25+) |
| `manual_assets` | `mvp_anon_manual_assets_mock_user` | `user_id = '00000000-0000-0000-0000-000000000001'` | `auth.uid() = user_id` 기반 authenticated 정책으로 교체 (Unit 25+) |

### 검증 결과 (보완 후 최종)

| 명령 | 결과 |
| --- | --- |
| `pnpm test` | ✅ PASS (209 tests, 28 files, 0 failures) |
| `pnpm lint` | ✅ PASS |
| `pnpm typecheck` | ✅ PASS |
| `pnpm build` | ✅ PASS (gzip JS 199.37 kB — supabase-js 포함으로 크기 증가, warning only) |
| `git diff --check` | ✅ PASS |
| `pnpm exec supabase migration list` | ✅ PASS — local/remote 완전 정합 (3 rows matched, 3차 재리뷰 기준). 최종 재실행은 pooler 임시 인증 차단으로 NOT VERIFIED |
| `pnpm exec supabase db query --linked` (`pg_policies`) | ✅ PASS — mock user id RLS 확인 |
| `pnpm exec supabase db query --linked` (`pg_proc`) | ✅ PASS — `set_updated_at` `search_path=""` 확인 |
| `pnpm exec supabase db advisors --linked --type security --level warn --fail-on error` | ✅ PASS — `No issues found` |

### 보완 내역 (1차 리뷰 NOT PASS → 재보완)

| 항목 | 분류 | 내용 | 해결 |
|------|------|------|------|
| Migration 정합성 | C1 | 로컬 `134553` ↔ 원격 `134639` 불일치 | 로컬 파일명을 `134639`로 rename → 정합 |
| MVP RLS 제한 | C2 | `using (true)` → anon 전체 허용 | RLS 패치 migration 생성·적용, mock user_id `00000000-...-0001`로 제한 |
| `supabase/.temp/` | W1 | 로컬 link metadata 커밋 포함 위험 | `.gitignore`에 `supabase/.temp/` 추가 |
| CLI dep 위치 | W2 | `supabase` CLI가 `dependencies`에 위치 | `devDependencies`로 이동, `pnpm install` 갱신 |
| `_resetSupabaseClient` | W3 | test-only 함수가 `@shared` public API 노출 | `supabaseClient.ts`에서 제거, `src/shared/test/supabaseTestUtils.ts`에 향후 통합 테스트용 플레이스홀더 추가 |
| `MOCK_SUPABASE_USER_ID` 이중 경로 | 추가 정리 | `supabaseTargetAllocationStore` 통과 re-export 중복 | `index.ts`에서 `supabaseMockUser.ts` 직접 export로 일원화 |
| `set_updated_at` search_path | 추가 정리 | security advisor `function_search_path_mutable` 경고 | migration `20260605131720` 적용 — `set search_path = ''` 명시 |

### 신규/수정 파일 목록

신규:
- `supabase/migrations/20260604134639_create_portfolio_persistence_tables.sql` (rename: 134553 → 134639)
- `supabase/migrations/20260605103226_fix_mvp_rls_mock_user.sql` (RLS 패치)
- `supabase/migrations/20260605131720_fix_set_updated_at_search_path.sql` (search_path 명시)
- `src/entities/portfolio/api/supabaseTargetAllocationStore.ts`
- `src/entities/portfolio/api/supabaseManualAssetStore.ts`
- `src/entities/portfolio/api/supabaseTargetAllocationStore.test.ts` (6 tests)
- `src/entities/portfolio/api/supabaseManualAssetStore.test.ts` (9 tests)
- `src/entities/portfolio/api/targetAllocationStore.test.ts` (4 tests, fallback 포함)
- `src/shared/test/supabaseTestUtils.ts` (테스트 격리 유틸 플레이스홀더)

수정:
- `src/shared/api/supabaseClient.ts` (getSupabaseClient 추가, `_resetSupabaseClient` 제거)
- `src/entities/portfolio/api/targetAllocationStore.ts` (resolveDefaultStore Supabase 분기 연결)
- `src/entities/portfolio/api/manualAssetStore.ts` (resolveDefaultStore Supabase 분기 연결)
- `src/entities/portfolio/index.ts` (createSupabaseTargetAllocationStore, createSupabaseManualAssetStore, MOCK_SUPABASE_USER_ID export 추가)
- `.gitignore` (`supabase/.temp/` 추가)
- `package.json` (`supabase` CLI → devDependencies 이동)

### 남은 리스크

- Auth 연동 전이므로 모든 데이터가 `MOCK_SUPABASE_USER_ID`(`00000000-0000-0000-0000-000000000001`) 기준으로 저장됨
- 운영 전환 시 MVP RLS 정책 삭제 + auth.uid() 기반 정책 추가 필요 (Unit 25+ OAuth 연동 후)
- Supabase generated types 미연결 — `as TargetAllocationRow` 단언 사용 중. 타입 생성 연결 시 단언 제거 가능
- 번들 크기 경고 (681 kB / 199 kB gzip): supabase-js 포함으로 Unit 21 대비 증가. 코드 스플리팅은 운영 최적화 단계에서 진행
- `VITE_SUPABASE_ANON_KEY`는 public client용 key이므로 노출 가능 (service_role key 사용 금지 유지)
- 최종 `migration list` 재실행은 pooler 임시 인증 차단으로 완료하지 못했으나, 직전 재리뷰에서 3개 migration local/remote 정합을 확인함

---

## Unit 21 — 최종 브라우저 QA와 릴리즈 후보 점검

- 작업 일자: 2026-06-03
- 작업 브랜치: main

### 검증 결과

| 명령 | 결과 |
| --- | --- |
| `pnpm test` | ✅ PASS (193 tests, 26 files, 0 failures) |
| `pnpm lint` | ✅ PASS |
| `pnpm typecheck` | ✅ PASS |
| `pnpm build` | ✅ PASS (431 modules, gzip JS 144.61 kB) |
| `git diff --check` | ✅ PASS |

### 브라우저 smoke QA

브라우저 자동화: Claude Preview MCP (`mcp__Claude_Preview__*`) 사용. dev server `pnpm dev` (port 5173) 기동 후 모든 라우트 접근 및 스크린샷/DOM 스냅샷 확인.

모든 라우트에서 런타임 콘솔 에러 없음.

| Route | 375x812 | 768x1024 | 1440x900 | 결과 |
| --- | --- | --- | --- | --- |
| `/login` | PASS | NOT VERIFIED¹ | NOT VERIFIED¹ | 인증 리디렉트 가드 동작 확인, 폼 렌더링 정상 |
| `/dashboard` | PASS | PASS | PASS | 탭 네비, 자산/종목 카드, AI 진단 섹션 렌더링 정상 |
| `/onboarding/brokerage` | PASS | PASS | PASS | 3단계 스테퍼, 증권사 카드 렌더링 정상 |
| `/rebalance` | PASS | PASS | PASS | 현재/추천 구성 비교, 추천 근거, 시뮬레이션 렌더링 정상 |
| `/portfolio` | PASS | PASS | PASS | 종목 테이블 (현재 비중·목표 비중·차이·AI 액션) 렌더링 정상 |
| `/settings` | PASS | PASS² | PASS | 수동 자산·목표 비중·AI 설정 섹션 렌더링 정상 |

**주석:**
1. `/login` 768x1024 · 1440x900: 세션이 유효한 상태에서 `/login` 접근 시 `/dashboard`로 리디렉트됨 — 보호 라우트 가드가 정상 동작한다는 증거로 기록. 로그아웃 후 `/login` 자체는 375x812에서 렌더링 확인.
2. `/settings` 768x1024: 스크린샷 도구 일시 오류(`UnknownVizError`), 접근성 트리(DOM 스냅샷)로 세 섹션(수동 자산·목표 비중·AI 설정) 전체 렌더링 확인.

### 다크 모드 점검

| Route | 다크 모드 결과 | 비고 |
| --- | --- | --- |
| `/login` | NOT VERIFIED | 앱 내 테마 토글 버튼은 AppShell(인증 후 라우트)에만 존재. 로그인 페이지는 UI에서 다크 모드 전환 불가. prefers-color-scheme 반응 여부 미확인. |
| `/dashboard` | PASS | 테마 버튼 클릭 후 다크 전환 확인. 배경 어둡게, 텍스트/수치 가독성 유지 |
| `/settings` | PASS | 다크 전환 후 입력 필드 배경 어둡게, 텍스트 대비 명확 |

### MSW opt-in smoke

| 항목 | 결과 |
| --- | --- |
| `VITE_ENABLE_MSW=true pnpm exec vite --host 127.0.0.1` | ✅ PASS (port 5174, 215ms 기동) |
| `public/mockServiceWorker.js` | ✅ 존재 (9120 bytes) |
| SW 파일 HTTP 서빙 | ✅ PASS (`curl` 확인: HTTP 200, Content-Type: text/javascript, Content-Length: 9120) |
| 브라우저에서 SW 등록 목록 직접 판독 | NOT VERIFIED (Claude Preview MCP 내 Service Worker 등록 목록 API 미제공) |

### API key 보안 확인

인증 후 sessionStorage/localStorage 내용 직접 확인:
- `sessionStorage.assetflow.session`: `{"userStatus":"existing","aiTrialRemainingCount":1}` — 세션 메타데이터만 저장, 민감 정보 없음
- `localStorage`: 완전히 비어 있음 (AI 설정 미저장 상태)
- API key 원문 없음 ✅

### 릴리즈 후보 체크리스트

- [x] Login/mock auth flow verified — 375x812 로그인 폼 및 mock 로그인 성공 확인
- [x] Protected routes verified — 미인증 시 `/login` 리디렉트, 인증 시 `/dashboard` 리디렉트 확인
- [x] Brokerage onboarding verified — 3단계 스테퍼, 증권사 목록 표시 정상
- [x] Dashboard overview verified — 자산 총액, 자산군 비중, 보유 종목, AI 진단 섹션 정상
- [x] Rebalancing proposal verified — 현재/추천 구성, AI 추천 근거, 예상 시뮬레이션 정상
- [x] Portfolio management verified — 5종목 비중 테이블, AI 액션 표시 정상
- [x] Settings/manual assets/target allocation/AI settings verified — 세 섹션 전체 렌더링 정상
- [x] Light/dark theme verified (authenticated routes) — /dashboard · /settings 다크 모드 PASS. /login 다크 모드: 앱 내 토글 미제공 (제한사항 기록)
- [x] Mobile/desktop layout verified — 375x812 전 라우트 PASS, 1440x900 전 라우트 PASS (/login 제외 — 인증 리디렉트로 직접 접근 불가, 상세 QA 표 주석 1 참조)
- [x] API key original not persisted — sessionStorage/localStorage 직접 확인, 원문 미포함 ✅
- [x] External integration risks documented — 하단 별도 섹션 참조

### 잔여 리스크 / 사용자 직접 결정 큐

아래 항목은 외부 계정, 운영 보안 정책, 실제 provider 선택이 필요하므로 Claude Code 단독 구현 범위 밖이다.

- **Supabase 프로젝트 생성 및 환경 변수 제공**: 현재 in-memory mock fallback. 운영 환경 전환 시 사용자가 Supabase 프로젝트 생성 후 `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` 제공 필요.
- **실제 `@supabase/supabase-js` adapter 운영 연결**: `createSupabaseTargetAllocationStore` · `createSupabaseManualAssetStore` 구현체 존재, 환경 변수 제공 시 즉시 연결 가능.
- **API key 서버 저장/암호화 정책 확정**: 현재 클라이언트 localStorage에 마스킹값만 저장. 서버 측 암호화 저장은 운영 정책 결정 후 구현 필요.
- **실제 AI provider 호출 방식 확정(GPT/Gemini/Claude)**: UI에서 모델 선택 가능하나 실제 API 호출 미연결. provider별 SDK/키 정책 결정 후 구현 필요.
- **OAuth 제공자 정책 확정**: 카카오 로그인 버튼 존재. 실제 OAuth 앱 등록 및 리다이렉트 URI 설정 필요.
- **결제/구독 정책 및 연동**: 무료 AI 잔여 횟수 상태 관리는 구현됨. 구독 티어·결제 처리 정책 결정 후 연동 필요.
- **/login 다크 모드**: 현재 앱 내 테마 토글은 AppShell에만 존재 (인증 후 라우트). 로그인 페이지 다크 모드 지원 여부는 사용자 요구사항 확정 후 구현 가능.

---

## Unit 20 — 세션과 AI 설정 메타데이터 persistence 보강

- 작업 일자: 2026-06-03
- 작업 브랜치: main

### 변경 파일

신규:
- `src/shared/lib/browserStorage.ts` (local/session storage 안전 JSON read/write/remove helper)

수정:
- `src/shared/lib/index.ts` (`export * from './browserStorage'` 추가 — `@shared/lib` 및 `@shared` public API 노출)
- `src/entities/session/model/constants.ts` (`SESSION_STORAGE_KEY = 'assetflow.session'` 추가)
- `src/entities/session/model/sessionAtom.ts` (sessionStorage 복원/저장/삭제, `decrementAiTrialAtom`·`clearSessionAtom` storage 연동)
- `src/entities/session/model/sessionAtom.test.ts` (복원/저장/삭제/차감/손상 데이터·shape 불일치 fallback 테스트)
- `src/entities/settings/model/constants.ts` (`AI_SETTINGS_STORAGE_KEY = 'assetflow.ai-settings'` 추가)
- `src/entities/settings/model/aiSettingsAtom.ts` (localStorage 복원/저장, API key 원문 미저장 보장)
- `src/entities/settings/model/aiSettingsAtom.test.ts` (복원/모델 변경/마스킹 저장/삭제/손상 데이터 fallback/원문 미저장 테스트)
- `src/shared/test/setupTests.ts` (`afterEach`에서 local/session storage 초기화 — 테스트 간 persistence 누수 차단)

### 구현 내용

- **shared storage helper**: `readBrowserStorageJson`/`writeBrowserStorageJson`/`removeBrowserStorageItem`. `typeof window === 'undefined'` 가드, storage 접근 차단(프라이빗 모드 등) try/catch fallback, JSON parse 실패·validator 불일치 시 fallback 반환, write/remove 실패가 앱을 중단시키지 않음.
- **session persistence (sessionStorage)**: `assetflow.session` 키에 `userStatus`·`aiTrialRemainingCount`만 저장. 인증 토큰·민감정보 미저장. `isSession` validator로 shape 검증. 새로고침 후 mock 세션과 무료 AI 잔여 횟수 복원.
- **AI settings persistence (localStorage)**: `assetflow.ai-settings` 키에 `modelId`·`isApiKeyConnected`·`maskedApiKey`만 저장. `isAiSettings`/`isAiModelId` validator로 검증. 모델 선택·API key 연결 표시 메타데이터 복원.
- **store별 lazy 복원 패턴**: 계획 원안은 atom 기본값을 모듈 로드 시점에 `readBrowserStorageJson`로 평가하지만, vitest는 모듈을 1회만 import하므로 테스트 본문에서 나중에 설정한 storage 값이 복원되지 않는다(restore 테스트 실패). 이를 sentinel(`Symbol`) base atom + derived read atom 패턴으로 대체해 store별 첫 접근 시 1회 storage를 복원하도록 했다. public atom API(`sessionAtom`, `aiSettingsAtom`, 액션 atom)는 동일하게 유지된다.
- **API key 원문 미저장 보장**: `saveApiKeyAtom`은 원문을 받아 `maskKey`로 마스킹 값으로 변환한 뒤에만 저장. 원문은 localStorage/sessionStorage/Jotai/테스트/문서 어디에도 기록하지 않음(테스트 `not.toContain('secret-key')`로 가드).
- **테스트 격리**: persistence 도입으로 통합 테스트(`router`, `RebalancingProposalPanel`, `SettingsPortfolioPanel`)에서 storage 상태가 테스트 간 누수되어 실패가 발생. 전역 `setupTests.ts`의 `afterEach`에서 두 storage를 초기화하여 해소.

### 설계 판단

- **deviation from plan (storage 초기화 시점)**: 모듈 로드 평가 → store별 sentinel lazy 복원으로 변경. 이유는 위 "store별 lazy 복원 패턴" 참고. 프로덕션 동작(페이지 로드 시 기존 storage 복원)과 테스트 동작 모두 정확.
- **FSD 방향 준수**: `entities → shared` 단방향 유지. helper는 `@shared/lib` public API 경유 import, deep import 없음.

### 검증 결과

| 명령 | 결과 |
| --- | --- |
| `pnpm test` | ✅ PASS (193 tests, 26 files, 0 failures) |
| `pnpm test` (targeted: sessionAtom + aiSettingsAtom) | ✅ PASS (25 tests, 2 files) |
| `pnpm lint` | ✅ PASS |
| `pnpm typecheck` | ✅ PASS |
| `pnpm build` | ✅ PASS (431 modules, gzip JS 144.61 kB) |
| `git diff --check` | ✅ PASS |

### 남은 리스크 / 범위 밖

- 실제 서버측 API key 저장/암호화 및 외부 AI provider 호출은 여전히 범위 밖(사용자 결정 필요).
- 실제 인증 토큰 저장·Supabase persistence·OAuth 연동은 미구현(현재 mock 메타데이터만 persistence).

---

## Unit 19 — 리밸런싱 허용 오차 정책 SSOT 및 mock 추천 테스트 정밀도 보강

- 작업 일자: 2026-06-03
- 작업 브랜치: main

### 변경 파일

신규:
- `src/shared/config/allocationPolicy.ts` (`ALLOCATION_TOLERANCE_PERCENT = 0.5` SSOT)

수정:
- `src/shared/index.ts` (`export * from './config/allocationPolicy'` 추가)
- `src/entities/portfolio/model/constants.ts` (로컬 `ALLOCATION_TOLERANCE_PERCENT` 리터럴 제거 → `@shared` re-export)
- `src/entities/rebalancing/model/mockRecommendations.test.ts` (하드코딩 `TOLERANCE_PERCENT = 0.5` 제거 → `@shared` import, `toBeCloseTo(100, 0)` → `toBeCloseTo(100, 1)`)

### 구현 내용

- **허용 오차 정책 SSOT**: `ALLOCATION_TOLERANCE_PERCENT`를 `src/shared/config/allocationPolicy.ts`로 이관. cross-entity 정책 상수를 shared가 소유.
- **portfolio 호환성 유지**: `entities/portfolio/model/constants.ts`가 `@shared`에서 re-export. `@entities/portfolio` 소비자(`calculateAllocationGap`, `calculateHoldingWeightRows`, index public API)는 import 경로 변경 없이 동일하게 동작.
- **rebalancing 테스트 정리**: Unit 1 리뷰 W1(하드코딩 `0.5`), W2(느슨한 `toBeCloseTo(100, 0)`) 해소. 테스트가 `@shared` 정책 상수를 직접 참조하므로 FSD entity cross-import 없이 SSOT 일치.
- **정밀도 강화**: 현재 비중 합계 검증 `toBeCloseTo(100, 1)` (±0.05). mock 합계 39+18+10.5+27.5+5 = 100 정확 일치.

### 설계 판단

- **shared 직접 경로 vs @shared alias**: `constants.ts`의 re-export는 `@shared`(index 전체)를 통해 수행. shared/index.ts는 entities를 import하지 않아 순환 의존 없음(`grep` 확인). 테스트도 `@shared` alias 사용으로 통일.
- **FSD 방향 준수**: `entities → shared` 단방향 유지. `src/shared`에서 `@entities` import 없음 확인 완료.

### 검증 결과

| 명령 | 결과 |
| --- | --- |
| `pnpm test` | ✅ PASS (181 tests, 26 files, 0 failures) |
| `pnpm lint` | ✅ PASS |
| `pnpm typecheck` | ✅ PASS |
| `pnpm build` | ✅ PASS (430 modules, gzip JS 144.20 kB) |
| `git diff --check` | ✅ PASS |

---

## Unit 18 — 다크 테마/모바일 QA 보강

- 작업 일자: 2026-06-03
- 작업 브랜치: main

### 변경 파일

신규:
- `src/shared/ui/FieldMessage.test.tsx` (6개 — tone token class, role=alert, id 전달 검증)
- `src/widgets/app-shell/ui/AppShell.test.tsx` (4개 — main id, p-4, sm:p-6, skip link 검증)

수정:
- `src/apps/styles/index.css` (`--success` 토큰 라이트/다크 추가)
- `src/shared/ui/FieldMessage.tsx` (error→`--destructive`, success→`--success` 토큰 전환)
- `src/shared/ui/ErrorState.tsx` (`text-red-600` → `text-[hsl(var(--destructive))]`)
- `src/widgets/app-shell/ui/AppShell.tsx` (`p-6` → `p-4 sm:p-6`)
- `src/widgets/app-header/ui/AppHeader.tsx` (`h-14` → `min-h-14 flex-wrap`, title `truncate`, action 영역 `shrink-0`)
- `src/widgets/app-sidebar/ui/AppSidebar.tsx` (`max-lg:overflow-x-auto` 추가, nav link `shrink-0`)
- `src/widgets/app-header/ui/AppHeader.test.tsx` (`flex-wrap` class guard 추가)
- `src/widgets/app-sidebar/ui/AppSidebar.test.tsx` (`max-lg:overflow-x-auto` class guard 추가)
- `src/pages/login/ui/LoginPage.tsx` (모바일 패딩 축소: `p-8 md:p-12`, `p-6 md:p-8`)
- `src/features/auth-login/ui/LoginForm.tsx` (`text-red-500`/`bg-red-50`/`text-red-600` → destructive 토큰)
- `src/features/brokerage-onboarding/ui/BrokerageOnboardingPanel.tsx` (스테퍼 `flex-col sm:flex-row`, 에러 div `bg-[hsl(var(--destructive)/0.12)]`)
- `src/features/dashboard-overview/model/constants.ts` (`text-red-600`/`text-blue-600` → destructive/primary 토큰)
- `src/features/portfolio-management/model/constants.ts` (`text-red-600`/`text-blue-600` → destructive/primary 토큰)
- `src/entities/rebalancing/model/constants.ts` (`text-blue-600`/`text-red-600` → primary/destructive 토큰)
- `src/features/rebalancing-proposal/ui/RebalancingProposalPanel.tsx` (`text-red-600` → destructive 토큰)
- `src/features/settings-portfolio/ui/AiSettingsSection.tsx` (`text-red-600` → destructive, input/버튼 그룹 `flex-col sm:flex-row`)
- `src/features/settings-portfolio/ui/ManualAssetsSection.tsx` (자산 목록 `flex-col sm:flex-row sm:items-center sm:justify-between`)
- `src/features/settings-portfolio/ui/TargetAllocationSection.tsx` (저장 버튼 행 `flex-wrap`)

### 구현 내용

**다크 테마 색상 토큰 정리:**
- `FieldMessage` error/success를 `--destructive`/`--success` CSS 변수로 전환. 하드코딩 `text-red-600`/`text-green-600` 완전 제거.
- `ErrorState` title 색상 → `--destructive`.
- 한국 시장 관례(상승=빨강, 하락=파랑) 색상 의도를 주석으로 명시하고 의미 토큰(`--destructive`/`--primary`)으로 매핑.
- `REBALANCING_ACTION_TONE_CLASSES` (entities/rebalancing): buy → `--primary`, sell → `--destructive`.
- `GAP_TONE_CLASSES` (portfolio-management): over → `--destructive`, under → `--primary`.
- `VALUE_CHANGE_DIRECTION_CLASSES` (dashboard-overview): up → `--destructive`, down → `--primary`.

**모바일 레이아웃 보강:**
- `AppShell` main: `p-6` → `p-4 sm:p-6` (작은 화면 과도한 여백 축소).
- `AppHeader`: 고정 `h-14` → `min-h-14 flex-wrap`, title/description `truncate` 적용, 액션 영역 `shrink-0`.
- `AppSidebar`: `max-lg:overflow-x-auto` 추가, nav link `shrink-0` 추가로 모바일 가로 스크롤 시 레이블 보존.
- `LoginPage`: 좌측 패널 `gap-8 p-12` → `gap-6 p-8 md:p-12`, 우측 패널 `p-8` → `p-6 md:p-8`.
- `BrokerageOnboardingPanel`: 스테퍼 `flex-col sm:flex-row`, 에러 행 `flex-col sm:flex-row`.
- `AiSettingsSection`: API key 입력 그룹 `flex-col sm:flex-row`.
- `ManualAssetsSection`: 자산 목록 아이템 `flex-col sm:flex-row`.
- `TargetAllocationSection`: 저장 행 `flex-wrap`.

**의도적 결정:**
- 금융 방향 색상(상승/하락)은 한국 시장 관례 유지. `--destructive`(적색)=상승, `--primary`(청색)=하락. 텍스트 라벨과 병행 사용(색상 단독 표현 금지).
- 브라우저 smoke 테스트: CI 환경상 직접 실측 미수행. RTL class guard 테스트로 레이아웃 회귀를 방어.

### 검증 결과

| 명령 | 결과 |
| --- | --- |
| `pnpm test` | ✅ PASS (179 tests, 26 files, 0 failures) |
| `pnpm lint` | ✅ PASS |
| `pnpm typecheck` | ✅ PASS |
| `pnpm build` | ✅ PASS (429 modules, gzip JS 144.18 kB) |
| `git diff --check` | ✅ PASS |

### 1차 리뷰 보완 (C1 해소)

**C1 해소:** `BrokerageOnboardingPanel.test.tsx`에 feature-level 모바일 class guard 테스트 2개 추가.
- 스테퍼 `<ol>` 요소가 `flex-col`과 `sm:flex-row` 클래스를 포함하는지 검증.
- 연결 실패 에러 `role="alert"` 영역이 `flex-col`과 `sm:flex-row` 클래스를 포함하는지 검증.

**W1 해소:** `SESSION_STATE.md`의 미완료 작업 문구 모순 정리 — 브라우저 실측 미완료 상태를 명확히 기록.

| 명령 | 결과 |
| --- | --- |
| `pnpm test` | ✅ PASS (181 tests, 26 files, 0 failures) |
| `pnpm lint` | ✅ PASS |
| `pnpm typecheck` | ✅ PASS |
| `pnpm build` | ✅ PASS (429 modules, gzip JS 144.18 kB) |
| `git diff --check` | ✅ PASS |

---

## Unit 17 — MSW 브라우저 워커 준비

- 작업 일자: 2026-06-03
- 작업 브랜치: main

### 변경 파일

신규:
- `public/mockServiceWorker.js` (MSW CLI `pnpm exec msw init public --save` 산출물, 수동 편집 금지)
- `src/shared/api/mocks/startWorker.ts` (dev-only opt-in browser worker bootstrap helper)

수정:
- `src/main.tsx` (startMockWorker 호출로 앱 부트스트랩 연결)
- `src/shared/index.ts` (startMockWorker를 shared public API에 export)
- `eslint.config.js` (`public/` 디렉터리 ESLint ignore 추가 — CLI 생성 파일 lint 제외)
- `package.json` (MSW CLI가 `msw.workerDirectory: "public"` 자동 추가)

### 구현 내용

- **Service Worker**: `pnpm exec msw init public --save`로 `public/mockServiceWorker.js` 생성. MSW 2 공식 CLI 산출물.
- **Bootstrap Helper**: `startMockWorker()` — `import.meta.env.DEV && import.meta.env.VITE_ENABLE_MSW === 'true'`일 때만 worker를 start. 조건 불충족 시 즉시 return(no-op)으로 production 안전 보장.
- **App Bootstrap**: `main.tsx`에서 `void startMockWorker().catch(...).finally(() => { createRoot(...).render(...) })` 패턴 적용. MSW 실패 시 경고 로그를 남기고 앱 렌더링이 막히지 않도록 처리.
- **FSD 준수**: `startMockWorker`를 `@shared` public API(`src/shared/index.ts`)에 노출. `main.tsx`는 deep import 없이 `@shared`에서 import.
- **Production 안전**: `import.meta.env.DEV`가 false이면 `worker.start()` 호출 자체가 실행되지 않음. production build에서 MSW worker는 번들에 포함되지 않음(dynamic import `await import('./browser')` 미실행).
- **Env flag**: `VITE_ENABLE_MSW=true pnpm dev`로 브라우저 MSW를 opt-in 활성화 가능.

### 검증 결과

| 명령 | 결과 |
| --- | --- |
| `pnpm test` | ✅ PASS (167 tests, 24 files, 0 failures) |
| `pnpm lint` | ✅ PASS |
| `pnpm typecheck` | ✅ PASS |
| `pnpm build` | ✅ PASS (429 modules transformed, gzip JS 144.06 kB) |
| `git diff --check` | ✅ PASS |

브라우저 smoke 테스트: `VITE_ENABLE_MSW=true pnpm exec vite --host 127.0.0.1`로 dev server 기동 및 로그인 페이지 DOM 렌더링 확인. Browser 런타임의 page global 접근 제한으로 service worker registration 목록 직접 판독은 완료하지 못했으므로, DevTools > Application > Service Workers에서 `mockServiceWorker.js` 등록 여부를 추가 실측할 수 있다.

---

## Unit 16 — 포트폴리오 종목별 계산 SSOT 이관

- 작업 일자: 2026-06-03
- 작업 브랜치: main

### 변경 파일

신규:
- `src/entities/portfolio/model/calculateHoldingWeightRows.ts` (순수 계산 함수: holdings + targetWeights → HoldingWeightRow[])
- `src/entities/portfolio/model/calculateHoldingWeightRows.test.ts` (9개 — 비중 계산, gap, buy/sell/hold 판단, 엣지케이스, MOCK_HOLDINGS 통합 검증)

수정:
- `src/entities/portfolio/model/types.ts` (HoldingWeightAction, HoldingTargetWeight, HoldingWeightRow 추가)
- `src/entities/portfolio/model/mockPortfolio.ts` (MOCK_HOLDING_TARGET_WEIGHTS, MOCK_HOLDING_WEIGHT_ROWS 추가)
- `src/entities/portfolio/index.ts` (새 타입·함수·mock 전부 re-export)
- `src/features/portfolio-management/ui/PortfolioManagementPanel.tsx` (stocks prop 제거, rows?: HoldingWeightRow[] 도입, 기본값 MOCK_HOLDING_WEIGHT_ROWS로 전환, MOCK_STOCK_ACTION_RECOMMENDATIONS 의존 제거)
- `src/features/portfolio-management/ui/PortfolioManagementPanel.test.tsx` (HoldingWeightRow[] fixture 추가, rows prop 주입 테스트 추가, 8개로 확장)

### 구현 내용

- **타입 SSOT**: `HoldingWeightAction` / `HoldingTargetWeight` / `HoldingWeightRow` 세 타입을 `entities/portfolio/model/types.ts`에 정의하고 public API 경유 export.
- **계산 함수**: `calculateHoldingWeightRows(holdings, targetWeights)` — `quantity * currentPrice / totalValue * 100`으로 현재 비중 산출, `ALLOCATION_TOLERANCE_PERCENT(0.5)` 기준 buy/sell/hold 판단.
- **Mock 데이터**: `MOCK_HOLDING_TARGET_WEIGHTS` 추가(MOCK_HOLDINGS 5종목 기준), `MOCK_HOLDING_WEIGHT_ROWS = calculateHoldingWeightRows(MOCK_HOLDINGS, MOCK_HOLDING_TARGET_WEIGHTS)`.
- **UI 전환**: `PortfolioManagementPanel`의 기본 데이터 소스를 `MOCK_HOLDING_WEIGHT_ROWS`로 교체. `MOCK_STOCK_ACTION_RECOMMENDATIONS` import 완전 제거.
- **FSD 준수**: `entities/portfolio`는 `entities/rebalancing`을 import하지 않음. feature는 `@entities/portfolio` public API 경유.
- **액션 레이블/색상**: `REBALANCING_ACTION_LABELS`, `REBALANCING_ACTION_TONE_CLASSES`를 feature에서 유지(feature → entity import는 FSD 허용).

### 잔존 리스크

- Unit 8 리뷰 후속 per-stock 계산 SSOT 이관 완료 — 리스크 해소.
- `REBALANCING_ACTION_LABELS`, `REBALANCING_ACTION_TONE_CLASSES`, `REBALANCING_DISCLOSURE`는 여전히 `entities/rebalancing`에서 feature가 import. 이후 portfolio entity에 action label 상수를 이관하는 후속 정리 가능(현재는 scope 외).

### 검증 결과

| 명령 | 결과 |
| --- | --- |
| `pnpm test` | ✅ PASS (167 tests, 24 files, 0 failures) |
| `pnpm lint` | ✅ PASS |
| `pnpm typecheck` | ✅ PASS |
| `pnpm build` | ✅ PASS (195 modules, gzip JS 143.39 kB) |
| `git diff --check` | ✅ PASS |

---

## Unit 15 — 수동 자산 persistence 전환

- 작업 일자: 2026-06-03
- 작업 브랜치: main

### 변경 파일

신규:
- `src/entities/portfolio/api/manualAssetStore.ts` (ManualAssetStore 인터페이스 + in-memory 어댑터)
- `src/entities/portfolio/api/manualAssetStore.test.ts` (8개 — read/create/update/delete 커버)
- `src/entities/portfolio/api/manualAssetApi.ts` (readManualAssets, createManualAsset, updateManualAsset, deleteManualAsset)
- `src/entities/portfolio/hook/useManualAssets.ts` (useSuspenseManualAssets + create/update/delete mutation 훅)
- `src/entities/portfolio/hook/useManualAssets.test.tsx` (7개 — 조회·invalidate·실패 커버)

수정:
- `src/entities/portfolio/model/types.ts` (ManualAsset, ManualAssetPayload 추가)
- `src/entities/portfolio/index.ts` (타입·store·api·hook 전체 re-export)
- `src/features/settings-portfolio/model/types.ts` (ManualAsset 로컬 정의 제거, entity re-export로 전환)
- `src/features/settings-portfolio/model/constants.ts` (MANUAL_ASSET_LOAD_ERROR·ADD/UPDATE/DELETE 성공·실패 메시지 상수 추가)
- `src/features/settings-portfolio/ui/ManualAssetsSection.tsx` (local list state → useSuspenseManualAssets + mutation 기반 전환, 성공/실패 메시지 추가, ManualAsset 타입 직접 참조)
- `src/features/settings-portfolio/ui/SettingsPortfolioPanel.tsx` (ManualAssetsSection을 ApiQueryBoundary로 감쌈)
- `src/features/settings-portfolio/ui/SettingsPortfolioPanel.test.tsx` (수동 자산 테스트 10개로 확장: 편집·추가/수정/삭제 성공 메시지·실패 메시지 추가, resetManualAssetStore afterEach 추가)
- `src/shared/ui/FieldMessage.tsx` (success tone 추가)

### 구현 내용

- **타입 SSOT**: `ManualAsset`·`ManualAssetPayload`를 `entities/portfolio/model/types.ts`로 승격. feature는 re-export로만 유지.
- **Persistence port**: `ManualAssetStore` 인터페이스(read/create/update/delete) + `createInMemoryManualAssetStore` 어댑터. `configure`/`reset` seam으로 테스트 격리 지원.
- **Fetcher**: `manualAssetApi.ts`가 활성 store에 위임. React hook 의존 없음.
- **TanStack Query 훅**: `useSuspenseManualAssets` + 3개 mutation 훅. `onSuccess`는 invalidate만 수행. UX 메시지는 feature UI에서 처리.
- **UI 전환**: `ManualAssetsSection`이 local `assets` state 제거, query/mutation 기반으로 전환. 생성/수정/삭제 성공 시 성공 메시지 표시 후 폼 초기화. 실패 시 에러 메시지 표시, 폼 값 유지.
- **성공/실패 메시지 상수**: `features/settings-portfolio/model/constants.ts`에 ADD/UPDATE/DELETE 각각의 성공·실패 메시지 SSOT 정의.
- **Suspense 처리**: `SettingsPortfolioPanel`이 `ManualAssetsSection`을 `ApiQueryBoundary`로 감싸 로딩/에러 경계 통합.
- **FieldMessage 확장**: `shared/ui/FieldMessage`에 `success` tone 추가.

### 1차 리뷰 보완 (2026-06-03)

리뷰 C1 해소: 성공 메시지(`자산을 추가했습니다.` / `자산을 수정했습니다.` / `자산을 삭제했습니다.`) 구현 및 테스트 3개 추가. S1 해소: `handleEdit` 인자 타입을 inline에서 `ManualAsset`으로 변경. S2 해소: 메시지 문자열을 `constants.ts`로 SSOT화.

### 테스트 및 검증 결과

| 명령 | 결과 | 세부 |
| --- | --- | --- |
| `pnpm test` | ✅ PASS | 23 files / 156 tests (+3: 성공 메시지 테스트 추가) |
| `pnpm lint` | ✅ PASS | 오류·경고 없음 |
| `pnpm typecheck` | ✅ PASS | `tsc -b --noEmit` |
| `pnpm build` | ✅ PASS | 194 modules, JS gzip 143.19 kB |
| `git diff --check` | ✅ PASS | whitespace 오류 없음 |

### 잔존 리스크

- Supabase adapter 미구현 — 페이지 새로고침 시 수동 자산 데이터 유실 (in-memory 한계). Unit 17+ 에서 연동 예정.
- 수동 자산이 대시보드/리밸런싱 계산에 미반영 — Unit 16 포트폴리오 SSOT 작업에서 통합 예정.

---

## Unit 14 — 로그아웃 UI와 세션 종료 흐름

- 작업 일자: 2026-06-03
- 작업 브랜치: main

### 변경 파일

신규:
- `src/features/auth-logout/ui/LogoutButton.tsx` (로그아웃 버튼 컴포넌트)
- `src/features/auth-logout/ui/LogoutButton.test.tsx` (3개)
- `src/features/auth-logout/index.ts` (public API)

수정:
- `src/widgets/app-header/ui/AppHeader.tsx` (`showLogout` prop 추가, 우측 액션 영역에 `LogoutButton` 조건부 렌더)
- `src/widgets/app-header/ui/AppHeader.test.tsx` (Provider+Router 래핑 전환, 로그아웃 표시/미표시 테스트 2개 추가)
- `src/apps/router/AppShellLayout.tsx` (`showLogout` prop 전달)
- `src/features/index.ts` (`auth-logout` 추가)

### 구현 내용

- **`features/auth-logout/LogoutButton`**
  - `useSetAtom(clearSessionAtom)` 호출 후 `navigate(ROUTES.LOGIN)`
  - `@entities/session`의 `clearSessionAtom`, `@shared`의 `ROUTES`·`Button`만 참조 (FSD 규칙 준수)
  - 중복 클릭 side-effect 없음 (clearSession은 멱등성 보장)
- **`AppHeader`** — `showLogout?: boolean` prop 추가 (기본 false)
  - 테마 토글과 함께 우측 flex gap-2 영역에 배치
  - 로그인 화면에서는 `showLogout` 미전달 → 로그아웃 버튼 미노출
- **`AppShellLayout`** — 앱 내부 레이아웃에만 `showLogout` 전달

### 테스트 및 검증 결과

| 명령 | 결과 | 세부 |
| --- | --- | --- |
| `pnpm test` | ✅ PASS | 21 files / 134 tests (+8: LogoutButton 3, AppHeader 2 추가+기존 5 유지) |
| `pnpm lint` | ✅ PASS | 오류·경고 없음 |
| `pnpm typecheck` | ✅ PASS | `tsc -b --noEmit` |
| `pnpm build` | ✅ PASS | 191 modules, JS gzip 142.75 kB |
| `git diff --check` | ✅ PASS | whitespace 오류 없음 |

### 설계 결정

- 로그아웃은 사용자 액션 슬라이스(`features/auth-logout`)로 분리 — 재사용성·FSD 준수
- `AppHeader`에 직접 atom 구독하지 않고 `showLogout` prop으로 제어 — 헤더의 순수 조합자 역할 유지
- `/login` 화면은 `AppShellLayout` 바깥에서 렌더 → `showLogout` 미전달로 자연스럽게 미노출

---

## Unit 13 — AI 설정 상태와 무료 제안 정책 배선

- 작업 일자: 2026-06-02
- 작업 브랜치: main

### 변경 파일

신규:
- `src/entities/settings/model/types.ts` (`AiModelId`, `ApiKeyStatus`, `AiSettings` 타입 SSOT)
- `src/entities/settings/model/constants.ts` (AI 모델 옵션/기본값/API key 정책 상수 SSOT)
- `src/entities/settings/model/aiSettingsAtom.ts` (`aiSettingsAtom` + `isApiKeyConnectedAtom` + `saveApiKeyAtom` + `clearApiKeyAtom` + `setAiModelAtom`)
- `src/entities/settings/model/aiSettingsAtom.test.ts` (4개)
- `src/entities/settings/index.ts`

수정:
- `src/entities/session/model/sessionAtom.ts` (`decrementAiTrialAtom` 추가)
- `src/entities/session/model/sessionAtom.test.ts` (`decrementAiTrialAtom` 테스트 3개 추가)
- `src/features/settings-portfolio/model/types.ts` (`AiModelId`/`ApiKeyStatus`를 entities/settings 재노출로 전환)
- `src/features/settings-portfolio/model/constants.ts` (AI 관련 상수 entities/settings 재노출로 전환, SSOT 정리)
- `src/features/settings-portfolio/ui/AiSettingsSection.tsx` (`aiSettingsAtom` write 연결: 저장→`saveApiKeyAtom`, 삭제→`clearApiKeyAtom`, 모델 변경→`setAiModelAtom`)
- `src/features/settings-portfolio/ui/SettingsPortfolioPanel.test.tsx` (Jotai Provider 추가, atom wiring 테스트 3개 추가)
- `src/features/rebalancing-proposal/ui/RebalancingProposalPanel.tsx` (props 제거, `sessionAtom`·`isApiKeyConnectedAtom`·`decrementAiTrialAtom` 직접 읽기)
- `src/features/rebalancing-proposal/ui/RebalancingProposalPanel.test.tsx` (Provider+store 방식 전면 재작성, 횟수 차감 테스트 5개 추가)

### 구현 내용

- **`entities/settings` 슬라이스 신설**
  - `AiModelId`, `ApiKeyStatus`, `AiSettings` 타입 — features에서 승격, SSOT 확립
  - `aiSettingsAtom`: `{ modelId: 'gpt', isApiKeyConnected: false }` 기본값
  - `saveApiKeyAtom`: key 원문은 저장하지 않고 `isApiKeyConnected: true`만 기록(보안 정책 준수)
  - `clearApiKeyAtom`: `isApiKeyConnected: false`로 초기화
  - `setAiModelAtom`: modelId 변경 액션
- **`decrementAiTrialAtom`** (session)
  - 횟수 > 0일 때만 1 차감, 0 미만 불가, 세션 없으면 no-op
- **`RebalancingProposalPanel`** — props `isApiKeyConnected`/`aiTrialRemainingCount` 제거
  - `useAtomValue(sessionAtom)`으로 `aiTrialRemainingCount` 읽기 (세션 없으면 `DEFAULT_AI_TRIAL_COUNT` fallback)
  - `useAtomValue(isApiKeyConnectedAtom)`으로 API key 연결 상태 읽기
  - 추천 요청 시: 횟수 소진 → 팝업, API key 있으면 차감 없이 통과, 그 외 → `decrementAiTrialAtom`
- **`AiSettingsSection`** — local state 유지 + atom write 추가
  - 저장 → `saveApiKeyAtom` 호출 (전역에 연결 상태 기록), 삭제 → `clearApiKeyAtom`
  - 모델 변경 → `setAiModelAtom`
  - UI 표시 상태는 `aiSettings.isApiKeyConnected` 기준으로 결정 (local error 상태만 별도 관리)

### 테스트 및 검증 결과

| 명령 | 결과 | 세부 |
| --- | --- | --- |
| `pnpm test` | ✅ PASS | 20 files / 126 tests (+15: aiSettingsAtom 4, decrementTrial 3, rebalancing 5, settings wiring 3) |
| `pnpm lint` | ✅ PASS | 오류·경고 없음 |
| `pnpm typecheck` | ✅ PASS | `tsc -b --noEmit` |
| `pnpm build` | ✅ PASS | 189 modules, JS gzip 142.70 kB |
| `git diff --check` | ✅ PASS | whitespace 오류 없음 |

### 설계 결정

- API key 원문은 `saveApiKeyAtom`에서 받지만 저장하지 않음 — `isApiKeyConnected: true`만 기록해 보안 정책 준수
- `AiModelId`/`ApiKeyStatus`/관련 상수는 `entities/settings`로 승격 — `features/settings-portfolio`는 하위 호환 재노출
- `RebalancingProposalPanel`의 props 인터페이스에서 `isApiKeyConnected`/`aiTrialRemainingCount` 제거 — atom이 단일 진실 소스
- 세션 없는 비인증 상태 fallback: `DEFAULT_AI_TRIAL_COUNT`로 표시 (route guard로 실제로는 미도달)

### 1차 리뷰 보완 (2026-06-02, PASS WITH WARNINGS → 보완 완료)

- [W1 해소] `AiSettings`에 `maskedApiKey: string | null` 추가. `saveApiKeyAtom`에서 마스킹 값 저장, `clearApiKeyAtom`에서 null 초기화. `maskedApiKeyAtom` 파생 atom 추가. `AiSettingsSection` 로컬 `savedKey` 제거 → `maskedApiKeyAtom` 읽기 전환(재마운트 후 복원 보장). 테스트 3개 추가.
- [W2 해소] `src/entities/index.ts`에 `export * from './settings'` 추가.
- 재검증: 20 files / 129 tests / lint / typecheck / build(189 modules) / diff-check 전체 PASS.

### 남은 리스크

- API key 원문 및 마스킹 값 persistence 없음(메모리 전용) — 새로고침 시 미연결 상태로 초기화
- AI 모델 선택 persistence 없음 — 새로고침 시 GPT로 초기화
- 실제 AI API 호출 없음, 실제 key 유효성 검증 없음 (MVP 제외 범위)

---

## Unit 12 — mock session 상태와 route guard 구현

- 작업 일자: 2026-06-02
- 작업 브랜치: main

### 변경 파일

신규:
- `src/entities/session/model/sessionAtom.ts` (Jotai 전역 session atom + isAuthenticated 파생 + clearSession 액션)
- `src/entities/session/model/sessionAtom.test.ts` (기본값/저장/clear 3개)
- `src/apps/router/ProtectedRoute.tsx` (비로그인 → /login redirect 가드)
- `src/apps/router/PublicOnlyRoute.tsx` (로그인 사용자 → userStatus 기반 내부 redirect 가드)

수정:
- `src/entities/session/model/types.ts` (`Session` 인터페이스 추가)
- `src/entities/session/index.ts` (`sessionAtom` 관련 export 추가)
- `src/features/auth-login/ui/LoginForm.tsx` (로그인 성공 시 `setSession`으로 전역 session 저장)
- `src/apps/router/routes.config.tsx` (protected/public-only 가드 적용)
- `src/apps/router/router.test.tsx` (Jotai Provider 주입, 15개로 전면 갱신)

### 구현 내용

- **`Session` 타입**: `{ userStatus, aiTrialRemainingCount }` — `LoginSuccessResult`와 1:1 대응, token 없음(메모리 전용)
- **`sessionAtom`**: `atom<Session | null>(null)` — 기본값 비로그인. `isAuthenticatedAtom`(파생 read), `clearSessionAtom`(write-only 액션)
- **`ProtectedRoute`**: `sessionAtom`이 null이면 `<Navigate to="/login" replace />`, 있으면 children 렌더
- **`PublicOnlyRoute`**: 세션 있으면 `userStatus === 'new'` → `/onboarding/brokerage`, 그 외 → `/dashboard` redirect
- **`LoginForm`**: `useSetAtom(sessionAtom)`으로 로그인 성공 결과를 전역에 저장 후 navigate
- **가드 적용 경로**: `/dashboard`, `/rebalance`, `/portfolio`, `/settings`, `/onboarding/brokerage` → ProtectedRoute 래핑; `/login` → PublicOnlyRoute 래핑
- **테스트 전략**: `router.test.tsx`에서 `createStore()`로 초기 세션 상태를 주입하고 `<Provider store={store}>`로 격리. LoginForm 기존 7개 테스트는 MemoryRouter 내에서 `Provider` 미사용(sessionAtom을 직접 assertions 대상으로 삼지 않으므로 통과)

### 테스트 및 검증 결과

| 명령 | 결과 | 세부 |
| --- | --- | --- |
| `pnpm test` | ✅ PASS | 19 files / 111 tests (router +9, sessionAtom +3) |
| `pnpm lint` | ✅ PASS | 오류·경고 없음 |
| `pnpm typecheck` | ✅ PASS | `tsc -b --noEmit` |
| `pnpm build` | ✅ PASS | 185 modules, JS gzip 142.46 kB |
| `git diff --check` | ✅ PASS | whitespace 오류 없음 |

신규 테스트(router.test.tsx, 15개):
- `redirects / to /login` / `renders LoginPage at /login (비로그인)`
- 비로그인 5개 경로 각각 /login redirect (it.each)
- 로그인 상태 /dashboard: main landmark / 콘텐츠 / 내비게이션 / active 표시
- 기존 사용자 /login → /dashboard redirect
- 신규 사용자 /login → /onboarding/brokerage redirect
- 기존 사용자 로그인 → /dashboard 이동 + 세션 저장
- 신규 사용자 로그인 → /onboarding/brokerage 이동 + 세션 저장

### 설계 결정

- Jotai `createStore()`로 테스트별 atom 격리 — `Provider store={store}` 패턴으로 테스트 간 상태 누출 방지
- `LoginForm`이 `sessionAtom`을 직접 write — feature가 entity atom을 직접 참조하는 구조는 FSD에서 허용(하위 레이어 참조)
- `clearSessionAtom`은 로그아웃 액션의 seam 역할 — 로그아웃 UI 구현 시 이 액션만 호출하면 됨
- token persistence(localStorage/sessionStorage) 없음 — 새로고침 시 세션 초기화(Post-MVP 제외 범위)

### 남은 리스크

- 세션 메모리 전용 — 새로고침 시 비로그인 상태로 돌아감(token persistence 이관)
- 로그아웃 UI 미구현(clearSessionAtom seam 준비됨)
- `loginWithKakao`는 항상 `existing` 반환 — 신규 카카오 사용자 분기 없음(MVP 의도적)

---

## Unit 11 — 최종 검증, 문서 정리, 릴리즈 후보 정리

- 작업 일자: 2026-06-02
- 작업 브랜치: main
- 성격: 기능 추가 없음. Unit 0~10 산출물 통합 회귀 검증 + 문서 정합성 정리 + 릴리즈 후보 체크리스트 작성.

### 변경 파일

- `docs/WORK_LOG.md` (진행 현황 표 Unit 6~11 상태 갱신, 본 Unit 11 결과 추가)
- `docs/SESSION_STATE.md` (Unit 10 재리뷰 PASS 반영, 현재 상태/검증 결과/다음 액션 갱신)
- 코드 변경 없음 (검증만 수행 → 회귀 없음)

### 통합 회귀 검증 결과 (2026-06-02 실측)

| 명령 | 결과 | 세부 |
| --- | --- | --- |
| `pnpm test` | ✅ PASS | 18 files / 99 tests, 0 failures (4.87s) |
| `pnpm lint` | ✅ PASS | `eslint .` 오류/경고 없음 |
| `pnpm typecheck` | ✅ PASS | `tsc -b --noEmit` |
| `pnpm build` | ✅ PASS | `tsc -b && vite build`, 178 modules, JS 452.66 kB (gzip 138.53 kB), CSS 18.86 kB (gzip 4.55 kB) |
| `git diff --check` | ✅ PASS | whitespace 오류 없음 |

### 시나리오별 수동 점검 (자동 테스트 매핑)

전 시나리오가 통과하는 자동 테스트로 커버됨을 확인:

| 시나리오 | 점검 결과 | 근거 테스트 |
| --- | --- | --- |
| 로그인 성공/실패 | ✅ | `LoginForm.test.tsx` — 신규/기존 사용자 성공 라우팅, 잘못된 자격증명 실패+페이지 유지, 카카오 성공, 입력 검증 3종 (7) |
| 온보딩 연결 성공/실패 | ✅ | `BrokerageOnboardingPanel.test.tsx` — 연결 성공 완료 메시지·대시보드 이동, 실패 오류·재시도, 검색 필터, 나중에 하기 (6) |
| 대시보드 KPI/요약 | ✅ | `DashboardOverviewPanel.test.tsx` — 총 자산·전일 대비 KPI(상승/하락), 자산군 비중, 상위 보유 종목, Empty/Error (6) |
| 리밸런싱 무료 3회/팝업 | ✅ | `RebalancingProposalPanel.test.tsx` — 잔여 횟수 표시, 잔여 0 차단+연동 유도 팝업, 팝업 포커스/ESC/aria, 연동 시 차단 없음 (9) |
| 포트폴리오 테이블/CTA | ✅ | `PortfolioManagementPanel.test.tsx` — 컬럼/행, 비중 차이 +/-, AI 액션 라벨, Empty/Error, 리밸런싱 CTA 경로 (6) |
| 설정 목표 비중 저장/불러오기·API key | ✅ | `SettingsPortfolioPanel.test.tsx` — 목표 비중 저장 성공/실패(persistence port), 프리셋, 자산 CRUD, API key 마스킹/오류/삭제·aria 연결 (12) |

### 잔여 리스크 분류 (해결됨 / 미해결 / 이관)

- **해결됨**: Unit 7 W1(SPA 라우팅 CTA), Unit 8 W1(액션 톤 SSOT 승격), Unit 9 C1/C2/W1(invalidate-only·Suspense 전환·env 의존 단정 제거), Unit 10 W1(반응형 1280/1024/768 실측).
- **미해결(릴리즈 전 결정 필요)**:
  - 실제 `@supabase/supabase-js` 어댑터 미연결 — 현재 in-memory mock fallback. 목표 비중은 새로고침 시 초기화(세션 간 비영속).
  - API key/수동 자산은 컴포넌트 local state — persistence 미전환. API key는 평문 저장 금지 원칙 유지.
  - ~~route guard 미구현~~ → **[Unit 12 해소]** ProtectedRoute/PublicOnlyRoute 구현 완료.
  - mock 계정 credentials 소스 노출(MVP 의도적), 증권사 연결 실패 트리거 `'toss'` 하드코딩.
- **이관(후속 Unit)**:
  - 수동 자산/AI 설정 persistence 전환, 종목 테이블 per-stock 계산 SSOT(`MOCK_HOLDINGS`+목표 비중 결합) 이관.
  - 다크 테마 픽셀 QA(실측은 라이트 테마 기준), 중첩 다이얼로그 포커스 트랩.
  - `msw init`로 `public/mockServiceWorker.js` 생성(브라우저 MSW 실사용 전).

### 릴리즈 후보 체크리스트

코드/검증:
- [x] `pnpm test` / `lint` / `typecheck` / `build` / `git diff --check` 전체 PASS
- [x] 전 Unit(0~10) 리뷰 종결(미해결 Critical 없음)
- [x] 핵심 사용자 시나리오 6종 자동 테스트 커버
- [x] 반응형 1280/1024/768 실측(데이터 밀집 4개 화면)
- [x] 접근성: 다이얼로그 a11y·폼 aria 연결·색상 단독 표현 금지 준수

배포 전 결정 필요(미완료):
- [ ] 운영 Supabase 인스턴스/자격증명 발급 + `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` 주입 + supabase 어댑터(`createSupabaseTargetAllocationStore`) 연결 + 부트스트랩 `configureTargetAllocationStore` 배선
- [x] ~~route guard 구현 여부 결정~~ → **[Unit 12 완료]** ProtectedRoute/PublicOnlyRoute 구현
- [ ] API key 저장/보안 정책(저장 위치·암호화·폐기) 운영 기준 확정
- [ ] `public/mockServiceWorker.js` 생성(브라우저 MSW 사용 시) 또는 실제 API 연동
- [ ] mock 계정/하드코딩 실패 트리거 제거(실데이터 연동 시)
- [ ] 다크 테마 픽셀 QA, 모바일(<768) 실측 증빙

### 검증 결론

- 본 Unit 범위(검증·문서 정리)에서 코드 변경 없이 5개 필수 검증 전부 PASS.
- 미해결 항목은 모두 "MVP 데모 가능 / 운영 배포 전 결정 필요"로 분류되며, 신규 기능·대규모 리팩터링 없이 릴리즈 후보 상태 도달.

---

## Unit 10 — 접근성/반응형/상태 UI 품질 보강

- 작업 일자: 2026-06-01
- 작업 브랜치: main

### 변경 파일

신규:
- src/shared/ui/common/Modal.tsx (접근성 다이얼로그 프리미티브)

수정:
- src/shared/ui/index.ts (Modal export)
- src/shared/ui/FieldMessage.tsx (`id` prop 추가 — aria-describedby 연결용)
- src/shared/ui/MetricValue.tsx (긴 값 줄바꿈/overflow 가드: min-w-0/break-words/tabular-nums)
- src/features/rebalancing-proposal/ui/RebalancingProposalPanel.tsx (수동 다이얼로그 → Modal 적용)
- src/features/rebalancing-proposal/model/constants.ts (다이얼로그 title/description id 상수)
- src/features/rebalancing-proposal/ui/RebalancingProposalPanel.test.tsx (+3 다이얼로그 a11y 테스트)
- src/features/settings-portfolio/ui/AiSettingsSection.tsx (API key 입력 aria-invalid/aria-describedby 연결)
- src/features/settings-portfolio/model/constants.ts (`API_KEY_ERROR_ID` 상수)
- src/features/settings-portfolio/ui/SettingsPortfolioPanel.test.tsx (+1 폼 aria 연결 테스트)

### 1) 보강한 접근성 항목

- **다이얼로그 a11y (Unit 7 W2 이연분 해소)**: 공통 `Modal` 프리미티브 신설 후 API key 연동 유도 팝업에 적용
  - 열릴 때 포커스를 다이얼로그 내부 첫 포커스 요소로 이동, 닫힐 때 트리거 버튼으로 **포커스 복귀**
  - **ESC 키 닫기**, **Tab/Shift+Tab 포커스 트랩**(순환), 배경 클릭 닫기
  - `role="dialog"` + `aria-modal` + `aria-labelledby`(제목) + `aria-describedby`(설명) 연결 (기존 aria-label → labelledby/describedby로 강화)
- **폼 a11y**: API key 입력에 `aria-invalid`/`aria-describedby`로 오류 메시지(`role="alert"`, `id`) 연결. `FieldMessage`에 `id` prop 추가로 입력-메시지 연결 표준화
- **상태 색상 단독 금지 유지**: 액션/증감/차이 표현은 색상 + 텍스트 라벨 동반(기존 SSOT 유지)

### 2) 반응형/레이아웃 보강

- `MetricValue`: 큰 KPI 숫자/설명에 `min-w-0`/`break-words`/`tabular-nums` 적용 → 좁은 폭(768)에서 숫자 오버플로우 방지(대시보드/리밸런싱 시뮬레이션 카드 공통 적용)
- 다이얼로그 액션 영역 `flex-wrap`으로 버튼 줄바꿈 안정화
- 기존 구조적 반응형 가드 확인: 페이지 `max-w-*` 컨테이너, `sm:grid-cols-*` 반응형 그리드, 테이블 `overflow-x-auto`, 비교 카드 `items-stretch`+`h-full` 동일 높이

### 3) 상태 UI 일관성 기준 정리(SSOT)

- 데이터 조회(Suspense) 에러 → `ApiQueryBoundary` + `ApiErrorFallback`(**재시도 버튼 제공**)
- prop/상태 주입형 화면의 빈/에러 → `EmptyState`/`ErrorState`(재시도 없음 — 재요청 대상이 없으므로 일관)
- 폼 검증/저장 피드백 → `FieldMessage`(error=`role="alert"`, info=일반 텍스트)

### 1차 리뷰 보완 (2026-06-01, PASS WITH WARNINGS → W1 실측 검증)

- [W1 해소] 1280/1024/768 뷰포트에서 dev 서버 실측 점검 수행(Vite dev + 프리뷰). 각 화면에서 문서 가로 오버플로우(`documentElement.scrollWidth > innerWidth`) 없음, 테이블은 `overflow-x-auto` 컨테이너 내 contain, 비교 카드 동일 높이 확인:

  | 화면 | 1280 | 1024 | 768 | 비고 |
  | --- | --- | --- | --- | --- |
  | dashboard | ✅ overflow 없음 | — | — | KPI 숫자 줄바꿈 가드 정상 |
  | portfolio | — | ✅ table contained | ✅ table contained | 종목 테이블 가로 스크롤 컨테이너 내 |
  | settings | — | — | ✅ overflow 없음 | 폼 2열 그리드/입력 정상, 목표비중 suspense 로드 OK |
  | rebalance | — | ✅ 카드 동일높이 | ✅ 카드 동일높이 | 비교 카드 146px 동일, 시뮬레이션 숫자 오버플로우 없음 |

  - 점검 방식: 코드 레벨 측정(`scrollWidth/clientWidth` 비교) + 스크린샷 캡처 병행. `.claude/launch.json`에 dev 서버 구성 추가
  - 잔여: login/onboarding은 단순 레이아웃이라 구조 변경 없이 점검만(데이터 밀집 4개 화면 우선 검증)

### 테스트 및 검증 결과

- `RebalancingProposalPanel.test.tsx` +3 (포커스 이동 / ESC 닫기+포커스 복귀 / aria-labelledby·describedby)
- `SettingsPortfolioPanel.test.tsx` +1 (API key 오류 시 aria-invalid·aria-describedby 연결)

| 명령 | 결과 |
| --- | --- |
| `pnpm test` | ✅ PASS (99 tests, 18 files) |
| `pnpm lint` | ✅ PASS |
| `pnpm typecheck` | ✅ PASS |
| `pnpm build` | ✅ PASS (gzip JS 138.53 kB) |
| `git diff --check` | ✅ PASS |
| 반응형 실측(1280/1024/768) | ✅ 오버플로우 없음 |

### 남은 리스크

- 다이얼로그 포커스 트랩은 단일 Modal 기준 구현 — 중첩 다이얼로그/포털 시나리오는 현재 범위 밖
- onboarding/login 화면은 기존 구현이 이미 label/role 기준을 충족하여 본 Unit에서 구조 변경 없음(점검만)
- 실측은 라이트 테마 기준 — 다크 테마 픽셀 QA는 후속 확인 권장

---

## Unit 9 — Supabase 연동 후보 검증과 persistence 전환

- 작업 일자: 2026-06-01
- 작업 브랜치: main

### 변경 파일

신규:
- src/shared/api/supabaseClient.ts (env 기반 Supabase 설정 감지 SSOT)
- src/entities/portfolio/api/targetAllocationStore.ts (persistence port + in-memory 어댑터 + fallback 해석)
- src/entities/portfolio/api/targetAllocationStore.test.ts
- src/entities/portfolio/api/targetAllocationApi.ts (1단계 fetcher)
- src/entities/portfolio/hook/useTargetAllocation.ts (2단계 query/mutation 훅)
- src/entities/portfolio/hook/useTargetAllocation.test.tsx

수정:
- src/vite-env.d.ts (VITE_SUPABASE_URL/ANON_KEY 타입 선언 — any 회피)
- src/shared/index.ts (supabaseClient export)
- src/entities/portfolio/index.ts (api/hook/store public API 보강)
- src/features/settings-portfolio/ui/TargetAllocationSection.tsx (로컬 state → 조회/저장 훅 연동, 로딩/성공/실패 UX)
- src/features/settings-portfolio/model/constants.ts (저장/로드 메시지 상수)
- src/features/settings-portfolio/ui/SettingsPortfolioPanel.test.tsx (QueryClientProvider 래핑 + 저장 성공/실패 테스트)

### 구현 내용 (3-tier API + persistence port)

- FSD 3단계 API 원칙 준수:
  1) `entities/portfolio/api`: 순수 fetcher(`readTargetAllocation`/`saveTargetAllocation`) + persistence port(`TargetAllocationStore`)
  2) `entities/portfolio/hook`: TanStack Query 조회(`useTargetAllocationQuery`) / 변경(`useSaveTargetAllocationMutation`, 성공 시 캐시 setQueryData)
  3) `features/settings-portfolio/ui`: 훅 사용 + 로딩/성공/실패 UX 처리
- persistence port 패턴: `TargetAllocationStore` 인터페이스 + `createInMemoryTargetAllocationStore`(mock 어댑터, 현재 기본 경로) + `configure/reset`(어댑터 주입 지점)
- Supabase 설정은 `shared/api/supabaseClient`의 `isSupabaseConfigured()`(VITE_SUPABASE_URL/ANON_KEY 존재 판정)로 감지하고, **미설정 시 in-memory mock으로 fallback**

### Supabase 적용 범위 / 스키마 매핑 (SSOT)

- 적용 우선순위: **목표 비중(이번 전환 완료)** > 수동 자산 > AI 설정
- 이번 Unit 전환 대상: 목표 비중 read/update 1개 플로우
- 스키마 초안 (table `target_allocations`):
  | 컬럼 | 타입 | 매핑 |
  | --- | --- | --- |
  | `user_id` | uuid (FK auth.users) | 인증 사용자 |
  | `equity` | numeric | `TargetAllocation.equity` |
  | `bond` | numeric | `TargetAllocation.bond` |
  | `cash_and_alternative` | numeric | `TargetAllocation['cash-and-alternative']` (kebab → snake) |
  | `updated_at` | timestamptz | 갱신 시각 |
- 타입 SSOT: `entities/portfolio`의 `TargetAllocation`을 그대로 사용. Supabase row ↔ `TargetAllocation` 매핑은 supabase 어댑터 구현 시 `targetAllocationStore`에 추가
- 보안: API key 등 민감 정보 평문 저장 금지 원칙 유지(목표 비중은 민감정보 아님)

### 전환 범위 / 미전환 범위 / 리스크

- 전환: 목표 비중 저장/조회를 port 기반 persistence 경로로 이관(현재 어댑터 = in-memory mock)
- 미전환: 수동 자산, AI 설정(후속 Unit), 실제 `@supabase/supabase-js` 클라이언트 연동
- 리스크/대응:
  - 실제 Supabase 인스턴스/자격증명 부재 → env 미설정 fallback으로 안전 동작, 실연동은 supabase 어댑터 교체로 추가(코드 지점 명시됨)
  - in-memory 어댑터는 모듈 싱글톤 → 세션 간 비영속(새로고침 시 초기화). 영속화는 supabase 어댑터 연결 시 해소
  - `configureTargetAllocationStore`는 어댑터 구성 seam(앱 부트스트랩/테스트). 운영 부트스트랩 배선은 supabase 어댑터 도입 시 추가

### 1차 리뷰 보완 (2026-06-01, NOT PASS → 보완)

- [C1 해소] `useUpdateTargetAllocation`(구 `useSaveTargetAllocationMutation`)의 `onSuccess`를 `invalidateQueries`만 수행하도록 수정(setQueryData 제거). 성공/실패 UX 피드백은 features 호출부(`TargetAllocationSection`)의 `mutateAsync` try/catch + 로컬 `saveStatus`로 분리(api-error-handling §5-2 레이어 분리 준수)
- [C2 해소] 조회 훅을 `useSuspenseTargetAllocation`(`useSuspenseQuery`, 네이밍 `useSuspense{Entity}`)으로 전환. 표준 `<ApiQueryBoundary>` + `ApiErrorFallback`를 `src/shared/ui/common/ApiQueryBoundary.tsx`에 신규 스캐폴딩(첫 데이터-페칭 Unit이라 공통 프리미티브 부재 → SSOT 신설). `SettingsPortfolioPanel`에서 `TargetAllocationSection`을 바운더리로 감싸고, 로드 에러는 `ApiErrorFallback`(재시도) + `QueryErrorResetBoundary`로 처리
  - 신규: `src/shared/ui/common/ApiQueryBoundary.tsx`(+`shared/ui/index.ts` export). 조회 hydrate는 `useEffect` 제거 후 `useState(persistedAllocation)` 초기화로 단순화
- [W1 해소] `targetAllocationStore.test.ts`의 env 의존 단정(`isSupabaseConfigured()`) 제거 → 기본 fallback 어댑터의 read 동작만 검증
- 재검증: `pnpm test`(95) / `lint` / `typecheck` / `build` / `git diff --check` 전체 PASS

### 테스트 및 검증 결과

- `targetAllocationStore.test.ts` 3개 (in-memory 저장/조회 영속, seed 기본값, 미설정 fallback read)
- `useTargetAllocation.test.tsx` 3개 (suspense 조회, 저장 성공+invalidate 반영, 저장 실패 에러 상태)
- `SettingsPortfolioPanel.test.tsx` +2개 (목표 비중 저장 성공 메시지, 저장 실패 에러 메시지) — QueryClientProvider 래핑 + suspense 대기(findBy)로 갱신

| 명령 | 결과 |
| --- | --- |
| `pnpm test` | ✅ PASS (95 tests, 18 files) |
| `pnpm lint` | ✅ PASS |
| `pnpm typecheck` | ✅ PASS |
| `pnpm build` | ✅ PASS (gzip JS 138.01 kB) |
| `git diff --check` | ✅ PASS |

---

## Unit 8 — 주식 포트폴리오 관리 구현

- 작업 일자: 2026-06-01
- 작업 브랜치: main

### 변경 파일

신규:
- src/features/portfolio-management/model/constants.ts
- src/features/portfolio-management/ui/PortfolioManagementPanel.tsx
- src/features/portfolio-management/ui/PortfolioManagementPanel.test.tsx
- src/features/portfolio-management/index.ts

수정:
- src/pages/portfolio/ui/PortfolioPage.tsx (placeholder EmptyState → PortfolioManagementPanel 조합)
- src/features/index.ts (portfolio-management export 추가)

### 구현 내용

- `features/portfolio-management/PortfolioManagementPanel`: Unit 8 필수 요소 구현
  - 종목 테이블 — `table/thead/tbody`, `th scope="col"`, `caption`(sr-only)로 표 접근성 준수. 컬럼: 종목 / 현재 비중 / 목표 비중 / 차이 / AI 액션
  - 데이터 소스는 Unit 1 `MOCK_STOCK_ACTION_RECOMMENDATIONS`(종목별 현재·목표 비중 + action) 재사용 (SSOT)
  - 차이값 = 현재 − 목표를 부호(+/-) 텍스트 + 색상(`GAP_TONE_CLASSES`: over=red, under=blue)로 강조 → 색상 단독 표현 금지 준수, 소수점은 `GAP_DECIMAL_PLACES`로 정규화
  - AI 액션 라벨 — `REBALANCING_ACTION_LABELS`(매수/매도/유지) + `ACTION_TONE_CLASSES` 색상 동반
  - Empty(`status='empty'` 또는 종목 0개) → `EmptyState`, Error(`status='error'`) → `ErrorState`(role=alert)
  - 리밸런싱 이동 CTA — react-router `Link to={ROUTES.REBALANCE}` (Unit 7 제안 화면 연결)
  - `REBALANCING_DISCLOSURE` 투자 판단 보조 고지 유지
- props 주입형(status/stocks)으로 ready/empty/error 분기 테스트 가능, 기본값은 Unit 1 mock

### 테스트 및 검증 결과

`PortfolioManagementPanel.test.tsx` 6개 (컬럼·행 렌더링 / 비중 차이 +/- / AI 액션 라벨 / EmptyState / ErrorState / 리밸런싱 CTA 경로), `MemoryRouter` 래핑

| 명령 | 결과 |
| --- | --- |
| `pnpm test` | ✅ PASS (87 tests, 16 files) |
| `pnpm lint` | ✅ PASS |
| `pnpm typecheck` | ✅ PASS |
| `pnpm build` | ✅ PASS (gzip JS 133.41 kB) |
| `git diff --check` | ✅ PASS |

### 리스크 / 후속 과제

- 종목 테이블 데이터를 `MOCK_STOCK_ACTION_RECOMMENDATIONS`(리밸런싱 추천)에서 가져오므로, 향후 실제 보유 종목(`MOCK_HOLDINGS`)과 목표 비중을 결합한 per-stock 계산 SSOT로 일원화 검토 필요
- 액션 색상 톤(`ACTION_TONE_CLASSES`)이 rebalancing/portfolio feature에 중복 정의됨 → `entities/rebalancing`로 승격 검토(리뷰 W 기준 충족)

### 1차 리뷰 보완 (2026-06-01, PASS WITH WARNINGS)

- [W1 해소] 중복된 `ACTION_TONE_CLASSES`를 `entities/rebalancing`의 `REBALANCING_ACTION_TONE_CLASSES`로 승격(SSOT). `rebalancing-proposal`, `portfolio-management` 두 feature는 로컬 정의를 제거하고 `@entities/rebalancing` public API에서 import. `REBALANCING_ACTION_LABELS`와 동일 위치에 co-locate. 톤은 CSS라 테스트 비대상(테스팅 정책), 렌더링 동작 불변 → 기존 87 tests 그대로 PASS
  - 변경: `src/entities/rebalancing/model/constants.ts`(+`REBALANCING_ACTION_TONE_CLASSES`), `src/entities/rebalancing/index.ts`(export 보강), `src/features/rebalancing-proposal/{model/constants.ts, ui/RebalancingProposalPanel.tsx}`, `src/features/portfolio-management/{model/constants.ts, ui/PortfolioManagementPanel.tsx}`
- [W2 이관 계획 명시] 종목 테이블의 per-stock 목표 비중 데이터 경로 이관 계획:
  - 현재: `MOCK_STOCK_ACTION_RECOMMENDATIONS`(리밸런싱 추천 mock)의 `currentWeightPercent`/`targetWeightPercent`를 그대로 표시
  - 목표: `entities/portfolio`에 종목 단위 목표 비중 소스(예: `targetWeightByTicker` 또는 보유 종목별 목표 매핑)를 추가하고, `MOCK_HOLDINGS`의 평가액 기반 현재 비중 + 종목별 목표 비중을 결합하는 per-stock 계산 함수(`calculateHoldingWeights` 가칭)를 `entities/portfolio/model`에 SSOT로 신설
  - 패널은 계산 결과를 props로 주입받아 표시(현 props 주입형 구조 유지) → 추천 mock 의존 제거
  - 적용 시점: 보유 종목 persistence/계산 경로가 도입되는 Unit 9 범위에서 처리(리뷰 권고대로 본 Unit에서는 계획 명시까지)

---

## Unit 7 — AI 리밸런싱 제안 구현

- 작업 일자: 2026-05-31
- 작업 브랜치: main

### 변경 파일

신규:
- src/features/rebalancing-proposal/model/constants.ts
- src/features/rebalancing-proposal/ui/RebalancingProposalPanel.tsx
- src/features/rebalancing-proposal/ui/RebalancingProposalPanel.test.tsx
- src/features/rebalancing-proposal/index.ts

수정:
- src/pages/rebalance/ui/RebalancePage.tsx (placeholder EmptyState → RebalancingProposalPanel 조합)
- src/features/index.ts (rebalancing-proposal export 추가)

### 구현 내용

- `features/rebalancing-proposal/RebalancingProposalPanel`: Unit 7 필수 요소 구현
  - 제안 비교 — 현재 자산 구성 vs AI 추천 구성 2개 카드(동일 데이터 소스 `MOCK_REBALANCING_RECOMMENDATIONS`의 currentPercent/targetPercent). 카드 동일 높이는 `grid items-stretch` + Surface `h-full`로 유지
  - 추천 근거 — `MOCK_STOCK_ACTION_RECOMMENDATIONS`의 종목/액션(매수·매도·유지)/사유. 액션은 색상(`ACTION_TONE_CLASSES`) + 텍스트 라벨(`REBALANCING_ACTION_LABELS`)을 함께 표기해 색상 단독 표현 금지 규칙 준수
  - 시뮬레이션 — `MOCK_REBALANCING_SCENARIOS`의 3/6/12개월 예상 가치·수익·수익률(`MetricValue` 재사용)
  - 무료 3회 + API key 정책 — `isApiKeyConnected`/`aiTrialRemainingCount` props 주입형 분기
    - API key 미설정 + 잔여 > 0 → 무료 제안 잔여 횟수 표시
    - API key 미설정 + 잔여 0 → 제안 요청 시 차단 + API key 연동 유도 팝업(`role="dialog"`) 표시, 팝업에서 설정 화면 이동 CTA(`<a href={ROUTES.SETTINGS}>`) 제공
    - API key 연동 시 잔여 횟수 노출/차단 없이 제안 표시
  - `REBALANCING_DISCLOSURE` 투자 판단 보조 고지 문구 유지
- props 기본값은 Unit 1 mock + `DEFAULT_AI_TRIAL_COUNT`(session) → 테스트에서 정책 분기를 props 주입으로 검증
- 설계 결정: cross-feature import(FSD 위반) 회피를 위해 Unit 5 `ApiKeyStatus` 대신 `isApiKeyConnected: boolean` prop으로 디커플링

### 1차 리뷰 보완 (2026-06-01, PASS WITH WARNINGS)

- [W1 해소] 팝업 설정 이동 CTA를 `<a href>` → react-router `Link`로 교체해 SPA 내비게이션 일관성 확보. 테스트는 `MemoryRouter` 래퍼(`renderPanel` 헬퍼)로 라우터 컨텍스트 제공, `href="/settings"` 검증 유지
- [W2 이연] 다이얼로그 focus trap/ESC 닫기 등 키보드 접근성 보강은 리뷰 판단대로 Unit 10 접근성 보강 범위로 이연 (SESSION_STATE 미완료 작업 등록)

### 테스트 및 검증 결과

`RebalancingProposalPanel.test.tsx` 6개 (제안 비교 / 추천 근거 / 시뮬레이션 / 잔여 횟수 표시 / 잔여 0 차단·팝업 / 연동 시 차단 없음), `MemoryRouter` 래핑

| 명령 | 결과 |
| --- | --- |
| `pnpm test` | ✅ PASS (81 tests, 15 files) |
| `pnpm lint` | ✅ PASS |
| `pnpm typecheck` | ✅ PASS |
| `pnpm build` | ✅ PASS (gzip JS 132.83 kB) |
| `git diff --check` | ✅ PASS |

---

## Unit 6 — 포트폴리오 대시보드 구현

- 작업 일자: 2026-05-31
- 작업 브랜치: main

### 변경 파일

신규:
- src/features/dashboard-overview/model/types.ts
- src/features/dashboard-overview/model/constants.ts
- src/features/dashboard-overview/ui/DashboardOverviewPanel.tsx
- src/features/dashboard-overview/ui/DashboardOverviewPanel.test.tsx
- src/features/dashboard-overview/index.ts
- src/shared/ui/ErrorState.tsx (에러 상태 공통 프리미티브, role="alert")

수정:
- src/pages/dashboard/ui/DashboardPage.tsx (placeholder → DashboardOverviewPanel 조합)
- src/features/index.ts (dashboard-overview export 추가)
- src/shared/ui/index.ts (ErrorState export 추가)
- src/entities/portfolio/model/constants.ts (ALLOCATION_GROUP_LABELS 승격)
- src/entities/portfolio/index.ts (ALLOCATION_GROUP_LABELS export)
- src/features/settings-portfolio/model/constants.ts (라벨 로컬 정의 → entities 재노출로 SSOT 통일)
- src/apps/router/router.test.tsx (대시보드 콘텐츠 검증을 신규 UI 기준으로 갱신)

### 구현 내용

- `features/dashboard-overview/DashboardOverviewPanel`: 6개 필수 요소 구현
  - 총 자산 가치 KPI (`MetricValue` 재사용)
  - 전일 대비 증감액/증감률 KPI — 상승/하락/보합을 색상 + 텍스트 라벨 + 기호로 동시 표현
  - 자산군 비중 요약 (`MOCK_PORTFOLIO_SUMMARY.breakdown` 재사용)
  - 주요 보유 종목 (평가액 = 수량×현재가 상위 `TOP_HOLDINGS_COUNT`개)
  - AI 포트폴리오 진단 요약 + `REBALANCING_DISCLOSURE` 투자 판단 보조 고지 유지
  - 빈 데이터(`holdings` empty 또는 `status='empty'`) → `EmptyState`, `status='error'` → `ErrorState`
- 패널은 props(status/holdings/summary/previousTotalValue/diagnosisSummary)로 상태 주입 가능, 기본값은 Unit 1 mock — 테스트에서 ready/empty/error 분기 검증
- SSOT 정리: `ALLOCATION_GROUP_LABELS`를 `entities/portfolio`로 승격하고 `settings-portfolio`는 재노출로 전환(중복 제거)
- 전일 대비 baseline은 대시보드 전용 표시 데이터라 feature-local mock(`MOCK_PREVIOUS_TOTAL_VALUE`)으로 유지

### 테스트 및 검증 결과

| 명령 | 결과 |
| --- | --- |
| `pnpm test` | ✅ PASS (74 tests, 14 files) |
| `pnpm lint` | ✅ PASS |
| `pnpm typecheck` | ✅ PASS |
| `pnpm build` | ✅ PASS (build 성공) |
| `git diff --check` | ✅ PASS |

### 유틸 승격 기준 (리뷰 W1 반영)

- `DashboardOverviewPanel`의 `formatKrw`(통화 포맷), `resolveDirection`(증감 방향), `getHoldingValue`(평가액=수량×현재가)는 현재 대시보드 전용 컴포넌트 로컬 유틸로 유지한다.
- **승격 기준**: 동일 로직이 서로 다른 슬라이스에서 **3회 이상** 필요해지면 아래로 승격한다.
  - 순수 도메인 계산(`getHoldingValue` 등) → `entities/portfolio/model` (Unit 1 계산 함수 패턴, 테스트 동반)
  - 표시 포맷(`formatKrw`, 증감 표기 등) → `shared/lib`
- Unit 7(AI 리밸런싱)·Unit 8(주식 관리)에서 동일 포맷/계산 재사용이 발생하면 이 기준에 따라 즉시 승격한다.

### 코드 리뷰 반영 내역 (2026-05-31, Unit 6 1차 리뷰 PASS WITH WARNINGS)

| 분류 | 내용 | 처리 |
| --- | --- | --- |
| Warning W1 | 컴포넌트 로컬 유틸(formatKrw/resolveDirection/getHoldingValue) 재사용 기준 부재 | 위 "유틸 승격 기준" 섹션에 3회 이상 중복 시 승격 규칙 문서화 |
| Warning W2 | KPI 테스트가 기본 mock 값에 고정 | 데이터 주입형 테스트 추가(커스텀 summary/previousTotalValue로 하락 KPI 검증) |

### 남은 리스크

- 대시보드 데이터가 Unit 1 mock에 고정 — 실제 보유 자산/시세 연동은 Unit 9 이후
- 전일 대비 baseline이 feature-local mock 상수 — 실데이터 전환 시 entities 또는 API로 이동 필요
- AI 진단 요약이 정적 mock 문구 — 실제 AI 호출은 Unit 7 범위
- 빈/에러 상태는 props 주입으로만 진입 — 실제 fetch 상태 연동은 후속

### GPT 리뷰 요청 포인트

1. `ALLOCATION_GROUP_LABELS`를 `entities/portfolio`로 승격하고 settings-portfolio를 재노출로 바꾼 SSOT 정리의 적절성
2. 전일 대비 baseline을 entities가 아닌 dashboard feature-local mock으로 둔 결정 (단일 feature 전용 판단)
3. 패널을 props 주입형으로 설계해 상태(ready/empty/error)를 외부에서 제어하는 구조
4. `ErrorState` 공통 프리미티브의 책임 범위(`role="alert"` + title/description/action)

---

## Unit 5 — 수동 자산 입력과 목표 비중 설정 구현

- 작업 일자: 2026-05-31
- 작업 브랜치: main

### 변경 파일

신규:
- src/features/settings-portfolio/model/types.ts
- src/features/settings-portfolio/model/constants.ts
- src/features/settings-portfolio/ui/ManualAssetsSection.tsx
- src/features/settings-portfolio/ui/TargetAllocationSection.tsx
- src/features/settings-portfolio/ui/AiSettingsSection.tsx
- src/features/settings-portfolio/ui/SettingsPortfolioPanel.tsx
- src/features/settings-portfolio/ui/SettingsPortfolioPanel.test.tsx
- src/features/settings-portfolio/index.ts
- src/shared/ui/FieldMessage.tsx (리뷰 W2 보완: 공통 피드백 메시지 프리미티브)

수정:
- src/pages/settings/ui/SettingsPage.tsx (placeholder → SettingsPortfolioPanel 조합)
- src/features/index.ts (settings-portfolio export 추가)
- src/shared/ui/index.ts (FieldMessage export 추가)

### 구현 내용

- `features/settings-portfolio`를 3개 독립 섹션으로 분리(상태 비공유, 각 섹션 local state 소유):
  - `ManualAssetsSection`: 티커/종목명/수량/평균단가 추가 폼, 필수값 검증, 목록 렌더링, 편집/삭제 CRUD
  - `TargetAllocationSection`: 주식/채권/현금 및 기타 비중 입력, 합계 100% 검증, 공격형/중립형/방어형 프리셋(Unit 1 `applyInvestmentPreset`·`INVESTMENT_PRESET_ALLOCATIONS` SSOT 재사용)
  - `AiSettingsSection`: GPT/Gemini/Claude 라디오 선택, API key 입력·저장·수정·삭제, 마스킹 표시(끝 4자리만 노출), 미설정/연동됨/오류 상태 텍스트
- feature-local `model/constants.ts`·`model/types.ts`: AI 모델 옵션, API key 상태 라벨, 자산군/프리셋 라벨 등 매직 스트링을 상수로 분리
- `pages/settings`: AppShell 내부에서 패널 렌더링
- 접근성: form/section `aria-label`, 비중 입력 `aria-label`, API key 상태를 색상이 아닌 텍스트로 전달, 오류 `role="alert"`

### 테스트 및 검증 결과

| 명령 | 결과 |
| --- | --- |
| `pnpm test` | ✅ PASS (69 tests, 13 files) |
| `pnpm lint` | ✅ PASS |
| `pnpm typecheck` | ✅ PASS |
| `pnpm build` | ✅ PASS (158 modules) |
| `git diff --check` | ✅ PASS |

### 코드 리뷰 반영 내역 (2026-05-31, Unit 5 1차 리뷰 PASS WITH WARNINGS)

| 분류 | 내용 | 처리 |
| --- | --- | --- |
| Warning W2 | 섹션 간 에러/상태 텍스트의 `role="alert"` 적용 기준 불일치 | `shared/ui/FieldMessage` 프리미티브 신설(tone: error→role="alert", info→일반 텍스트). 3개 섹션의 인라인 에러/검증 메시지를 모두 FieldMessage로 통일. AI 상태값에 `aria-live="polite"` 추가 |
| Warning W1 | API key 저장 위치/마스킹/삭제 정책 SSOT 미고정 | 후속 처리 — Unit 6 착수 전 `PROJECT_GUIDE.md`에 정책 확정 (SESSION_STATE 미완료 작업 등록) |

### 남은 리스크

- 수동 자산·설정 값이 컴포넌트 local state에만 존재 — 페이지 이탈 시 소실 (Unit 9 persistence에서 처리)
- API key 오류 상태는 길이(최소 8자) 기준 mock 검증 — 실제 유효성 네트워크 검증은 범위 외(Unit 9)
- 목표 비중은 합계 검증만 제공하고 자동 보정은 미구현 (의도적 선택)
- 수동 자산과 목표 비중·진단 연계(계산 반영)는 Unit 6 대시보드/Unit 7에서 통합

### GPT 리뷰 요청 포인트

1. AI 모델/API key 개념을 `entities/settings` 슬라이스 대신 feature-local `model/`에 둔 결정의 적절성
2. 패널을 3개 섹션으로 분리하고 각 섹션이 독립 local state를 소유한 구조
3. 수동 자산 폼을 RHF 대신 useState 기반으로 구현한 선택(편집 in-place 제어 목적)
4. API key 오류 트리거를 길이 기준 mock 검증으로 둔 방식

---

## Unit 4 — 증권사 연동 온보딩과 mock 연결 상태 구현

- 작업 일자: 2026-05-31
- 작업 브랜치: main

### 변경 파일

신규:
- src/entities/brokerage/api/connectBrokerage.ts
- src/features/brokerage-onboarding/ui/BrokerageOnboardingPanel.tsx
- src/features/brokerage-onboarding/ui/BrokerageOnboardingPanel.test.tsx
- src/features/brokerage-onboarding/index.ts

수정:
- src/entities/brokerage/model/types.ts (ConnectBrokerageResult 추가)
- src/entities/brokerage/model/constants.ts (BROKERAGE_ONBOARDING_STEPS, BROKERAGE_CONNECTION_ERROR_MESSAGE 추가)
- src/entities/brokerage/index.ts (connectBrokerage, 신규 타입/상수 export 추가)
- src/features/index.ts (brokerage-onboarding export 추가)
- src/pages/onboarding-brokerage/ui/OnboardingBrokeragePage.tsx (placeholder → BrokerageOnboardingPanel 조합)

### 구현 내용

- `entities/brokerage`: `connectBrokerage` in-memory mock async 함수 (Unit 3 `loginWithEmail` 패턴 답습). 토스증권은 항상 실패(인증 토큰 만료 재현), 나머지는 성공. `ConnectBrokerageResult` 타입, 온보딩 3단계 라벨/오류 메시지 상수 추가
- `features/brokerage-onboarding/BrokerageOnboardingPanel`: 3단계 진행 표시(상태→단계 매핑), 증권사 검색 로컬 필터, 4개 증권사 카드(이름·지원기능·인기 배지·연결 버튼), `idle|connecting|connected|failed` 상태 머신, 성공 시 완료 메시지+대시보드 이동, 실패 시 role="alert" 오류+재시도, `나중에 하기` 대시보드 라우팅, 보안 배지 3종
- `pages/onboarding-brokerage`: AppShell 내부에서 패널 렌더링
- 접근성: 단계 `aria-current="step"`, 연결 버튼 `aria-label="{증권사명} 연결하기"`, 상태를 색상이 아닌 텍스트/아이콘으로 전달

### 테스트 및 검증 결과

| 명령 | 결과 |
| --- | --- |
| `pnpm test` | ✅ PASS (60 tests, 12 files) |
| `pnpm lint` | ✅ PASS |
| `pnpm typecheck` | ✅ PASS |
| `pnpm build` | ✅ PASS (145 modules) |
| `git diff --check` | ✅ PASS |

### 남은 리스크

- 연결 실패 트리거가 providerId 하드코딩('toss')에 의존 — 실제 API 연동(Unit 9) 시 교체 필요
- connecting 상태에 인위적 지연이 없어 실제 네트워크 지연 UX는 미검증 (Unit 10 품질 보강에서 처리 검토)
- route guard 미구현으로 온보딩 우회 가능 (Unit 4 범위 외, 후속 처리)

### GPT 리뷰 요청 포인트

1. mock connect 함수를 `entities/brokerage/api`에 둔 위치 결정의 적절성 (feature 내 배치 대비)
2. 상태 머신을 `idle|connecting|connected|failed` 단순 enum + 단일 selectedProvider로 관리한 구조
3. 3단계 진행 표시를 연결 상태에 매핑(STATUS_STEP_INDEX)한 방식의 직관성

---

## Unit 3 — 인증 UI와 mock 로그인 플로우 구현

- 작업 일자: 2026-05-28
- 작업 브랜치: feature/unit3-auth-login

### 변경 파일

신규:
- src/entities/session/model/types.ts
- src/entities/session/model/constants.ts
- src/entities/session/model/mockSession.ts
- src/entities/session/api/login.ts
- src/entities/session/index.ts
- src/features/auth-login/ui/LoginForm.tsx
- src/features/auth-login/ui/LoginForm.test.tsx
- src/features/auth-login/index.ts

수정:
- src/entities/index.ts (session export 추가)
- src/features/index.ts (auth-login export 추가)
- src/pages/login/ui/LoginPage.tsx (5:5 레이아웃 + LoginForm 조합)

### 구현 내용

- `entities/session` 슬라이스: UserStatus/LoginResult discriminated union, MockAccount 타입, LOGIN_ERROR_MESSAGES 상수, MOCK_ACCOUNTS fixture (신규/기존 사용자), loginWithEmail/loginWithKakao in-memory 순수 async 함수
- `features/auth-login/LoginForm`: RHF native validate + zod safeParse 조합 (resolvers 없음), useNavigate 라우팅 분기, 별도 isKakaoLoading 상태, isFormDisabled 동시 제출 방지, role="alert" 접근성
- `pages/login/LoginPage`: flex min-h-screen 5:5 분할 레이아웃, 브랜딩 패널(h1, 특징 목록, 투자 고지), 폼 패널(LoginForm, 보안 안내)

### 테스트 및 검증 결과

| 명령 | 결과 |
| --- | --- |
| `pnpm test` | ✅ PASS (53 tests, 11 files) |
| `pnpm lint` | ✅ PASS |
| `pnpm typecheck` | ✅ PASS |
| `pnpm build` | ✅ PASS (139 modules) |
| `git diff --check` | ✅ PASS |

### 남은 리스크

- mock 계정 credentials이 소스 코드에 노출됨 (MVP 범위 내 의도적 결정)
- route guard 미구현: 인증 없이 /dashboard 직접 접근 가능 (Unit 4 이후 처리)
- loginWithKakao는 항상 기존 사용자 반환 (신규 카카오 사용자 시나리오 미지원)

### GPT 리뷰 요청 포인트

1. entities/session public API 범위 적절성 (MOCK_ACCOUNTS fixture 외부 노출 여부)
2. loginWithKakao가 항상 'existing' 반환하는 것이 Unit 3 범위 내 적합한지
3. LoginForm에서 useNavigate 직접 사용 vs onLoginSuccess prop 패턴 선택 근거

---

# Work Log — 작업 결과 로그

## 0. 운영 규칙

- Claude Code는 단위 작업 완료 시 이 문서 상단에 결과를 추가한다.
- 변경 파일, 구현 내용, 검증 결과, 남은 리스크를 기록한다.
- 기존 오류와 신규 오류를 구분해 기록한다.
- 리뷰 결과 자체는 `REVIEW_LOG.md`에 기록한다.
- 진행 현황 표는 Unit 상태가 바뀔 때 함께 갱신한다.

## 1. 진행 현황

| Unit | 상태 | 담당 | 리뷰 상태 | 비고 |
| --- | --- | --- | --- | --- |
| Unit 0 — 프로젝트 스캐폴딩과 개발 도구 구성 | DONE | Claude Code | PASS WITH WARNINGS | 2026-05-26 GPT 재리뷰 통과 |
| Unit 1 — 도메인 모델, 상수, mock 데이터, 계산 로직 SSOT 구축 | DONE | Claude Code | PASS WITH WARNINGS | 2026-05-27 GPT 재리뷰 통과 |
| Unit 2 — 공통 앱 쉘, 라우팅, 테마, 레이아웃 기반 구축 | DONE | Claude Code | PASS WITH WARNINGS | 2026-05-28 GPT 3차 리뷰 통과 |
| Unit 3 — 인증 UI와 mock 로그인 플로우 구현 | DONE | Claude Code | 완료 | 2026-05-28 main 병합 완료 |
| Unit 4 — 증권사 연동 온보딩과 mock 연결 상태 구현 | DONE | Claude Code | 완료 | 2026-05-31 main 병합 완료 |
| Unit 5 — 수동 자산 입력과 목표 비중 설정 구현 | DONE | Claude Code | PASS WITH WARNINGS | 2026-05-31 GPT 2차 리뷰 통과, main 병합 |
| Unit 6 — 포트폴리오 대시보드 구현 | DONE | Claude Code | PASS WITH WARNINGS | 2026-05-31 1차 리뷰 통과(W1/W2 반영) |
| Unit 7 — AI 리밸런싱 제안 구현 | DONE | Claude Code | PASS WITH WARNINGS | 2026-06-01 1차 리뷰 통과(W1 해소, W2 Unit 10 이연) |
| Unit 8 — 주식 포트폴리오 관리 구현 | DONE | Claude Code | PASS | 2026-06-01 2차 재리뷰 통과 |
| Unit 9 — Supabase 연동 후보 검증과 persistence 전환 | DONE | Claude Code | PASS | 2026-06-01 2차 재리뷰 통과 |
| Unit 10 — 접근성, 반응형, 에러/빈 상태 품질 보강 | DONE | Claude Code | PASS | 2026-06-01 2차 재리뷰 통과 |
| Unit 11 — 최종 검증, 문서 정리, 릴리즈 후보 정리 | DONE | Claude Code | PASS | 2026-06-02 GPT 1차 리뷰 통과 |
| Unit 12 — mock session 상태와 route guard 구현 | DONE | Claude Code | PASS WITH WARNINGS | 2026-06-02 GPT 1차 리뷰 통과 |
| Unit 13 — AI 설정 상태와 무료 제안 정책 배선 | DONE | Claude Code | PASS | 2026-06-02 GPT 2차 재리뷰 통과, 20 files / 129 tests PASS |

## 2. 단위 작업 결과

---

### Unit 2 — 공통 앱 쉘, 라우팅, 테마, 레이아웃 기반 구축

- **작업 일자**: 2026-05-28
- **작업 단위명**: Unit 2 — 공통 앱 쉘, 라우팅, 테마, 레이아웃 기반 구축
- **작업 브랜치**: `main`

#### 변경 파일

**신규 생성**

| 파일 | 설명 |
| --- | --- |
| `src/shared/config/navigation.ts` | NAV_ITEMS 배열 (5개 메뉴, NavItem 타입) |
| `src/shared/config/theme.ts` | Theme 타입, DEFAULT_THEME 상수 |
| `src/shared/lib/useTheme.ts` | light/dark 토글 훅, documentElement class 적용 |
| `src/shared/lib/index.ts` | shared/lib 레이어 public API |
| `src/shared/lib/useTheme.test.ts` | useTheme 훅 3개 테스트 (초기값, dark 적용, 복귀) |
| `src/shared/ui/Button.tsx` | primary/secondary/ghost variant 버튼 |
| `src/shared/ui/Surface.tsx` | 카드/패널용 as=section or div 래퍼 |
| `src/shared/ui/MetricValue.tsx` | label, value, optional description 표시 컴포넌트 |
| `src/shared/ui/EmptyState.tsx` | title, description, optional action 영역 |
| `src/shared/ui/index.ts` | shared/ui 레이어 public API |
| `src/widgets/app-header/ui/AppHeader.tsx` | 페이지 title, 설명, 테마 토글 버튼 포함 헤더 |
| `src/widgets/app-header/ui/AppHeader.test.tsx` | AppHeader 5개 테스트 (title, description, aria-pressed, toggle) |
| `src/widgets/app-header/index.ts` | app-header slice public API |
| `src/widgets/app-sidebar/ui/AppSidebar.tsx` | 5개 nav link, useLocation으로 aria-current 적용 |
| `src/widgets/app-sidebar/ui/AppSidebar.test.tsx` | AppSidebar 4개 테스트 (렌더링, active, inactive, 경로 변경) |
| `src/widgets/app-sidebar/index.ts` | app-sidebar slice public API |
| `src/widgets/app-shell/ui/AppShell.tsx` | skip link, header/sidebar slot, main#main-content 레이아웃 (slot 패턴, sibling import 없음) |
| `src/widgets/app-shell/index.ts` | app-shell slice public API |
| `src/pages/login/ui/LoginPage.tsx` | 로그인 placeholder |
| `src/pages/login/index.ts` | login slice public API |
| `src/pages/dashboard/ui/DashboardPage.tsx` | 대시보드 placeholder |
| `src/pages/dashboard/index.ts` | dashboard slice public API |
| `src/pages/onboarding-brokerage/ui/OnboardingBrokeragePage.tsx` | 증권사 연동 placeholder |
| `src/pages/onboarding-brokerage/index.ts` | onboarding-brokerage slice public API |
| `src/pages/rebalance/ui/RebalancePage.tsx` | 리밸런싱 placeholder |
| `src/pages/rebalance/index.ts` | rebalance slice public API |
| `src/pages/portfolio/ui/PortfolioPage.tsx` | 포트폴리오 placeholder |
| `src/pages/portfolio/index.ts` | portfolio slice public API |
| `src/pages/settings/ui/SettingsPage.tsx` | 설정 placeholder |
| `src/pages/settings/index.ts` | settings slice public API |
| `src/apps/router/router.test.tsx` | 라우터 통합 테스트 6개 (/ redirect, login, main landmark, nav, aria-current) |

**수정**

| 파일 | 설명 |
| --- | --- |
| `src/shared/index.ts` | navigation, theme, lib, ui re-export 추가 |
| `src/widgets/index.ts` | app-header, app-shell, app-sidebar re-export 추가 |
| `src/pages/index.ts` | 6개 page slice re-export 추가 |
| `src/apps/router/index.tsx` | inline placeholder → page slice + AppShell 레이아웃 조합 구조로 전환 |

#### 구현 내용

- **라우팅**: `/` → `/login` redirect, `/login` 단독 레이아웃, 5개 내부 화면은 AppShell children로 렌더링
- **AppShell**: 접근성 skip link("본문으로 건너뛰기"), AppHeader + AppSidebar + `<main id="main-content">` 조합
- **AppSidebar**: useLocation 기반 active 감지, aria-current="page" 적용, max-lg 수평 배치
- **AppHeader**: title + optional description + 테마 토글 버튼 (aria-pressed, 텍스트 레이블)
- **useTheme**: useState(light) + useEffect → documentElement.classList.toggle('dark')
- **Shared UI**: Button(3 variant), Surface(as prop), MetricValue, EmptyState — 모두 className override 지원
- **FSD 레이어 준수**: shared ← widgets ← pages ← apps/router 방향 유지; @shared/*, @widgets/* 경유 import

#### 테스트 및 검증 결과 (초기 구현)

| 명령 | 결과 | 비고 |
| --- | --- | --- |
| `pnpm test` | ✅ PASS | 10 test files, 46 tests passed |
| `pnpm lint` | ✅ PASS | 오류 없음 |
| `pnpm typecheck` | ✅ PASS | `tsc -b --noEmit` |
| `pnpm build` | ✅ PASS | dist 322KB (gzip 102KB) |
| `git diff --check` | ✅ PASS | whitespace 오류 없음 |

#### GPT Critical 보완 내역 (2026-05-28)

| 분류 | 내용 | 처리 |
| --- | --- | --- |
| C1 | AppShell이 sibling widget(app-header, app-sidebar)을 직접 import — FSD 위반 | AppShell을 slot 패턴(header/sidebar/children)으로 변경; AppShellLayout.tsx 분리; useTheme+AppHeader+AppSidebar 조합을 apps/router로 이동 |
| C2 | 외부 레이어에서 `@shared/config/*`, `@shared/lib/useTheme` deep import | widgets는 `@shared` 공개 API 경유로 수정; shared 내부는 상대 경로(`../config/theme`) 사용 |
| C3 | router.test.tsx가 실제 APP_ROUTES 미사용, `/` redirect 테스트 누락 | APP_ROUTES를 routes.config.tsx로 분리 export; router.test.tsx에서 import 재사용; `/` → `/login` redirect 테스트 추가 |
| W1 | PAGE_TITLES가 navigation.ts와 분리 — SSOT 위반 | NavItem에 description 필드 추가; NAV_ITEMS에 통합; AppShellLayout에서 navItem 조회로 대체 |
| W2 | React 컴포넌트가 function 선언 — 프로젝트 규칙 위반 | 모든 컴포넌트를 화살표 함수 패턴으로 변환 |

#### 테스트 및 검증 결과 (GPT Critical 보완 후)

| 명령 | 결과 | 비고 |
| --- | --- | --- |
| `pnpm test` | ✅ PASS | 10 test files, 47 tests passed (redirect 테스트 +1) |
| `pnpm lint` | ✅ PASS | 오류/경고 없음 |
| `pnpm typecheck` | ✅ PASS | `tsc -b --noEmit` |
| `pnpm build` | ✅ PASS | dist 322KB (gzip 102KB) |
| `git diff --check` | ✅ PASS | whitespace 오류 없음 |

#### 남은 리스크

| 리스크 | 설명 | 대응 |
| --- | --- | --- |
| 반응형 사이드바 | max-lg CSS 처리만 있고 실제 모바일 overflow 테스트 미검증 | Unit 10 반응형 보강 단계에서 처리 |
| theme persistence 미구현 | localStorage 저장 미포함 (Unit 2 의도적 제외) | Unit 3 또는 Unit 5에서 sessionStorage/localStorage 도입 검토 |

#### 리뷰 요청 포인트

- `useTheme`가 AppShellLayout에 직접 들어있어 layout이 theme state를 소유하는 구조 — Unit 3 인증 컨텍스트 추가 시 theme provider 분리 필요 여부
- router.test.tsx가 `createMemoryRouter`로 실제 page 컴포넌트를 마운트하는 통합 방식 — 향후 테스트 속도 관리 여부

---

### Unit 1 — 도메인 모델, 상수, mock 데이터, 계산 로직 SSOT 구축

- **작업 일자**: 2026-05-27
- **작업 단위명**: Unit 1 — 도메인 모델, 상수, mock 데이터, 계산 로직 SSOT 구축
- **작업 브랜치**: `main`

#### 변경 파일

**신규 생성**

| 파일 | 설명 |
| --- | --- |
| `src/entities/portfolio/model/types.ts` | CurrencyCode, AssetType, AllocationGroup 등 portfolio 도메인 타입 |
| `src/entities/portfolio/model/constants.ts` | BASE_CURRENCY_CODE, INVESTMENT_PRESET_ALLOCATIONS 등 portfolio 상수 |
| `src/entities/portfolio/model/mockPortfolio.ts` | 5종목 mock holdings, mock 목표 비중, mock portfolio summary |
| `src/entities/portfolio/model/calculatePortfolioSummary.ts` | 총 평가액 및 자산군별 비중 계산 순수 함수 |
| `src/entities/portfolio/model/calculatePortfolioSummary.test.ts` | calculatePortfolioSummary 6개 테스트 |
| `src/entities/portfolio/model/calculateAllocationGap.ts` | 목표 비중 차이 및 리밸런싱 액션 계산 순수 함수 |
| `src/entities/portfolio/model/calculateAllocationGap.test.ts` | calculateAllocationGap 6개 테스트 |
| `src/entities/portfolio/model/applyInvestmentPreset.ts` | 투자 성향 프리셋 목표 비중 반환 순수 함수 |
| `src/entities/portfolio/model/applyInvestmentPreset.test.ts` | applyInvestmentPreset 4개 테스트 (3개 프리셋 합계 100%) |
| `src/entities/portfolio/model/calculateExpectedValue.ts` | 기간별 복리 예상 자산 가치 계산 순수 함수 |
| `src/entities/portfolio/model/calculateExpectedValue.test.ts` | calculateExpectedValue 6개 테스트 (3/6/12개월) |
| `src/entities/portfolio/index.ts` | portfolio slice public API |
| `src/entities/brokerage/model/types.ts` | BrokerageProvider, BrokerageAccount 등 brokerage 도메인 타입 |
| `src/entities/brokerage/model/constants.ts` | 4개 증권사 BROKERAGE_PROVIDERS, SECURITY_BADGES 상수 |
| `src/entities/brokerage/model/mockBrokerages.ts` | 연결완료(키움) + 실패(토스) mock 계좌 2개 |
| `src/entities/brokerage/index.ts` | brokerage slice public API |
| `src/entities/rebalancing/model/types.ts` | RebalancingAction, RebalancingRecommendationItem 등 rebalancing 타입 |
| `src/entities/rebalancing/model/constants.ts` | 액션/사유 레이블, 투자 판단 고지 문구 |
| `src/entities/rebalancing/model/mockRecommendations.ts` | 자산군 추천 3개, 종목 추천 5개, 3/6/12개월 시나리오 mock |
| `src/entities/rebalancing/index.ts` | rebalancing slice public API |

**수정**

| 파일 | 설명 |
| --- | --- |
| `src/entities/index.ts` | 3개 entity slice re-export 추가 |
| `index.html` | Unit 0 Warning: `<meta>` 태그 들여쓰기 정리 |

#### 구현 내용

- **FSD 레이어 준수**: `entities`는 `shared`만 참조, slice 간 cross-import 없음
- **순수 계산 함수 4개**: `calculatePortfolioSummary`, `calculateAllocationGap`, `applyInvestmentPreset`, `calculateExpectedValue`
- **도메인 정책 구현**: 비중 소수점 2자리, 허용 오차 0.5%p, 복리 계산, KRW 기준
- **mock 데이터**: 총 20,000,000 KRW 포트폴리오 (삼성전자·SK하이닉스·KODEX200·국고채·MMF)
- **투자 고지 문구**: `REBALANCING_DISCLOSURE`에 포함, mock 추천 데이터에서 참조
- **타입 안전성**: `any` 미사용, literal union type 기반 상수 참조

#### 테스트 및 검증 결과

| 명령 | 결과 | 비고 |
| --- | --- | --- |
| `pnpm test` | ✅ PASS | 6 test files, 29 tests passed (GPT 재보완 후) |
| `pnpm lint` | ✅ PASS | 오류 없음 |
| `pnpm typecheck` | ✅ PASS | `tsc -b --noEmit` |
| `pnpm build` | ✅ PASS | dist 316KB (gzip 100KB) |
| `git diff --check` | ✅ PASS | whitespace 오류 없음 |

#### 남은 리스크

| 리스크 | 설명 | 대응 |
| --- | --- | --- |
| `AllocationGroup` 타입 중복 | rebalancing types.ts에 로컬 타입 선언으로 cross-import 회피함. 구조적 타입 호환은 되지만 공식 공유 타입이 아님 | Unit 5+ 에서 공유 필요성 확인 시 `shared/types`로 이동 검토 |
| mock 데이터 정합성 | `MOCK_PORTFOLIO_SUMMARY`의 값은 `MOCK_HOLDINGS`를 직접 계산하지 않고 하드코딩됨 | `calculatePortfolioSummary.test.ts`에 정합성 가드 테스트 추가로 방어 |
| `entities/index.ts` export * | 슬라이스 증가 시 이름 충돌 가능성 | Unit 5+ 에서 슬라이스 추가 시 충돌 여부 모니터링 |

#### 코드 리뷰 반영 내역 (2026-05-27)

| 분류 | 내용 | 처리 |
| --- | --- | --- |
| Critical (1차) | `MOCK_REBALANCING_SCENARIOS` 수치가 `calculateExpectedValue` 공식과 불일치 | 수정 완료 (6% 연수익, 2천만 기준 정확한 복리 계산값 적용) |
| Important (1차) | KODEX 200 `action: 'hold'` vs gapPercent +2.5%p 모순 | `action: 'buy'`로 수정 |
| Important (1차) | `MOCK_PORTFOLIO_SUMMARY`와 `MOCK_HOLDINGS` 정합성 가드 테스트 미비 | `calculatePortfolioSummary.test.ts`에 정합성 검증 테스트 추가 |
| Critical (GPT) | 삼성전자 `action: 'hold'` vs gap -4%p 모순 (허용 오차 0.5%p 초과) | `action: 'sell'`, `reasonSummary` 수정 |
| GPT 보완 지시 | 종목 단위 mock action 정합성 테스트 추가 | `mockRecommendations.test.ts` 신규 생성 (3개 테스트) |
| GPT 보완 지시 | `index.html` charset meta 태그 들여쓰기 8칸 오류 | 4칸으로 수정 |
| Suggestion | `AllocationGroup` rebalancing 로컬 재선언 → shared 이동 권장 | 현 상태 유지, Unit 5+ 이후 shared 이동 검토 |
| Suggestion | `adjustmentAmount` 절댓값 방식 → JSDoc에 규칙 명시 권장 | 리뷰 요청 포인트로 남김 (설계 의도 보존) |

#### 리뷰 요청 포인트 (GPT 검토용)

1. `AllocationGroup` 타입을 rebalancing 슬라이스에서 로컬 재선언한 방식 vs. `shared`로 이동하는 방식의 적합성
2. `calculateAllocationGap`에서 `adjustmentAmount`를 절댓값으로 계산한 설계 의도가 이후 Unit에서도 적합한지 확인
3. `entities/index.ts`의 `export *` 방식이 슬라이스 증가 시 충돌 위험을 감수할 만한지

---

### Unit 0 — 프로젝트 스캐폴딩과 개발 도구 구성

- **작업 일자**: 2026-05-26
- **작업 브랜치**: `main`

#### 변경 파일

**신규 생성**

| 파일 | 설명 |
| --- | --- |
| `package.json` | pnpm 기반 스크립트 및 의존성 정의 |
| `index.html` | Vite 앱 엔트리 HTML |
| `vite.config.ts` | Vite + React + Tailwind v4 플러그인, path alias |
| `vitest.config.ts` | Vitest + RTL + jsdom 설정, path alias |
| `tsconfig.json` | TypeScript project references 루트 |
| `tsconfig.app.json` | 앱 소스 TypeScript 설정, path alias |
| `tsconfig.node.json` | Vite/Vitest 설정 파일용 TypeScript |
| `eslint.config.js` | ESLint flat config (ts-eslint, react-hooks, react-refresh) |
| `.prettierrc` | Prettier 포맷 설정 |
| `postcss.config.js` | PostCSS 빈 설정 (Tailwind는 Vite 플러그인으로 처리) |
| `src/vite-env.d.ts` | Vite 클라이언트 타입 참조 (CSS import 허용) |
| `src/main.tsx` | React 19 StrictMode 앱 마운트 엔트리 |
| `src/apps/App.tsx` | AppProviders + AppRouter 조합 루트 컴포넌트 |
| `src/apps/router/index.tsx` | createBrowserRouter 기반 기본 라우팅 (6개 라우트 placeholder) |
| `src/apps/providers/AppProviders.tsx` | TanStack Query QueryClientProvider 래퍼 |
| `src/apps/styles/index.css` | Tailwind v4 import + shadcn/ui CSS 변수 (라이트/다크) |
| `src/pages/index.ts` | pages 레이어 public API (빈 배럴) |
| `src/widgets/index.ts` | widgets 레이어 public API (빈 배럴) |
| `src/features/index.ts` | features 레이어 public API (빈 배럴) |
| `src/entities/index.ts` | entities 레이어 public API (빈 배럴) |
| `src/shared/index.ts` | shared 레이어 public API (routes re-export) |
| `src/shared/config/routes.ts` | ROUTES 상수 (6개 라우트 경로) |
| `src/shared/config/routes.test.ts` | ROUTES 상수 smoke 테스트 |
| `src/shared/api/mocks/handlers.ts` | MSW handler (health-check mock만 포함) |
| `src/shared/api/mocks/browser.ts` | MSW browser worker 설정 |
| `src/shared/api/mocks/server.ts` | MSW node server 설정 (테스트용) |
| `src/shared/test/setupTests.ts` | Vitest setupFiles — jest-dom import + MSW server 생명주기 |
| `src/shared/ui/README.md` | shared/ui 레이어 설명 |
| `src/shared/lib/README.md` | shared/lib 레이어 설명 |

**수정**

- `docs/WORK_LOG.md` (이 문서)
- `docs/SESSION_STATE.md`

#### 구현 내용

- **프레임워크**: Vite 6 + React 19 + TypeScript 5.7 SPA (SSR 미사용)
- **스타일**: Tailwind CSS v4 (`@tailwindcss/vite` 플러그인) + shadcn/ui CSS 변수 기반 라이트/다크 토큰 준비
- **라우팅**: React Router DOM v7 `createBrowserRouter`, 6개 라우트 placeholder
- **상태 관리 기반**: TanStack Query v5 `QueryClientProvider` 준비
- **FSD 레이어**: `apps`, `pages`, `widgets`, `features`, `entities`, `shared` 디렉토리 + 각 `index.ts` public API
- **Path alias**: `@apps`, `@pages`, `@widgets`, `@features`, `@entities`, `@shared` (tsconfig + vite + vitest 모두 반영)
- **MSW**: handler(health-check), browser worker, node server 기본 구조
- **테스트**: Vitest + RTL + jest-dom + MSW 서버 생명주기 setupTests 구성
- **패키지 빌드 승인**: `pnpm.onlyBuiltDependencies` 로 `esbuild`, `msw` 자동 승인

#### 검증 결과 (초기 — 2026-05-26 v1)

| 명령 | 결과 | 비고 |
| --- | --- | --- |
| `pnpm typecheck` | ❌ INVALID | `tsc --noEmit`이 references 검증 안 함 (false positive) |
| `pnpm test` | ✅ PASS | 1 test file, 1 test passed (routes smoke test) |
| `pnpm lint` | ✅ PASS | 오류 없음 |
| `pnpm build` | ✅ PASS | dist 316KB (gzip 100KB) |
| `git diff --check` | ✅ PASS | whitespace 오류 없음 |

#### GPT 리뷰 NOT PASS — 보완 내역 (2026-05-26 v2)

| 항목 | 내용 |
| --- | --- |
| C1 수정 | `package.json` `typecheck` 스크립트: `tsc --noEmit` → `tsc -b --noEmit` |
| C2 수정 | `src/apps/router/index.tsx` `ROUTES` import: `@shared/config/routes` → `@shared` (public API 경유) |
| C2 보조 | `tsconfig.app.json` paths에 와일드카드 없는 레이어 alias 추가 (`@shared`, `@pages`, …) |
| C2 보조 | `src/apps/index.ts` 신규 생성 (apps 레이어 public API) |
| W1 처리 | `index.html` Vite 기본 favicon 참조 제거 |

#### 검증 결과 (보완 후 — 2026-05-26 v2)

| 명령 | 결과 | 비고 |
| --- | --- | --- |
| `pnpm typecheck` | ✅ PASS | `tsc -b --noEmit` — references 포함 검증 |
| `pnpm test` | ✅ PASS | 1 test file, 1 test passed |
| `pnpm lint` | ✅ PASS | 오류 없음 |
| `pnpm build` | ✅ PASS | dist 316KB (gzip 100KB) |
| `git diff --check` | ✅ PASS | whitespace 오류 없음 |

#### 남은 리스크

| 리스크 | 설명 | 대응 |
| --- | --- | --- |
| shadcn/ui 컴포넌트 미설치 | CLI로 컴포넌트 개별 설치 필요 | Unit 2에서 shadcn init 및 컴포넌트 추가 |
| MSW Service Worker 파일 미생성 | 브라우저 MSW는 `msw init` 명령으로 `public/mockServiceWorker.js` 생성 필요 | Unit 1 이후 MSW 실제 사용 시 실행 |
| Tailwind v4 CSS 변수 shadcn 호환성 | shadcn/ui v2+ Tailwind v4 지원 확인 필요 | Unit 2 shadcn init 시점 검증 |
| `postcss.config.js` 빈 파일 잔존 | shadcn CLI 호환성을 위해 남겨둠 | Unit 2에서 실제 필요 여부 재확인 후 삭제 또는 유지 |

#### 리뷰 요청 포인트 (재리뷰)

1. `tsconfig.app.json`의 와일드카드 없는 alias(`@shared` 등)와 와일드카드 alias(`@shared/*`)가 함께 존재하는 구조가 적절한지 확인
2. Tailwind v4 `@tailwindcss/vite` 플러그인 방식이 shadcn/ui CLI와 호환되는지 확인
3. `src/apps/styles/index.css`의 CSS 변수 토큰이 shadcn/ui 공식 기준과 일치하는지 확인
