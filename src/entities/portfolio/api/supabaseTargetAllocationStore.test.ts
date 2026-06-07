import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';
import { MOCK_TARGET_ALLOCATION } from '../model/mockPortfolio';
import { createSupabaseTargetAllocationStore } from './supabaseTargetAllocationStore';

const TEST_USER_ID = 'test-user-id';

/**
 * Supabase query builder 체이닝 stub 생성.
 * 각 메서드는 자기 자신을 반환하며, terminal 메서드(maybeSingle, single)만 Promise를 resolve한다.
 */
const makeMockChain = (resolvedValue: { data: unknown; error: unknown }) => {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {};
  const methods = ['select', 'eq', 'maybeSingle', 'single', 'upsert', 'insert', 'update', 'delete', 'order'];

  methods.forEach((m) => {
    chain[m] = vi.fn().mockReturnValue(chain);
  });

  // terminal 메서드: Promise resolve
  chain.maybeSingle.mockResolvedValue(resolvedValue);
  chain.single.mockResolvedValue(resolvedValue);

  return chain;
};

const makeClient = (chain: Record<string, ReturnType<typeof vi.fn>>) =>
  ({
    from: vi.fn().mockReturnValue(chain),
  }) as unknown as SupabaseClient;

describe('createSupabaseTargetAllocationStore — read', () => {
  it('DB row가 없으면(null) MOCK_TARGET_ALLOCATION을 반환한다', async () => {
    const chain = makeMockChain({ data: null, error: null });
    const store = createSupabaseTargetAllocationStore(makeClient(chain), TEST_USER_ID);

    const result = await store.read();

    expect(result).toEqual(MOCK_TARGET_ALLOCATION);
  });

  it('DB row가 있으면 entity로 변환하여 반환한다 (cash_and_alternative → cash-and-alternative, Number 변환)', async () => {
    const row = {
      id: 'row-1',
      user_id: TEST_USER_ID,
      equity: '60',
      bond: '30',
      cash_and_alternative: '10',
    };
    const chain = makeMockChain({ data: row, error: null });
    const store = createSupabaseTargetAllocationStore(makeClient(chain), TEST_USER_ID);

    const result = await store.read();

    expect(result).toEqual({
      equity: 60,
      bond: 30,
      'cash-and-alternative': 10,
    });
    // Number() 변환 확인: 문자열 입력 → 숫자 출력
    expect(typeof result.equity).toBe('number');
    expect(typeof result.bond).toBe('number');
    expect(typeof result['cash-and-alternative']).toBe('number');
  });

  it('Supabase error 시 "target_allocations read failed"가 포함된 Error를 throw한다', async () => {
    const chain = makeMockChain({ data: null, error: { message: 'DB connection refused' } });
    const store = createSupabaseTargetAllocationStore(makeClient(chain), TEST_USER_ID);

    await expect(store.read()).rejects.toThrow('target_allocations read failed');
  });
});

describe('createSupabaseTargetAllocationStore — save', () => {
  it('upsert 성공 시 저장된 entity를 반환한다', async () => {
    const savedRow = {
      id: 'row-1',
      user_id: TEST_USER_ID,
      equity: 50,
      bond: 40,
      cash_and_alternative: 10,
    };
    const chain = makeMockChain({ data: savedRow, error: null });
    const store = createSupabaseTargetAllocationStore(makeClient(chain), TEST_USER_ID);

    const result = await store.save({ equity: 50, bond: 40, 'cash-and-alternative': 10 });

    expect(result).toEqual({
      equity: 50,
      bond: 40,
      'cash-and-alternative': 10,
    });
  });

  it('data가 null이면 "no data returned"가 포함된 Error를 throw한다', async () => {
    const chain = makeMockChain({ data: null, error: null });
    const store = createSupabaseTargetAllocationStore(makeClient(chain), TEST_USER_ID);

    await expect(store.save({ equity: 50, bond: 40, 'cash-and-alternative': 10 })).rejects.toThrow('no data returned');
  });

  it('Supabase error 시 "target_allocations save failed"가 포함된 Error를 throw한다', async () => {
    const chain = makeMockChain({ data: null, error: { message: 'unique constraint violation' } });
    const store = createSupabaseTargetAllocationStore(makeClient(chain), TEST_USER_ID);

    await expect(store.save({ equity: 50, bond: 40, 'cash-and-alternative': 10 })).rejects.toThrow(
      'target_allocations save failed',
    );
  });
});
