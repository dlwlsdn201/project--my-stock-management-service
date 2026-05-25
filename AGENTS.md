# AGENTS.md

이 프로젝트는 GitLab 기반 릴리즈 정보를 하나의 원본 데이터로 관리하고, CHANGELOG, QC 테스트 케이스, 릴리즈 노트, 전사 공지문을 자동 생성하는 ReleaseHub 프로토타입이다.

## 문서 우선순위

1. 사용자의 명시 요청
2. 이 파일의 지침
3. `.agents/**/*.{md,mdc}`의 에이전트 작업 규칙
4. `.rules/**/*.mdc`의 상세 개발 규칙
5. `.skills/**/*.{md,mdc}`의 작업별 스킬 지침
6. `PRD.mdc`의 제품 요구사항
7. 기존 코드 컨벤션

## 공통 AI 문서 경로

이 프로젝트는 특정 AI 도구에 종속되지 않도록 루트 경로의 공통 폴더를 기준으로 한다.

- `.agents`: AI 에이전트의 작업 방식, 응답 방식, 검증 흐름 등 실행 지침
- `.rules`: 아키텍처, 네이밍, API, 테스트, 리뷰 등 프로젝트 개발 규칙
- `.skills`: 특정 작업 유형별 절차와 참고 지식
- `PRD.mdc`: 제품 요구사항과 MVP 범위

보일러플레이트용 템플릿은 `.agents/AGENTS.template.md`, `.agents/PRD.template.md`를 사용한다.

도구별 자동 인식이 필요한 경우 `.cursor/`, `.claude/`, `.codex/` 등에는 위 공통 문서를 참조하는 얇은 연결 문서만 둔다.

## 상세 규칙

코드 작성, 리뷰, 테스트, 아키텍처 판단은 `.rules` 하위 문서를 따른다.

- 아키텍처/FSD: `.rules/project-rules_architecture.mdc`
- 기본 작업 규칙: `.rules/project-rules_working.mdc`
- 에이전트 작업 흐름: `.rules/project-rules_agent-workflow.mdc`
- 테스트 정책: `.rules/project-rules_testing-policy.mdc`
- 네이밍: `.rules/project-rules_naming.mdc`
- API 계약/응답/에러 처리: `.rules/project-rules_api-spec-contract.mdc`, `.rules/project-rules_api-response-interface.mdc`, `.rules/project-rules_api-error-handling.mdc`

## 에이전트 지침

AI 에이전트별 공통 작업 지침은 `.agents` 하위 문서를 따른다. 신규 에이전트 규칙을 추가할 때는 특정 도구 이름보다 역할과 적용 범위를 기준으로 파일을 작성한다.

## 스킬 지침

반복 가능한 작업 절차나 특정 도메인 지식은 `.skills` 하위 문서로 분리한다. 예를 들어 문서 작성, Figma 기반 UI 구현, API 명세 반영, 테스트 작성처럼 독립적인 절차가 있는 작업을 스킬 문서로 관리한다.

## 제품 기준

제품 요구사항과 MVP 범위는 `PRD.mdc`를 따른다. 구현 중 제품 방향과 코드 규칙이 충돌하면 사용자에게 확인한다.
