# Session State — 세션 재개 상태

## 0. 문서 목적

이 문서는 세션이 끊기거나 다음 날 작업을 이어갈 때 현재 상태를 빠르게 복구하기 위한 문서다.

## 1. 현재 상태

- 현재 브랜치: `main`
- 현재 작업: Post-MVP Unit 16 (포트폴리오 종목별 계산 SSOT 이관) 착수 준비
- 마지막 완료 작업: Unit 15 보완 완료 후 2차 재리뷰 PASS + `9afb076` 커밋/원격 push 완료 (2026-06-03)
- 커밋 여부: Unit 15까지 원격 반영 완료
- 리뷰 상태: Unit 16 작업 대기

## 2. 미완료 작업

- ~~로그아웃 UI 구현~~ → **[Unit 14 완료]**
- ~~수동 자산 persistence 전환~~ → **[Unit 15 완료]**
- 종목 테이블 per-stock 계산 SSOT 이관(`MOCK_HOLDINGS` + 목표 비중 결합) — **[Unit 16 예정]**
- `mockRecommendations.test.ts` 비중 합계 검증 정밀도 보강
- `msw init` 명령으로 `public/mockServiceWorker.js` 생성 (브라우저 MSW 실제 사용 전)
- 세션/AI설정 persistence (새로고침 시 초기화 — 메모리 전용, 의도적)
- 다크 테마 픽셀 QA, 모바일(<768) 실측 증빙
- 실제 `@supabase/supabase-js` 어댑터(`createSupabaseTargetAllocationStore`, `createSupabaseManualAssetStore`) 연결 — 현재 in-memory mock fallback
- 실제 외부 AI provider 호출 및 API key 서버 저장/암호화 정책 확정 — 사용자 결정 필요
- ~~Unit 7 후속: 무료 잔여 횟수/API key 연동 상태 배선~~ → **[Unit 13 완료]**
- ~~API key 저장 위치/마스킹/삭제 정책 SSOT화~~ → **[Unit 13 완료]**

## 3. 신규/수정 파일 목록 (Unit 15)

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

## 3-1. 신규/수정 파일 목록 (Unit 14)

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

1. `docs/CURRENT_TASK.md`와 `docs/superpowers/plans/2026-06-03-unit16-portfolio-stock-weights.md` 기준으로 Claude Code에 Unit 16 구현 지시
2. Unit 16 완료 후 코드 리뷰 및 `docs/REVIEW_LOG.md` 갱신
3. 통과 시 커밋/푸시 후 Unit 17 MSW 브라우저 워커 준비 또는 Unit 18 다크/모바일 QA로 진행

## 6. 재개 시 읽을 문서

- `AGENTS.md`
- `PRD.mdc`
- `docs/PROJECT_GUIDE.md`
- `docs/CURRENT_TASK.md`
- `docs/WORK_LOG.md`
- `docs/REVIEW_LOG.md`
- `docs/SESSION_STATE.md`
