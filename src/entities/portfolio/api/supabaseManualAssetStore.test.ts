import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';
import type { ManualAssetPayload } from '../model/types';
import { createSupabaseManualAssetStore } from './supabaseManualAssetStore';

const TEST_USER_ID = 'test-user-id';

/**
 * Supabase query builder 체이닝 stub.
 * - 일반 메서드: 자기 자신 반환
 * - terminal 메서드(single): Promise resolve
 * - order: 배열 data를 직접 resolve하므로 별도 override 필요
 */
const makeMockChain = (resolvedValue: { data: unknown; error: unknown }) => {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  const methods = ['select', 'eq', 'maybeSingle', 'single', 'upsert', 'insert', 'update', 'delete', 'order'];

  methods.forEach((m) => {
    chain[m] = vi.fn().mockReturnValue(chain);
  });

  // terminal 메서드
  chain.single.mockResolvedValue(resolvedValue);
  chain.order.mockResolvedValue(resolvedValue);

  return chain;
};

const makeClient = (chain: Record<string, ReturnType<typeof vi.fn>>) =>
  ({
    from: vi.fn().mockReturnValue(chain),
  }) as unknown as SupabaseClient;

describe('createSupabaseManualAssetStore — read', () => {
  it('DB 행을 ManualAsset 배열로 변환한다 (avg_price → avgPrice, Number 변환 확인)', async () => {
    const rows = [
      { id: 'asset-1', user_id: TEST_USER_ID, ticker: 'AAPL', name: 'Apple', quantity: '10', avg_price: '150.5' },
      { id: 'asset-2', user_id: TEST_USER_ID, ticker: 'TSLA', name: 'Tesla', quantity: '5', avg_price: '200.0' },
    ];
    const chain = makeMockChain({ data: rows, error: null });
    const store = createSupabaseManualAssetStore(makeClient(chain), TEST_USER_ID);

    const result = await store.read();

    expect(result).toEqual([
      { id: 'asset-1', ticker: 'AAPL', name: 'Apple', quantity: 10, avgPrice: 150.5 },
      { id: 'asset-2', ticker: 'TSLA', name: 'Tesla', quantity: 5, avgPrice: 200 },
    ]);
    // Number() 변환 확인
    expect(typeof result[0].quantity).toBe('number');
    expect(typeof result[0].avgPrice).toBe('number');
  });

  it('Supabase error 시 "manual_assets read failed"가 포함된 Error를 throw한다', async () => {
    const chain = makeMockChain({ data: null, error: { message: 'permission denied' } });
    const store = createSupabaseManualAssetStore(makeClient(chain), TEST_USER_ID);

    await expect(store.read()).rejects.toThrow('manual_assets read failed');
  });
});

describe('createSupabaseManualAssetStore — create', () => {
  const payload: ManualAssetPayload = { ticker: 'AAPL', name: 'Apple', quantity: 10, avgPrice: 150 };

  it('insert 성공 시 ManualAsset entity를 반환한다', async () => {
    const savedRow = {
      id: 'new-asset-id',
      user_id: TEST_USER_ID,
      ticker: 'AAPL',
      name: 'Apple',
      quantity: 10,
      avg_price: 150,
    };
    const chain = makeMockChain({ data: savedRow, error: null });
    const store = createSupabaseManualAssetStore(makeClient(chain), TEST_USER_ID);

    const result = await store.create(payload);

    expect(result).toEqual({ id: 'new-asset-id', ticker: 'AAPL', name: 'Apple', quantity: 10, avgPrice: 150 });
  });

  it('data가 null이면 "no data returned"가 포함된 Error를 throw한다', async () => {
    const chain = makeMockChain({ data: null, error: null });
    const store = createSupabaseManualAssetStore(makeClient(chain), TEST_USER_ID);

    await expect(store.create(payload)).rejects.toThrow('no data returned');
  });

  it('Supabase error 시 Error를 throw한다', async () => {
    const chain = makeMockChain({ data: null, error: { message: 'insert failed' } });
    const store = createSupabaseManualAssetStore(makeClient(chain), TEST_USER_ID);

    await expect(store.create(payload)).rejects.toThrow('manual_assets create failed');
  });
});

describe('createSupabaseManualAssetStore — update', () => {
  const payload: ManualAssetPayload = { ticker: 'AAPL', name: 'Apple Inc', quantity: 20, avgPrice: 160 };

  it('id와 user_id 필터 후 업데이트된 ManualAsset을 반환한다', async () => {
    const updatedRow = {
      id: 'asset-1',
      user_id: TEST_USER_ID,
      ticker: 'AAPL',
      name: 'Apple Inc',
      quantity: 20,
      avg_price: 160,
    };
    const chain = makeMockChain({ data: updatedRow, error: null });
    const client = makeClient(chain);
    const store = createSupabaseManualAssetStore(client, TEST_USER_ID);

    const result = await store.update('asset-1', payload);

    expect(result).toEqual({ id: 'asset-1', ticker: 'AAPL', name: 'Apple Inc', quantity: 20, avgPrice: 160 });
    // eq 필터가 id와 user_id 두 번 호출됨을 검증
    expect(chain.eq).toHaveBeenCalledWith('id', 'asset-1');
    expect(chain.eq).toHaveBeenCalledWith('user_id', TEST_USER_ID);
  });

  it('Supabase error 시 Error를 throw한다', async () => {
    const chain = makeMockChain({ data: null, error: { message: 'update failed' } });
    const store = createSupabaseManualAssetStore(makeClient(chain), TEST_USER_ID);

    await expect(store.update('asset-1', payload)).rejects.toThrow('manual_assets update failed');
  });
});

describe('createSupabaseManualAssetStore — delete', () => {
  it('error 없으면 void를 반환한다 (Promise resolve)', async () => {
    // delete는 terminal 없이 eq 체인으로 끝남 → order가 아닌 별도 처리 필요
    const chain: Record<string, ReturnType<typeof vi.fn>> = {};
    const methods = ['select', 'eq', 'single', 'upsert', 'insert', 'update', 'order'];
    methods.forEach((m) => {
      chain[m] = vi.fn().mockReturnValue(chain);
    });
    // delete().eq().eq() 패턴: 마지막 eq가 { data, error } Promise를 resolve
    chain.delete = vi.fn().mockReturnValue(chain);
    chain.eq = vi.fn().mockReturnValue(chain);
    // 마지막 eq 호출이 Promise처럼 동작하도록: then을 직접 주입
    const thenableChain: Record<string, unknown> = {
      ...chain,
      eq: vi.fn().mockImplementation((_col: string, _val: string) => ({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      })),
    };
    thenableChain.delete = vi.fn().mockReturnValue(thenableChain);

    const client = {
      from: vi.fn().mockReturnValue(thenableChain),
    } as unknown as SupabaseClient;

    const store = createSupabaseManualAssetStore(client, TEST_USER_ID);
    await expect(store.delete('asset-1')).resolves.toBeUndefined();
  });

  it('Supabase error 시 Error를 throw한다', async () => {
    const thenableChain: Record<string, unknown> = {
      eq: vi.fn().mockImplementation((_col: string, _val: string) => ({
        eq: vi.fn().mockResolvedValue({ data: null, error: { message: 'delete failed' } }),
      })),
    };
    thenableChain.delete = vi.fn().mockReturnValue(thenableChain);

    const client = {
      from: vi.fn().mockReturnValue(thenableChain),
    } as unknown as SupabaseClient;

    const store = createSupabaseManualAssetStore(client, TEST_USER_ID);
    await expect(store.delete('asset-1')).rejects.toThrow('manual_assets delete failed');
  });
});
