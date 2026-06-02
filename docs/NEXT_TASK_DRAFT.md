# Next Task Draft — 다음 작업 초안

## 0. 문서 목적

이 문서는 Unit 14 이후 남은 작업을 “Claude Code가 직접 구현 가능한 작업”과 “사용자 결정/외부 계정이 필요한 작업”으로 분리한다. 당분간은 사용자 직접 작업이 필요한 항목을 뒤로 미루고, 코드베이스 안에서 완결 가능한 기능을 먼저 진행한다.

## 1. 우선 진행 큐

### 완료: Post-MVP Unit 14 — 로그아웃 UI와 세션 종료 흐름

- 상태: `f588491` 커밋 및 원격 push 완료.
- 핵심 결과: 앱 내부 헤더에서 로그아웃 가능, 세션 제거 후 `/login` 이동.

### 1순위: Post-MVP Unit 15 — 수동 자산 persistence 전환

- 사유: 설정 화면의 수동 자산 추가 기능이 아직 local state 중심이다.
- 핵심 결과: Unit 9의 target allocation store 패턴처럼 in-memory store/api/hook으로 전환한다.
- 범위: 실제 Supabase 저장은 제외하고 adapter seam만 만든다.
- 지시 문서: `docs/CURRENT_TASK.md`
- 구현 계획: `docs/superpowers/plans/2026-06-03-unit15-manual-asset-persistence.md`

### 2순위: Post-MVP Unit 16 — 포트폴리오 종목별 계산 SSOT 이관

- 사유: 포트폴리오 종목 테이블이 mock action fixture에 의존하고 있어 목표/현재 비중 계산 출처가 분산된다.
- 핵심 결과: `MOCK_HOLDINGS`와 목표 비중 데이터를 결합하는 계산 함수를 entity model로 이관한다.
- 범위: 실제 시세 API나 외부 종목 데이터 연동은 제외한다.

### 3순위: Post-MVP Unit 17 — MSW 브라우저 워커 준비

- 사유: 테스트 MSW와 브라우저 mock 사용 준비 상태를 맞춘다.
- 핵심 결과: `public/mockServiceWorker.js` 생성 및 개발 환경 사용 문서화.
- 주의: 명령 실행이 필요하므로 환경에 따라 별도 승인 또는 수동 실행이 필요할 수 있다.

### 4순위: Post-MVP Unit 18 — 다크 테마/모바일 QA 보강

- 사유: 주요 화면은 구현되었지만 다크 테마와 모바일 실측 증빙이 부족하다.
- 핵심 결과: 주요 라우트의 다크 모드와 768px 미만 레이아웃 문제를 보완하고 QA 기록을 남긴다.

## 2. 사용자 직접 작업 또는 외부 결정 필요 큐

아래 항목은 사용자의 계정, 운영 정책, 외부 서비스 선택이 필요하므로 마지막에 몰아서 진행한다.

- Supabase 프로젝트 생성 및 환경 변수 제공
- 실제 `@supabase/supabase-js` adapter 운영 연결
- API key 서버 저장/암호화 정책 확정
- 실제 AI provider 호출 방식 확정(GPT/Gemini/Claude)
- OAuth 제공자 정책 확정
- 결제/구독 정책 및 연동

## 3. 다음 작업 후보 상세

현재 다음 작업은 `Post-MVP Unit 15 — 수동 자산 persistence 전환`이다.

예상 구조:

```text
src/entities/portfolio/api/manualAssetStore.ts
src/entities/portfolio/api/manualAssetStore.test.ts
src/entities/portfolio/api/manualAssetApi.ts
src/entities/portfolio/hook/useManualAssets.ts
src/entities/portfolio/hook/useManualAssets.test.tsx

src/features/settings-portfolio/ui/ManualAssetsSection.tsx
src/features/settings-portfolio/ui/SettingsPortfolioPanel.test.tsx
```

검증 명령:

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
git diff --check
```
