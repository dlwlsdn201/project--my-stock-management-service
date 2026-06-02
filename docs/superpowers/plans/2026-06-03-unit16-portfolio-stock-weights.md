# Unit 16 Portfolio Stock Weights Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move portfolio stock table weights/actions from rebalancing mock recommendations to portfolio-owned holding calculations.

**Architecture:** `entities/portfolio` owns holdings, target weights, and per-stock calculation. `features/portfolio-management` consumes rows from `@entities/portfolio` public API and keeps only presentation logic.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, React Testing Library, Feature-Sliced Design.

---

## File Structure

- Create `src/entities/portfolio/model/calculateHoldingWeightRows.ts`: pure calculation function.
- Create `src/entities/portfolio/model/calculateHoldingWeightRows.test.ts`: calculation unit tests.
- Modify `src/entities/portfolio/model/types.ts`: add `HoldingTargetWeight`, `HoldingWeightRow`, `HoldingWeightAction`.
- Modify `src/entities/portfolio/model/mockPortfolio.ts`: add `MOCK_HOLDING_TARGET_WEIGHTS` and `MOCK_HOLDING_WEIGHT_ROWS`.
- Modify `src/entities/portfolio/index.ts`: export new types, constants, mocks, and function.
- Modify `src/features/portfolio-management/ui/PortfolioManagementPanel.tsx`: use portfolio rows instead of `MOCK_STOCK_ACTION_RECOMMENDATIONS`.
- Modify `src/features/portfolio-management/ui/PortfolioManagementPanel.test.tsx`: update tests to portfolio rows and verify no behavior regression.
- Modify `docs/WORK_LOG.md` and `docs/SESSION_STATE.md`: record Unit 16 results after implementation.

---

### Task 1: Add Portfolio Row Types

**Files:**
- Modify: `src/entities/portfolio/model/types.ts`
- Modify: `src/entities/portfolio/index.ts`

- [ ] **Step 1: Add types**

Add:

```ts
export type HoldingWeightAction = 'buy' | 'sell' | 'hold';

export interface HoldingTargetWeight {
  ticker: string;
  targetWeightPercent: number;
}

export interface HoldingWeightRow {
  ticker: string;
  name: string;
  currentWeightPercent: number;
  targetWeightPercent: number;
  gapPercent: number;
  action: HoldingWeightAction;
}
```

- [ ] **Step 2: Export from public API**

Add the new types to `src/entities/portfolio/index.ts`.

- [ ] **Step 3: Verify**

Run:

```bash
pnpm typecheck
```

Expected: PASS.

---

### Task 2: Implement Holding Weight Calculation

**Files:**
- Create: `src/entities/portfolio/model/calculateHoldingWeightRows.ts`
- Create: `src/entities/portfolio/model/calculateHoldingWeightRows.test.ts`
- Modify: `src/entities/portfolio/index.ts`

- [ ] **Step 1: Write calculation tests**

Cover:

- current weights from `quantity * currentPrice`
- gap as `currentWeightPercent - targetWeightPercent`
- `sell` for overweight, `buy` for underweight, `hold` within tolerance
- empty holdings returns empty rows

- [ ] **Step 2: Implement function**

Use `ALLOCATION_TOLERANCE_PERCENT` or a clearly named stock-level tolerance constant.

Expected shape:

```ts
export const calculateHoldingWeightRows = (
  holdings: HoldingAsset[],
  targetWeights: HoldingTargetWeight[],
): HoldingWeightRow[] => {
  const totalValue = holdings.reduce((sum, holding) => sum + holding.quantity * holding.currentPrice, 0);
  if (totalValue <= 0) return [];

  const targetByTicker = new Map(targetWeights.map((target) => [target.ticker, target.targetWeightPercent]));

  return holdings.map((holding) => {
    const currentWeightPercent = Number((((holding.quantity * holding.currentPrice) / totalValue) * 100).toFixed(PERCENT_DECIMAL_PLACES));
    const targetWeightPercent = targetByTicker.get(holding.ticker) ?? 0;
    const gapPercent = Number((currentWeightPercent - targetWeightPercent).toFixed(PERCENT_DECIMAL_PLACES));
    const action = resolveHoldingWeightAction(gapPercent);

    return { ticker: holding.ticker, name: holding.name, currentWeightPercent, targetWeightPercent, gapPercent, action };
  });
};
```

- [ ] **Step 3: Export function**

Add `calculateHoldingWeightRows` to `src/entities/portfolio/index.ts`.

- [ ] **Step 4: Verify**

Run:

```bash
pnpm test src/entities/portfolio/model/calculateHoldingWeightRows.test.ts
pnpm typecheck
```

Expected: PASS.

---

### Task 3: Add Portfolio-Owned Mock Rows

**Files:**
- Modify: `src/entities/portfolio/model/mockPortfolio.ts`
- Modify: `src/entities/portfolio/index.ts`

- [ ] **Step 1: Add target weights**

Add `MOCK_HOLDING_TARGET_WEIGHTS` with tickers matching `MOCK_HOLDINGS`.

- [ ] **Step 2: Add computed rows**

Add:

```ts
export const MOCK_HOLDING_WEIGHT_ROWS = calculateHoldingWeightRows(
  MOCK_HOLDINGS,
  MOCK_HOLDING_TARGET_WEIGHTS,
);
```

- [ ] **Step 3: Export mocks**

Expose both mocks from `src/entities/portfolio/index.ts`.

- [ ] **Step 4: Verify**

Run:

```bash
pnpm test src/entities/portfolio/model/calculateHoldingWeightRows.test.ts
pnpm typecheck
```

Expected: PASS.

---

### Task 4: Convert PortfolioManagementPanel Data Source

**Files:**
- Modify: `src/features/portfolio-management/ui/PortfolioManagementPanel.tsx`
- Modify: `src/features/portfolio-management/ui/PortfolioManagementPanel.test.tsx`

- [ ] **Step 1: Remove rebalancing mock data dependency**

`PortfolioManagementPanel` must not import `MOCK_STOCK_ACTION_RECOMMENDATIONS`.

- [ ] **Step 2: Use portfolio rows**

Default prop should use `MOCK_HOLDING_WEIGHT_ROWS`.

- [ ] **Step 3: Keep UI behavior**

Columns, EmptyState, ErrorState, and rebalance CTA must remain unchanged.

- [ ] **Step 4: Update tests**

Use `HoldingWeightRow[]` fixtures in tests and assert:

- column headers render
- a known mock row renders
- gap sign/tone behavior remains
- AI action labels render
- empty/error/CTA tests remain green

- [ ] **Step 5: Verify**

Run:

```bash
pnpm test src/features/portfolio-management/ui/PortfolioManagementPanel.test.tsx
pnpm typecheck
```

Expected: PASS.

---

### Task 5: Final Verification And Docs

**Files:**
- Modify: `docs/WORK_LOG.md`
- Modify: `docs/SESSION_STATE.md`

- [ ] **Step 1: Update logs**

Record changed files, implementation notes, tests, and residual risks.

- [ ] **Step 2: Run full verification**

Run:

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
git diff --check
```

Expected: all PASS.

- [ ] **Step 3: Do not commit**

Leave commit creation to reviewer/user instruction.

---

## Self-Review

- Spec coverage: type ownership, calculation, mock rows, UI conversion, tests, and docs are covered.
- Placeholder scan: no TBD/TODO placeholders are used as implementation requirements.
- Type consistency: `HoldingWeightRow`, `HoldingTargetWeight`, and `HoldingWeightAction` names are consistent across tasks.
