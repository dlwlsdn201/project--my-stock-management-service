# Session and AI Settings Persistence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persist mock session state and AI settings metadata across browser refreshes without storing the original API key.

**Architecture:** Add a shared browser storage helper, then let entity atoms own their own storage keys and validation rules. Session state uses `sessionStorage`; AI settings metadata uses `localStorage`; API key originals remain transient input only and are converted to masked display values before persistence.

**Tech Stack:** React 19, TypeScript, Jotai, Vitest, React Testing Library where existing tests require it.

---

## File Structure

- Create `src/shared/lib/browserStorage.ts`
  - Safe JSON read/write/remove helper for `localStorage` and `sessionStorage`
  - Guards `typeof window === 'undefined'`
  - Uses caller-provided validators to reject malformed stored data
- Modify `src/shared/index.ts`
  - Export the storage helper through the shared public API
- Modify `src/entities/session/model/constants.ts`
  - Add `SESSION_STORAGE_KEY`
- Modify `src/entities/session/model/sessionAtom.ts`
  - Initialize from `sessionStorage`
  - Persist writes and clears
  - Keep `decrementAiTrialAtom` storage-aware
- Modify `src/entities/session/model/sessionAtom.test.ts`
  - Add storage restore/save/clear/decrement/malformed tests
- Modify `src/entities/settings/model/constants.ts`
  - Add `AI_SETTINGS_STORAGE_KEY`
- Modify `src/entities/settings/model/aiSettingsAtom.ts`
  - Initialize from `localStorage`
  - Persist model changes, masked key metadata, and clear operations
  - Never persist raw API key input
- Modify `src/entities/settings/model/aiSettingsAtom.test.ts`
  - Add storage restore/save/clear/malformed/raw-key exclusion tests
- Modify `docs/WORK_LOG.md`
  - Record implementation result and validation commands
- Modify `docs/SESSION_STATE.md`
  - Record Unit 20 status, changed files, validation results, next action

## Task 1: Shared Browser Storage Helper

**Files:**
- Create: `src/shared/lib/browserStorage.ts`
- Modify: `src/shared/index.ts`

- [ ] **Step 1: Create storage helper**

Implement this shape:

```ts
type BrowserStorageType = 'local' | 'session';

interface ReadBrowserStorageJsonParams<T> {
  key: string;
  storageType: BrowserStorageType;
  fallback: T;
  validate: (value: unknown) => value is T;
}

interface WriteBrowserStorageJsonParams<T> {
  key: string;
  storageType: BrowserStorageType;
  value: T;
}

interface RemoveBrowserStorageItemParams {
  key: string;
  storageType: BrowserStorageType;
}
```

Required functions:

```ts
export const readBrowserStorageJson = <T>(params: ReadBrowserStorageJsonParams<T>): T => {
  const storage = getBrowserStorage(params.storageType);
  if (!storage) return params.fallback;

  try {
    const raw = storage.getItem(params.key);
    if (!raw) return params.fallback;
    const parsed: unknown = JSON.parse(raw);
    return params.validate(parsed) ? parsed : params.fallback;
  } catch {
    return params.fallback;
  }
};

export const writeBrowserStorageJson = <T>(params: WriteBrowserStorageJsonParams<T>): void => {
  const storage = getBrowserStorage(params.storageType);
  if (!storage) return;

  try {
    storage.setItem(params.key, JSON.stringify(params.value));
  } catch {
    // Storage may be unavailable or quota-limited. Persistence failure must not break the app.
  }
};

export const removeBrowserStorageItem = (params: RemoveBrowserStorageItemParams): void => {
  const storage = getBrowserStorage(params.storageType);
  if (!storage) return;

  try {
    storage.removeItem(params.key);
  } catch {
    // Storage failure must not break logout or clear actions.
  }
};
```

Use this internal helper:

```ts
const getBrowserStorage = (storageType: BrowserStorageType): Storage | null => {
  if (typeof window === 'undefined') return null;
  return storageType === 'local' ? window.localStorage : window.sessionStorage;
};
```

- [ ] **Step 2: Export through public API**

Add this to `src/shared/index.ts`:

```ts
export * from './lib/browserStorage';
```

- [ ] **Step 3: Verify helper compiles**

Run:

```bash
pnpm typecheck
```

Expected: PASS.

## Task 2: Session Persistence

**Files:**
- Modify: `src/entities/session/model/constants.ts`
- Modify: `src/entities/session/model/sessionAtom.ts`
- Modify: `src/entities/session/model/sessionAtom.test.ts`

- [ ] **Step 1: Add failing tests**

Add tests that prove:

```ts
sessionStorage.setItem('assetflow.session', JSON.stringify({ userStatus: 'existing', aiTrialRemainingCount: 2 }));
const store = createStore();
expect(store.get(sessionAtom)).toEqual({ userStatus: 'existing', aiTrialRemainingCount: 2 });
```

```ts
const store = createStore();
store.set(sessionAtom, { userStatus: 'new', aiTrialRemainingCount: 3 });
expect(JSON.parse(window.sessionStorage.getItem('assetflow.session') ?? '{}')).toEqual({
  userStatus: 'new',
  aiTrialRemainingCount: 3,
});
```

```ts
const store = createStore();
store.set(sessionAtom, { userStatus: 'existing', aiTrialRemainingCount: 1 });
store.set(clearSessionAtom);
expect(window.sessionStorage.getItem('assetflow.session')).toBeNull();
```

```ts
const store = createStore();
store.set(sessionAtom, { userStatus: 'existing', aiTrialRemainingCount: 2 });
store.set(decrementAiTrialAtom);
expect(JSON.parse(window.sessionStorage.getItem('assetflow.session') ?? '{}').aiTrialRemainingCount).toBe(1);
```

```ts
window.sessionStorage.setItem('assetflow.session', '{bad-json');
const store = createStore();
expect(store.get(sessionAtom)).toBeNull();
```

Clear `window.sessionStorage` in `beforeEach`.

- [ ] **Step 2: Run tests and confirm failure**

Run:

```bash
pnpm test src/entities/session/model/sessionAtom.test.ts
```

Expected: FAIL until persistence is implemented.

- [ ] **Step 3: Implement constants and validators**

Add to `src/entities/session/model/constants.ts`:

```ts
export const SESSION_STORAGE_KEY = 'assetflow.session';
```

In `sessionAtom.ts`, add a validator:

```ts
const isSession = (value: unknown): value is Session => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<Session>;
  const isKnownStatus = candidate.userStatus === 'new' || candidate.userStatus === 'existing';
  const isValidTrialCount =
    typeof candidate.aiTrialRemainingCount === 'number' &&
    Number.isInteger(candidate.aiTrialRemainingCount) &&
    candidate.aiTrialRemainingCount >= 0;
  return isKnownStatus && isValidTrialCount;
};
```

- [ ] **Step 4: Implement persistent atom writes**

Use a private base atom and export a read/write atom:

```ts
const persistedSessionAtom = atom<Session | null>(
  readBrowserStorageJson<Session | null>({
    key: SESSION_STORAGE_KEY,
    storageType: 'session',
    fallback: null,
    validate: (value): value is Session | null => value === null || isSession(value),
  }),
);

export const sessionAtom = atom(
  (get) => get(persistedSessionAtom),
  (_get, set, nextSession: Session | null) => {
    set(persistedSessionAtom, nextSession);
    if (nextSession) {
      writeBrowserStorageJson({ key: SESSION_STORAGE_KEY, storageType: 'session', value: nextSession });
      return;
    }
    removeBrowserStorageItem({ key: SESSION_STORAGE_KEY, storageType: 'session' });
  },
);
```

Update `clearSessionAtom` and `decrementAiTrialAtom` to write through `sessionAtom`, not the private base atom.

- [ ] **Step 5: Run targeted session tests**

Run:

```bash
pnpm test src/entities/session/model/sessionAtom.test.ts
```

Expected: PASS.

## Task 3: AI Settings Persistence

**Files:**
- Modify: `src/entities/settings/model/constants.ts`
- Modify: `src/entities/settings/model/aiSettingsAtom.ts`
- Modify: `src/entities/settings/model/aiSettingsAtom.test.ts`

- [ ] **Step 1: Add failing tests**

Add tests that prove:

```ts
window.localStorage.setItem(
  'assetflow.ai-settings',
  JSON.stringify({ modelId: 'claude', isApiKeyConnected: true, maskedApiKey: '••••1234' }),
);
const store = createStore();
expect(store.get(aiSettingsAtom)).toEqual({
  modelId: 'claude',
  isApiKeyConnected: true,
  maskedApiKey: '••••1234',
});
```

```ts
const store = createStore();
store.set(setAiModelAtom, 'gemini');
expect(JSON.parse(window.localStorage.getItem('assetflow.ai-settings') ?? '{}').modelId).toBe('gemini');
```

```ts
const store = createStore();
store.set(saveApiKeyAtom, 'secret-key-1234');
const persisted = window.localStorage.getItem('assetflow.ai-settings') ?? '';
expect(persisted).toContain('1234');
expect(persisted).not.toContain('secret-key');
```

```ts
const store = createStore();
store.set(saveApiKeyAtom, 'secret-key-1234');
store.set(clearApiKeyAtom);
expect(JSON.parse(window.localStorage.getItem('assetflow.ai-settings') ?? '{}')).toEqual({
  modelId: 'gpt',
  isApiKeyConnected: false,
  maskedApiKey: null,
});
```

```ts
window.localStorage.setItem('assetflow.ai-settings', JSON.stringify({ modelId: 'unknown' }));
const store = createStore();
expect(store.get(aiSettingsAtom)).toEqual({ modelId: 'gpt', isApiKeyConnected: false, maskedApiKey: null });
```

Clear `window.localStorage` in `beforeEach`.

- [ ] **Step 2: Run tests and confirm failure**

Run:

```bash
pnpm test src/entities/settings/model/aiSettingsAtom.test.ts
```

Expected: FAIL until persistence is implemented.

- [ ] **Step 3: Add constants and validators**

Add to `src/entities/settings/model/constants.ts`:

```ts
export const AI_SETTINGS_STORAGE_KEY = 'assetflow.ai-settings';
```

In `aiSettingsAtom.ts`, add validators:

```ts
const isAiModelId = (value: unknown): value is AiModelId =>
  value === 'gpt' || value === 'gemini' || value === 'claude';

const isAiSettings = (value: unknown): value is AiSettings => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<AiSettings>;
  return (
    isAiModelId(candidate.modelId) &&
    typeof candidate.isApiKeyConnected === 'boolean' &&
    (candidate.maskedApiKey === null || typeof candidate.maskedApiKey === 'string')
  );
};
```

- [ ] **Step 4: Implement persistent atom writes**

Use a private base atom and export a read/write atom:

```ts
const persistedAiSettingsAtom = atom<AiSettings>(
  readBrowserStorageJson<AiSettings>({
    key: AI_SETTINGS_STORAGE_KEY,
    storageType: 'local',
    fallback: DEFAULT_AI_SETTINGS,
    validate: isAiSettings,
  }),
);

export const aiSettingsAtom = atom(
  (get) => get(persistedAiSettingsAtom),
  (_get, set, nextSettings: AiSettings) => {
    set(persistedAiSettingsAtom, nextSettings);
    writeBrowserStorageJson({ key: AI_SETTINGS_STORAGE_KEY, storageType: 'local', value: nextSettings });
  },
);
```

Update `setAiModelAtom`, `saveApiKeyAtom`, and `clearApiKeyAtom` to write through `aiSettingsAtom`.

- [ ] **Step 5: Run targeted settings tests**

Run:

```bash
pnpm test src/entities/settings/model/aiSettingsAtom.test.ts
```

Expected: PASS.

## Task 4: Integration Validation and Docs

**Files:**
- Modify: `docs/WORK_LOG.md`
- Modify: `docs/SESSION_STATE.md`

- [ ] **Step 1: Run combined targeted tests**

Run:

```bash
pnpm test src/entities/session/model/sessionAtom.test.ts src/entities/settings/model/aiSettingsAtom.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run full validation**

Run:

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
git diff --check
```

Expected: all PASS.

- [ ] **Step 3: Update `docs/WORK_LOG.md`**

Record:

- Unit 20 summary
- New/modified files
- Persistence policy: sessionStorage for session, localStorage for AI settings metadata
- Explicit statement: API key original is not persisted
- Validation command results
- Remaining risks: actual server-side API key storage/AI provider integration remains out of scope

- [ ] **Step 4: Update `docs/SESSION_STATE.md`**

Record:

- Current Unit 20 implementation status
- Changed files
- Validation results
- Next action: GPT review request

## Self-Review Checklist

- [ ] No API key original is stored in localStorage/sessionStorage.
- [ ] Stored AI settings contain only `modelId`, `isApiKeyConnected`, and `maskedApiKey`.
- [ ] Stored session contains only `userStatus` and `aiTrialRemainingCount`.
- [ ] Malformed storage data falls back safely.
- [ ] Jotai public atoms remain the only feature-facing API.
- [ ] No FSD dependency direction violation is introduced.
- [ ] No deep import is introduced.
- [ ] Full validation commands pass before review request.
