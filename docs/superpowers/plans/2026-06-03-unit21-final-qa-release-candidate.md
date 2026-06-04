# Final QA and Release Candidate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Verify the completed mock MVP in browser-like conditions and produce a release-candidate handoff record.

**Architecture:** This unit should avoid feature work. It runs validation, performs route-level smoke checks where tooling permits, records exact evidence in project docs, and separates demo-ready status from external integration decisions.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, React Testing Library, MSW, local browser or available browser automation.

---

## File Structure

- Modify `docs/WORK_LOG.md`
  - Add Unit 21 QA results
  - Record validation command outputs
  - Record browser smoke route matrix
  - Record release-candidate checklist
  - Record remaining external/user-decision risks
- Modify `docs/SESSION_STATE.md`
  - Update current state after Unit 21
  - Record QA result and next action
- Modify `docs/NEXT_TASK_DRAFT.md`
  - Move Claude-implementable queue to complete
  - Keep external integration/user-decision queue as next phase

## Task 1: Baseline Validation

**Files:**
- Modify: `docs/WORK_LOG.md`
- Modify: `docs/SESSION_STATE.md`

- [ ] **Step 1: Run full validation**

Run:

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
git diff --check
```

Expected:

```text
pnpm test: PASS, all test files pass
pnpm lint: PASS
pnpm typecheck: PASS
pnpm build: PASS
git diff --check: PASS
```

- [ ] **Step 2: Record validation evidence**

Add a `Unit 21 — 최종 브라우저 QA와 릴리즈 후보 점검` section near the top of `docs/WORK_LOG.md` with this structure:

```markdown
## Unit 21 — 최종 브라우저 QA와 릴리즈 후보 점검

- 작업 일자: 2026-06-03
- 작업 브랜치: main

### 검증 결과

| 명령 | 결과 |
| --- | --- |
| `pnpm test` | ✅ PASS (... tests, ... files, 0 failures) |
| `pnpm lint` | ✅ PASS |
| `pnpm typecheck` | ✅ PASS |
| `pnpm build` | ✅ PASS (... modules, gzip JS ... kB) |
| `git diff --check` | ✅ PASS |
```

Use the actual command output numbers. Do not copy placeholder values.

## Task 2: Browser Smoke QA

**Files:**
- Modify: `docs/WORK_LOG.md`

- [ ] **Step 1: Start normal dev server**

Run:

```bash
pnpm exec vite --host 127.0.0.1
```

Expected:

```text
VITE dev server starts and prints a localhost or 127.0.0.1 URL.
```

If the port is busy, use the printed fallback port. Do not kill unrelated user processes unless explicitly approved.

- [ ] **Step 2: Smoke check routes**

Check these routes in a browser or available browser automation:

```text
/login
/dashboard
/onboarding/brokerage
/rebalance
/portfolio
/settings
```

For protected routes, if unauthenticated redirect blocks direct inspection, log in with an existing mock user:

```text
email: user@assetflow.ai
password: password123
```

Record the result in `docs/WORK_LOG.md`:

```markdown
### 브라우저 smoke QA

| Route | 375x812 | 768x1024 | 1440x900 | 결과 |
| --- | --- | --- | --- | --- |
| `/login` | PASS/FAIL/NOT VERIFIED | PASS/FAIL/NOT VERIFIED | PASS/FAIL/NOT VERIFIED | ... |
| `/dashboard` | PASS/FAIL/NOT VERIFIED | PASS/FAIL/NOT VERIFIED | PASS/FAIL/NOT VERIFIED | ... |
| `/onboarding/brokerage` | PASS/FAIL/NOT VERIFIED | PASS/FAIL/NOT VERIFIED | PASS/FAIL/NOT VERIFIED | ... |
| `/rebalance` | PASS/FAIL/NOT VERIFIED | PASS/FAIL/NOT VERIFIED | PASS/FAIL/NOT VERIFIED | ... |
| `/portfolio` | PASS/FAIL/NOT VERIFIED | PASS/FAIL/NOT VERIFIED | PASS/FAIL/NOT VERIFIED | ... |
| `/settings` | PASS/FAIL/NOT VERIFIED | PASS/FAIL/NOT VERIFIED | PASS/FAIL/NOT VERIFIED | ... |
```

If browser automation is unavailable, write `NOT VERIFIED` and explain the exact tooling limitation. Do not present unverified browser state as PASS.

- [ ] **Step 3: Check dark mode**

At minimum, inspect:

```text
/login
/dashboard
/settings
```

Record whether text remains readable and layout is unchanged in dark mode. If browser tooling is unavailable, record `NOT VERIFIED` with reason.

## Task 3: MSW Opt-In Smoke

**Files:**
- Modify: `docs/WORK_LOG.md`

- [ ] **Step 1: Start MSW-enabled dev server**

Run:

```bash
VITE_ENABLE_MSW=true pnpm exec vite --host 127.0.0.1
```

Expected:

```text
VITE dev server starts without build/runtime error.
```

- [ ] **Step 2: Record MSW state**

Record:

```markdown
### MSW opt-in smoke

- `VITE_ENABLE_MSW=true pnpm exec vite --host 127.0.0.1`: PASS/FAIL
- `public/mockServiceWorker.js`: present/not present
- Service worker registration direct browser check: PASS/NOT VERIFIED
- Note: ...
```

If direct service worker registration cannot be inspected, write `NOT VERIFIED` and do not treat it as a failure if the dev server and build pass.

## Task 4: Release Candidate Checklist

**Files:**
- Modify: `docs/WORK_LOG.md`
- Modify: `docs/NEXT_TASK_DRAFT.md`
- Modify: `docs/SESSION_STATE.md`

- [ ] **Step 1: Add release-candidate checklist**

Add this checklist to `docs/WORK_LOG.md` and mark each item based on evidence:

```markdown
### 릴리즈 후보 체크리스트

- [ ] Login/mock auth flow verified
- [ ] Protected routes verified
- [ ] Brokerage onboarding verified
- [ ] Dashboard overview verified
- [ ] Rebalancing proposal verified
- [ ] Portfolio management verified
- [ ] Settings/manual assets/target allocation/AI settings verified
- [ ] Light/dark theme verified or limitation recorded
- [ ] Mobile/desktop layout verified or limitation recorded
- [ ] API key original not persisted
- [ ] External integration risks documented
```

- [ ] **Step 2: Update external-decision queue**

Ensure `docs/NEXT_TASK_DRAFT.md` keeps these as external/user decision items:

```markdown
- Supabase 프로젝트 생성 및 환경 변수 제공
- 실제 `@supabase/supabase-js` adapter 운영 연결
- API key 서버 저장/암호화 정책 확정
- 실제 AI provider 호출 방식 확정(GPT/Gemini/Claude)
- OAuth 제공자 정책 확정
- 결제/구독 정책 및 연동
```

- [ ] **Step 3: Update session state**

Update `docs/SESSION_STATE.md`:

```markdown
- 현재 작업: Post-MVP Unit 21 구현 완료 (GPT 리뷰 대기)
- 마지막 완료 작업: Unit 21 최종 브라우저 QA와 릴리즈 후보 점검
- 커밋 여부: Unit 21 미커밋
- 리뷰 상태: Unit 21 GPT 리뷰 요청 대기
```

Also record final validation summary and next action.

## Task 5: Final Self-Check

**Files:**
- Modify: `docs/WORK_LOG.md`
- Modify: `docs/SESSION_STATE.md`
- Modify: `docs/NEXT_TASK_DRAFT.md`

- [ ] **Step 1: Run final diff check**

Run:

```bash
git diff --check
```

Expected: PASS.

- [ ] **Step 2: Confirm no feature creep**

Check:

```bash
git status --short
```

Expected:

```text
Only docs/WORK_LOG.md, docs/SESSION_STATE.md, docs/NEXT_TASK_DRAFT.md, and possibly QA evidence files if explicitly created.
No src feature implementation changes unless a clear QA-blocking bug was found and documented.
```

- [ ] **Step 3: Request GPT review**

Do not commit. Ask GPT to review using:

```text
Unit 21 작업 완료.
WORK_LOG.md, SESSION_STATE.md, NEXT_TASK_DRAFT.md와 변경사항 기반으로 검증 리뷰를 진행해 주세요.
```

## Self-Review Checklist

- [ ] Browser QA limitations are stated explicitly.
- [ ] No unverified route is marked PASS.
- [ ] External/user-decision items remain out of implementation scope.
- [ ] Validation command results use actual numbers.
- [ ] `git diff --check` passes.
- [ ] No commit was created.
