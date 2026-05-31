# Unit 3 — 인증 UI와 mock 로그인 플로우 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 로그인 페이지를 실제 동작 가능한 mock 인증 흐름으로 전환한다 — 이메일/비밀번호 로그인, 카카오 mock 로그인, 성공/실패 상태 처리, 신규/기존 사용자 라우팅 분기 포함.

**Architecture:** `entities/session` 슬라이스에 in-memory mock 로그인 함수(HTTP 없음)를 두고, `features/auth-login`에서 RHF 기반 LoginForm을 구현한다. `pages/login`이 5:5 분할 레이아웃으로 이를 조합한다. MSW 핸들러와 TanStack Query 사용 없이 순수 async 함수로 mock 인증을 처리한다.

**Tech Stack:** React 19, React Hook Form 7.54 (native validation), Zod 3.24 (type inference + safeParse in validate), React Router v7 (useNavigate), Vitest + RTL + jsdom

---

## File Map

### 신규 생성

| 파일 | 역할 |
|------|------|
| `src/entities/session/model/types.ts` | LoginResult, MockAccount, UserStatus 타입 정의 |
| `src/entities/session/model/constants.ts` | 에러 메시지 상수 |
| `src/entities/session/model/mockSession.ts` | mock 계정 fixture (신규/기존 사용자) |
| `src/entities/session/api/login.ts` | loginWithEmail, loginWithKakao — in-memory 순수 async 함수 |
| `src/entities/session/index.ts` | session slice public API |
| `src/features/auth-login/ui/LoginForm.test.tsx` | **TDD — 구현 전 작성할 failing 테스트** |
| `src/features/auth-login/ui/LoginForm.tsx` | RHF 기반 로그인 폼 컴포넌트 |
| `src/features/auth-login/index.ts` | auth-login slice public API |

### 수정

| 파일 | 변경 내용 |
|------|-----------|
| `src/entities/index.ts` | `export * from './session'` 추가 |
| `src/features/index.ts` | `export * from './auth-login'` 추가 |
| `src/pages/login/ui/LoginPage.tsx` | placeholder 제거 → 5:5 분할 레이아웃 + LoginForm 조합 |
| `docs/CURRENT_TASK.md` | Unit 3 지시서로 갱신 |
| `docs/WORK_LOG.md` | Unit 3 완료 기록 추가 |
| `docs/SESSION_STATE.md` | 현재 상태 갱신 |

---

## Task 1: entities/session — 타입, 상수, mock fixture

**Files:**
- Create: `src/entities/session/model/types.ts`
- Create: `src/entities/session/model/constants.ts`
- Create: `src/entities/session/model/mockSession.ts`

- [ ] **Step 1: types.ts 생성**

```typescript
// src/entities/session/model/types.ts
export type UserStatus = 'new' | 'existing';
export type LoginProvider = 'email' | 'kakao';

export interface MockAccount {
  id: string;
  email: string;
  password: string;
  userStatus: UserStatus;
}

export interface LoginSuccessResult {
  success: true;
  userStatus: UserStatus;
}

export interface LoginFailureResult {
  success: false;
  errorMessage: string;
}

export type LoginResult = LoginSuccessResult | LoginFailureResult;

export interface LoginEmailPayload {
  email: string;
  password: string;
}
```

- [ ] **Step 2: constants.ts 생성**

```typescript
// src/entities/session/model/constants.ts
export const LOGIN_ERROR_MESSAGES = {
  INVALID_CREDENTIALS: '이메일 또는 비밀번호가 올바르지 않습니다.',
} as const;
```

- [ ] **Step 3: mockSession.ts 생성**

```typescript
// src/entities/session/model/mockSession.ts
import type { MockAccount } from './types';

export const MOCK_ACCOUNTS: MockAccount[] = [
  {
    id: 'user-001',
    email: 'new@assetflow.ai',
    password: 'password123',
    userStatus: 'new',
  },
  {
    id: 'user-002',
    email: 'user@assetflow.ai',
    password: 'password123',
    userStatus: 'existing',
  },
];
```

---

## Task 2: entities/session — login API 함수

**Files:**
- Create: `src/entities/session/api/login.ts`

> **Note (테스트 정책):** `api/` 하위 fetcher 단독 테스트는 정책상 금지. 이 함수는 LoginForm 통합 테스트에서 간접 검증한다.

- [ ] **Step 1: login.ts 생성**

```typescript
// src/entities/session/api/login.ts
import type { LoginEmailPayload, LoginResult } from '../model/types';
import { LOGIN_ERROR_MESSAGES } from '../model/constants';
import { MOCK_ACCOUNTS } from '../model/mockSession';

export const loginWithEmail = async (payload: LoginEmailPayload): Promise<LoginResult> => {
  const account = MOCK_ACCOUNTS.find(
    (acc) => acc.email === payload.email && acc.password === payload.password,
  );

  if (!account) {
    return { success: false, errorMessage: LOGIN_ERROR_MESSAGES.INVALID_CREDENTIALS };
  }

  return { success: true, userStatus: account.userStatus };
};

export const loginWithKakao = async (): Promise<LoginResult> => {
  // Mock Kakao: 항상 기존 사용자 성공으로 처리
  return { success: true, userStatus: 'existing' };
};
```

---

## Task 3: entities/session — barrel export 및 entities index 갱신

**Files:**
- Create: `src/entities/session/index.ts`
- Modify: `src/entities/index.ts`

- [ ] **Step 1: session/index.ts 생성**

```typescript
// src/entities/session/index.ts
export * from './model/types';
export * from './model/constants';
export * from './model/mockSession';
export * from './api/login';
```

- [ ] **Step 2: entities/index.ts에 session 추가**

현재 파일 (`src/entities/index.ts`):
```typescript
export * from './brokerage';
export * from './portfolio';
export * from './rebalancing';
```

변경 후:
```typescript
export * from './brokerage';
export * from './portfolio';
export * from './rebalancing';
export * from './session';
```

- [ ] **Step 3: typecheck 실행하여 session slice 타입 오류 없음 확인**

```bash
pnpm typecheck
```

Expected: 오류 없음 (entities/session 관련 파일 모두 통과)

---

## Task 4: features/auth-login — 실패 테스트 먼저 작성 (TDD)

**Files:**
- Create: `src/features/auth-login/ui/LoginForm.test.tsx`

> **Context:** MSW 서버는 `onUnhandledRequest: 'error'`로 설정되어 있다. `loginWithEmail`과 `loginWithKakao`는 HTTP 요청이 없는 in-memory 함수이므로 MSW 핸들러 불필요. 테스트는 MemoryRouter로 감싸서 `useNavigate`를 사용 가능하게 한다.

- [ ] **Step 1: LoginForm.test.tsx 생성**

```typescript
// src/features/auth-login/ui/LoginForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { LoginForm } from './LoginForm';

const renderLoginForm = () => {
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/dashboard" element={<div>Dashboard 페이지</div>} />
        <Route path="/onboarding/brokerage" element={<div>온보딩 페이지</div>} />
      </Routes>
    </MemoryRouter>,
  );
  return { user };
};

describe('LoginForm', () => {
  it('이메일 미입력 시 유효성 에러를 표시한다', async () => {
    const { user } = renderLoginForm();
    await user.click(screen.getByRole('button', { name: '로그인' }));
    expect(await screen.findByText('이메일을 입력해주세요.')).toBeInTheDocument();
  });

  it('비밀번호 미입력 시 유효성 에러를 표시한다', async () => {
    const { user } = renderLoginForm();
    await user.type(screen.getByLabelText('이메일'), 'user@assetflow.ai');
    await user.click(screen.getByRole('button', { name: '로그인' }));
    expect(await screen.findByText('비밀번호를 입력해주세요.')).toBeInTheDocument();
  });

  it('신규 사용자 이메일 로그인 성공 시 /onboarding/brokerage로 이동한다', async () => {
    const { user } = renderLoginForm();
    await user.type(screen.getByLabelText('이메일'), 'new@assetflow.ai');
    await user.type(screen.getByLabelText('비밀번호'), 'password123');
    await user.click(screen.getByRole('button', { name: '로그인' }));
    await waitFor(() => {
      expect(screen.getByText('온보딩 페이지')).toBeInTheDocument();
    });
  });

  it('기존 사용자 이메일 로그인 성공 시 /dashboard로 이동한다', async () => {
    const { user } = renderLoginForm();
    await user.type(screen.getByLabelText('이메일'), 'user@assetflow.ai');
    await user.type(screen.getByLabelText('비밀번호'), 'password123');
    await user.click(screen.getByRole('button', { name: '로그인' }));
    await waitFor(() => {
      expect(screen.getByText('Dashboard 페이지')).toBeInTheDocument();
    });
  });

  it('잘못된 자격증명 로그인 실패 시 에러 메시지를 표시하고 페이지를 유지한다', async () => {
    const { user } = renderLoginForm();
    await user.type(screen.getByLabelText('이메일'), 'wrong@assetflow.ai');
    await user.type(screen.getByLabelText('비밀번호'), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: '로그인' }));
    await waitFor(() => {
      expect(
        screen.getByText('이메일 또는 비밀번호가 올바르지 않습니다.'),
      ).toBeInTheDocument();
    });
    // 페이지 유지 확인: 로그인 버튼이 아직 있음
    expect(screen.getByRole('button', { name: '로그인' })).toBeInTheDocument();
  });

  it('카카오 로그인 성공 시 /dashboard로 이동한다', async () => {
    const { user } = renderLoginForm();
    await user.click(screen.getByRole('button', { name: '카카오 로그인' }));
    await waitFor(() => {
      expect(screen.getByText('Dashboard 페이지')).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 2: 테스트 실행하여 실패 확인 (LoginForm이 아직 없으므로 FAIL 예상)**

```bash
pnpm test src/features/auth-login/ui/LoginForm.test.tsx
```

Expected: `Cannot find module './LoginForm'` 또는 유사한 import 오류로 FAIL

---

## Task 5: features/auth-login — LoginForm 컴포넌트 구현

**Files:**
- Create: `src/features/auth-login/ui/LoginForm.tsx`
- Create: `src/features/auth-login/index.ts`
- Modify: `src/features/index.ts`

> **구현 가이드:**
> - `@hookform/resolvers`가 미설치 → RHF 네이티브 `validate` 옵션에 zod safeParse를 활용한다.
> - 폼 에러는 `role="alert"` span으로 표시 (접근성).
> - submit 중 상태는 `isSubmitting`으로 버튼 disabled 처리.
> - 카카오 로그인은 별도 `useState` 로딩 상태를 사용 (isSubmitting은 RHF form에만 적용됨).
> - 전역 API 에러는 `setError('root', ...)` + `errors.root` 로 처리 (RHF v7.54 지원).

- [ ] **Step 1: LoginForm.tsx 생성**

```typescript
// src/features/auth-login/ui/LoginForm.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { loginWithEmail, loginWithKakao } from '@entities/session';
import { Button, ROUTES } from '@shared';
import type { UserStatus } from '@entities/session';

const emailFieldSchema = z.string().email('올바른 이메일 형식이 아닙니다.');

interface LoginFormValues {
  email: string;
  password: string;
}

export const LoginForm = () => {
  const navigate = useNavigate();
  const [isKakaoLoading, setIsKakaoLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>();

  const handleNavigateAfterLogin = (userStatus: UserStatus) => {
    const target =
      userStatus === 'new' ? ROUTES.ONBOARDING_BROKERAGE : ROUTES.DASHBOARD;
    navigate(target);
  };

  const onEmailSubmit = handleSubmit(async (values) => {
    const result = await loginWithEmail(values);
    if (!result.success) {
      setError('root', { message: result.errorMessage });
      return;
    }
    handleNavigateAfterLogin(result.userStatus);
  });

  const handleKakaoLogin = async () => {
    setIsKakaoLoading(true);
    try {
      const result = await loginWithKakao();
      if (!result.success) {
        setError('root', { message: result.errorMessage });
        return;
      }
      handleNavigateAfterLogin(result.userStatus);
    } finally {
      setIsKakaoLoading(false);
    }
  };

  const isFormDisabled = isSubmitting || isKakaoLoading;

  return (
    <form onSubmit={onEmailSubmit} noValidate aria-label="로그인 폼">
      <div className="mb-4">
        <label
          htmlFor="email"
          className="mb-1 block text-sm font-medium text-[hsl(var(--foreground))]"
        >
          이메일
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          disabled={isFormDisabled}
          className="w-full rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] disabled:opacity-50"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          {...register('email', {
            required: '이메일을 입력해주세요.',
            validate: (value) => {
              const result = emailFieldSchema.safeParse(value);
              return result.success || result.error.errors[0]?.message ?? '올바른 이메일 형식이 아닙니다.';
            },
          })}
        />
        {errors.email && (
          <span id="email-error" role="alert" className="mt-1 block text-xs text-red-500">
            {errors.email.message}
          </span>
        )}
      </div>

      <div className="mb-6">
        <label
          htmlFor="password"
          className="mb-1 block text-sm font-medium text-[hsl(var(--foreground))]"
        >
          비밀번호
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          disabled={isFormDisabled}
          className="w-full rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] disabled:opacity-50"
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? 'password-error' : undefined}
          {...register('password', {
            required: '비밀번호를 입력해주세요.',
          })}
        />
        {errors.password && (
          <span id="password-error" role="alert" className="mt-1 block text-xs text-red-500">
            {errors.password.message}
          </span>
        )}
      </div>

      {errors.root && (
        <p role="alert" className="mb-4 rounded-[var(--radius)] bg-red-50 px-3 py-2 text-sm text-red-600">
          {errors.root.message}
        </p>
      )}

      <Button
        type="submit"
        variant="primary"
        disabled={isFormDisabled}
        className="mb-3 w-full"
      >
        {isSubmitting ? '로그인 중...' : '로그인'}
      </Button>

      <div className="relative mb-3 flex items-center">
        <div className="flex-1 border-t border-[hsl(var(--border))]" />
        <span
          aria-hidden="true"
          className="mx-3 text-xs text-[hsl(var(--muted-foreground))]"
        >
          또는
        </span>
        <div className="flex-1 border-t border-[hsl(var(--border))]" />
      </div>

      <Button
        type="button"
        variant="secondary"
        onClick={handleKakaoLogin}
        disabled={isFormDisabled}
        className="w-full"
      >
        {isKakaoLoading ? '처리 중...' : '카카오 로그인'}
      </Button>
    </form>
  );
};
```

- [ ] **Step 2: auth-login/index.ts 생성**

```typescript
// src/features/auth-login/index.ts
export * from './ui/LoginForm';
```

- [ ] **Step 3: features/index.ts에 auth-login 추가**

현재 파일 (`src/features/index.ts`):
```typescript
// features layer public API
// Unit 3 이후 각 피처 슬라이스가 추가됩니다.
```

변경 후:
```typescript
// features layer public API
export * from './auth-login';
```

- [ ] **Step 4: 테스트 실행하여 통과 확인**

```bash
pnpm test src/features/auth-login/ui/LoginForm.test.tsx
```

Expected: 5개 테스트 모두 PASS

---

## Task 6: pages/login — 5:5 분할 레이아웃으로 LoginPage 업데이트

**Files:**
- Modify: `src/pages/login/ui/LoginPage.tsx`

> **레이아웃 규칙:**
> - 데스크톱: 좌측 브랜딩(50%) | 우측 폼(50%) — flex-row
> - 모바일: 위 브랜딩 → 아래 폼 — flex-col
> - `<h1>AssetFlow AI</h1>`은 브랜딩 패널에 하나만 둔다 (기존 router.test.tsx의 heading 검증 유지)
> - 투자 판단 고지 문구와 보안 안내 문구를 포함한다

- [ ] **Step 1: LoginPage.tsx 수정**

현재 파일 (`src/pages/login/ui/LoginPage.tsx`):
```tsx
import { Button } from '@shared';

export const LoginPage = () => (
  <div className="flex h-screen flex-col items-center justify-center gap-6 bg-[hsl(var(--background))]">
    ...
  </div>
);
```

변경 후:
```tsx
// src/pages/login/ui/LoginPage.tsx
import { LoginForm } from '@features/auth-login';

export const LoginPage = () => (
  <div className="flex min-h-screen flex-col bg-[hsl(var(--background))] md:flex-row">
    {/* 좌측: 브랜딩 패널 (50%) */}
    <div className="flex flex-col items-center justify-center gap-8 bg-[hsl(var(--primary))] p-12 text-[hsl(var(--primary-foreground))] md:w-1/2">
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-4xl font-bold">AssetFlow AI</h1>
        <p className="text-lg opacity-90">AI 기반 포트폴리오 진단 서비스</p>
      </div>

      <ul className="space-y-3 text-sm" aria-label="서비스 특징">
        <li className="flex items-center gap-2">
          <span aria-hidden="true">✓</span>
          증권사 자동 연동으로 손쉬운 자산 관리
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden="true">✓</span>
          AI 리밸런싱 추천 및 목표 비중 관리
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden="true">✓</span>
          실시간 포트폴리오 분석과 진단
        </li>
      </ul>

      <p className="text-center text-xs opacity-60">
        본 서비스는 투자 판단 보조 정보를 제공하며 수익을 보장하지 않습니다.
      </p>
    </div>

    {/* 우측: 로그인 폼 패널 (50%) */}
    <div className="flex flex-1 flex-col items-center justify-center p-8 md:w-1/2">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[hsl(var(--foreground))]">로그인</h2>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            계정에 로그인하여 포트폴리오를 관리하세요
          </p>
        </div>

        <LoginForm />

        <p className="mt-6 text-center text-xs text-[hsl(var(--muted-foreground))]">
          로그인 정보는 암호화되어 안전하게 보호됩니다.
        </p>
      </div>
    </div>
  </div>
);
```

- [ ] **Step 2: router.test.tsx 기존 테스트가 여전히 통과하는지 확인**

```bash
pnpm test src/apps/router/router.test.tsx
```

Expected: PASS — `<h1>AssetFlow AI</h1>`이 브랜딩 패널에 유지됨

---

## Task 7: 전체 검증 실행

**Files:** (수정 없음, 검증만)

- [ ] **Step 1: 전체 테스트 실행**

```bash
pnpm test
```

Expected: 모든 테스트 PASS. 이전 Unit 1/2 테스트(총 47개) + 신규 LoginForm 테스트(5개) = 52개 이상 PASS.

- [ ] **Step 2: lint 실행**

```bash
pnpm lint
```

Expected: 오류 없음. `any` 타입, deep import, magic string 등 없음.

- [ ] **Step 3: typecheck 실행**

```bash
pnpm typecheck
```

Expected: TypeScript 오류 없음.

- [ ] **Step 4: build 실행**

```bash
pnpm build
```

Expected: 빌드 성공, dist 생성.

- [ ] **Step 5: whitespace/marker 확인**

```bash
git diff --check
```

Expected: 충돌 마커 없음.

---

## Task 8: docs 갱신 — CURRENT_TASK.md, WORK_LOG.md, SESSION_STATE.md

**Files:**
- Modify: `docs/CURRENT_TASK.md`
- Modify: `docs/WORK_LOG.md`
- Modify: `docs/SESSION_STATE.md`

- [ ] **Step 1: CURRENT_TASK.md를 Unit 3 지시서로 갱신**

`docs/CURRENT_TASK.md` 파일 상단의 작업 요약, 포함/제외 범위, 예상 변경 파일 섹션을 Unit 3 내용으로 교체한다:

```markdown
# Current Task — 현재 작업 지시서

## 0. 작업 요약

Unit 3 — AssetFlow AI MVP의 인증 UI와 mock 로그인 플로우를 구현한다.

이번 Unit은 이메일/비밀번호 로그인 폼, 카카오 mock 로그인 버튼, 성공/실패 상태 처리,
신규 사용자(/onboarding/brokerage) / 기존 사용자(/dashboard) 라우팅 분기를 구현한다.
실제 OAuth, TanStack Query 연동, MSW 핸들러 고도화, 토큰 persistence는 이번 Unit에서 제외한다.

## 1. 상태: DONE
```

- [ ] **Step 2: WORK_LOG.md에 Unit 3 완료 항목 추가**

`docs/WORK_LOG.md` 상단에 아래 항목을 추가한다 (기존 Unit 2 항목 위):

```markdown
---

## Unit 3 — 인증 UI와 mock 로그인 플로우 구현

- 작업 일자: 2026-05-28
- 작업 브랜치: main

### 변경 파일

신규:
- src/entities/session/model/types.ts
- src/entities/session/model/constants.ts
- src/entities/session/model/mockSession.ts
- src/entities/session/api/login.ts
- src/entities/session/index.ts
- src/features/auth-login/ui/LoginForm.tsx
- src/features/auth-login/ui/LoginForm.test.tsx
- src/features/auth-login/index.ts

수정:
- src/entities/index.ts (session export 추가)
- src/features/index.ts (auth-login export 추가)
- src/pages/login/ui/LoginPage.tsx (5:5 레이아웃 + LoginForm 조합)

### 구현 내용

- entities/session 슬라이스: UserStatus, LoginResult, MockAccount 타입, 에러 메시지 상수, mock 계정 fixture(신규/기존), loginWithEmail/loginWithKakao in-memory 함수
- features/auth-login/LoginForm: RHF(native validate + zod safeParse) 기반 이메일/비밀번호 폼, 카카오 mock 로그인 버튼, 로딩/에러 상태 처리, useNavigate로 라우팅 분기
- pages/login: 5:5 flex 분할 레이아웃(브랜딩 좌측 | 폼 우측), 투자 판단 고지 문구, 보안 안내 문구

### 테스트 및 검증 결과

| 명령 | 결과 |
| --- | --- |
| `pnpm test` | ✅ PASS |
| `pnpm lint` | ✅ PASS |
| `pnpm typecheck` | ✅ PASS |
| `pnpm build` | ✅ PASS |
| `git diff --check` | ✅ PASS |

### 남은 리스크

- mock 계정 credentials이 소스 코드에 노출됨 (MVP 범위 내 의도적 결정, production에서는 제거 필요)
- route guard 미구현: 인증 없이도 /dashboard 직접 접근 가능 (Unit 4 이후 처리 예정)
- loginWithKakao는 항상 기존 사용자로 처리 — 신규 카카오 사용자 시나리오 미지원

### GPT 리뷰 요청 포인트

1. entities/session public API 범위가 적절한지 (mockSession fixture를 외부 노출할지)
2. loginWithKakao가 항상 'existing'을 반환하는 것이 Unit 3 범위 내에서 적합한지
3. LoginForm에서 useNavigate 직접 사용 vs onLoginSuccess prop 패턴 선택 근거
```

- [ ] **Step 3: SESSION_STATE.md 갱신**

```markdown
# Session State — 세션 재개 상태

## 1. 현재 상태

- 현재 브랜치: `main`
- 현재 작업: Unit 3 완료, Unit 4 착수 준비
- 마지막 완료 작업: Unit 3 인증 UI와 mock 로그인 플로우 구현 (2026-05-28)
- 커밋 여부: Unit 3 미커밋 (커밋 대기 중)
- 리뷰 상태: Unit 3 구현 완료, GPT 리뷰 대기

## 2. 미완료 작업

- Unit 2 및 Unit 3 커밋 및 origin/main 푸시
- Unit 3 GPT 리뷰 요청 및 결과 반영
- Unit 5 이전 ALLOCATION_TOLERANCE_PERCENT shared 이동 검토
- msw init 명령으로 public/mockServiceWorker.js 생성 (브라우저 MSW 실제 사용 전)
- route guard 구현 (Unit 4 이후)

## 3. 검증 결과 요약

### Unit 3 검증 (2026-05-28)

| 명령 | 결과 |
| --- | --- |
| `pnpm test` | ✅ PASS |
| `pnpm lint` | ✅ PASS |
| `pnpm typecheck` | ✅ PASS |
| `pnpm build` | ✅ PASS |
| `git diff --check` | ✅ PASS |

## 4. 다음 액션

1. Unit 3 GPT 리뷰 요청
2. 리뷰 통과 후 커밋 및 푸시
3. Unit 4 착수: 증권사 연동 온보딩과 mock 연결 상태 구현
```

---

## Self-Review — Spec 커버리지 확인

### 요구사항 대비 검증

| 요구사항 | 커버 Task |
|----------|-----------|
| `entities/session` 슬라이스 생성 (타입, 상수, mock fixture, 로그인 결과 타입) | Task 1, 2, 3 |
| `features/auth-login` 슬라이스 생성 (LoginForm, RHF, 유효성 검증, 에러 표시, submit 상태) | Task 4, 5 |
| `pages/login/ui/LoginPage.tsx` 5:5 레이아웃, 카카오 버튼, 보안 안내 문구 | Task 6 |
| 로그인 성공 시 라우팅 분기 (신규 → `/onboarding/brokerage`, 기존 → `/dashboard`) | Task 5 (LoginForm) |
| 유효성 실패 시 에러 노출 테스트 | Task 4 (test cases 1, 2) |
| 이메일 로그인 성공 시 분기 라우팅 테스트 | Task 4 (test cases 3, 4) |
| 카카오 mock 로그인 성공 시 분기 라우팅 테스트 | Task 4 (test case 5) |
| 로그인 실패 시 현재 페이지 유지 + 오류 표시 테스트 | Task 4 (test case 4) |
| pnpm test / lint / typecheck / build / git diff --check | Task 7 |
| WORK_LOG.md, SESSION_STATE.md 갱신 | Task 8 |

### 제외 범위 위반 여부 확인

- ❌ 실제 OAuth 연동: 없음
- ❌ TanStack Query: 없음
- ❌ MSW 핸들러 신규 추가: 없음 (login은 in-memory)
- ❌ 토큰 persistence: 없음
- ❌ 전역 route guard: 없음
- ❌ 신규 패키지 설치: 없음
- ❌ 커밋 생성: 없음 (Task 8에서 문서만 갱신)

### Placeholder 검사

- 모든 단계에 실제 코드 포함 ✅
- "TBD", "TODO" 없음 ✅
- 타입 일관성: `UserStatus`, `LoginResult`, `MockAccount` — Task 1에서 정의하고 Task 2, 5에서 재사용 ✅
- `MOCK_ACCOUNTS` — Task 1에서 정의, Task 2의 `loginWithEmail`에서 참조 ✅
- `LOGIN_ERROR_MESSAGES.INVALID_CREDENTIALS` — Task 1 constants, Task 2 api/login에서 참조, Task 4 test에서 검증 ✅
- `ROUTES.ONBOARDING_BROKERAGE`, `ROUTES.DASHBOARD` — 기존 `src/shared/config/routes.ts`에서 import ✅
