# Current Task — 현재 작업 지시서

## 0. 작업 요약

- TODO: 현재 수행할 작업을 한 문단으로 작성한다.

## 1. 반드시 읽을 문서

- `docs/ai-harness/PROJECT_GUIDE.md`
- `docs/ai-harness/WORK_LOG.md`
- `docs/ai-harness/REVIEW_LOG.md`
- `docs/ai-harness/SESSION_STATE.md`
- TODO: 필요한 handoff 문서 또는 설계 문서를 추가한다.

## 2. 작업 범위

### 포함

- TODO

### 제외

- TODO

## 3. 예상 변경 파일

### 신규 후보

- TODO

### 수정 후보

- TODO

## 4. 구현 규칙

- 프로젝트 기존 패턴을 우선한다.
- 범위 밖 리팩터링은 하지 않는다.
- API/상수/타입/비즈니스 규칙은 한 곳에 정의하고 참조한다.
- 테스트와 검증 결과를 기록한다.
- 불확실한 사항은 임시 구현 전에 문서에 리스크로 남긴다.

## 5. 테스트 및 검증

```bash
# TODO: lint 명령
```

```bash
# TODO: test 명령
```

```bash
# TODO: typecheck 명령
```

## 6. 완료 기준

- TODO: 기능 완료 기준을 체크리스트로 작성한다.
- `WORK_LOG.md`에 결과가 기록된다.
- 작업 중단 전 `SESSION_STATE.md`가 갱신된다.

## 7. 완료 보고 형식

작업 완료 후 `WORK_LOG.md`에 아래 항목을 기록한다.

- 작업 일자
- 작업 단위명
- 작업 브랜치
- 변경 파일
- 구현 내용
- 검증 결과
- 남은 리스크
- 리뷰 요청 포인트

