# Current Task — 현재 작업 지시서

## 0. 작업 요약

Post-MVP Unit 22 — Supabase Persistence 연결 최종 리뷰 완료

Unit 22 최종 GPT 리뷰 결과는 **PASS WITH WARNINGS**다. 목표 비중과 수동 자산을 Supabase에 연결하는 adapter 구현, MVP RLS mock user id 제한, `set_updated_at` 함수의 `search_path` 적용, Supabase security advisor `No issues found`를 확인했다.

이번 작업은 커밋/푸시 가능 상태다. 남은 항목은 build chunk size warning과 최종 `migration list` 재실행이 Supabase pooler 임시 인증 차단으로 실패한 점이다.

## 1. 반드시 읽을 문서

- `AGENTS.md`
- `PRD.mdc`
- `docs/PROJECT_GUIDE.md`
- `docs/WORK_LOG.md`
- `docs/REVIEW_LOG.md`
- `docs/SESSION_STATE.md`
- `docs/NEXT_TASK_DRAFT.md`
- `.rules/project-rules_architecture.mdc`
- `.rules/project-rules_working.mdc`
- `.rules/project-rules_testing-policy.mdc`
- `.rules/project-rules_review.mdc`
- `.agents/skills/supabase/SKILL.md`
- `.agents/skills/supabase-postgres-best-practices/SKILL.md`

## 2. 선행 상태

- Unit 21 커밋/푸시 완료.
- Unit 22 구현 산출물은 미커밋 상태.
- Unit 22 최종 GPT 리뷰 결과: `PASS WITH WARNINGS`
- 검증 결과:
  - `pnpm test`: PASS, 28 files / 209 tests
  - `pnpm lint`: PASS
  - `pnpm typecheck`: PASS
  - `pnpm build`: PASS
  - `git diff --check`: PASS
  - `pnpm exec supabase migration list`: 최종 재실행 NOT VERIFIED, pooler 임시 인증 차단. 직전 재리뷰에서 3개 migration local/remote 정합 확인됨
  - `pnpm exec supabase db query --linked`: PASS, mock user id RLS 확인
  - `pnpm exec supabase db query --linked`: PASS, `set_updated_at` `search_path=""` 확인
  - `pnpm exec supabase db advisors --linked --type security --level warn --fail-on error`: PASS, `No issues found`

## 3. 확인된 완료 범위

### 포함

- 로컬 migration 파일과 원격 Supabase migration history 정합성 복구 완료
- MVP RLS 정책을 mock user id 범위로 제한 완료
- `supabase/.temp/` 커밋 제외 처리 완료
- `supabase` CLI 패키지의 dependency 위치 정리 완료
- `_resetSupabaseClient` public API 노출 제거 완료
- `set_updated_at` 함수 `search_path` 명시 완료
- 관련 테스트/문서 갱신 완료

### 제외

- Supabase Auth/OAuth 실제 연동
- 운영 RLS 전환
- 실제 AI provider 호출
- API key 서버 저장/암호화 구현
- 결제/구독 구현
- UI 리디자인
- 커밋 생성

## 4. 잔여 Warning

- Build chunk size warning: Supabase client 추가 후 JS chunk가 500 kB 기준을 넘는다.
- 최종 `migration list` 재실행은 pooler 임시 인증 차단으로 완료하지 못했다. 직전 재리뷰에서 migration 정합성은 확인했다.

두 항목 모두 Unit 22 커밋을 막지는 않는다. pooler 차단이 해소되면 `migration list`를 한 번 더 재실행한다.

## 5. 권장 실행 명령

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
git diff --check
pnpm exec supabase migration list
```

필요 시 Supabase CLI 명령은 먼저 `--help`로 사용법을 확인한다.

## 6. 완료 기준

- Unit 22는 커밋/푸시 가능.
- `.claude/`는 작업 산출물 범위 밖이면 커밋에서 제외한다.
- 커밋 후 다음 단계는 사용자 결정이 필요한 Unit 23+ 후보로 전환한다.
