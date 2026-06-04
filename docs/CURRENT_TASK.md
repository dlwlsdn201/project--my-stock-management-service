# Current Task — 현재 작업 지시서

## 0. 작업 요약

Post-MVP Unit 21 — 최종 브라우저 QA와 릴리즈 후보 점검

Unit 20까지 Claude Code가 직접 구현 가능한 주요 mock MVP 보강 작업은 대부분 완료됐다. 이번 작업은 신규 기능 추가가 아니라, 현재 구현 산출물을 실제 로컬 브라우저와 문서 기준으로 점검하고 릴리즈 후보 상태를 정리하는 최종 QA 단계다.

핵심 목표는 “MVP 데모 가능 여부”를 판단할 수 있는 증거를 남기는 것이다. 운영 배포에 필요한 외부 계정/정책 결정 항목은 구현하지 않고, 사용자 직접 결정 큐로 분리한다.

## 1. 반드시 읽을 문서

- `AGENTS.md`
- `PRD.mdc`
- `docs/PROJECT_GUIDE.md`
- `docs/WORK_LOG.md`
- `docs/REVIEW_LOG.md`
- `docs/SESSION_STATE.md`
- `docs/NEXT_TASK_DRAFT.md`
- `docs/superpowers/plans/2026-06-03-unit21-final-qa-release-candidate.md`
- `.rules/project-rules_architecture.mdc`
- `.rules/project-rules_working.mdc`
- `.rules/project-rules_testing-policy.mdc`
- `.rules/project-rules_review.mdc`

## 2. 선행 상태

- Unit 20 커밋/푸시 완료: `7368755`
- Unit 20 기준 검증 결과:
  - `pnpm test`: PASS, 26 files / 193 tests
  - `pnpm lint`: PASS
  - `pnpm typecheck`: PASS
  - `pnpm build`: PASS, 431 modules transformed
  - `git diff --check`: PASS
- 남은 Claude Code 구현 가능 작업은 최종 QA/릴리즈 후보 정리 중심이다.
- 사용자 직접 결정 또는 외부 계정이 필요한 작업은 이번 Unit에서 구현하지 않는다.

## 3. 작업 범위

### 포함

- 주요 라우트 브라우저 smoke 점검
- 모바일/데스크톱 viewport 기준 레이아웃 점검 기록
- 라이트/다크 테마 기본 화면 점검 기록
- MSW dev worker opt-in 상태 점검 기록
- PRD/MVP 포함 범위 대비 현재 구현 상태 정리
- 릴리즈 후보 체크리스트 작성 또는 갱신
- 사용자 직접 결정/외부 계정 필요 항목 분리
- `WORK_LOG.md`, `SESSION_STATE.md`, `NEXT_TASK_DRAFT.md` 갱신

### 제외

- 신규 기능 구현
- UI 리디자인
- 실제 Supabase 운영 연동
- 실제 AI provider API 호출
- 실제 OAuth 연동
- API key 서버 저장/암호화 구현
- 결제/구독 구현
- 신규 패키지 설치
- 커밋 생성

## 4. 브라우저 QA 대상

가능하면 아래 라우트를 dev server에서 직접 확인한다.

```text
/login
/dashboard
/onboarding/brokerage
/rebalance
/portfolio
/settings
```

권장 viewport:

```text
375x812   모바일
768x1024  태블릿 경계
1440x900  데스크톱
```

권장 테마:

```text
light
dark
```

점검 기준:

- 핵심 콘텐츠가 렌더링되는가?
- 화면 진입 시 런타임 에러가 없는가?
- 모바일 폭에서 주요 버튼/입력/테이블/사이드바가 겹치거나 잘리지 않는가?
- 다크 모드에서 텍스트 대비가 명확한가?
- 로그인/보호 라우트 흐름이 기존 테스트 결과와 모순되지 않는가?
- API key 원문이 storage 또는 화면에 노출되지 않는가?

## 5. 권장 실행 명령

필수 검증:

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
git diff --check
```

브라우저 smoke:

```bash
pnpm exec vite --host 127.0.0.1
```

MSW opt-in smoke:

```bash
VITE_ENABLE_MSW=true pnpm exec vite --host 127.0.0.1
```

주의:

- dev server가 이미 실행 중이면 다른 포트를 사용하거나 기존 서버를 종료하지 말고 상태를 기록한다.
- 브라우저 자동화 도구 접근이 불가능하면 그 사실을 `WORK_LOG.md`에 명확히 적고, 가능한 수동/DOM/빌드 검증으로 대체한다.

## 6. 완료 기준

- 필수 검증 5종이 통과한다.
- 브라우저 smoke 또는 접근 불가 사유가 `WORK_LOG.md`에 기록된다.
- 주요 라우트별 QA 결과가 기록된다.
- 모바일/데스크톱/다크 테마 관련 잔여 리스크가 기록된다.
- 릴리즈 후보 체크리스트가 최신화된다.
- 사용자 직접 결정/외부 계정 필요 항목이 `NEXT_TASK_DRAFT.md`에 남는다.
- `SESSION_STATE.md`가 다음 재개 시점 기준으로 최신화된다.
- GPT 리뷰 요청 전 커밋은 생성하지 않는다.
