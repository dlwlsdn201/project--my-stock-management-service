# Current Task — 현재 작업 지시서

## 0. 작업 요약

Post-MVP Unit 17 — MSW 브라우저 워커 준비

이번 작업은 브라우저 개발 환경에서 MSW mock API를 사용할 수 있도록 `public/mockServiceWorker.js`를 생성하고, 기존 `src/shared/api/mocks/browser.ts` worker 구성이 실제 앱 부트스트랩에서 선택적으로 동작할 수 있는 준비 상태를 만든다.

## 1. 반드시 읽을 문서

- `AGENTS.md`
- `PRD.mdc`
- `docs/PROJECT_GUIDE.md`
- `docs/WORK_LOG.md`
- `docs/REVIEW_LOG.md`
- `docs/SESSION_STATE.md`
- `docs/superpowers/plans/2026-06-03-unit17-msw-browser-worker.md`
- `.rules/project-rules_architecture.mdc`
- `.rules/project-rules_working.mdc`
- `.rules/project-rules_testing-policy.mdc`
- `.rules/project-rules_review.mdc`

## 2. 선행 상태

- Unit 0에서 MSW 패키지와 기본 mock 구조가 준비되었다.
- 현재 존재하는 파일:
  - `src/shared/api/mocks/handlers.ts`
  - `src/shared/api/mocks/browser.ts`
  - `src/shared/api/mocks/server.ts`
  - `src/shared/test/setupTests.ts`
- `public/` 디렉터리와 `public/mockServiceWorker.js`는 아직 없다.
- 테스트 MSW 서버는 동작하지만, 브라우저 개발 환경에서 service worker를 사용할 준비는 미완료 상태다.

## 3. 작업 범위

### 포함

- `public/mockServiceWorker.js` 생성
- 브라우저 MSW 시작 함수를 앱 부트스트랩에서 선택적으로 호출할 수 있게 정리
- Vite dev 환경에서만 MSW worker가 시작되도록 안전한 env gate 적용
- health-check handler(`/api/health`) 기준 smoke 검증 추가 또는 문서화
- MSW 사용 방법을 `WORK_LOG.md`, `SESSION_STATE.md`에 기록

### 제외

- 실제 backend API 연동
- Supabase adapter 구현
- 모든 mock API handler 확장
- 인증/포트폴리오 API를 HTTP 기반으로 전면 전환
- 배포 환경에서 MSW 자동 실행
- 커밋 생성

## 4. 설계 지침

- `public/mockServiceWorker.js`는 `pnpm exec msw init public --save` 또는 동등한 MSW 공식 CLI 방식으로 생성한다.
- MSW worker는 production build에서 시작하지 않는다.
- 앱 부트스트랩에서 MSW 시작이 필요한 경우 `import.meta.env.DEV`와 명시적 env flag를 함께 고려한다.
- env flag 이름은 Vite 규칙에 맞춰 `VITE_ENABLE_MSW`를 우선 사용한다.
- MSW worker 시작 코드는 앱 진입부를 과도하게 복잡하게 만들지 않는다.
- 기존 test server(`src/shared/api/mocks/server.ts`) 구조는 유지한다.
- 신규 패키지 설치는 하지 않는다. 이미 설치된 `msw`를 사용한다.

## 5. 예상 변경 파일

### 신규 후보

- `public/mockServiceWorker.js`
- `src/shared/api/mocks/startWorker.ts` 또는 유사한 브라우저 worker bootstrap helper

### 수정 후보

- `src/main.tsx`
- `src/shared/index.ts` 또는 `src/shared/api` public API가 필요한 경우
- `docs/WORK_LOG.md`
- `docs/SESSION_STATE.md`

## 6. 필수 구현 상세

### 6.1 Service Worker 파일

- `public/` 디렉터리가 없으면 생성한다.
- MSW CLI로 `public/mockServiceWorker.js`를 생성한다.
- 생성된 파일은 수동 편집하지 않는다.

### 6.2 Browser Worker 시작 조건

권장 조건:

```ts
const shouldEnableMsw = import.meta.env.DEV && import.meta.env.VITE_ENABLE_MSW === 'true';
```

- `VITE_ENABLE_MSW`가 `'true'`일 때만 브라우저 worker를 시작한다.
- worker 시작 실패가 앱 전체 렌더링을 막지 않도록 처리한다.
- production build에서는 worker import/start가 실행되지 않아야 한다.

### 6.3 App Bootstrap

- `src/main.tsx`에서 앱 렌더링 전에 MSW 준비를 기다릴지, 렌더 후 비동기로 시작할지 결정하고 이유를 `WORK_LOG.md`에 기록한다.
- 일반적으로 mock API가 초기 렌더링 fetch에 관여한다면 render 전 await가 안전하다.
- 현재 앱은 대부분 in-memory/mock state 기반이므로 단순 bootstrap helper 방식도 가능하다.

### 6.4 Smoke 검증

가능하면 개발 환경에서 `/api/health` handler가 MSW로 응답할 수 있음을 문서화하거나 테스트한다.

필수 최소 검증:

- 기존 Vitest MSW server 테스트 구조가 깨지지 않는다.
- production build가 worker bootstrap 때문에 실패하지 않는다.

## 7. 구현 규칙

- FSD 의존성 방향 준수
- deep import 금지, public API 경유
- `any` 금지
- 신규 패키지 설치 금지
- production 환경에서 MSW 자동 실행 금지
- service worker 생성 파일은 MSW CLI 산출물로 유지

## 8. 테스트 및 검증

작업 완료 전 아래 명령 실행:

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
git diff --check
```

추가 권장:

```bash
VITE_ENABLE_MSW=true pnpm exec vite --host 127.0.0.1
```

브라우저에서 `/api/health` 또는 앱 초기 로드 중 MSW worker 등록 여부를 확인하고, 가능하면 `WORK_LOG.md`에 결과를 기록한다.

## 9. 완료 기준

- `public/mockServiceWorker.js`가 존재한다.
- 브라우저 MSW worker를 dev 환경에서 opt-in으로 시작할 수 있다.
- production build가 정상 통과한다.
- 기존 테스트 MSW server 구조가 유지된다.
- `WORK_LOG.md`, `SESSION_STATE.md`가 최신화된다.
