# Current Task — 현재 작업 지시서

## 0. 작업 요약

Post-MVP Unit 23A — AI Provider Adapter 경계와 세션 API key 정책 구현

Unit 22까지 Supabase 목표 비중/수동 자산 persistence 연결은 완료됐다. 다음 단계는 실제 AI API 호출로 바로 넘어가기 전에, 리밸런싱 제안 생성 흐름을 provider adapter 뒤로 이동시키고 API key 원문을 브라우저 세션 메모리에만 보관하는 구조를 만드는 것이다.

이번 Unit의 1차 provider는 사용자가 선택한 **Codex**다. 구현상으로는 OpenAI API/Responses 연동을 위한 provider 경계로 설계하되, Unit 23A에서는 외부 OpenAI API를 실제 호출하지 않는다. 실제 OpenAI API 호출은 Unit 23B에서 진행한다.

## 1. 반드시 읽을 문서

- `AGENTS.md`
- `PRD.mdc`
- `docs/PROJECT_GUIDE.md`
- `docs/WORK_LOG.md`
- `docs/REVIEW_LOG.md`
- `docs/SESSION_STATE.md`
- `docs/NEXT_TASK_DRAFT.md`
- `docs/superpowers/plans/2026-06-10-unit23a-ai-provider-adapter.md`
- `.rules/project-rules_architecture.mdc`
- `.rules/project-rules_working.mdc`
- `.rules/project-rules_testing-policy.mdc`
- `.rules/project-rules_review.mdc`

## 2. 선행 상태

- Unit 22 커밋/푸시 완료: `a4c61b3`
- Unit 22 문서 상태 정리 커밋/푸시 완료: `465ffcf`
- 현재 리밸런싱 제안 화면은 mock data를 직접 사용한다.
- 현재 AI 설정은 API key 원문을 저장하지 않고 마스킹 메타데이터만 저장한다.
- 현재 AI 모델 옵션은 `GPT`, `Gemini`, `Claude`다.

## 3. 사용자 결정 사항

- 1차 provider: `Codex`
- 프로토타입 API key 정책: 브라우저 세션 중 메모리에만 원문 key 보관
- 정식 런칭 API key 정책: 이후 Supabase 암호화 저장으로 전환
- 진행 순서:
  1. Unit 23A — provider adapter 경계와 세션 key 정책
  2. Unit 23B — 실제 OpenAI/Codex API 호출
  3. Unit 24 — Supabase encrypted API key storage

## 4. 포함 범위

- `entities/ai-provider` 슬라이스 생성
- AI proposal request/response 타입 정의
- Codex provider label/default 설정
- raw API key를 Jotai memory atom에만 보관
- 기존 mock rebalancing 데이터를 async provider boundary 뒤로 이동
- 설정 화면 저장 버튼이 raw key는 memory atom에, persisted metadata는 masked 값만 저장하도록 연결
- 리밸런싱 화면의 “AI 제안 요청” 버튼이 provider boundary를 호출하도록 연결
- 기존 무료 3회 정책 유지
- API key 연결 metadata는 있지만 세션 raw key가 없으면 설정 안내 modal 표시
- 관련 테스트와 작업 문서 갱신

## 5. 제외 범위

- 실제 OpenAI API network call
- OpenAI SDK 신규 설치
- Supabase Edge Function
- Supabase encrypted API key storage
- Supabase Auth/OAuth
- 결제/구독 연동
- 실제 투자 주문 실행
- 커밋 생성

## 6. 구현 계획

`docs/superpowers/plans/2026-06-10-unit23a-ai-provider-adapter.md`를 기준으로 진행한다.

Claude Code는 계획 문서의 Task 순서를 지키고, 각 Task마다 테스트를 먼저 작성한 뒤 구현한다.

## 7. 필수 검증

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
git diff --check
```

추가 targeted test:

```bash
pnpm test src/entities/ai-provider/api/aiProposalProvider.test.ts
pnpm test src/entities/ai-provider/model/apiKeySessionAtom.test.ts
pnpm test src/entities/settings/model/aiSettingsAtom.test.ts src/features/settings-portfolio/ui/SettingsPortfolioPanel.test.tsx
pnpm test src/features/rebalancing-proposal/ui/RebalancingProposalPanel.test.tsx
```

## 8. 완료 기준

- Codex가 첫 AI provider 옵션으로 표시된다.
- API key 원문은 localStorage/sessionStorage/Supabase/docs/tests에 남지 않는다.
- API key 원문은 현재 브라우저 세션의 Jotai memory atom에만 존재한다.
- 리밸런싱 제안 요청은 mock data 직접 참조가 아니라 provider boundary를 통해 수행된다.
- API key 미설정/무료 횟수 소진 정책은 기존 UX와 호환된다.
- 모든 필수 검증이 통과한다.
- `WORK_LOG.md`, `SESSION_STATE.md`, `NEXT_TASK_DRAFT.md`가 Unit 23A 결과로 갱신된다.
- GPT 리뷰 전 커밋은 생성하지 않는다.
