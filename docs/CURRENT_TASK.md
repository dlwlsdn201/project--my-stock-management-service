# Current Task — 현재 작업 지시서

## 0. 작업 요약

Unit 3 — AssetFlow AI MVP의 인증 UI와 mock 로그인 플로우를 구현한다.

이메일/비밀번호 로그인 폼, 카카오 mock 로그인 버튼, 성공/실패 상태 처리,
신규 사용자(`/onboarding/brokerage`) / 기존 사용자(`/dashboard`) 라우팅 분기를 구현했다.

## 1. 상태: DONE

## 2. 구현 범위

### 포함

- `entities/session` 슬라이스: UserStatus, LoginResult, MockAccount 타입, 에러 메시지 상수, mock 계정 fixture, loginWithEmail/loginWithKakao in-memory 함수
- `features/auth-login/LoginForm`: RHF + zod 유효성 검증, 카카오 mock 버튼, 로딩/에러 상태, useNavigate 라우팅 분기
- `pages/login/LoginPage`: 5:5 분할 레이아웃(브랜딩 좌측 | 폼 우측), 투자 판단 고지, 보안 안내 문구

### 제외

- 실제 OAuth 연동
- TanStack Query / MSW 핸들러
- 토큰 persistence
- 전역 route guard
- 커밋 생성

## 3. 검증 결과

| 명령 | 결과 |
| --- | --- |
| `pnpm test` | ✅ PASS (53 tests, 11 files) |
| `pnpm lint` | ✅ PASS |
| `pnpm typecheck` | ✅ PASS |
| `pnpm build` | ✅ PASS (139 modules) |
| `git diff --check` | ✅ PASS |
