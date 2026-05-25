---
version: v2.0
updated: 2026-05-20
name: generate-fsd-api-layer
description: FSD 3단계 통신 구조(Jotai Params, 순수 Fetcher, Custom Hook) 파일 세트를 자동 생성. entities API, FSD API 세트, Mock API, mock data 생성 시 적용. globs: src/features/**/*, src/entities/**/*
---

# FSD 3단계 API 세트 자동 생성 스킬

이 스킬이 호출되면, AI는 반드시 `@project-rules_architecture.mdc`, `@project-rules_api-response-interface.mdc`, `@project-rules_api-error-handling.mdc`, `@project-rules_naming.mdc`, `@project-rules_mock-api.mdc` 를 먼저 읽고 다음 작업을 수행합니다.

## 1. 사용자 확인 사항

**먼저 아래 질문을 반드시 수행합니다:**

> "이번 작업의 목표가 **Mock API와 mock data 생성**인가요?"
> - **예**: 백엔드 API 미구현 상태에서 MSW 기반 mock API로 UI 선행 개발. mock data JSON, Fetcher, MockupHandler, Custom Hook, MSW 등록까지 함께 생성
> - **아니오**: 실제 API 연동을 전제로 Fetcher, Custom Hook만 생성

이어서 아래 정보를 물어보거나, 입력받은 명세를 바탕으로 코드를 생성합니다:
1. entities/* 레이어 하위에 존재하는 또는 신규로 생성할 도메인명 (예: device, schedule, user, batch-settings 등)
2. API 기능명 (예: readDeviceStatus, createSchedule, updateUserInfo)
3. API Path (예: 'api/devices/status' — baseURL 제외 상대 경로)

## 2. 생성할 파일 목록 (Mock API 목표가 **true**인 경우)

| 순서 | 대상 | 경로/규칙 |
|------|------|-----------|
| 1 | Mock data JSON | `entities/{슬라이스}/json/{fetcher함수명}.json` — Fetcher 함수명과 동일한 파일명. 내부에 mock response data 포함 |
| 2 | Fetcher + MockupHandler | `entities/{슬라이스}/api/{fetcher함수명}.ts` |
| 3 | Custom Hook | `entities/{슬라이스}/hook/useProcessed{기능명}.ts` |
| 4 | Params Store (필요 시) | `entities/{슬라이스}/store/{기능명}Params.atom.ts` |
| 5 | MSW 등록 | `apps/ui/MSWProvider.tsx` handlers에 `*MockupHandler` 추가 |
| 6 | Entity index | `entities/{슬라이스}/index.ts`에 `*MockupHandler` export 추가 |

## 3. 생성할 파일 목록 (Mock API 목표가 **false**인 경우)

1. `entities/{도메인명}/store/{기능명}Params.atom.ts`: Jotai Atom (interface 포함, 조회 API에 필요 시)
2. `entities/{도메인명}/api/{fetcher함수명}.ts`: 순수 Fetcher
3. `entities/{도메인명}/hook/{hook파일명}.ts`: Custom Hook
   - **조회(GET)**: `useSuspense{기능명}.ts` 또는 `useProcessed{기능명}.ts` (데이터 가공 시)
   - **변경(POST/PUT/DELETE)**: `useCreate{Entity}.ts` / `useUpdate{Entity}.ts` / `useDelete{Entity}.ts` — `useProcessed` 접두사 사용 금지
4. (Mutation + Dialog UI가 범위에 포함될 때) `features/{domain}/manage-{slice}/hook/useCreate{Entity}Dialog.tsx`: entities hook + `mutateAsync` 호출 시 toast

## 4. Mock API 생성 시 추가 규칙

- **Mock data JSON**:
  - 경로: `entities/{슬라이스}/json/{fetcher함수명}.json` (API Fetcher가 정의된 entities 슬라이스 폴더의 `json/*` 하위)
  - 파일명: Fetcher 함수명과 **동일** (예: `readDevices` fetcher → `readDevices.json`)
  - 내용: `api-response-standard` 형식의 mock response data (`{ data: T }` 또는 `{ data, meta? }`). UI 개발에 필요한 더미 데이터 생성
- **MockupHandler**: `baseMockupHandlerModule` 사용. `path`는 Fetcher의 API_PATH와 동일. `jsonFormData: () => import한JSON`
- **네이밍**: `{fetcher함수명}MockupHandler` (예: `readDevicesMockupHandler`)
- `@project-rules_mock-api.mdc` 참고

## 5. 공통 강제 규칙

- Fetcher: React Hook 절대 사용 금지. `read-`, `create-`, `update-`, `delete-` 접두사 camelCase
- Custom Hook: `use` 접두사 필수
  - 조회: `useSuspenseQuery` (신규 기본) 또는 레거시 `useBaseQuery`
  - 변경: **`useBaseMutation`** (`@shared/api` 또는 `@shared/api/hooks/useBaseQuery`) — `useMutation` 직접 호출 지양
- 모든 파일: TypeScript 인터페이스(Params, Response), JSDoc(`@returns` 등) 포함

## 6. API 응답 및 에러 핸들링 고려사항

### Fetcher (api/*.ts)

- `baseApiModule`만 호출. 에러 try-catch 또는 형식 분기 작성 금지
- 반환 타입: `api-response-standard`의 `ApiSuccessResponse<DataType>`. 목록 API는 `meta` 포함 여부 확인

### Custom Hook (hook/*.ts) — 조회(GET)

- **useSuspenseQuery**: 상위 `ApiQueryBoundary`로 감싸고, fallback에서 `NormalizedApiError` 형태 전제
- entities hook에 toast 금지

### Custom Hook (hook/*.ts) — 변경(Mutation)

- **`useBaseMutation`** + `mutationFn`(Fetcher)
- hook `onSuccess`: **`invalidateQueries`만** (관련 `queryKey`는 Fetcher path·기존 조회 hook과 SSOT 맞출 것)
- hook에 **toast·useModal 금지** — features Dialog/UI에서 `mutateAsync(payload, { onSuccess, onError })`로 처리
- `onError`의 `error`는 `Error` / `NormalizedApiError`, `error.message` 사용
- 레퍼런스: `entities/schedule/hook/useCreateSchedule.ts`, `features/zone/manage-zone/hook/useCreateZoneDialog.tsx`
- 상세: `project-rules_api-error-handling.mdc` §5-2, `project-rules_architecture.mdc` §3 [2단계] 2-2
