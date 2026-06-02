# Current Task — 현재 작업 지시서

## 0. 작업 요약

Post-MVP Unit 13 — AI 설정 상태와 무료 제안 정책 배선

이번 작업은 설정 화면의 AI 모델/API key 상태를 앱 전역 상태로 승격하고, 리밸런싱 화면의 무료 제안 횟수/API key 연동 분기를 실제 session/settings 상태와 연결한다.

## 1. 반드시 읽을 문서

- `AGENTS.md`
- `PRD.mdc`
- `docs/PROJECT_GUIDE.md`
- `docs/WORK_LOG.md`
- `docs/REVIEW_LOG.md`
- `docs/SESSION_STATE.md`
- `.rules/project-rules_architecture.mdc`
- `.rules/project-rules_working.mdc`
- `.rules/project-rules_testing-policy.mdc`
- `.rules/project-rules_review.mdc`

## 2. 선행 상태

- Unit 12에서 mock session 상태와 route guard가 구현되었다.
- Unit 5의 AI 모델/API key 설정 UI는 feature-local state로 동작한다.
- Unit 7의 리밸런싱 무료 제안/API key 분기는 props 주입형으로만 동작한다.
- API key 저장 위치/마스킹/삭제 정책 SSOT가 아직 확정되지 않았다.

## 3. 작업 범위

### 포함

- AI 설정 타입/상태를 SSOT로 정리
- AI 모델 선택 상태를 앱 전역 상태로 저장
- API key 연결 상태를 앱 전역 상태로 저장
- API key 원문은 화면 재노출 금지, 저장 정책 문서화
- 설정 화면의 저장/수정/삭제 동작을 전역 AI 설정 상태에 연결
- 리밸런싱 화면이 `sessionAtom.aiTrialRemainingCount`와 AI 설정 연결 상태를 참조하도록 배선
- 무료 제안 요청 시 잔여 횟수 차감 정책 구현
- API key 연동 상태에서는 무료 횟수 차감 없이 제안 허용
- 관련 테스트 추가/수정
- 작업 완료 후 `docs/WORK_LOG.md`, `docs/SESSION_STATE.md` 갱신

### 제외

- 실제 외부 AI API 호출
- 실제 API key 네트워크 유효성 검증
- API key 서버 저장/Supabase 저장
- API key 암호화 구현
- 결제/구독 연동
- 커밋 생성

## 4. 설계 결정

- MVP 후속 단계에서는 API key를 서버나 브라우저 storage에 영속 저장하지 않는다.
- API key 원문은 입력 후 마스킹 표시에 필요한 최소 상태만 유지하고, 화면에 다시 평문 노출하지 않는다.
- 실제 운영 저장/암호화 정책은 별도 Supabase/Edge Function 연동 단계로 이관한다.
- 상태 관리는 기존 프로젝트 기준에 맞춰 Jotai를 우선 사용한다.
- AI 설정은 여러 feature에서 참조하므로 `entities/settings` 또는 `entities/session` 중 책임 경계를 검토하고, 결정 사유를 `WORK_LOG.md`에 기록한다.

## 5. 예상 변경 파일

### 신규 후보

- `src/entities/settings/model/types.ts`
- `src/entities/settings/model/aiSettingsAtom.ts`
- `src/entities/settings/model/constants.ts`
- `src/entities/settings/index.ts`

### 수정 후보

- `src/features/settings-portfolio/ui/AiSettingsSection.tsx`
- `src/features/rebalancing-proposal/ui/RebalancingProposalPanel.tsx`
- `src/entities/session/model/sessionAtom.ts`
- `src/features/index.ts` 또는 `src/entities/index.ts` (필요 시)
- 관련 테스트 파일
- `docs/WORK_LOG.md`
- `docs/SESSION_STATE.md`

## 6. 구현 규칙

- FSD 의존성 방향 준수
- deep import 금지, public API 경유
- `any` 금지
- 민감 정보는 평문 영속 저장 금지
- 상태 표현은 색상 단독 금지
- 무료 제안 횟수 정책은 상수/타입으로 SSOT화

## 7. 필수 구현 상세

### 7.1 AI 설정 상태

- 선택 모델: `gpt` / `gemini` / `claude`
- API key 상태: 미설정 / 연동됨 / 오류
- 마스킹된 key 표시값
- 원문 key 저장 정책은 문서화하고, 현재 구현 범위에서는 영속 저장하지 않는다.

### 7.2 설정 화면 연결

- 모델 변경 시 전역 상태 반영
- API key 저장 성공 시 연동 상태와 마스킹 값 반영
- 수정/삭제 시 상태 초기화
- 짧은 key 입력 시 오류 상태 유지

### 7.3 리밸런싱 정책 연결

- `sessionAtom.aiTrialRemainingCount`를 실제 잔여 횟수로 표시
- API key 미연동 + 잔여 횟수 0이면 기존 팝업/차단 유지
- API key 미연동 + 잔여 횟수 > 0이면 추천 요청 시 잔여 횟수 1 차감
- API key 연동 상태이면 잔여 횟수 차감 없이 추천 허용

### 7.4 테스트

- 설정 화면에서 API key 저장 시 리밸런싱 화면이 연동 상태로 판단할 수 있는 상태가 저장된다.
- API key 삭제 시 리밸런싱 화면은 무료 횟수 정책으로 돌아간다.
- 무료 잔여 횟수 > 0에서 추천 요청 시 횟수가 차감된다.
- 무료 잔여 횟수 0에서 추천 요청 시 팝업이 표시되고 횟수는 음수가 되지 않는다.
- API key 연동 상태에서는 추천 요청 시 무료 횟수가 차감되지 않는다.

## 8. 테스트 및 검증

작업 완료 전 아래 명령 실행:

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
git diff --check
```

## 9. 완료 기준

- 설정 화면과 리밸런싱 화면이 같은 AI 설정 상태를 참조한다.
- 무료 제안 잔여 횟수 차감 정책이 테스트로 방어된다.
- API key 평문 영속 저장이 없다.
- `WORK_LOG.md`, `SESSION_STATE.md`가 최신화된다.
