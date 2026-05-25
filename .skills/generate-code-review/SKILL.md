---
version: v1.2
name: generate-code-review
description: "[AI Action] 작성된 파일이나 코드 블록에 대해 사내 컨벤션(FSD, 네이밍, 상태 관리 등) 기반의 코드 리뷰를 진행할 때 호출하세요."
---

# 자동화 코드 리뷰 스킬

이 스킬이 호출되면, AI는 반드시 `@project-rules_review.mdc`, `@project-rules_architecture.mdc`, `@project-rules_working.mdc`, `@project-rules_api-spec-contract.mdc` 를 정독한 후 사용자의 코드를 리뷰합니다.

사용자가 제시한 코드를 분석하고, 아래의 마크다운 템플릿 양식에 맞춰 엄격하고 전문적인 리뷰 결과를 제공하세요. 칭찬할 점은 칭찬하고, 수정할 점은 명확한 코드 예시와 함께 제안하세요.

**[코드 리뷰 출력 템플릿]**

### 🛡️ NX Frontend 컨벤션 검증 결과
- **FSD 아키텍처 위반 여부**: (Pass 🟢 / Fail 🔴) - 이유 설명
- **네이밍 및 클린 코드**: (Pass 🟢 / Fail 🔴) - 이유 설명
- **에러/로딩(Suspense) 처리**: (Pass 🟢 / Fail 🔴) - 이유 설명
- **import alias path**: (Pass 🟢 / Fail 🔴) - 이유 설명

### 💡 개선 제안 (Refactoring Suggestions)
(위반된 규칙이 있다면, 왜 고쳐야 하는지 15년 차 시니어 개발자의 시각으로 친절하고 명확하게 근거를 기반으로 설명하고, 수정된 `Before & After` 코드를 제공하세요.)

### ✅ 놓치기 쉬운 Best Practice 체크
- [ ] Jotai 파라미터 스토어를 올바르게 분리했는가?
- [ ] 하드코딩된 디자인 토큰은 없는가?
- [ ] 불필요한 메모이징(`useMemo`/`useCallback`)은 없는가?
- [ ] API Fetcher가 `project-rules_api-spec-contract.mdc`의 path/method/query 규칙을 준수하는가?
