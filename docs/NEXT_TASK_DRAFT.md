# Next Task Draft — 다음 작업 초안

## 0. 문서 목적

이 문서는 Unit 12 이후 이어질 후속 작업 후보를 정리한다. 현재 우선순위는 설정 화면의 AI 모델/API key 상태와 리밸런싱 화면의 무료 제안 정책을 실제 앱 상태로 연결하는 것이다.

## 1. 다음 작업 후보

Post-MVP Unit 13 — AI 설정 상태와 무료 제안 정책 배선

## 2. 배경

Unit 5에서 AI 모델/API key 설정 UI가 구현되었고, Unit 7에서 리밸런싱 무료 제안 정책 UI가 구현되었다. 그러나 두 화면은 아직 같은 상태를 공유하지 않는다. Unit 12에서 mock session이 전역 상태로 도입되었으므로, 무료 제안 잔여 횟수와 API key 연동 상태를 연결할 수 있다.

## 3. 예상 범위

### 포함 후보

- AI 설정 상태 타입/atom 추가
- 설정 화면의 모델/API key 상태를 전역 상태에 연결
- 리밸런싱 화면의 무료 제안 정책을 session/settings 상태에 연결
- 무료 제안 요청 시 잔여 횟수 차감
- API key 연동 상태에서는 무료 횟수 차감 없이 제안 허용
- API key 저장/마스킹/삭제 정책 문서화
- 관련 테스트

### 제외 후보

- 실제 외부 AI API 호출
- 실제 API key 검증
- API key 서버 저장 또는 브라우저 storage 영속화
- 암호화 구현
- 결제/구독 연동

## 4. 설계 메모

예상 구조:

```text
src/entities/settings/
  model/types.ts
  model/constants.ts
  model/aiSettingsAtom.ts
  index.ts

src/features/settings-portfolio/ui/AiSettingsSection.tsx
src/features/rebalancing-proposal/ui/RebalancingProposalPanel.tsx
```

정책:

- API key 원문은 평문 영속 저장하지 않는다.
- 저장 후 화면에는 마스킹 값만 표시한다.
- 운영 저장/암호화는 Supabase/Edge Function 연동 단계에서 별도 처리한다.
- 무료 잔여 횟수는 session 상태의 `aiTrialRemainingCount`를 기준으로 한다.

## 5. 예상 검증

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
git diff --check
```
