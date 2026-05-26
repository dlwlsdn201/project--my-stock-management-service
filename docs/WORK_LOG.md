# Work Log — 작업 결과 로그

## 0. 운영 규칙

- Claude Code는 단위 작업 완료 시 이 문서 상단에 결과를 추가한다.
- 변경 파일, 구현 내용, 검증 결과, 남은 리스크를 기록한다.
- 기존 오류와 신규 오류를 구분해 기록한다.
- 리뷰 결과 자체는 `REVIEW_LOG.md`에 기록한다.
- 진행 현황 표는 Unit 상태가 바뀔 때 함께 갱신한다.

## 1. 진행 현황

| Unit | 상태 | 담당 | 리뷰 상태 | 비고 |
| --- | --- | --- | --- | --- |
| Unit 0 — 프로젝트 스캐폴딩과 개발 도구 구성 | DONE | Claude Code | PASS WITH WARNINGS | 2026-05-26 GPT 재리뷰 통과 |
| Unit 1 — 도메인 모델, 상수, mock 데이터, 계산 로직 SSOT 구축 | PLANNED | Claude Code | NOT REQUESTED | `NEXT_TASK_DRAFT.md` 작성 완료 |
| Unit 2 — 공통 앱 쉘, 라우팅, 테마, 레이아웃 기반 구축 | PLANNED | Claude Code | NOT REQUESTED | Unit 0, Unit 1 이후 |
| Unit 3 — 인증 UI와 mock 로그인 플로우 구현 | PLANNED | Claude Code | NOT REQUESTED | Unit 2 이후 |
| Unit 4 — 증권사 연동 온보딩과 mock 연결 상태 구현 | PLANNED | Claude Code | NOT REQUESTED | Unit 2, Unit 3 이후 |
| Unit 5 — 수동 자산 입력과 목표 비중 설정 구현 | PLANNED | Claude Code | NOT REQUESTED | Unit 1, Unit 2 이후 |
| Unit 6 — 포트폴리오 대시보드 구현 | PLANNED | Claude Code | NOT REQUESTED | Unit 1, Unit 2, Unit 5 이후 |
| Unit 7 — AI 리밸런싱 제안 구현 | PLANNED | Claude Code | NOT REQUESTED | Unit 1, Unit 5, Unit 6 이후 |
| Unit 8 — 주식 포트폴리오 관리 구현 | PLANNED | Claude Code | NOT REQUESTED | Unit 1, Unit 5, Unit 7 이후 |
| Unit 9 — Supabase 연동 후보 검증과 persistence 전환 | PLANNED | Claude Code | NOT REQUESTED | Unit 1~8 이후 |
| Unit 10 — 접근성, 반응형, 에러/빈 상태 품질 보강 | PLANNED | Claude Code | NOT REQUESTED | Unit 2~8 이후 |
| Unit 11 — 최종 검증, 문서 정리, 릴리즈 후보 정리 | PLANNED | Claude Code | NOT REQUESTED | Unit 0~10 이후 |

## 2. 단위 작업 결과

---

### Unit 0 — 프로젝트 스캐폴딩과 개발 도구 구성

- **작업 일자**: 2026-05-26
- **작업 브랜치**: `main`

#### 변경 파일

**신규 생성**

| 파일 | 설명 |
| --- | --- |
| `package.json` | pnpm 기반 스크립트 및 의존성 정의 |
| `index.html` | Vite 앱 엔트리 HTML |
| `vite.config.ts` | Vite + React + Tailwind v4 플러그인, path alias |
| `vitest.config.ts` | Vitest + RTL + jsdom 설정, path alias |
| `tsconfig.json` | TypeScript project references 루트 |
| `tsconfig.app.json` | 앱 소스 TypeScript 설정, path alias |
| `tsconfig.node.json` | Vite/Vitest 설정 파일용 TypeScript |
| `eslint.config.js` | ESLint flat config (ts-eslint, react-hooks, react-refresh) |
| `.prettierrc` | Prettier 포맷 설정 |
| `postcss.config.js` | PostCSS 빈 설정 (Tailwind는 Vite 플러그인으로 처리) |
| `src/vite-env.d.ts` | Vite 클라이언트 타입 참조 (CSS import 허용) |
| `src/main.tsx` | React 19 StrictMode 앱 마운트 엔트리 |
| `src/apps/App.tsx` | AppProviders + AppRouter 조합 루트 컴포넌트 |
| `src/apps/router/index.tsx` | createBrowserRouter 기반 기본 라우팅 (6개 라우트 placeholder) |
| `src/apps/providers/AppProviders.tsx` | TanStack Query QueryClientProvider 래퍼 |
| `src/apps/styles/index.css` | Tailwind v4 import + shadcn/ui CSS 변수 (라이트/다크) |
| `src/pages/index.ts` | pages 레이어 public API (빈 배럴) |
| `src/widgets/index.ts` | widgets 레이어 public API (빈 배럴) |
| `src/features/index.ts` | features 레이어 public API (빈 배럴) |
| `src/entities/index.ts` | entities 레이어 public API (빈 배럴) |
| `src/shared/index.ts` | shared 레이어 public API (routes re-export) |
| `src/shared/config/routes.ts` | ROUTES 상수 (6개 라우트 경로) |
| `src/shared/config/routes.test.ts` | ROUTES 상수 smoke 테스트 |
| `src/shared/api/mocks/handlers.ts` | MSW handler (health-check mock만 포함) |
| `src/shared/api/mocks/browser.ts` | MSW browser worker 설정 |
| `src/shared/api/mocks/server.ts` | MSW node server 설정 (테스트용) |
| `src/shared/test/setupTests.ts` | Vitest setupFiles — jest-dom import + MSW server 생명주기 |
| `src/shared/ui/README.md` | shared/ui 레이어 설명 |
| `src/shared/lib/README.md` | shared/lib 레이어 설명 |

**수정**

- `docs/WORK_LOG.md` (이 문서)
- `docs/SESSION_STATE.md`

#### 구현 내용

- **프레임워크**: Vite 6 + React 19 + TypeScript 5.7 SPA (SSR 미사용)
- **스타일**: Tailwind CSS v4 (`@tailwindcss/vite` 플러그인) + shadcn/ui CSS 변수 기반 라이트/다크 토큰 준비
- **라우팅**: React Router DOM v7 `createBrowserRouter`, 6개 라우트 placeholder
- **상태 관리 기반**: TanStack Query v5 `QueryClientProvider` 준비
- **FSD 레이어**: `apps`, `pages`, `widgets`, `features`, `entities`, `shared` 디렉토리 + 각 `index.ts` public API
- **Path alias**: `@apps`, `@pages`, `@widgets`, `@features`, `@entities`, `@shared` (tsconfig + vite + vitest 모두 반영)
- **MSW**: handler(health-check), browser worker, node server 기본 구조
- **테스트**: Vitest + RTL + jest-dom + MSW 서버 생명주기 setupTests 구성
- **패키지 빌드 승인**: `pnpm.onlyBuiltDependencies` 로 `esbuild`, `msw` 자동 승인

#### 검증 결과 (초기 — 2026-05-26 v1)

| 명령 | 결과 | 비고 |
| --- | --- | --- |
| `pnpm typecheck` | ❌ INVALID | `tsc --noEmit`이 references 검증 안 함 (false positive) |
| `pnpm test` | ✅ PASS | 1 test file, 1 test passed (routes smoke test) |
| `pnpm lint` | ✅ PASS | 오류 없음 |
| `pnpm build` | ✅ PASS | dist 316KB (gzip 100KB) |
| `git diff --check` | ✅ PASS | whitespace 오류 없음 |

#### GPT 리뷰 NOT PASS — 보완 내역 (2026-05-26 v2)

| 항목 | 내용 |
| --- | --- |
| C1 수정 | `package.json` `typecheck` 스크립트: `tsc --noEmit` → `tsc -b --noEmit` |
| C2 수정 | `src/apps/router/index.tsx` `ROUTES` import: `@shared/config/routes` → `@shared` (public API 경유) |
| C2 보조 | `tsconfig.app.json` paths에 와일드카드 없는 레이어 alias 추가 (`@shared`, `@pages`, …) |
| C2 보조 | `src/apps/index.ts` 신규 생성 (apps 레이어 public API) |
| W1 처리 | `index.html` Vite 기본 favicon 참조 제거 |

#### 검증 결과 (보완 후 — 2026-05-26 v2)

| 명령 | 결과 | 비고 |
| --- | --- | --- |
| `pnpm typecheck` | ✅ PASS | `tsc -b --noEmit` — references 포함 검증 |
| `pnpm test` | ✅ PASS | 1 test file, 1 test passed |
| `pnpm lint` | ✅ PASS | 오류 없음 |
| `pnpm build` | ✅ PASS | dist 316KB (gzip 100KB) |
| `git diff --check` | ✅ PASS | whitespace 오류 없음 |

#### 남은 리스크

| 리스크 | 설명 | 대응 |
| --- | --- | --- |
| shadcn/ui 컴포넌트 미설치 | CLI로 컴포넌트 개별 설치 필요 | Unit 2에서 shadcn init 및 컴포넌트 추가 |
| MSW Service Worker 파일 미생성 | 브라우저 MSW는 `msw init` 명령으로 `public/mockServiceWorker.js` 생성 필요 | Unit 1 이후 MSW 실제 사용 시 실행 |
| Tailwind v4 CSS 변수 shadcn 호환성 | shadcn/ui v2+ Tailwind v4 지원 확인 필요 | Unit 2 shadcn init 시점 검증 |
| `postcss.config.js` 빈 파일 잔존 | shadcn CLI 호환성을 위해 남겨둠 | Unit 2에서 실제 필요 여부 재확인 후 삭제 또는 유지 |

#### 리뷰 요청 포인트 (재리뷰)

1. `tsconfig.app.json`의 와일드카드 없는 alias(`@shared` 등)와 와일드카드 alias(`@shared/*`)가 함께 존재하는 구조가 적절한지 확인
2. Tailwind v4 `@tailwindcss/vite` 플러그인 방식이 shadcn/ui CLI와 호환되는지 확인
3. `src/apps/styles/index.css`의 CSS 변수 토큰이 shadcn/ui 공식 기준과 일치하는지 확인
