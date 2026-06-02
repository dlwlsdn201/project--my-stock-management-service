# Unit 15 Manual Asset Persistence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert manual asset CRUD from feature-local state to entity-owned persistence port + TanStack Query hooks.

**Architecture:** Follow the existing Unit 9 target allocation pattern. `entities/portfolio/api` owns the store/fetchers, `entities/portfolio/hook` owns TanStack Query hooks, and `features/settings-portfolio` consumes only public entity hooks/types.

**Tech Stack:** React 19, TypeScript, TanStack Query, Vitest, React Testing Library, Feature-Sliced Design.

---

## File Structure

- Create `src/entities/portfolio/api/manualAssetStore.ts`: persistence port, in-memory adapter, configure/reset helpers.
- Create `src/entities/portfolio/api/manualAssetStore.test.ts`: store behavior tests.
- Create `src/entities/portfolio/api/manualAssetApi.ts`: pure fetcher functions that delegate to the active store.
- Create `src/entities/portfolio/hook/useManualAssets.ts`: query key, suspense query hook, create/update/delete mutation hooks.
- Create `src/entities/portfolio/hook/useManualAssets.test.tsx`: hook query/mutation invalidation behavior tests.
- Modify `src/entities/portfolio/model/types.ts`: move `ManualAsset` and payload types into entity model.
- Modify `src/entities/portfolio/index.ts`: expose manual asset types/api/hook/store public API.
- Modify `src/features/settings-portfolio/model/types.ts`: re-export `ManualAsset` for compatibility or remove local type ownership.
- Modify `src/features/settings-portfolio/ui/ManualAssetsSection.tsx`: replace local assets state with query/mutation hooks.
- Modify `src/features/settings-portfolio/ui/SettingsPortfolioPanel.test.tsx`: cover query-backed add/edit/delete and failure states.
- Modify `docs/WORK_LOG.md` and `docs/SESSION_STATE.md`: record Unit 15 result.

---

### Task 1: Move Manual Asset Types To Entity Layer

**Files:**
- Modify: `src/entities/portfolio/model/types.ts`
- Modify: `src/entities/portfolio/index.ts`
- Modify: `src/features/settings-portfolio/model/types.ts`

- [ ] **Step 1: Add entity-owned types**

Add these interfaces to `src/entities/portfolio/model/types.ts`:

```ts
export interface ManualAsset {
  id: string;
  ticker: string;
  name: string;
  quantity: number;
  avgPrice: number;
}

export interface ManualAssetPayload {
  ticker: string;
  name: string;
  quantity: number;
  avgPrice: number;
}
```

- [ ] **Step 2: Export types from portfolio public API**

Add `ManualAsset` and `ManualAssetPayload` to the type export list in `src/entities/portfolio/index.ts`.

- [ ] **Step 3: Remove feature ownership**

Change `src/features/settings-portfolio/model/types.ts` to re-export the entity type:

```ts
export type { ManualAsset } from '@entities/portfolio';
export type { AiModelId, ApiKeyStatus } from '@entities/settings';
```

- [ ] **Step 4: Verify typecheck**

Run:

```bash
pnpm typecheck
```

Expected: PASS.

---

### Task 2: Add Manual Asset Store And Fetchers

**Files:**
- Create: `src/entities/portfolio/api/manualAssetStore.ts`
- Create: `src/entities/portfolio/api/manualAssetStore.test.ts`
- Create: `src/entities/portfolio/api/manualAssetApi.ts`
- Modify: `src/entities/portfolio/index.ts`

- [ ] **Step 1: Implement persistence port**

Create `manualAssetStore.ts` with:

```ts
import type { ManualAsset, ManualAssetPayload } from '../model/types';

export interface ManualAssetStore {
  read: () => Promise<ManualAsset[]>;
  create: (payload: ManualAssetPayload) => Promise<ManualAsset>;
  update: (id: string, payload: ManualAssetPayload) => Promise<ManualAsset>;
  delete: (id: string) => Promise<void>;
}

export const createInMemoryManualAssetStore = (seed: ManualAsset[] = []): ManualAssetStore => {
  let current = seed.map((asset) => ({ ...asset }));
  let nextId = current.length + 1;

  return {
    read: async () => current.map((asset) => ({ ...asset })),
    create: async (payload) => {
      const asset = { id: `manual-asset-${nextId}`, ...payload };
      nextId += 1;
      current = [...current, asset];
      return { ...asset };
    },
    update: async (id, payload) => {
      const nextAsset = { id, ...payload };
      current = current.map((asset) => (asset.id === id ? nextAsset : asset));
      return { ...nextAsset };
    },
    delete: async (id) => {
      current = current.filter((asset) => asset.id !== id);
    },
  };
};

let activeStore: ManualAssetStore = createInMemoryManualAssetStore();

export const getManualAssetStore = (): ManualAssetStore => activeStore;

export const configureManualAssetStore = (store: ManualAssetStore): void => {
  activeStore = store;
};

export const resetManualAssetStore = (): void => {
  activeStore = createInMemoryManualAssetStore();
};
```

- [ ] **Step 2: Implement fetchers**

Create `manualAssetApi.ts` with:

```ts
import type { ManualAsset, ManualAssetPayload } from '../model/types';
import { getManualAssetStore } from './manualAssetStore';

export const readManualAssets = (): Promise<ManualAsset[]> => getManualAssetStore().read();

export const createManualAsset = (payload: ManualAssetPayload): Promise<ManualAsset> =>
  getManualAssetStore().create(payload);

export const updateManualAsset = (id: string, payload: ManualAssetPayload): Promise<ManualAsset> =>
  getManualAssetStore().update(id, payload);

export const deleteManualAsset = (id: string): Promise<void> => getManualAssetStore().delete(id);
```

- [ ] **Step 3: Add store tests**

Cover read/create/update/delete in `manualAssetStore.test.ts`.

- [ ] **Step 4: Export public API**

Expose store helpers and fetchers from `src/entities/portfolio/index.ts`.

- [ ] **Step 5: Verify**

Run:

```bash
pnpm test src/entities/portfolio/api/manualAssetStore.test.ts
pnpm typecheck
```

Expected: PASS.

---

### Task 3: Add Manual Asset Query Hooks

**Files:**
- Create: `src/entities/portfolio/hook/useManualAssets.ts`
- Create: `src/entities/portfolio/hook/useManualAssets.test.tsx`
- Modify: `src/entities/portfolio/index.ts`

- [ ] **Step 1: Implement hooks**

Create `useManualAssets.ts` with:

```ts
import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import type { ManualAssetPayload } from '../model/types';
import { createManualAsset, deleteManualAsset, readManualAssets, updateManualAsset } from '../api/manualAssetApi';

export const MANUAL_ASSETS_QUERY_KEY = ['portfolio', 'manual-assets'] as const;

export const useSuspenseManualAssets = () =>
  useSuspenseQuery({
    queryKey: MANUAL_ASSETS_QUERY_KEY,
    queryFn: readManualAssets,
  });

export const useCreateManualAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ManualAssetPayload) => createManualAsset(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MANUAL_ASSETS_QUERY_KEY });
    },
  });
};

export const useUpdateManualAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ManualAssetPayload }) =>
      updateManualAsset(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MANUAL_ASSETS_QUERY_KEY });
    },
  });
};

export const useDeleteManualAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteManualAsset(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MANUAL_ASSETS_QUERY_KEY });
    },
  });
};
```

- [ ] **Step 2: Add hook tests**

Use `QueryClientProvider`, `configureManualAssetStore`, and `resetManualAssetStore` to verify query read and mutation invalidation.

- [ ] **Step 3: Export hooks**

Expose query key and hooks from `src/entities/portfolio/index.ts`.

- [ ] **Step 4: Verify**

Run:

```bash
pnpm test src/entities/portfolio/hook/useManualAssets.test.tsx
pnpm typecheck
```

Expected: PASS.

---

### Task 4: Convert ManualAssetsSection To Query/Mutation

**Files:**
- Modify: `src/features/settings-portfolio/ui/ManualAssetsSection.tsx`
- Modify: `src/features/settings-portfolio/ui/SettingsPortfolioPanel.test.tsx`

- [ ] **Step 1: Replace local list state**

Import manual asset hooks from `@entities/portfolio` and read the list with `useSuspenseManualAssets`.

- [ ] **Step 2: Use mutation hooks for CRUD**

Use:

```ts
const createManualAssetMutation = useCreateManualAsset();
const updateManualAssetMutation = useUpdateManualAsset();
const deleteManualAssetMutation = useDeleteManualAsset();
```

Submit behavior:

```ts
if (editingId) {
  await updateManualAssetMutation.mutateAsync({ id: editingId, payload });
} else {
  await createManualAssetMutation.mutateAsync(payload);
}
```

Delete behavior:

```ts
await deleteManualAssetMutation.mutateAsync(id);
```

- [ ] **Step 3: Preserve validation and edit mode**

Keep form validation messages:

- `티커와 종목명을 입력해주세요.`
- `보유 수량을 0보다 큰 숫자로 입력해주세요.`
- `평균 단가를 0보다 큰 숫자로 입력해주세요.`

- [ ] **Step 4: Add success/failure messages**

Use feature-local message state. Required failure messages:

- 생성 실패: `자산 추가에 실패했습니다. 잠시 후 다시 시도해 주세요.`
- 수정 실패: `자산 수정에 실패했습니다. 잠시 후 다시 시도해 주세요.`
- 삭제 실패: `자산 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.`

- [ ] **Step 5: Update tests**

Extend `SettingsPortfolioPanel.test.tsx` to cover add/edit/delete success and mutation failure states.

- [ ] **Step 6: Verify**

Run:

```bash
pnpm test src/features/settings-portfolio/ui/SettingsPortfolioPanel.test.tsx
pnpm typecheck
```

Expected: PASS.

---

### Task 5: Final Verification And Docs

**Files:**
- Modify: `docs/WORK_LOG.md`
- Modify: `docs/SESSION_STATE.md`

- [ ] **Step 1: Update work log**

Record changed files, implementation notes, test results, and residual risks.

- [ ] **Step 2: Update session state**

Mark Unit 15 as review-ready and set next candidate to Unit 16 portfolio per-stock calculation SSOT.

- [ ] **Step 3: Run full verification**

Run:

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
git diff --check
```

Expected: all PASS.

- [ ] **Step 4: Do not commit**

Leave commit creation to the reviewer/user instruction.

---

## Self-Review

- Spec coverage: Type ownership, store, fetchers, hooks, UI conversion, tests, and docs are covered.
- Placeholder scan: No TBD/TODO placeholders are used as implementation requirements.
- Type consistency: `ManualAsset`, `ManualAssetPayload`, query key, and hook names are consistent across tasks.
