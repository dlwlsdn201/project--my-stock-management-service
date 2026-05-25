# PRD Template

이 문서는 프로젝트별 제품 요구사항 문서(`PRD.md` 또는 `PRD.mdc`)를 작성할 때 사용하는 보일러플레이트 템플릿이다.

# PRD: {{PRODUCT_NAME}}

## 1. 개요

### 제품명

{{PRODUCT_NAME}}

### 목적

{{PRODUCT_PURPOSE}}

### 한 줄 소개

{{ONE_LINE_DESCRIPTION}}

## 2. 문제 정의

### 현재 문제

- {{PROBLEM_1}}
- {{PROBLEM_2}}
- {{PROBLEM_3}}

### 개선 필요성

{{WHY_NOW}}

## 3. 목표

### 핵심 목표

{{PRIMARY_GOAL}}

### 정량 목표

- {{METRIC_GOAL_1}}
- {{METRIC_GOAL_2}}
- {{METRIC_GOAL_3}}

### 정성 목표

- {{QUALITATIVE_GOAL_1}}
- {{QUALITATIVE_GOAL_2}}
- {{QUALITATIVE_GOAL_3}}

## 4. 대상 사용자

### 1차 사용자

- {{PRIMARY_USER_1}}
- {{PRIMARY_USER_2}}

### 2차 사용자

- {{SECONDARY_USER_1}}
- {{SECONDARY_USER_2}}

## 5. 핵심 사용자 시나리오

### 시나리오 1: {{SCENARIO_1_TITLE}}

1. {{SCENARIO_1_STEP_1}}
2. {{SCENARIO_1_STEP_2}}
3. {{SCENARIO_1_STEP_3}}

### 시나리오 2: {{SCENARIO_2_TITLE}}

1. {{SCENARIO_2_STEP_1}}
2. {{SCENARIO_2_STEP_2}}
3. {{SCENARIO_2_STEP_3}}

### 시나리오 3: {{SCENARIO_3_TITLE}}

1. {{SCENARIO_3_STEP_1}}
2. {{SCENARIO_3_STEP_2}}
3. {{SCENARIO_3_STEP_3}}

## 6. 주요 기능

### 6.1 {{FEATURE_1_NAME}}

#### 설명

{{FEATURE_1_DESCRIPTION}}

#### 주요 요구사항

- {{FEATURE_1_REQUIREMENT_1}}
- {{FEATURE_1_REQUIREMENT_2}}
- {{FEATURE_1_REQUIREMENT_3}}

### 6.2 {{FEATURE_2_NAME}}

#### 설명

{{FEATURE_2_DESCRIPTION}}

#### 주요 요구사항

- {{FEATURE_2_REQUIREMENT_1}}
- {{FEATURE_2_REQUIREMENT_2}}
- {{FEATURE_2_REQUIREMENT_3}}

### 6.3 {{FEATURE_3_NAME}}

#### 설명

{{FEATURE_3_DESCRIPTION}}

#### 주요 요구사항

- {{FEATURE_3_REQUIREMENT_1}}
- {{FEATURE_3_REQUIREMENT_2}}
- {{FEATURE_3_REQUIREMENT_3}}

## 7. MVP 범위

### 포함

- {{MVP_INCLUDED_1}}
- {{MVP_INCLUDED_2}}
- {{MVP_INCLUDED_3}}

### 제외

- {{MVP_EXCLUDED_1}}
- {{MVP_EXCLUDED_2}}
- {{MVP_EXCLUDED_3}}

## 8. 화면 구성

### 8.1 {{SCREEN_1_NAME}}

- {{SCREEN_1_ELEMENT_1}}
- {{SCREEN_1_ELEMENT_2}}
- {{SCREEN_1_ELEMENT_3}}

### 8.2 {{SCREEN_2_NAME}}

- {{SCREEN_2_ELEMENT_1}}
- {{SCREEN_2_ELEMENT_2}}
- {{SCREEN_2_ELEMENT_3}}

### 8.3 {{SCREEN_3_NAME}}

- {{SCREEN_3_ELEMENT_1}}
- {{SCREEN_3_ELEMENT_2}}
- {{SCREEN_3_ELEMENT_3}}

## 9. 데이터 모델 초안

```ts
type ExampleStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

type ExampleEntity = {
  id: string;
  name: string;
  status: ExampleStatus;
  createdAt: string;
  updatedAt: string;
};
```

## 10. 성공 기준

- {{SUCCESS_CRITERION_1}}
- {{SUCCESS_CRITERION_2}}
- {{SUCCESS_CRITERION_3}}

## 11. 추천 기술 스택

- {{TECH_STACK_1}}
- {{TECH_STACK_2}}
- {{TECH_STACK_3}}

## 12. 우선순위

### 1차

- {{PHASE_1_ITEM_1}}
- {{PHASE_1_ITEM_2}}
- {{PHASE_1_ITEM_3}}

### 2차

- {{PHASE_2_ITEM_1}}
- {{PHASE_2_ITEM_2}}
- {{PHASE_2_ITEM_3}}

### 3차

- {{PHASE_3_ITEM_1}}
- {{PHASE_3_ITEM_2}}
- {{PHASE_3_ITEM_3}}

## 13. 오픈 이슈

- {{OPEN_ISSUE_1}}
- {{OPEN_ISSUE_2}}
- {{OPEN_ISSUE_3}}
