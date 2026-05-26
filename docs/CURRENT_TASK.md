# Current Task — 현재 작업 지시서

## 0. 작업 요약

Unit 0 — AssetFlow AI MVP 구현을 시작하기 위한 React 프로젝트 기반을 구축한다. 현재 저장소는 문서/규칙 중심 상태이므로, Vite 기반 React 19 + TypeScript 앱을 스캐폴딩하고 FSD 디렉토리, 개발 도구, 테스트 도구, mock API 준비 구조를 만든다.

이번 Unit은 실제 AssetFlow 기능 화면을 구현하지 않는다. 목표는 이후 Unit 1~8이 안정적으로 구현될 수 있는 실행 가능한 앱 기반을 만드는 것이다.

## 1. 반드시 읽을 문서

- `AGENTS.md`
- `PRD.mdc`
- `docs/PROJECT_GUIDE.md`
- `docs/WORK_LOG.md`
- `docs/REVIEW_LOG.md`
- `docs/SESSION_STATE.md`
- `.rules/project-rules_architecture.mdc`
- `.rules/project-rules_working.mdc`
- `.rules/project-rules_naming.mdc`
- `.rules/project-rules_testing-policy.mdc`
- `.rules/project-rules_api-error-handling.mdc`
- `.rules/project-rules_mock-api.mdc`

## 2. 작업 범위

### 포함

- Vite 기반 React 19 + TypeScript 프로젝트 스캐폴딩
- pnpm 기반 script 구성
- ESLint, Prettier, TypeScript, Vitest, React Testing Library 설정
- MSW 사용을 위한 기본 디렉토리와 테스트 setup 준비
- shadcn/ui 도입을 위한 Tailwind CSS 기반 스타일 환경 준비
- FSD 기본 디렉토리 생성
- path alias 설정
- 최소 앱 엔트리와 기본 라우팅 준비
- Unit 0 완료 후 Claude Code가 `WORK_LOG.md`, `SESSION_STATE.md` 갱신

### 제외

- 로그인, 온보딩, 대시보드, 리밸런싱, 포트폴리오, 설정 화면 구현
- 실제 카카오 OAuth 연동
- 실제 증권사 API 연동
- Supabase 실제 연동
- 도메인 모델, mock portfolio data, 계산 로직 구현
- AGENTS.md 제품 설명 갱신
- unrelated 변경 되돌리기

## 3. 예상 변경 파일

### 신규 후보

- `package.json`
- `pnpm-lock.yaml`
- `index.html`
- `vite.config.ts`
- `vitest.config.ts`
- `tsconfig.json`
- `tsconfig.node.json`
- `eslint.config.js`
- `.prettierrc`
- `postcss.config.js`
- `tailwind.config.ts`
- `src/main.tsx`
- `src/apps/App.tsx`
- `src/apps/router/index.tsx`
- `src/apps/providers/AppProviders.tsx`
- `src/apps/styles/index.css`
- `src/pages/index.ts`
- `src/widgets/index.ts`
- `src/features/index.ts`
- `src/entities/index.ts`
- `src/shared/index.ts`
- `src/shared/config/routes.ts`
- `src/shared/api/mocks/browser.ts`
- `src/shared/api/mocks/server.ts`
- `src/shared/api/mocks/handlers.ts`
- `src/shared/test/setupTests.ts`
- `src/shared/ui/README.md`
- `src/shared/lib/README.md`

### 수정 후보

- `docs/WORK_LOG.md`
- `docs/SESSION_STATE.md`
- 필요 시 `.gitignore`

## 4. 구현 규칙

- 프로젝트 기존 문서 규칙과 `.rules`를 우선한다.
- 현재 Unit은 기반 구축만 수행한다. 화면/도메인 기능을 앞당겨 구현하지 않는다.
- PRD의 기술 스택 보완 사항을 반영하되, MVP 첫 스캐폴딩은 SSR 요구가 없으므로 Vite를 사용한다.
- React 19 기준으로 불필요한 `import React from 'react'`를 추가하지 않는다.
- 디렉토리는 kebab-case를 사용한다.
- FSD public API를 고려해 각 레이어에 `index.ts`를 둔다.
- path alias는 `@apps`, `@pages`, `@widgets`, `@features`, `@entities`, `@shared`를 준비한다.
- 테스트 setup은 실제 테스트가 하나 이상 실행 가능해야 한다.
- MSW handler는 빈 배열 또는 health-check용 mock만 둔다. 실제 AssetFlow API mock은 Unit 1 이후 작성한다.
- `AGENTS.template.md` 삭제 상태는 기존 worktree 변경이므로 되돌리지 않는다.
- `PRD.mdc`, `docs/PROJECT_GUIDE.md`는 이번 Unit에서 수정하지 않는다.
- 커밋은 사용자가 명시적으로 요청하기 전까지 만들지 않는다.

## 5. 테스트 및 검증

아래 명령을 가능한 범위에서 실행하고 결과를 `WORK_LOG.md`에 기록한다.

```bash
pnpm lint
```

```bash
pnpm test
```

```bash
pnpm typecheck
```

```bash
pnpm build
```

```bash
git diff --check
```

패키지 설치 또는 dev server 실행이 네트워크/권한 문제로 막히면, 실패 로그와 원인을 `WORK_LOG.md`와 `SESSION_STATE.md`에 기록한다.

## 6. 완료 기준

- `package.json`에 `dev`, `build`, `lint`, `test`, `typecheck` script가 존재한다.
- 앱이 Vite 엔트리에서 렌더링 가능한 상태다.
- FSD 기본 레이어 디렉토리가 존재한다.
- path alias가 TypeScript와 Vite 설정에 반영되어 있다.
- Vitest + RTL setup이 동작한다.
- MSW 기본 구조가 존재한다.
- Tailwind/shadcn 기반 스타일 준비가 되어 있다.
- `pnpm lint`, `pnpm test`, `pnpm typecheck`, `pnpm build`, `git diff --check` 결과가 `WORK_LOG.md`에 기록되어 있다.
- 작업 중단 또는 완료 시 `SESSION_STATE.md`가 최신화되어 있다.

## 7. 완료 보고 형식

Claude Code는 작업 완료 후 `WORK_LOG.md` 상단에 아래 항목을 기록한다.

- 작업 일자
- 작업 단위명: Unit 0 — 프로젝트 스캐폴딩과 개발 도구 구성
- 작업 브랜치
- 변경 파일
- 구현 내용
- 검증 결과
- 남은 리스크
- 리뷰 요청 포인트

`SESSION_STATE.md`에는 현재 브랜치, 마지막 완료 작업, 미완료 작업, 커밋 여부, worktree 주의사항, 다음 액션을 기록한다.

## 8. 리뷰 결과 및 보완 지시

2026-05-26 GPT 리뷰 결과: NOT PASS.

아래 Critical 2건을 보완한 뒤 Unit 0 재리뷰를 요청한다.

- `package.json`의 `typecheck` 스크립트가 루트 `tsconfig.json`의 references를 실제로 검증하지 않는다. `tsc -b` 또는 동등하게 `tsconfig.app.json`, `tsconfig.node.json`까지 검증하는 명령으로 수정한다.
- `src/apps/router/index.tsx`에서 `@shared/config/routes` deep import를 사용하고 있다. `src/shared/index.ts` public API를 경유하도록 `@shared` import로 수정한다.

보완 후 아래 명령을 재실행하고 결과를 `docs/WORK_LOG.md`, `docs/SESSION_STATE.md`에 기록한다.

```bash
pnpm lint
```

```bash
pnpm test
```

```bash
pnpm typecheck
```

```bash
pnpm build
```

```bash
git diff --check
```

## 9. 재리뷰 결과

2026-05-26 GPT 1차 보완 재리뷰 결과: PASS WITH WARNINGS.

- C1 resolved: `package.json`의 `typecheck` 스크립트가 `tsc -b --noEmit`로 변경됐다.
- C2 resolved: `src/apps/router/index.tsx`가 `@shared` public API 경유 import로 변경됐다.
- W1 resolved: Vite 기본 favicon 참조가 제거됐다.
- 남은 Warning: `index.html` 들여쓰기 정리, shadcn/ui 초기화와 Tailwind v4 호환성 검증은 후속 Unit에서 처리한다.

Unit 0은 완료로 보고 Unit 1 착수 문서 승격이 가능하다.
