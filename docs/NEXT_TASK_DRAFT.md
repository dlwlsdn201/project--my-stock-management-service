# Next Task Draft — 다음 작업 초안

## 0. 문서 목적

이 문서는 Unit 14 이후 남은 작업을 “Claude Code가 직접 구현 가능한 작업”과 “사용자 결정/외부 계정이 필요한 작업”으로 분리한다. 당분간은 사용자 직접 작업이 필요한 항목을 뒤로 미루고, 코드베이스 안에서 완결 가능한 기능을 먼저 진행한다.

## 1. 우선 진행 큐

### 완료: Post-MVP Unit 14 — 로그아웃 UI와 세션 종료 흐름

- 상태: `f588491` 커밋 및 원격 push 완료.
- 핵심 결과: 앱 내부 헤더에서 로그아웃 가능, 세션 제거 후 `/login` 이동.

### 완료: Post-MVP Unit 15 — 수동 자산 persistence 전환

- 상태: `9afb076` 커밋 및 원격 push 완료.
- 핵심 결과: Unit 9의 target allocation store 패턴처럼 in-memory store/api/hook으로 전환한다.
- 구현 계획: `docs/superpowers/plans/2026-06-03-unit15-manual-asset-persistence.md`

### 완료: Post-MVP Unit 16 — 포트폴리오 종목별 계산 SSOT 이관

- 상태: `c087d3c` 커밋 및 원격 push 완료.
- 핵심 결과: `MOCK_HOLDINGS`와 목표 비중 데이터를 결합하는 계산 함수를 entity model로 이관한다.
- 구현 계획: `docs/superpowers/plans/2026-06-03-unit16-portfolio-stock-weights.md`

### 완료: Post-MVP Unit 17 — MSW 브라우저 워커 준비

- 상태: `139c90f` 커밋 및 원격 push 완료.
- 핵심 결과: `public/mockServiceWorker.js` 생성 및 개발 환경 사용 문서화.
- 구현 계획: `docs/superpowers/plans/2026-06-03-unit17-msw-browser-worker.md`

### 완료: Post-MVP Unit 18 — 다크 테마/모바일 QA 보강

- 상태: `76b2ef0` 커밋 및 원격 push 완료.
- 핵심 결과: 주요 라우트의 다크 모드와 768px 미만 레이아웃 문제를 보완하고 QA 기록을 남긴다.
- 구현 계획: `docs/superpowers/plans/2026-06-03-unit18-dark-mobile-qa.md`

### 완료: Post-MVP Unit 19 — 리밸런싱 허용 오차 정책 SSOT 및 mock 추천 테스트 정밀도 보강

- 상태: `cebea72` 커밋 및 원격 push 완료.
- 핵심 결과: `ALLOCATION_TOLERANCE_PERCENT`를 shared 정책으로 이관하고, portfolio 계산과 rebalancing mock 테스트가 같은 정책을 참조한다.
- 구현 계획: `docs/superpowers/plans/2026-06-03-unit19-allocation-policy-ssot.md`

### 완료: Post-MVP Unit 20 — 세션과 AI 설정 메타데이터 persistence 보강

- 상태: `7368755` 커밋 및 원격 push 완료.
- 핵심 결과: API key 원문을 저장하지 않는 조건에서 세션과 AI 설정 메타데이터를 브라우저 storage로 복원한다.
- 구현 계획: `docs/superpowers/plans/2026-06-03-unit20-session-ai-settings-persistence.md`

### 완료: Post-MVP Unit 21 — 최종 브라우저 QA와 릴리즈 후보 점검

- 상태: `773f84d` 커밋 및 원격 push 완료.
- 핵심 결과: 6개 라우트 브라우저 smoke PASS (375x812·768x1024·1440x900), 다크 모드 PASS (인증 라우트), MSW opt-in PASS, API key 원문 미저장 확인, 릴리즈 후보 체크리스트 작성 완료.
- 지시 문서: `docs/CURRENT_TASK.md`
- 구현 계획: `docs/superpowers/plans/2026-06-03-unit21-final-qa-release-candidate.md`

### 완료: Post-MVP Unit 22 — Supabase Persistence 연결

- 상태: GPT 최종 리뷰 PASS WITH WARNINGS, 커밋 대기.
- 핵심 결과: 목표 비중과 수동 자산 store가 Supabase 설정 시 원격 DB adapter를 사용하고, 미설정 시 in-memory fallback을 유지한다. migration local/remote 정합성 확인, MVP RLS mock user id 제한 확인.
- 잔여 Warning: Supabase client 추가로 인한 build chunk size warning. 최종 `migration list` 재실행은 pooler 임시 인증 차단으로 미완료이나, 직전 재리뷰에서 3개 migration 정합 확인. Supabase security advisor는 `No issues found`.
- 구현 계획: `docs/superpowers/plans/2026-06-04-unit22-supabase-persistence.md`

### 다음 단계: 사용자 직접 결정/외부 연동 단계

- 사유: Unit 22 완료로 Supabase 목표 비중/수동 자산 persistence 연결까지 마무리됐다. 이후에는 사용자 결정이 필요한 운영 연동 단계로 전환한다.
- 조정: 아래 2번 큐의 각 항목에 대해 사용자가 순서와 정책을 결정하면 Claude Code가 이어서 구현한다.

## 2. 사용자 직접 작업 또는 외부 결정 필요 큐

아래 항목은 사용자의 계정, 운영 정책, 외부 서비스 선택이 필요하므로 마지막에 몰아서 진행한다.

- ~~Supabase 프로젝트 생성 및 환경 변수 제공~~ → **완료**
- ~~실제 `@supabase/supabase-js` adapter 운영 연결 (목표 비중 + 수동 자산)~~ → **[Unit 22 PASS WITH WARNINGS, 커밋 대기]**
- API key 서버 저장/암호화 정책 확정
- 실제 AI provider 호출 방식 확정(GPT/Gemini/Claude)
- OAuth 제공자 정책 확정 (Supabase Auth 연동 → Unit 25+ RLS 전환 포함)
- 결제/구독 정책 및 연동

## 3. 다음 작업 후보 상세

Unit 22가 완료되어 Claude Code 단독 구현 큐는 비어 있다. 이후 작업은 사용자 결정 후 Unit 23+로 진행한다.

### 사용자 결정 후 Claude Code 구현 가능한 작업 후보

- **실제 AI provider 호출 (Unit 23 후보)**: GPT/Gemini/Claude 중 provider 확정 후 API 호출 레이어 구현.
- **서버 측 API key 암호화 저장 (Unit 24 후보)**: 운영 암호화 정책 확정 후 서버 엔드포인트 또는 Supabase 함수로 구현.
- **OAuth 연동 (Unit 25 후보)**: 카카오 등 OAuth 앱 등록 후 콜백 처리 구현.
- **결제/구독 연동 (Unit 26 후보)**: 결제 서비스(Stripe 등) 및 구독 티어 정책 확정 후 구현.

검증 명령 (재개 시 사용):

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
git diff --check
```
