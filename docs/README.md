# AI Harness Engineering

이 폴더는 여러 AI 모델과 함께 개발 작업을 안정적으로 진행하기 위한 문서 기반 작업 하네스다.

목표는 AI가 이전 대화 기억에 의존하지 않고, 문서만 읽어도 현재 프로젝트 상태, 현재 작업, 다음 작업, 리뷰 결과, 세션 재개 지점을 이해하게 만드는 것이다.

## 문서 구조

```text
docs/ai-harness/
  README.md
  PROJECT_GUIDE.md
  CURRENT_TASK.md
  NEXT_TASK_DRAFT.md
  WORK_LOG.md
  REVIEW_LOG.md
  SESSION_STATE.md
  handoff/
    unit-example-handoff.md
  templates/
    current-task-template.md
    next-task-draft-template.md
    work-log-template.md
    review-log-template.md
    session-state-template.md
    handoff-template.md
```

## 문서별 역할

### PROJECT_GUIDE.md

프로젝트 또는 기능 영역의 최상위 기준 문서다.

포함 내용:

- 프로젝트 목적
- 포함 범위와 제외 범위
- 기술 스택과 아키텍처 원칙
- 작업 단위 분해 기준
- Definition of Done
- 리뷰 기준
- 모델별 역할 분담

주 담당: GPT

### CURRENT_TASK.md

현재 수행할 단 하나의 작업 지시서다.

포함 내용:

- 작업 목표
- 반드시 읽을 문서
- 포함 범위와 제외 범위
- 예상 변경 파일
- 구현 규칙
- 테스트 및 검증 명령
- 완료 보고 형식

주 담당: GPT

### NEXT_TASK_DRAFT.md

아직 확정되지 않은 다음 작업 후보 초안이다.

포함 내용:

- 다음 작업 후보
- 선행 작업과의 연결점
- 미확정 사항
- 예상 변경 범위
- 설계 메모
- 착수 전 결정해야 할 항목

주 담당: GPT

### WORK_LOG.md

완료된 작업 결과를 누적하는 작업 로그다.

포함 내용:

- 작업 일자
- 작업 단위명
- 작업 브랜치
- 변경 파일
- 구현 내용
- 검증 결과
- 남은 리스크
- 다음 작업으로 넘길 항목

주 담당: Claude Code

### REVIEW_LOG.md

검증 리뷰와 피드백을 누적하는 리뷰 로그다.

포함 내용:

- 리뷰 대상
- 최종 판단: PASS / PASS WITH WARNINGS / NOT PASS
- Critical 이슈
- Warning 이슈
- 검증 결과
- 보완 요청
- 후속 권장 사항

주 담당: GPT

### SESSION_STATE.md

세션이 끊기거나 다음 날 작업을 이어갈 때 읽는 현재 상태 문서다.

포함 내용:

- 현재 브랜치
- 마지막으로 완료한 작업
- 미완료 작업
- 커밋 여부
- 현재 worktree 주의사항
- 다음 액션
- 재개 시 읽을 문서

주 담당: Claude Code

### handoff/*

복잡한 작업 단위를 새 AI 모델이나 미래의 내가 빠르게 이해하기 위한 인수인계 문서다.

포함 내용:

- 작업 목표
- 현재 코드 상태
- 참고할 기존 구현
- 핵심 로직
- API 또는 데이터 계약
- 예상 변경 파일
- 테스트 기준
- 주의 사항

주 담당: GPT

## 모델별 역할 분담

### Claude Code Sonnet

주 역할:

- 실제 코드 구현
- 코드 수정 및 보완
- 테스트 실행
- lint/typecheck 실행
- `WORK_LOG.md` 업데이트
- `SESSION_STATE.md` 업데이트

Claude Code는 `CURRENT_TASK.md`를 기준으로 구현하고, 작업 완료 후 결과를 `WORK_LOG.md`에 남긴다. 작업을 중단하거나 컨텍스트 전환이 예상되면 `SESSION_STATE.md`를 갱신한다.

### GPT

주 역할:

- 프로젝트 전체 관리
- 작업 계획 수립
- 기능 설계
- 작업 단위 분해
- 검증 리뷰
- 피드백 작성
- `PROJECT_GUIDE.md` 업데이트
- `NEXT_TASK_DRAFT.md` 업데이트
- `CURRENT_TASK.md` 업데이트
- `REVIEW_LOG.md` 업데이트
- `handoff/*` 업데이트

GPT는 Claude Code가 구현하기 전에 작업 지시를 정리하고, 구현 후에는 결과물과 로그를 기준으로 리뷰한다.

## 기본 작업 플로우

1. GPT가 `PROJECT_GUIDE.md`와 기존 로그를 기준으로 다음 작업을 분석한다.
2. GPT가 `NEXT_TASK_DRAFT.md`에 다음 작업 후보와 설계 메모를 작성한다.
3. 작업이 확정되면 GPT가 `CURRENT_TASK.md`를 작성한다.
4. Claude Code가 `CURRENT_TASK.md`를 읽고 구현한다.
5. Claude Code가 lint, test, typecheck 등 필요한 검증을 실행한다.
6. Claude Code가 `WORK_LOG.md`에 변경 파일, 구현 내용, 검증 결과, 남은 리스크를 기록한다.
7. Claude Code가 작업 중단 또는 세션 종료 전 `SESSION_STATE.md`를 갱신한다.
8. GPT가 구현 결과와 `WORK_LOG.md`를 기준으로 리뷰한다.
9. GPT가 `REVIEW_LOG.md`에 PASS 여부, Critical, Warning, 후속 조치를 기록한다.
10. Critical이 있으면 GPT가 `CURRENT_TASK.md`에 보완 작업을 다시 작성하고 Claude Code가 수정한다.
11. PASS 또는 PASS WITH WARNINGS 상태가 되면 GPT가 다음 작업 초안을 준비한다.

## 운영 원칙

- `CURRENT_TASK.md`에는 현재 실행할 작업 하나만 둔다.
- 완료된 작업 이력은 `WORK_LOG.md`에 누적한다.
- 리뷰 결과는 `REVIEW_LOG.md`에 분리해서 기록한다.
- 세션을 넘기기 전에는 `SESSION_STATE.md`를 최신 상태로 만든다.
- 불확실한 다음 작업은 `NEXT_TASK_DRAFT.md`에만 둔다.
- 범위 밖 리팩터링은 별도 작업 단위로 분리한다.
- 실패한 검증은 숨기지 않고 기존 오류와 신규 오류를 구분해 기록한다.
- 큰 작업은 `handoff/`에 별도 인수인계 문서를 둔다.

## 문서 갱신 기준

- 큰 방향이 바뀌면 `PROJECT_GUIDE.md`를 갱신한다.
- 새 작업 착수 전에는 `CURRENT_TASK.md`를 갱신한다.
- 작업 완료 후에는 `WORK_LOG.md`를 갱신한다.
- 리뷰 후에는 `REVIEW_LOG.md`를 갱신한다.
- 작업 중단 전에는 `SESSION_STATE.md`를 갱신한다.
- 다음 작업이 아직 확정되지 않았으면 `NEXT_TASK_DRAFT.md`에만 기록한다.

