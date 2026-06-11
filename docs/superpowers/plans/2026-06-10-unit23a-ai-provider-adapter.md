# Unit 23A AI Provider Adapter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the client-side AI provider boundary for AssetFlow AI so rebalancing proposals can be requested through a Codex/OpenAI adapter interface while still using mock recommendations as the default prototype response.

**Architecture:** This unit does not call the real OpenAI API yet. It introduces provider-neutral request/response types, an in-session API key atom, and a mock-backed provider adapter so the UI flow moves from hardcoded mock data to an async provider boundary. Actual OpenAI Responses API network calls are deferred to Unit 23B.

**Tech Stack:** React 19, TypeScript, Vite, Jotai, TanStack Query conventions where already used, Vitest + RTL, Feature-Sliced Design.

---

## Product Decisions

- First provider: `codex`, displayed as `Codex`.
- Technical adapter family: OpenAI-compatible provider boundary, because Codex is an OpenAI product line and the app will later call OpenAI API/Responses from this boundary.
- API key handling for prototype: keep raw API key in memory only for the active browser session; do not write raw key to localStorage, sessionStorage, Supabase, logs, docs, tests, or URL params.
- Formal launch direction: move raw key storage to Supabase with encryption and server-side access policy in Unit 24.
- Unit 23A scope: provider boundary and UI flow only. No real external API call.
- Unit 23B scope: actual OpenAI/Codex-compatible API call through the provider boundary.

## File Map

Create:
- `src/entities/ai-provider/model/types.ts` — provider ids, request/response contracts, error codes.
- `src/entities/ai-provider/model/constants.ts` — provider labels, default provider, session key policy copy.
- `src/entities/ai-provider/model/apiKeySessionAtom.ts` — raw API key in-memory atom and derived connection state.
- `src/entities/ai-provider/api/mockAiProposalProvider.ts` — mock adapter returning existing rebalancing data through async boundary.
- `src/entities/ai-provider/api/aiProposalProvider.ts` — provider resolver and request function.
- `src/entities/ai-provider/api/aiProposalProvider.test.ts` — adapter tests.
- `src/entities/ai-provider/model/apiKeySessionAtom.test.ts` — in-memory key policy tests.
- `src/entities/ai-provider/index.ts` — public API.

Modify:
- `src/entities/settings/model/types.ts` — add `codex` model id or rename first option carefully.
- `src/entities/settings/model/constants.ts` — expose `Codex` as first AI model option.
- `src/entities/settings/model/aiSettingsAtom.ts` — default model should be `codex`; persisted metadata remains raw-key-free.
- `src/entities/settings/model/aiSettingsAtom.test.ts` — update default/provider option tests.
- `src/features/settings-portfolio/ui/AiSettingsSection.tsx` — save raw key to in-memory atom while keeping persisted metadata masked only.
- `src/features/settings-portfolio/ui/SettingsPortfolioPanel.test.tsx` — guard that raw key is not persisted and connected state still works.
- `src/features/rebalancing-proposal/ui/RebalancingProposalPanel.tsx` — request proposal through provider boundary; show loading/error/result states.
- `src/features/rebalancing-proposal/ui/RebalancingProposalPanel.test.tsx` — test trial decrement, key-required modal, provider success, provider failure.
- `src/entities/rebalancing/index.ts` — export needed mock data only if provider adapter imports from public API without deep import.
- `docs/WORK_LOG.md`, `docs/SESSION_STATE.md`, `docs/NEXT_TASK_DRAFT.md` — update Unit 23A result after implementation.

## Task 1: Add AI Provider Contracts

**Files:**
- Create: `src/entities/ai-provider/model/types.ts`
- Create: `src/entities/ai-provider/model/constants.ts`
- Create: `src/entities/ai-provider/index.ts`

- [ ] **Step 1: Create failing type/import test via provider adapter test shell**

Create `src/entities/ai-provider/api/aiProposalProvider.test.ts` with this initial test:

```ts
import { describe, expect, it } from 'vitest';
import { AI_PROVIDER_LABELS, DEFAULT_AI_PROVIDER_ID } from '@entities/ai-provider';

describe('ai provider contracts', () => {
  it('uses Codex as the first prototype provider', () => {
    expect(DEFAULT_AI_PROVIDER_ID).toBe('codex');
    expect(AI_PROVIDER_LABELS.codex).toBe('Codex');
  });
});
```

Run:

```bash
pnpm test src/entities/ai-provider/api/aiProposalProvider.test.ts
```

Expected: FAIL because `@entities/ai-provider` does not exist.

- [ ] **Step 2: Add provider contract files**

Create `src/entities/ai-provider/model/types.ts`:

```ts
import type {
  RebalancingRecommendationItem,
  RebalancingScenario,
  StockActionRecommendation,
} from '@entities/rebalancing';

export type AiProviderId = 'codex' | 'gemini' | 'claude';

export type AiProposalErrorCode =
  | 'api_key_required'
  | 'provider_unavailable'
  | 'invalid_response'
  | 'network_error';

export interface AiProposalRequest {
  providerId: AiProviderId;
  apiKey: string | null;
}

export interface AiProposalResponse {
  recommendations: RebalancingRecommendationItem[];
  stockActions: StockActionRecommendation[];
  scenarios: RebalancingScenario[];
  generatedAt: string;
  source: 'mock' | 'provider';
}

export interface AiProposalFailure {
  code: AiProposalErrorCode;
  message: string;
}

export type AiProposalResult =
  | { success: true; data: AiProposalResponse }
  | { success: false; error: AiProposalFailure };

export interface AiProposalProvider {
  requestProposal: (request: AiProposalRequest) => Promise<AiProposalResult>;
}
```

Create `src/entities/ai-provider/model/constants.ts`:

```ts
import type { AiProviderId } from './types';

export const DEFAULT_AI_PROVIDER_ID: AiProviderId = 'codex';

export const AI_PROVIDER_LABELS: Record<AiProviderId, string> = {
  codex: 'Codex',
  gemini: 'Gemini',
  claude: 'Claude',
};

export const AI_API_KEY_SESSION_POLICY_MESSAGE =
  '프로토타입에서는 API key 원문을 브라우저 메모리에만 보관하고 저장소에는 기록하지 않습니다.';
```

Create `src/entities/ai-provider/index.ts`:

```ts
export type {
  AiProposalErrorCode,
  AiProposalFailure,
  AiProposalProvider,
  AiProposalRequest,
  AiProposalResponse,
  AiProposalResult,
  AiProviderId,
} from './model/types';

export {
  AI_API_KEY_SESSION_POLICY_MESSAGE,
  AI_PROVIDER_LABELS,
  DEFAULT_AI_PROVIDER_ID,
} from './model/constants';
```

- [ ] **Step 3: Run contract test**

Run:

```bash
pnpm test src/entities/ai-provider/api/aiProposalProvider.test.ts
```

Expected: PASS.

## Task 2: Add In-Memory API Key Session Atom

**Files:**
- Create: `src/entities/ai-provider/model/apiKeySessionAtom.ts`
- Create: `src/entities/ai-provider/model/apiKeySessionAtom.test.ts`
- Modify: `src/entities/ai-provider/index.ts`

- [ ] **Step 1: Write in-memory key tests**

Create `src/entities/ai-provider/model/apiKeySessionAtom.test.ts`:

```ts
import { createStore } from 'jotai';
import { describe, expect, it } from 'vitest';
import {
  aiApiKeySessionAtom,
  clearAiApiKeySessionAtom,
  hasAiApiKeySessionAtom,
  setAiApiKeySessionAtom,
} from './apiKeySessionAtom';

describe('aiApiKeySessionAtom', () => {
  it('keeps raw API key in memory only', () => {
    const store = createStore();

    store.set(setAiApiKeySessionAtom, 'sk-prototype-session-key');

    expect(store.get(aiApiKeySessionAtom)).toBe('sk-prototype-session-key');
    expect(store.get(hasAiApiKeySessionAtom)).toBe(true);
    expect(window.localStorage.getItem('assetflow.ai-api-key')).toBeNull();
    expect(window.sessionStorage.getItem('assetflow.ai-api-key')).toBeNull();
  });

  it('clears the in-memory API key', () => {
    const store = createStore();

    store.set(setAiApiKeySessionAtom, 'sk-prototype-session-key');
    store.set(clearAiApiKeySessionAtom);

    expect(store.get(aiApiKeySessionAtom)).toBeNull();
    expect(store.get(hasAiApiKeySessionAtom)).toBe(false);
  });
});
```

Run:

```bash
pnpm test src/entities/ai-provider/model/apiKeySessionAtom.test.ts
```

Expected: FAIL because atom file does not exist.

- [ ] **Step 2: Implement atom**

Create `src/entities/ai-provider/model/apiKeySessionAtom.ts`:

```ts
import { atom } from 'jotai';

export const aiApiKeySessionAtom = atom<string | null>(null);

export const hasAiApiKeySessionAtom = atom((get) => get(aiApiKeySessionAtom) !== null);

export const setAiApiKeySessionAtom = atom(null, (_get, set, key: string) => {
  set(aiApiKeySessionAtom, key);
});

export const clearAiApiKeySessionAtom = atom(null, (_get, set) => {
  set(aiApiKeySessionAtom, null);
});
```

Update `src/entities/ai-provider/index.ts`:

```ts
export {
  aiApiKeySessionAtom,
  clearAiApiKeySessionAtom,
  hasAiApiKeySessionAtom,
  setAiApiKeySessionAtom,
} from './model/apiKeySessionAtom';
```

- [ ] **Step 3: Run atom tests**

Run:

```bash
pnpm test src/entities/ai-provider/model/apiKeySessionAtom.test.ts
```

Expected: PASS.

## Task 3: Add Mock Proposal Provider Boundary

**Files:**
- Create: `src/entities/ai-provider/api/mockAiProposalProvider.ts`
- Create: `src/entities/ai-provider/api/aiProposalProvider.ts`
- Modify: `src/entities/ai-provider/api/aiProposalProvider.test.ts`
- Modify: `src/entities/ai-provider/index.ts`

- [ ] **Step 1: Extend provider tests**

Replace `src/entities/ai-provider/api/aiProposalProvider.test.ts` with:

```ts
import { describe, expect, it } from 'vitest';
import {
  AI_PROVIDER_LABELS,
  DEFAULT_AI_PROVIDER_ID,
  requestAiProposal,
} from '@entities/ai-provider';

describe('ai provider contracts', () => {
  it('uses Codex as the first prototype provider', () => {
    expect(DEFAULT_AI_PROVIDER_ID).toBe('codex');
    expect(AI_PROVIDER_LABELS.codex).toBe('Codex');
  });
});

describe('requestAiProposal', () => {
  it('returns mock proposal data through the provider boundary', async () => {
    const result = await requestAiProposal({ providerId: 'codex', apiKey: 'sk-session-key' });

    expect(result.success).toBe(true);
    if (!result.success) throw new Error(result.error.message);
    expect(result.data.source).toBe('mock');
    expect(result.data.recommendations.length).toBeGreaterThan(0);
    expect(result.data.stockActions.length).toBeGreaterThan(0);
    expect(result.data.scenarios.length).toBeGreaterThan(0);
  });

  it('returns api_key_required when no key is provided', async () => {
    const result = await requestAiProposal({ providerId: 'codex', apiKey: null });

    expect(result).toEqual({
      success: false,
      error: {
        code: 'api_key_required',
        message: 'Codex API key가 필요합니다.',
      },
    });
  });
});
```

Run:

```bash
pnpm test src/entities/ai-provider/api/aiProposalProvider.test.ts
```

Expected: FAIL because `requestAiProposal` does not exist.

- [ ] **Step 2: Implement mock provider**

Create `src/entities/ai-provider/api/mockAiProposalProvider.ts`:

```ts
import {
  MOCK_REBALANCING_RECOMMENDATIONS,
  MOCK_REBALANCING_SCENARIOS,
  MOCK_STOCK_ACTION_RECOMMENDATIONS,
} from '@entities/rebalancing';
import type { AiProposalProvider } from '../model/types';

export const mockAiProposalProvider: AiProposalProvider = {
  requestProposal: async (request) => {
    if (!request.apiKey) {
      return {
        success: false,
        error: {
          code: 'api_key_required',
          message: 'Codex API key가 필요합니다.',
        },
      };
    }

    return {
      success: true,
      data: {
        recommendations: MOCK_REBALANCING_RECOMMENDATIONS,
        stockActions: MOCK_STOCK_ACTION_RECOMMENDATIONS,
        scenarios: MOCK_REBALANCING_SCENARIOS,
        generatedAt: new Date().toISOString(),
        source: 'mock',
      },
    };
  },
};
```

Create `src/entities/ai-provider/api/aiProposalProvider.ts`:

```ts
import { mockAiProposalProvider } from './mockAiProposalProvider';
import type { AiProposalRequest, AiProposalResult, AiProviderId } from '../model/types';

const PROVIDERS = {
  codex: mockAiProposalProvider,
  gemini: mockAiProposalProvider,
  claude: mockAiProposalProvider,
} satisfies Record<AiProviderId, typeof mockAiProposalProvider>;

export const requestAiProposal = async (request: AiProposalRequest): Promise<AiProposalResult> => {
  const provider = PROVIDERS[request.providerId];
  return provider.requestProposal(request);
};
```

Update `src/entities/ai-provider/index.ts`:

```ts
export { requestAiProposal } from './api/aiProposalProvider';
export { mockAiProposalProvider } from './api/mockAiProposalProvider';
```

- [ ] **Step 3: Run provider tests**

Run:

```bash
pnpm test src/entities/ai-provider/api/aiProposalProvider.test.ts
```

Expected: PASS.

## Task 4: Wire Settings UI to In-Memory Raw Key

**Files:**
- Modify: `src/entities/settings/model/types.ts`
- Modify: `src/entities/settings/model/constants.ts`
- Modify: `src/entities/settings/model/aiSettingsAtom.ts`
- Modify: `src/entities/settings/model/aiSettingsAtom.test.ts`
- Modify: `src/features/settings-portfolio/ui/AiSettingsSection.tsx`
- Modify: `src/features/settings-portfolio/ui/SettingsPortfolioPanel.test.tsx`

- [ ] **Step 1: Update model ids and tests**

Change `AiModelId` in `src/entities/settings/model/types.ts`:

```ts
export type AiModelId = 'codex' | 'gemini' | 'claude';
```

Change options in `src/entities/settings/model/constants.ts`:

```ts
export const AI_MODEL_OPTIONS: { id: AiModelId; label: string }[] = [
  { id: 'codex', label: 'Codex' },
  { id: 'gemini', label: 'Gemini' },
  { id: 'claude', label: 'Claude' },
];

export const DEFAULT_AI_MODEL_ID: AiModelId = 'codex';
```

Update `isAiModelId` and default in `src/entities/settings/model/aiSettingsAtom.ts`:

```ts
const DEFAULT_AI_SETTINGS: AiSettings = {
  modelId: 'codex',
  isApiKeyConnected: false,
  maskedApiKey: null,
};

const isAiModelId = (value: unknown): value is AiModelId =>
  value === 'codex' || value === 'gemini' || value === 'claude';
```

Update `src/entities/settings/model/aiSettingsAtom.test.ts` expectations from `gpt` to `codex` where they assert default fallback.

- [ ] **Step 2: Store raw key in memory on save**

Modify `src/features/settings-portfolio/ui/AiSettingsSection.tsx` imports:

```ts
import { clearAiApiKeySessionAtom, setAiApiKeySessionAtom } from '@entities/ai-provider';
```

Add setters:

```ts
const setAiApiKeySession = useSetAtom(setAiApiKeySessionAtom);
const clearAiApiKeySession = useSetAtom(clearAiApiKeySessionAtom);
```

Update `handleSave`:

```ts
setAiApiKeySession(trimmed);
saveApiKey(trimmed);
```

Update `handleEdit` and `handleDelete`:

```ts
clearAiApiKeySession();
clearApiKey();
```

- [ ] **Step 3: Update settings tests**

In `src/features/settings-portfolio/ui/SettingsPortfolioPanel.test.tsx`, keep existing raw-key-not-persisted tests. Add or update an assertion that the Codex option is present:

```ts
expect(screen.getByLabelText('Codex')).toBeInTheDocument();
```

Run:

```bash
pnpm test src/entities/settings/model/aiSettingsAtom.test.ts src/features/settings-portfolio/ui/SettingsPortfolioPanel.test.tsx
```

Expected: PASS.

## Task 5: Wire Rebalancing Proposal UI to Provider Boundary

**Files:**
- Modify: `src/features/rebalancing-proposal/ui/RebalancingProposalPanel.tsx`
- Modify: `src/features/rebalancing-proposal/ui/RebalancingProposalPanel.test.tsx`

- [ ] **Step 1: Update tests for async provider request**

In `src/features/rebalancing-proposal/ui/RebalancingProposalPanel.test.tsx`, add tests:

```ts
import { setAiApiKeySessionAtom } from '@entities/ai-provider';

it('API key가 연결된 사용자가 제안 요청 시 provider 결과를 표시한다', async () => {
  const user = userEvent.setup();
  const store = createStore();
  store.set(sessionAtom, { userStatus: 'existing', aiTrialRemainingCount: 2 });
  store.set(saveApiKeyAtom, 'dummy-key-for-test');
  store.set(setAiApiKeySessionAtom, 'dummy-key-for-test');

  render(
    <Provider store={store}>
      <MemoryRouter>
        <RebalancingProposalPanel />
      </MemoryRouter>
    </Provider>,
  );

  await user.click(screen.getByRole('button', { name: 'AI 추천 받기' }));

  expect(screen.getByRole('region', { name: 'AI 추천 근거' })).toBeInTheDocument();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(store.get(sessionAtom)?.aiTrialRemainingCount).toBe(2);
});

it('API key 연결 상태지만 세션 key 원문이 없으면 설정 안내를 표시한다', async () => {
  const user = userEvent.setup();
  const store = createStore();
  store.set(sessionAtom, { userStatus: 'existing', aiTrialRemainingCount: 2 });
  store.set(saveApiKeyAtom, 'dummy-key-for-test');

  render(
    <Provider store={store}>
      <MemoryRouter>
        <RebalancingProposalPanel />
      </MemoryRouter>
    </Provider>,
  );

  await user.click(screen.getByRole('button', { name: 'AI 추천 받기' }));

  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(store.get(sessionAtom)?.aiTrialRemainingCount).toBe(2);
});
```

If the existing `renderPanel` helper is kept, extend it to accept an option object:

```ts
const renderPanel = (
  sessionOverride?: Partial<Session> | null,
  options: { apiKeyConnected?: boolean; sessionApiKey?: string | null } = {},
) => {
  const store = createStore();
  if (sessionOverride !== null) {
    store.set(sessionAtom, { ...DEFAULT_SESSION, ...sessionOverride });
  }
  if (options.apiKeyConnected) {
    store.set(saveApiKeyAtom, 'dummy-key-for-test');
  }
  if (options.sessionApiKey) {
    store.set(setAiApiKeySessionAtom, options.sessionApiKey);
  }
  render(
    <Provider store={store}>
      <MemoryRouter>
        <RebalancingProposalPanel />
      </MemoryRouter>
    </Provider>,
  );
  return { store };
};
```

- [ ] **Step 2: Update component**

In `src/features/rebalancing-proposal/ui/RebalancingProposalPanel.tsx`:

Import:

```ts
import { aiApiKeySessionAtom, requestAiProposal } from '@entities/ai-provider';
import { aiSettingsAtom } from '@entities/settings';
```

Read atoms:

```ts
const aiSettings = useAtomValue(aiSettingsAtom);
const aiApiKey = useAtomValue(aiApiKeySessionAtom);
```

Add state:

```ts
const [isRequesting, setIsRequesting] = useState(false);
const [proposalError, setProposalError] = useState<string | null>(null);
```

Change `handleRequestProposal` to async:

```ts
const handleRequestProposal = async () => {
  setProposalError(null);

  if (isTrialExhausted) {
    setIsApiKeyPromptOpen(true);
    return;
  }

  if (isApiKeyConnected && !aiApiKey) {
    setIsApiKeyPromptOpen(true);
    return;
  }

  setIsRequesting(true);
  const result = await requestAiProposal({
    providerId: aiSettings.modelId,
    apiKey: aiApiKey ?? 'free-trial-mock-key',
  });
  setIsRequesting(false);

  if (!result.success) {
    setProposalError(result.error.message);
    return;
  }

  if (!isApiKeyConnected) {
    decrementTrial();
  }
};
```

Button label:

```tsx
{isRequesting ? '제안 생성 중...' : PROPOSAL_REQUEST_CTA_LABEL}
```

Render error:

```tsx
{proposalError && (
  <p role="alert" className="text-sm text-[hsl(var(--destructive))]">
    {proposalError}
  </p>
)}
```

- [ ] **Step 3: Run rebalancing tests**

Run:

```bash
pnpm test src/features/rebalancing-proposal/ui/RebalancingProposalPanel.test.tsx
```

Expected: PASS.

## Task 6: Update Docs and Run Full Verification

**Files:**
- Modify: `docs/WORK_LOG.md`
- Modify: `docs/SESSION_STATE.md`
- Modify: `docs/NEXT_TASK_DRAFT.md`

- [ ] **Step 1: Update docs**

Record:

- Unit 23A added AI provider adapter boundary.
- Codex is the first prototype provider.
- Raw API key is stored only in Jotai memory during the browser session.
- No real external API call is made in Unit 23A.
- Unit 23B will implement actual OpenAI Responses API call.
- Unit 24 will implement Supabase encrypted API key storage.

- [ ] **Step 2: Run required validation**

Run:

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm build
git diff --check
```

Expected:

- All commands pass.
- `pnpm build` may keep the known Supabase chunk size warning.

- [ ] **Step 3: Do not commit**

Claude Code must not create a commit. GPT reviewer will review first.

## Self-Review Checklist

- Unit 23A does not call the real OpenAI API.
- Raw API key is never persisted.
- The persisted `assetflow.ai-settings` value still contains only `modelId`, `isApiKeyConnected`, and `maskedApiKey`.
- FSD dependency direction is preserved.
- No feature imports from another feature.
- No deep import outside slice public APIs.
- Tests cover provider success, missing key, and raw-key-not-persisted policy.
