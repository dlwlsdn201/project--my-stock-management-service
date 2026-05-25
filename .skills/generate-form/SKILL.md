---
version: v1.1
name: generate-form
description: react-hook-form과 사내 공통 컴포넌트(@shared/ui)를 활용한 규격화된 폼(Form)을 생성. Form 컴포넌트 자동 생성, FormInput, FormSelect, FormDatepicker, useMutation 폼 제출 시 적용. globs: src/**/*.tsx
---

# 표준 폼(Form) 컴포넌트 자동 생성 스킬

이 스킬이 호출되면, AI는 반드시 `@project-rules_shared-components.mdc` 를 먼저 읽고 다음 작업을 수행합니다.

사용자로부터 생성할 '폼의 목적'과 '필드 목록'을 입력받아 코드를 작성하세요.

**[작성 준수사항]**
1. 태그 금지: 기본 HTML `<input>`, `<select>` 태그나 @nx-frontend/design-kits 를 제외한 외부 UI 라이브러리 사용을 절대 금지합니다.
2. register 방식: 텍스트 입력과 스위치는 `register` 방식을 사용하여 `FormInput.Text`, `FormSelection` 등으로 구현하세요.
3. controller 방식: 숫자, 복잡한 드롭다운, 날짜 선택은 `control` 방식을 사용하여 `FormInput.Number`, `FormSelect.Default`, `FormDatepicker` 등으로 구현하세요.
4. 제출 로직: 폼 Submit 시 `useMutation`을 호출하는 뼈대 코드를 포함하며, `onSuccess`와 `onError`에 토스트 알림을 띄우는 예시를 작성하세요.
5. 유효성 검사: 필수값(required), 최소/최대 길이 등 기본적인 유효성 검사 규칙(`rules`)을 폼 필드에 적용하세요.
