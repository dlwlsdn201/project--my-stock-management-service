---
version: v1.1
name: figma-to-code
description: Figma 디자인을 styled-components 코드로 변환할 때 사내 디자인 토큰(Theme)을 강제 적용. Figma to code, Figma Code 변환, 디자인 토큰, getCommonColors, getBodyTypography 작업 시 적용. globs: src/**/*.tsx
---

# Figma 디자인 Code 변환 스킬

이 스킬이 호출되면, AI는 반드시 `@project-rules_figma-to-code.mdc` 를 먼저 읽고 다음 작업을 수행합니다.

선택한 Figma 프레임을 분석하여 `styled-components` 코드로 변환하세요.

**[작성 준수사항]**
1. 최적화된 분석: Figma API로 전체 노드를 한 번에 부르지 말고, `get_selection()`으로 뼈대부터 점진적으로 분석해서 `.cursor/figma-analysis/` 폴더에 마크다운 파일로 먼저 정리하세요.
2. 하드코딩 절대 금지: 절대 색상 헥스코드(예: `#FFFFFF`)나 픽셀 사이즈(예: `14px`)를 하드코딩하지 마세요.
3. 테마 토큰 매핑: 반드시 `@nx-frontend/design-kits/lib/style`의 `getCommonColors`, `getBodyTypography` 등 유틸리티 함수로 100% 매핑해서 코드를 작성하세요.
4. 반응형 및 간격: 간격(Padding, Margin, Gap)은 반드시 `rem` 단위로 변환하여 적용하세요.
