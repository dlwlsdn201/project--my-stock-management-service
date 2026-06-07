# Unit 22 — Supabase Persistence 연결 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 목표 비중(`TargetAllocation`)과 수동 자산(`ManualAsset`)을 Supabase DB에 저장/조회/수정/삭제하도록 연결하고, Supabase env 미설정 시 in-memory fallback을 유지한다.

**Architecture:** `supabaseClient.ts`를 실제 `createClient` 기반으로 교체하고, 기존 Store 인터페이스(`TargetAllocationStore`, `ManualAssetStore`)를 구현하는 Supabase 어댑터를 별도 파일로 추가한다. `resolveDefaultStore()` 분기에 Supabase 어댑터를 연결하면 api/hook 레이어는 변경하지 않는다.

**Tech Stack:** `@supabase/supabase-js ^2.107.0` (이미 설치됨), Vitest, Supabase MCP (`mcp__supabase__*`)

---

## 파일 구조

### 신규 생성
- `supabase/migrations/<timestamp>_create_portfolio_persistence_tables.sql` — DB 스키마
- `src/shared/api/supabaseClient.ts` (수정) — `createClient` 실제 연결
- `src/entities/portfolio/api/supabaseTargetAllocationStore.ts` — Supabase TA 어댑터
- `src/entities/portfolio/api/supabaseManualAssetStore.ts` — Supabase MA 어댑터
- `src/entities/portfolio/api/supabaseTargetAllocationStore.test.ts`
- `src/entities/portfolio/api/supabaseManualAssetStore.test.ts`
- `src/entities/portfolio/api/targetAllocationStore.test.ts` (수정) — fallback 테스트 보강

### 수정
- `src/entities/portfolio/api/targetAllocationStore.ts` — resolveDefaultStore Supabase 분기 연결
- `src/entities/portfolio/api/manualAssetStore.ts` — resolveDefaultStore Supabase 분기 연결
- `src/entities/portfolio/index.ts` — 새 어댑터 export 추가
- `docs/WORK_LOG.md`
- `docs/SESSION_STATE.md`
- `docs/NEXT_TASK_DRAFT.md` (필요 시)

---

## Task 1: supabaseClient.ts — 실제 createClient 연결

**Files:**
- Modify: `src/shared/api/supabaseClient.ts`

현재 파일은 env 감지만 하고 클라이언트를 생성하지 않는다. `createClient` 인스턴스를 반환하도록 확장한다. env 미설정 시 `null`을 반환하는 게터를 분리해 fallback 분기가 `null` 체크만으로 작동하게 한다.

- [ ] **Step 1: 현재 파일을 읽고 변경 계획 확인**

  이미 읽었으므로 바로 수정한다. `@supabase/supabase-js`의 `createClient`를 import하고 싱글턴 `SupabaseClient` 인스턴스를 반환하는 `getSupabaseClient()` 함수를 추가한다. `any` 금지 — 제네릭 타입 파라미터 없이 `createClient(url, anonKey)`로 호출하면 `SupabaseClient<Database, 'public', any>` 타입이 되므로 `ReturnType<typeof createClient>`로 타입 추론을 활용한다.

```typescript
// src/shared/api/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export const getSupabaseConfig = (): SupabaseConfig | null => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (typeof url === 'string' && url.length > 0 && typeof anonKey === 'string' && anonKey.length > 0) {
    return { url, anonKey };
  }

  return null;
};

export const isSupabaseConfigured = (): boolean => getSupabaseConfig() !== null;

let _client: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  const config = getSupabaseConfig();
  if (!config) return null;
  if (!_client) {
    _client = createClient(config.url, config.anonKey);
  }
  return _client;
};

// 테스트 격리용: 클라이언트 인스턴스를 리셋한다.
export const _resetSupabaseClient = (): void => {
  _client = null;
};
```

- [ ] **Step 2: `src/shared/index.ts`에 getSupabaseClient export 추가**

  `isSupabaseConfigured`와 `getSupabaseConfig`는 이미 export 중일 수 있다. 현재 shared index를 확인하고 `getSupabaseClient`가 없으면 추가한다.

  ```bash
  grep -n "supabase" src/shared/index.ts
  ```

  없으면 `src/shared/api/index.ts` 또는 `src/shared/index.ts`에 추가한다.

- [ ] **Step 3: typecheck 통과 확인**

  ```bash
  pnpm typecheck
  ```
  Expected: no errors

---

## Task 2: DB Migration 작성

**Files:**
- Create: `supabase/migrations/<timestamp>_create_portfolio_persistence_tables.sql`

`entity/portfolio/model/types.ts`의 타입과 1:1 매핑:
- `TargetAllocation` → `target_allocations` 테이블
- `ManualAsset` → `manual_assets` 테이블

두 테이블 모두 `user_id uuid` 컬럼을 포함한다. MVP에서는 mock user id를 사용하고, 운영 전환 시 `auth.uid() = user_id` 기반 RLS로 강화한다.

- [ ] **Step 1: migration 파일 이름을 CLI로 생성**

  ```bash
  npx supabase migration new create_portfolio_persistence_tables
  ```

  생성된 파일 경로를 확인한다 (`supabase/migrations/<timestamp>_create_portfolio_persistence_tables.sql`).

- [ ] **Step 2: migration SQL 작성**

  ```sql
  -- supabase/migrations/<timestamp>_create_portfolio_persistence_tables.sql

  -- target_allocations: 사용자별 목표 자산군 비중 (equity/bond/cash-and-alternative)
  -- TargetAllocation { equity: number; bond: number; 'cash-and-alternative': number }
  create table if not exists public.target_allocations (
    id          uuid primary key default gen_random_uuid(),
    user_id     uuid not null,
    equity      numeric(5,2) not null check (equity >= 0 and equity <= 100),
    bond        numeric(5,2) not null check (bond >= 0 and bond <= 100),
    cash_and_alternative numeric(5,2) not null check (cash_and_alternative >= 0 and cash_and_alternative <= 100),
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
  );

  -- 사용자당 목표 비중 레코드는 1개. upsert 패턴으로 단일 레코드를 유지한다.
  create unique index if not exists target_allocations_user_id_unique
    on public.target_allocations (user_id);

  -- manual_assets: 사용자가 수동 입력한 자산 목록
  -- ManualAsset { id: string; ticker: string; name: string; quantity: number; avgPrice: number }
  create table if not exists public.manual_assets (
    id          uuid primary key default gen_random_uuid(),
    user_id     uuid not null,
    ticker      text not null,
    name        text not null,
    quantity    numeric not null check (quantity > 0),
    avg_price   numeric not null check (avg_price > 0),
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
  );

  -- RLS 활성화
  alter table public.target_allocations enable row level security;
  alter table public.manual_assets enable row level security;

  -- MVP RLS 정책: anon 키로 접근 가능하게 열어둔다.
  -- mock user_id 기반 persistence가 동작해야 하므로 제한적으로 허용한다.
  -- 운영 전환 시 아래 정책을 제거하고 auth.uid() 기반 정책으로 교체한다.
  -- 운영 정책 예시:
  --   create policy "users can manage own target_allocations"
  --   on public.target_allocations for all
  --   to authenticated
  --   using ( (select auth.uid()) = user_id )
  --   with check ( (select auth.uid()) = user_id );
  create policy "mvp_anon_all_target_allocations"
    on public.target_allocations for all
    to anon
    using (true)
    with check (true);

  create policy "mvp_anon_all_manual_assets"
    on public.manual_assets for all
    to anon
    using (true)
    with check (true);

  -- updated_at 자동 갱신 트리거
  create or replace function public.set_updated_at()
  returns trigger language plpgsql as $$
  begin
    new.updated_at = now();
    return new;
  end;
  $$;

  create trigger target_allocations_set_updated_at
    before update on public.target_allocations
    for each row execute function public.set_updated_at();

  create trigger manual_assets_set_updated_at
    before update on public.manual_assets
    for each row execute function public.set_updated_at();
  ```

- [ ] **Step 3: Supabase MCP로 migration 적용**

  MCP `apply_migration` 도구로 위 SQL을 원격 프로젝트에 적용한다. (local CLI가 PATH에 없으므로 MCP 사용)

  적용 후 `list_tables`로 테이블 생성 확인:
  ```
  mcp__supabase__list_tables(schemas: ["public"], verbose: true)
  ```

- [ ] **Step 4: 적용 결과를 WORK_LOG.md에 기록**

---

## Task 3: Supabase TargetAllocation 어댑터

**Files:**
- Create: `src/entities/portfolio/api/supabaseTargetAllocationStore.ts`

`TargetAllocationStore` 인터페이스(`read`, `save`)를 Supabase로 구현한다. `user_id`는 MVP에서 고정값(`MOCK_SUPABASE_USER_ID`)을 사용하고, 운영 전환 시 auth 연동 지점임을 주석으로 남긴다.

- [ ] **Step 1: 어댑터 파일 작성**

```typescript
// src/entities/portfolio/api/supabaseTargetAllocationStore.ts
import type { SupabaseClient } from '@supabase/supabase-js';
import { MOCK_TARGET_ALLOCATION } from '../model/mockPortfolio';
import type { TargetAllocation } from '../model/types';
import type { TargetAllocationStore } from './targetAllocationStore';

// MVP mock user id. 운영 전환 시 supabase.auth.getUser() 로 교체한다.
export const MOCK_SUPABASE_USER_ID = '00000000-0000-0000-0000-000000000001';

interface TargetAllocationRow {
  id: string;
  user_id: string;
  equity: number;
  bond: number;
  cash_and_alternative: number;
}

const rowToEntity = (row: TargetAllocationRow): TargetAllocation => ({
  equity: row.equity,
  bond: row.bond,
  'cash-and-alternative': row.cash_and_alternative,
});

const entityToRow = (
  entity: TargetAllocation,
  userId: string,
): Omit<TargetAllocationRow, 'id'> => ({
  user_id: userId,
  equity: entity.equity,
  bond: entity.bond,
  cash_and_alternative: entity['cash-and-alternative'],
});

export const createSupabaseTargetAllocationStore = (
  client: SupabaseClient,
  userId: string = MOCK_SUPABASE_USER_ID,
): TargetAllocationStore => ({
  read: async () => {
    const { data, error } = await client
      .from('target_allocations')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw new Error(`target_allocations read failed: ${error.message}`);
    if (!data) return { ...MOCK_TARGET_ALLOCATION };

    return rowToEntity(data as TargetAllocationRow);
  },

  save: async (next: TargetAllocation) => {
    const row = entityToRow(next, userId);
    const { data, error } = await client
      .from('target_allocations')
      .upsert({ ...row }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw new Error(`target_allocations save failed: ${error.message}`);

    return rowToEntity(data as TargetAllocationRow);
  },
});
```

- [ ] **Step 2: targetAllocationStore.ts의 resolveDefaultStore 교체**

```typescript
// src/entities/portfolio/api/targetAllocationStore.ts
import { getSupabaseClient } from '@shared/api/supabaseClient';
import { isSupabaseConfigured } from '@shared';
import { MOCK_TARGET_ALLOCATION } from '../model/mockPortfolio';
import type { TargetAllocation } from '../model/types';
import { createSupabaseTargetAllocationStore } from './supabaseTargetAllocationStore';

// ... (기존 TargetAllocationStore interface, createInMemoryTargetAllocationStore 유지)

const resolveDefaultStore = (): TargetAllocationStore => {
  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (client) return createSupabaseTargetAllocationStore(client);
  }
  return createInMemoryTargetAllocationStore();
};
```

- [ ] **Step 3: index.ts에 createSupabaseTargetAllocationStore export 추가**

```typescript
// src/entities/portfolio/index.ts 에 추가:
export {
  MOCK_SUPABASE_USER_ID,
  createSupabaseTargetAllocationStore,
} from './api/supabaseTargetAllocationStore';
```

- [ ] **Step 4: typecheck 통과 확인**

  ```bash
  pnpm typecheck
  ```

---

## Task 4: Supabase ManualAsset 어댑터

**Files:**
- Create: `src/entities/portfolio/api/supabaseManualAssetStore.ts`

`ManualAssetStore` 인터페이스(`read`, `create`, `update`, `delete`)를 Supabase로 구현한다.

- [ ] **Step 1: 어댑터 파일 작성**

```typescript
// src/entities/portfolio/api/supabaseManualAssetStore.ts
import type { SupabaseClient } from '@supabase/supabase-js';
import type { ManualAsset, ManualAssetPayload } from '../model/types';
import type { ManualAssetStore } from './manualAssetStore';
import { MOCK_SUPABASE_USER_ID } from './supabaseTargetAllocationStore';

interface ManualAssetRow {
  id: string;
  user_id: string;
  ticker: string;
  name: string;
  quantity: number;
  avg_price: number;
}

const rowToEntity = (row: ManualAssetRow): ManualAsset => ({
  id: row.id,
  ticker: row.ticker,
  name: row.name,
  quantity: row.quantity,
  avgPrice: row.avg_price,
});

const payloadToRow = (
  payload: ManualAssetPayload,
  userId: string,
): Omit<ManualAssetRow, 'id'> => ({
  user_id: userId,
  ticker: payload.ticker,
  name: payload.name,
  quantity: payload.quantity,
  avg_price: payload.avgPrice,
});

export const createSupabaseManualAssetStore = (
  client: SupabaseClient,
  userId: string = MOCK_SUPABASE_USER_ID,
): ManualAssetStore => ({
  read: async () => {
    const { data, error } = await client
      .from('manual_assets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(`manual_assets read failed: ${error.message}`);

    return (data as ManualAssetRow[]).map(rowToEntity);
  },

  create: async (payload: ManualAssetPayload) => {
    const row = payloadToRow(payload, userId);
    const { data, error } = await client
      .from('manual_assets')
      .insert(row)
      .select()
      .single();

    if (error) throw new Error(`manual_assets create failed: ${error.message}`);

    return rowToEntity(data as ManualAssetRow);
  },

  update: async (id: string, payload: ManualAssetPayload) => {
    const { data, error } = await client
      .from('manual_assets')
      .update({
        ticker: payload.ticker,
        name: payload.name,
        quantity: payload.quantity,
        avg_price: payload.avgPrice,
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error(`manual_assets update failed: ${error.message}`);

    return rowToEntity(data as ManualAssetRow);
  },

  delete: async (id: string) => {
    const { error } = await client
      .from('manual_assets')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new Error(`manual_assets delete failed: ${error.message}`);
  },
});
```

- [ ] **Step 2: manualAssetStore.ts의 resolveDefaultStore 교체**

  `manualAssetStore.ts`에 `resolveDefaultStore` 패턴을 추가한다. 현재는 `createInMemoryManualAssetStore()`를 직접 할당하고 있으므로 아래로 교체:

```typescript
// src/entities/portfolio/api/manualAssetStore.ts (resolveDefaultStore 추가)
import { getSupabaseClient, isSupabaseConfigured } from '@shared/api/supabaseClient';
import { createSupabaseManualAssetStore } from './supabaseManualAssetStore';

// ... (기존 interface, createInMemoryManualAssetStore 유지)

const resolveDefaultStore = (): ManualAssetStore => {
  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (client) return createSupabaseManualAssetStore(client);
  }
  return createInMemoryManualAssetStore();
};

let activeStore: ManualAssetStore = resolveDefaultStore();

// ... (getManualAssetStore, configureManualAssetStore, resetManualAssetStore 유지)
```

  주의: `isSupabaseConfigured`는 `@shared`에서, `getSupabaseClient`는 `@shared/api/supabaseClient`에서 import한다. 현재 `manualAssetStore.ts`에는 import가 없으므로 추가해야 한다.

- [ ] **Step 3: index.ts에 createSupabaseManualAssetStore export 추가**

```typescript
// src/entities/portfolio/index.ts 에 추가:
export { createSupabaseManualAssetStore } from './api/supabaseManualAssetStore';
```

- [ ] **Step 4: typecheck 통과 확인**

  ```bash
  pnpm typecheck
  ```

---

## Task 5: 테스트 작성

**Files:**
- Create: `src/entities/portfolio/api/supabaseTargetAllocationStore.test.ts`
- Create: `src/entities/portfolio/api/supabaseManualAssetStore.test.ts`
- Modify: `src/entities/portfolio/api/targetAllocationStore.test.ts` (없으면 신규)

테스트 정책(`project-rules_testing-policy.mdc`): store/api는 순수 함수 단위 테스트 대상이다. Supabase client는 `vi.mock`이 아닌 **mock 객체(stub)**로 주입한다 (HTTP 모킹 금지 조항은 MSW 적용 대상인 실제 네트워크 훅에 해당, 어댑터 단위 테스트는 client stub 허용).

- [ ] **Step 1: supabaseTargetAllocationStore.test.ts 작성**

```typescript
// src/entities/portfolio/api/supabaseTargetAllocationStore.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createSupabaseTargetAllocationStore, MOCK_SUPABASE_USER_ID } from './supabaseTargetAllocationStore';
import type { TargetAllocation } from '../model/types';
import { MOCK_TARGET_ALLOCATION } from '../model/mockPortfolio';

const mockAllocation: TargetAllocation = { equity: 60, bond: 30, 'cash-and-alternative': 10 };

const makeClient = (overrides: object = {}): SupabaseClient => {
  const base = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn(),
    upsert: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    single: vi.fn(),
    ...overrides,
  };
  return base as unknown as SupabaseClient;
};

describe('createSupabaseTargetAllocationStore', () => {
  describe('read', () => {
    it('레코드 없으면 MOCK_TARGET_ALLOCATION 기본값 반환', async () => {
      const client = makeClient();
      (client.from('target_allocations').select('*').eq('user_id', MOCK_SUPABASE_USER_ID).maybeSingle as ReturnType<typeof vi.fn>)
        .mockResolvedValue({ data: null, error: null });

      const store = createSupabaseTargetAllocationStore(client);
      const result = await store.read();

      expect(result).toEqual(MOCK_TARGET_ALLOCATION);
    });

    it('레코드 있으면 DB row를 entity로 변환', async () => {
      const client = makeClient();
      (client.from('target_allocations').select('*').eq('user_id', MOCK_SUPABASE_USER_ID).maybeSingle as ReturnType<typeof vi.fn>)
        .mockResolvedValue({
          data: {
            id: 'uuid-1',
            user_id: MOCK_SUPABASE_USER_ID,
            equity: 60,
            bond: 30,
            cash_and_alternative: 10,
          },
          error: null,
        });

      const store = createSupabaseTargetAllocationStore(client);
      const result = await store.read();

      expect(result).toEqual(mockAllocation);
    });

    it('Supabase 에러 시 Error throw', async () => {
      const client = makeClient();
      (client.from('target_allocations').select('*').eq('user_id', MOCK_SUPABASE_USER_ID).maybeSingle as ReturnType<typeof vi.fn>)
        .mockResolvedValue({ data: null, error: { message: 'network error' } });

      const store = createSupabaseTargetAllocationStore(client);

      await expect(store.read()).rejects.toThrow('target_allocations read failed');
    });
  });

  describe('save', () => {
    it('upsert 후 저장된 entity 반환', async () => {
      const client = makeClient();
      (client.from('target_allocations').upsert({}, { onConflict: 'user_id' }).select().single as ReturnType<typeof vi.fn>)
        .mockResolvedValue({
          data: {
            id: 'uuid-1',
            user_id: MOCK_SUPABASE_USER_ID,
            equity: 60,
            bond: 30,
            cash_and_alternative: 10,
          },
          error: null,
        });

      const store = createSupabaseTargetAllocationStore(client);
      const result = await store.save(mockAllocation);

      expect(result).toEqual(mockAllocation);
    });

    it('Supabase 에러 시 Error throw', async () => {
      const client = makeClient();
      (client.from('target_allocations').upsert({}, { onConflict: 'user_id' }).select().single as ReturnType<typeof vi.fn>)
        .mockResolvedValue({ data: null, error: { message: 'conflict error' } });

      const store = createSupabaseTargetAllocationStore(client);

      await expect(store.save(mockAllocation)).rejects.toThrow('target_allocations save failed');
    });
  });
});
```

  **주의:** 위 테스트의 mock chain 구조는 실제 Supabase query builder 체이닝 특성 때문에 각 chain 단계의 mock을 동일 객체가 반환하도록 설계해야 한다. `makeClient`를 `vi.fn().mockReturnThis()` 패턴으로 작성하면 각 단계가 동일 mock 객체를 반환하므로 최종 `.maybeSingle()` / `.single()`의 resolved 값만 지정하면 된다.

  실제 구현 시 chain depth에 맞게 조정이 필요할 수 있다. 테스트를 먼저 실행해 실패 메시지를 확인 후 보정한다.

- [ ] **Step 2: supabaseManualAssetStore.test.ts 작성**

```typescript
// src/entities/portfolio/api/supabaseManualAssetStore.test.ts
import { describe, it, expect, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createSupabaseManualAssetStore } from './supabaseManualAssetStore';
import { MOCK_SUPABASE_USER_ID } from './supabaseTargetAllocationStore';
import type { ManualAsset, ManualAssetPayload } from '../model/types';

const payload: ManualAssetPayload = { ticker: 'AAPL', name: 'Apple Inc', quantity: 10, avgPrice: 150 };
const asset: ManualAsset = { id: 'uuid-asset-1', ...payload };
const dbRow = {
  id: 'uuid-asset-1',
  user_id: MOCK_SUPABASE_USER_ID,
  ticker: 'AAPL',
  name: 'Apple Inc',
  quantity: 10,
  avg_price: 150,
};

const makeClient = (): SupabaseClient => {
  const base = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn(),
  };
  return base as unknown as SupabaseClient;
};

describe('createSupabaseManualAssetStore', () => {
  describe('read', () => {
    it('DB 행을 ManualAsset 배열로 변환 (avgPrice snake_case → camelCase)', async () => {
      const client = makeClient();
      // order() 이후 resolve
      vi.spyOn(client as unknown as { from: () => object }, 'from').mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [dbRow], error: null }),
      } as unknown as ReturnType<SupabaseClient['from']>);

      const store = createSupabaseManualAssetStore(client);
      const result = await store.read();

      expect(result).toEqual([asset]);
    });

    it('Supabase 에러 시 Error throw', async () => {
      const client = makeClient();
      vi.spyOn(client as unknown as { from: () => object }, 'from').mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: { message: 'db error' } }),
      } as unknown as ReturnType<SupabaseClient['from']>);

      const store = createSupabaseManualAssetStore(client);

      await expect(store.read()).rejects.toThrow('manual_assets read failed');
    });
  });

  describe('create', () => {
    it('payload를 DB에 insert하고 ManualAsset 반환 (avg_price → avgPrice)', async () => {
      const client = makeClient();
      vi.spyOn(client as unknown as { from: () => object }, 'from').mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: dbRow, error: null }),
      } as unknown as ReturnType<SupabaseClient['from']>);

      const store = createSupabaseManualAssetStore(client);
      const result = await store.create(payload);

      expect(result).toEqual(asset);
    });

    it('Supabase 에러 시 Error throw', async () => {
      const client = makeClient();
      vi.spyOn(client as unknown as { from: () => object }, 'from').mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'insert failed' } }),
      } as unknown as ReturnType<SupabaseClient['from']>);

      const store = createSupabaseManualAssetStore(client);

      await expect(store.create(payload)).rejects.toThrow('manual_assets create failed');
    });
  });

  describe('update', () => {
    it('id와 user_id로 필터 후 업데이트된 ManualAsset 반환', async () => {
      const client = makeClient();
      vi.spyOn(client as unknown as { from: () => object }, 'from').mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: dbRow, error: null }),
      } as unknown as ReturnType<SupabaseClient['from']>);

      const store = createSupabaseManualAssetStore(client);
      const result = await store.update('uuid-asset-1', payload);

      expect(result).toEqual(asset);
    });

    it('Supabase 에러 시 Error throw', async () => {
      const client = makeClient();
      vi.spyOn(client as unknown as { from: () => object }, 'from').mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: { message: 'update failed' } }),
      } as unknown as ReturnType<SupabaseClient['from']>);

      const store = createSupabaseManualAssetStore(client);

      await expect(store.update('uuid-asset-1', payload)).rejects.toThrow('manual_assets update failed');
    });
  });

  describe('delete', () => {
    it('에러 없으면 void 반환', async () => {
      const client = makeClient();
      vi.spyOn(client as unknown as { from: () => object }, 'from').mockReturnValue({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null }),
      } as unknown as ReturnType<SupabaseClient['from']>);

      const store = createSupabaseManualAssetStore(client);

      await expect(store.delete('uuid-asset-1')).resolves.toBeUndefined();
    });

    it('Supabase 에러 시 Error throw', async () => {
      const client = makeClient();
      vi.spyOn(client as unknown as { from: () => object }, 'from').mockReturnValue({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: { message: 'delete failed' } }),
      } as unknown as ReturnType<SupabaseClient['from']>);

      const store = createSupabaseManualAssetStore(client);

      await expect(store.delete('uuid-asset-1')).rejects.toThrow('manual_assets delete failed');
    });
  });
});
```

- [ ] **Step 3: env 미설정 fallback 테스트 (targetAllocationStore.test.ts)**

  환경변수가 없으면 `resolveDefaultStore()`가 in-memory를 반환하는지 확인한다.

```typescript
// src/entities/portfolio/api/targetAllocationStore.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MOCK_TARGET_ALLOCATION } from '../model/mockPortfolio';

describe('targetAllocationStore — env fallback', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('Supabase env 미설정 시 in-memory store로 read/save 동작', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');

    const { resetTargetAllocationStore, getTargetAllocationStore } = await import('./targetAllocationStore');
    resetTargetAllocationStore();
    const store = getTargetAllocationStore();

    const initial = await store.read();
    expect(initial).toEqual(MOCK_TARGET_ALLOCATION);

    const saved = await store.save({ equity: 50, bond: 40, 'cash-and-alternative': 10 });
    expect(saved).toEqual({ equity: 50, bond: 40, 'cash-and-alternative': 10 });

    const after = await store.read();
    expect(after).toEqual({ equity: 50, bond: 40, 'cash-and-alternative': 10 });
  });
});
```

- [ ] **Step 4: 테스트 실행 및 통과 확인**

  ```bash
  pnpm test --run src/entities/portfolio/api/
  ```
  Expected: 모든 테스트 PASS. 실패 시 에러 메시지를 보고 mock chain 구조를 보정한다.

---

## Task 6: 필수 검증 5종

- [ ] **Step 1: 전체 테스트 실행**

  ```bash
  pnpm test
  ```
  Expected: 기존 193개 + 신규 테스트 PASS. 0 failures.

- [ ] **Step 2: lint**

  ```bash
  pnpm lint
  ```
  Expected: 0 errors, 0 warnings

- [ ] **Step 3: typecheck**

  ```bash
  pnpm typecheck
  ```
  Expected: 0 errors

- [ ] **Step 4: build**

  ```bash
  pnpm build
  ```
  Expected: build 성공

- [ ] **Step 5: whitespace 확인**

  ```bash
  git diff --check
  ```
  Expected: 출력 없음

---

## Task 7: 문서 업데이트

**Files:**
- Modify: `docs/WORK_LOG.md`
- Modify: `docs/SESSION_STATE.md`
- Modify: `docs/NEXT_TASK_DRAFT.md` (필요 시)

- [ ] **Step 1: WORK_LOG.md에 Unit 22 섹션 추가**

  아래 내용을 `WORK_LOG.md` 최상단에 추가한다:

  ```markdown
  ---

  ## Unit 22 — Supabase Persistence 연결

  - 작업 일자: 2026-06-04
  - 작업 브랜치: main

  ### 생성된 Migration

  - 파일: `supabase/migrations/<timestamp>_create_portfolio_persistence_tables.sql`
  - 적용 방법: Supabase MCP `apply_migration`

  ### 적용된 테이블 / Schema

  | 테이블 | 컬럼 | 비고 |
  |--------|------|------|
  | `target_allocations` | id, user_id, equity, bond, cash_and_alternative, created_at, updated_at | user_id unique index |
  | `manual_assets` | id, user_id, ticker, name, quantity, avg_price, created_at, updated_at | |

  ### RLS 정책

  | 테이블 | MVP 정책 | 운영 전환 정책 |
  |--------|----------|----------------|
  | `target_allocations` | `mvp_anon_all_target_allocations` — anon 전체 허용 | `auth.uid() = user_id` 기반 authenticated 정책으로 교체 |
  | `manual_assets` | `mvp_anon_all_manual_assets` — anon 전체 허용 | `auth.uid() = user_id` 기반 authenticated 정책으로 교체 |

  MVP 단계에서 anon 접근을 허용한 이유: 실제 Supabase Auth/OAuth 연동 전이므로 mock user_id 기반 persistence가 동작해야 함. 운영 전환 시 MVP 정책을 삭제하고 운영 정책을 생성한다.

  ### 검증 결과

  | 명령 | 결과 |
  | --- | --- |
  | `pnpm test` | ✅ PASS (N tests, M files, 0 failures) |
  | `pnpm lint` | ✅ PASS |
  | `pnpm typecheck` | ✅ PASS |
  | `pnpm build` | ✅ PASS |
  | `git diff --check` | ✅ PASS |
  | Supabase migration 적용 | ✅ target_allocations, manual_assets 테이블 생성 확인 |

  ### 남은 리스크

  - Auth 연동 전이므로 모든 데이터가 `MOCK_SUPABASE_USER_ID`(`00000000-0000-0000-0000-000000000001`) 기준으로 저장됨
  - 운영 전환 시 MVP RLS 정책 삭제 + auth.uid() 기반 정책 추가 필요
  - `VITE_SUPABASE_ANON_KEY`는 public client용 key이므로 노출 가능 (service_role key 사용 금지 유지)
  ```

- [ ] **Step 2: SESSION_STATE.md 갱신**

  현재 상태, 미완료 작업, Unit 22 신규/수정 파일 목록, 검증 결과, 다음 액션을 갱신한다.

---

## 자기 검증 체크리스트

### Spec 커버리지 확인

| 요구사항 | Task |
|---------|------|
| Supabase client 실제 연결 | Task 1 |
| DB migration 작성 및 적용 | Task 2 |
| `createSupabaseTargetAllocationStore` 구현 | Task 3 |
| `createSupabaseManualAssetStore` 구현 | Task 4 |
| env 미설정 fallback 유지 | Task 3·4 resolveDefaultStore |
| 기존 인터페이스 유지 | Task 3·4 (TargetAllocationStore, ManualAssetStore) |
| DB row ↔ entity mapper 분리 | Task 3·4 (rowToEntity, entityToRow) |
| Supabase 에러 → Error 변환 | Task 3·4 (에러 throw) |
| FSD public API 준수 | Task 3·4 Step 3 (index.ts export) |
| deep import 금지 | 모든 Task (`@shared` 경유) |
| 테스트: env fallback | Task 5 Step 3 |
| 테스트: TA read/save contract | Task 5 Step 1 |
| 테스트: MA read/create/update/delete contract | Task 5 Step 2 |
| 테스트: mapper 변환 정확성 | Task 5 Step 1·2 |
| 테스트: 에러 처리 | Task 5 Step 1·2 |
| RLS MVP 정책 문서화 | Task 2 Step 2, Task 7 Step 1 |
| 운영 전환 정책 문서화 | Task 2 Step 2 (SQL 주석), Task 7 Step 1 |
| WORK_LOG 갱신 | Task 7 Step 1 |
| SESSION_STATE 갱신 | Task 7 Step 2 |
| 필수 검증 5종 | Task 6 |

### 주의사항

- `any` 타입 금지 — `as unknown as SupabaseClient`는 테스트 stub 주입 패턴이므로 허용
- `VITE_SUPABASE_PUBLISHABLE_KEY`는 사용하지 않음 (env SSOT는 `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`)
- service_role key, DB password, JWT secret 코드/문서에 기록 금지
- 커밋은 만들지 않음 — GPT 리뷰 요청으로 마무리
