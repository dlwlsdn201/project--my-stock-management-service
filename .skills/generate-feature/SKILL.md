---
version: v1.2
name: generate-feature
description: Jotai 파라미터 구독, Custom Hook 호출 및 에러/로딩 위임이 적용된 Feature 컴포넌트를 자동 생성. FSD Feature 생성, features 도메인 컴포넌트, useAtomValue, useSuspenseQuery 위임 시 적용. globs: src/features/**/*
---

# FSD Feature 컴포넌트 자동 생성 스킬

이 스킬이 호출되면, AI는 반드시 `@project-rules_architecture.mdc` 와 `@project-rules_working.mdc` 를 먼저 읽고 다음 작업을 수행합니다.

사용자에게 명세를 입력받아 다음 규칙에 맞게 코드를 생성하세요:
- 도메인/피처명 (예: device/manage-status)
- 컴포넌트명 (PascalCase)
- 연동할 훅 및 파라미터 스토어

**[작성 준수사항]**
1. 파일 경로: `features/{도메인}/{피처명}/ui/{컴포넌트명}.tsx` 에 생성.
2. 상태 연동: `useAtomValue`를 사용하여 Jotai 파라미터를 읽어오고, 이를 Custom Hook의 인자로 전달.
3. 선언적 UI: 컴포넌트 내부에 `if (isLoading)` 또는 `try-catch` 로직을 작성하지 말 것. 데이터는 무조건 존재한다고 가정하고 순수 UI 렌더링에만 집중할 것.
4. 화살표 함수와 PascalCase를 사용하고, 해당 피처 폴더에 배럴 파일(`index.ts`)도 함께 생성할 것.
