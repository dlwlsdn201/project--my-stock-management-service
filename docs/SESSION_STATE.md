# Session State — 세션 재개 상태

## 0. 문서 목적

이 문서는 세션이 끊기거나 다음 날 작업을 이어갈 때 현재 상태를 빠르게 복구하기 위한 문서다.

## 1. 현재 상태

- 현재 브랜치: `main`
- 현재 작업: Unit 9 (Supabase persistence 전환 — 목표 비중) 1차 리뷰 C1/C2/W1 보완 완료, 재리뷰 대기
- 마지막 완료 작업: Unit 9 1차 리뷰(NOT PASS) 보완 — invalidate-only mutation + useSuspenseQuery/ApiQueryBoundary 전환 + env 의존 테스트 제거 (2026-06-01)
- 커밋 여부: Unit 9 미커밋 (재리뷰 후 커밋 예정). Unit 8은 `3b02d91`로 커밋·푸시 완료
- 리뷰 상태: Unit 9 1차 리뷰 NOT PASS → C1(invalidate-only)/C2(suspense+ApiQueryBoundary)/W1(env 단정 제거) 해소, 재리뷰 대기

## 2. 미완료 작업

- Unit 9 리뷰 요청 및 결과 반영 → 커밋/푸시
- Unit 9 후속: `@supabase/supabase-js` 실제 어댑터(`createSupabaseTargetAllocationStore`) 연결 + 운영 부트스트랩에서 `configureTargetAllocationStore` 배선(env 설정 시)
- Unit 9 후속: 수동 자산 / AI 설정 persistence 전환(우선순위 다음 순), AI 설정은 평문 저장 금지 원칙 유지
- [리뷰 W2, Unit 8 → Unit 9 이후] 종목 테이블을 보유 종목(`MOCK_HOLDINGS`) + 종목별 목표 비중 결합 per-stock 계산 SSOT로 이관(`WORK_LOG` Unit 8 보완에 계획 명시)
- [리뷰 W2, Unit 7 → Unit 10] 연동 유도 다이얼로그 focus trap/ESC 닫기 등 키보드 접근성 보강
- [리뷰 W1, Unit 5] API key 저장 위치/마스킹/삭제 정책을 `PROJECT_GUIDE.md`에 SSOT로 확정
- Unit 7 후속: `ApiKeyStatus`(현재 settings-portfolio feature 소유)의 entities 승격 검토 → 리밸런싱·설정 간 SSOT 연결
- Unit 7 후속: 무료 잔여 횟수/API key 연동 상태를 session·settings 실제 상태와 배선(현재 props 주입형)
- `mockRecommendations.test.ts` 비중 합계 검증 정밀도 보강 (후속)
- `msw init` 명령으로 `public/mockServiceWorker.js` 생성 (브라우저 MSW 실제 사용 전)
- route guard 구현 (온보딩/대시보드 보호, 후속)
- 수동 자산·목표 비중·대시보드 데이터의 persistence/API 전환 (Unit 9)

## 3. 신규/수정 파일 목록 (Unit 9)

신규:
- `src/shared/api/supabaseClient.ts`
- `src/shared/ui/common/ApiQueryBoundary.tsx` (리뷰 C2 보완 — 표준 조회 바운더리 스캐폴딩)
- `src/entities/portfolio/api/targetAllocationStore.ts` + `.test.ts`
- `src/entities/portfolio/api/targetAllocationApi.ts`
- `src/entities/portfolio/hook/useTargetAllocation.ts` + `.test.tsx`

수정:
- `src/vite-env.d.ts` (VITE_SUPABASE_* 타입 선언)
- `src/shared/index.ts` (supabaseClient export), `src/shared/ui/index.ts` (ApiQueryBoundary export)
- `src/entities/portfolio/index.ts` (api/hook/store public API 보강 — `useSuspenseTargetAllocation`/`useUpdateTargetAllocation`)
- `src/features/settings-portfolio/ui/TargetAllocationSection.tsx` (useSuspenseQuery 조회 + mutateAsync 저장 UX)
- `src/features/settings-portfolio/ui/SettingsPortfolioPanel.tsx` (TargetAllocationSection을 ApiQueryBoundary로 래핑)
- `src/features/settings-portfolio/model/constants.ts` (저장/로드 메시지 상수)
- `src/features/settings-portfolio/ui/SettingsPortfolioPanel.test.tsx` (QueryClientProvider 래핑 + suspense 대기 + 저장 성공/실패 테스트)

## 4. 검증 결과 요약

### Unit 9 최종 검증 (2026-06-01, 1차 리뷰 C1/C2/W1 보완 후)

| 명령 | 결과 |
| --- | --- |
| `pnpm test` | ✅ PASS (95 tests, 18 files) |
| `pnpm lint` | ✅ PASS |
| `pnpm typecheck` | ✅ PASS |
| `pnpm build` | ✅ PASS |
| `git diff --check` | ✅ PASS |

## 5. 다음 액션

1. Unit 9 재리뷰 요청 → 통과 시 커밋/푸시
2. Unit 10 착수 (PRD 기준 다음 범위)

## 6. 재개 시 읽을 문서

- `AGENTS.md`
- `PRD.mdc`
- `docs/PROJECT_GUIDE.md`
- `docs/CURRENT_TASK.md`
- `docs/WORK_LOG.md`
- `docs/REVIEW_LOG.md`
- `docs/SESSION_STATE.md`
