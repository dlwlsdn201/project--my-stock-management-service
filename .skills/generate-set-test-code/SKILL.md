---
version: v1.1
name: generate-set-test-code
description: Vitest + RTL + MSW 기반 최소주의 실용 테스트 작성. 테스트 코드 생성, 회귀 테스트 작성, 테스트 리뷰 시 적용. @project-rules_testing-policy.mdc 및 코딩 컨벤션 Part 10 준수. globs: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx"]
---

# 최소주의 실용 테스트 작성 스킬

이 스킬이 호출되면, AI는 반드시 `@project-rules_testing-policy.mdc` 및 코딩 컨벤션 문서 **Part 10: 프론트엔드 테스팅 정책**을 먼저 확인하고 다음 규칙을 준수하여 테스트를 작성합니다.

## 1. 테스트 작성 전 확인

- **버그 수정 요청 시**: 기존 코드 수정 **전에** 해당 버그를 재현하는 **실패(Red) 회귀 테스트를 무조건 먼저 작성**하고, 수정 후 통과(Green) 확인
- **신규 테스트 요청 시**: 대상이 3가지 카테고리(shared 유틸, entities hook, 핵심 feature)에 해당하는지 확인. 해당하지 않으면 테스트 작성을 권장하지 않음

## 2. 테스트 대상별 작성 지침

| 대상 | 경로 | 방법 | 참고 예시 |
|------|------|------|-----------|
| 공통 유틸/API | `shared/lib/`, `shared/utils/`, `shared/api/` | 순수 함수 단위 테스트. MSW 불필요 | `normalizeApiError.test.ts` |
| 데이터 전처리 훅 | `entities/{domain}/hook/` | MSW로 API 모킹, 정상+에러 응답 검증 | - |
| 핵심 피처 | `features/` | Happy Path 1개 + 치명적 실패 1개 | - |
| 공통 UI 컴포넌트 | `shared/ui/` | 행동 기반 검증. design-kits는 `vi.mock` | `ApiErrorFallback.test.tsx` |

## 3. 절대 금지 (Anti-Patterns)

- ❌ UI/스타일: 버튼 색상, CSS 클래스, margin/padding
- ❌ 구현 세부사항: `useState` 값, 내부 함수 호출 횟수
- ❌ 1단계 Fetcher 단독 테스트: `read~`, `create~` 등 순수 Fetcher
- ❌ 스냅샷: `toMatchSnapshot`
- ❌ `vi.mock('axios')` 등 HTTP 모듈 직접 모킹 → **MSW만 사용**

## 4. 도구 및 작성 원칙

- **API 모킹**: MSW `setupServer`(Node) 또는 `http.get/post` 핸들러 사용
- **RTL 쿼리**: `getByRole`, `getByText`, `getByLabelText` 우선. `getByTestId`는 불가피할 때만
- **파일 위치 (Co-location)**: `utils.ts` → `utils.test.ts` (동일 경로, `__tests__` 폴더 금지)
- **design-kits 미지원 시**: `vi.mock('@nx-frontend/design-kits/...')`로 button/input 등 간단한 mock

## 5. 실행 스크립트 (프로젝트별 상이할 수 있음)

- **1회 실행**: `pnpm test` 또는 `vitest run --coverage` — CI/로컬 검증용
- **Vitest UI 모드**: `pnpm test:coverage` 또는 `vitest --ui --coverage` — 대화형 디버깅
- **커버리지 확인**: Vitest UI **Coverage** 탭 또는 `coverage/index.html` 브라우저 열기

## 6. 레퍼런스 파일

| 파일 | 설명 |
|------|------|
| `src/shared/api/utils/normalizeApiError.test.ts` | 순수 함수 단위 테스트 패턴 |
| `src/shared/ui/common/ApiErrorFallback.test.tsx` | 컴포넌트 행동 테스트 + design-kits mock |
| `docs/테스트 예시 및 레퍼런스.md` | 카테고리별 패턴 상세 |
