# Current Task — 현재 작업 지시서

## 0. 작업 요약

Unit 9 — Supabase 연동 후보 검증과 persistence 전환

이번 Unit은 Unit 1~8 mock 기반 흐름 중 저장이 필요한 데이터(수동 자산, 목표 비중, AI 설정)를 Supabase로 전환 가능한 구조로 검증하고, 최소 1개 플로우를 실제 persistence 경로로 전환한다.

## 1. 반드시 읽을 문서

- `AGENTS.md`
- `PRD.mdc`
- `docs/PROJECT_GUIDE.md`
- `docs/WORK_LOG.md`
- `docs/REVIEW_LOG.md`
- `docs/SESSION_STATE.md`
- `.rules/project-rules_architecture.mdc`
- `.rules/project-rules_working.mdc`
- `.rules/project-rules_api-spec-contract.mdc`
- `.rules/project-rules_api-response-interface.mdc`
- `.rules/project-rules_api-error-handling.mdc`
- `.rules/project-rules_testing-policy.mdc`

## 2. 선행 상태

- Unit 8까지 주요 UI/도메인 플로우가 mock 기반으로 완료되어 있다.
- 설정/리밸런싱/포트폴리오 화면의 상태와 상수 SSOT가 정리되어 있다.

## 3. 작업 범위

### 포함

- Supabase 적용 범위 확정 문서화(세션/자산/목표 비중/AI 설정 중 우선순위)
- schema 초안 및 타입 매핑 정의
- 최소 1개 저장 플로우 persistence 전환(권장: 수동 자산 + 목표 비중)
- entities `api` fetcher 계층 추가 또는 교체
- entities `hook`에 TanStack Query 기반 조회/변경 훅 추가
- features에서 기존 local 상태와 연동되는 저장/불러오기 UX 정리
- 실패/로딩 상태 처리
- Unit 9 테스트 작성(MSW 또는 mock client)
- 작업 완료 후 `docs/WORK_LOG.md`, `docs/SESSION_STATE.md` 갱신

### 제외

- 실제 주문/자동매매
- 운영 배포 수준 보안 강화
- 전체 화면의 완전한 서버 상태 전환(부분 전환만 수행)
- 커밋 생성

## 4. 설계 결정

- FSD 3단계 API 원칙 준수:
  1) `entities/*/api`: 순수 fetcher
  2) `entities/*/hook`: query/mutation
  3) `features/*/ui`: 훅 사용 + UX 처리
- Supabase 연동은 환경변수 기반으로 구성하고, 미설정 시 mock fallback 정책을 명시한다.
- API key 등 민감 정보는 평문 저장 금지 원칙을 유지한다.

## 5. 예상 변경 파일

### 신규 후보

- `src/shared/api/supabaseClient.ts` (또는 동등 경로)
- `src/entities/portfolio/api/*`
- `src/entities/portfolio/hook/*`
- `src/entities/settings/api/*` 또는 기존 slice 내 api/hook
- `src/entities/settings/hook/*`
- 관련 테스트 파일

### 수정 후보

- `src/features/settings-portfolio/ui/*`
- `src/features/portfolio-management/ui/*` (필요 시)
- `src/entities/*/index.ts` (public API export 보강)
- `docs/WORK_LOG.md`
- `docs/SESSION_STATE.md`

## 6. 구현 규칙

- deep import 금지, public API 경유
- `any` 금지
- API 계약과 타입 SSOT 유지
- 에러 처리 메시지 일관성 유지
- 환경변수 누락/오류 시 안전한 fallback 또는 명시적 에러 처리

## 7. 필수 구현 상세

### 7.1 데이터 모델/스키마

- 수동 자산, 목표 비중, AI 설정 필드 매핑
- mock 계약과 Supabase 컬럼명 정합성 확보

### 7.2 persistence 전환

- 저장(create/update) + 조회(read) 최소 1개 플로우 구현
- 성공 시 UI 반영, 실패 시 사용자 메시지 표시

### 7.3 품질/리스크

- 연결 실패, 인증 실패, 데이터 없음 케이스 처리
- WORK_LOG에 전환 범위/미전환 범위/리스크 명시

## 8. 테스트 및 검증

아래 테스트를 최소 포함한다.

- persistence 전환 대상 플로우의 성공 케이스
- 저장 실패 또는 조회 실패 케이스
- fallback 또는 에러 분기 케이스

작업 완료 전 아래 명령 실행:

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
git diff --check
```

## 9. 완료 기준

- Supabase 적용 범위와 스키마 매핑이 문서화됨
- 최소 1개 저장 플로우가 실제 persistence 경로로 동작
- 테스트/검증 통과
- `WORK_LOG.md`, `SESSION_STATE.md` 최신화
