# Unit 19 Allocation Policy SSOT Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the allocation tolerance policy to shared SSOT and tighten rebalancing mock recommendation tests.

**Architecture:** Shared owns cross-entity policy constants. Portfolio entity re-exports the shared tolerance for backward compatibility, while portfolio calculations and rebalancing tests consume the same policy value without entity cross-imports.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Feature-Sliced Design.

---

## File Map

- Create: `src/shared/config/allocationPolicy.ts` — shared allocation tolerance policy.
- Modify: `src/shared/index.ts` — public API export for allocation policy.
- Modify: `src/entities/portfolio/model/constants.ts` — re-export shared tolerance and keep existing portfolio public API compatibility.
- Modify: `src/entities/portfolio/model/calculateAllocationGap.ts` — keep existing import from portfolio constants unless direct shared import is cleaner.
- Modify: `src/entities/portfolio/model/calculateHoldingWeightRows.ts` — keep existing import from portfolio constants unless direct shared import is cleaner.
- Modify: `src/entities/rebalancing/model/mockRecommendations.test.ts` — use shared tolerance and stricter precision.
- Modify: `docs/WORK_LOG.md` — record Unit 19 implementation and validation.
- Modify: `docs/SESSION_STATE.md` — update current status and validation summary.

---

## Task 1: Add Shared Allocation Policy

**Files:**
- Create: `src/shared/config/allocationPolicy.ts`
- Modify: `src/shared/index.ts`

- [ ] **Step 1: Create shared policy file**

Create `src/shared/config/allocationPolicy.ts`:

```ts
export const ALLOCATION_TOLERANCE_PERCENT = 0.5;
```

- [ ] **Step 2: Export through shared public API**

Add to `src/shared/index.ts`:

```ts
export * from './config/allocationPolicy';
```

- [ ] **Step 3: Run targeted typecheck**

Run:

```bash
pnpm typecheck
```

Expected: PASS.

---

## Task 2: Keep Portfolio Constants Compatible

**Files:**
- Modify: `src/entities/portfolio/model/constants.ts`
- Check: `src/entities/portfolio/index.ts`

- [ ] **Step 1: Remove local tolerance literal**

In `src/entities/portfolio/model/constants.ts`, replace:

```ts
export const ALLOCATION_TOLERANCE_PERCENT = 0.5;
```

with:

```ts
export { ALLOCATION_TOLERANCE_PERCENT } from '@shared';
```

This keeps `@entities/portfolio` consumers working because `src/entities/portfolio/index.ts` already re-exports `ALLOCATION_TOLERANCE_PERCENT` from portfolio constants.

- [ ] **Step 2: Confirm no FSD violation**

Allowed direction:

```text
entities -> shared
```

Disallowed direction:

```text
shared -> entities
```

Run:

```bash
rg -n "from '@entities|from \"@entities" src/shared
```

Expected: no matches.

---

## Task 3: Tighten Rebalancing Mock Tests

**Files:**
- Modify: `src/entities/rebalancing/model/mockRecommendations.test.ts`

- [ ] **Step 1: Import shared policy**

Add:

```ts
import { ALLOCATION_TOLERANCE_PERCENT } from '@shared';
```

Remove:

```ts
const TOLERANCE_PERCENT = 0.5;
```

- [ ] **Step 2: Use shared tolerance in action resolver**

Update:

```ts
if (Math.abs(gap) <= ALLOCATION_TOLERANCE_PERCENT) return 'hold';
```

- [ ] **Step 3: Tighten total precision**

Update:

```ts
expect(total).toBeCloseTo(100, 1);
```

This keeps a small decimal tolerance but is stricter than `toBeCloseTo(100, 0)`.

- [ ] **Step 4: Run targeted tests**

Run:

```bash
pnpm test src/entities/rebalancing/model/mockRecommendations.test.ts src/entities/portfolio/model/calculateAllocationGap.test.ts src/entities/portfolio/model/calculateHoldingWeightRows.test.ts
```

Expected: PASS.

---

## Task 4: Full Validation And Docs

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

Expected: all PASS.

- [ ] **Step 2: Update `WORK_LOG.md`**

Add Unit 19 section with:

- changed files
- shared policy SSOT decision
- tests changed
- validation results

- [ ] **Step 3: Update `SESSION_STATE.md`**

Set current status to:

```md
- 현재 작업: Post-MVP Unit 19 완료 (커밋/푸시 전, 리뷰 대기)
- 마지막 완료 작업: Unit 19 리밸런싱 허용 오차 정책 SSOT 및 mock 추천 테스트 정밀도 보강
- 커밋 여부: Unit 19 미커밋
- 리뷰 상태: Unit 19 코드 리뷰 대기
```

Also mark the old `mockRecommendations.test.ts` precision task as Unit 19 complete.

---

## Self-Review Checklist

- `ALLOCATION_TOLERANCE_PERCENT` is defined once in shared.
- Portfolio public API compatibility is preserved.
- Rebalancing tests do not import from portfolio entity.
- No `const TOLERANCE_PERCENT = 0.5` remains in `mockRecommendations.test.ts`.
- `toBeCloseTo(100, 0)` is no longer used for mock recommendation total weight.
- Full validation commands are recorded in `WORK_LOG.md`.
