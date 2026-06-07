import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MOCK_TARGET_ALLOCATION } from '../model/mockPortfolio';
import type { TargetAllocation } from '../model/types';
import {
  createInMemoryTargetAllocationStore,
  getTargetAllocationStore,
  resetTargetAllocationStore,
} from './targetAllocationStore';

const SAMPLE: TargetAllocation = { equity: 80, bond: 10, 'cash-and-alternative': 10 };

afterEach(() => resetTargetAllocationStore());

describe('createInMemoryTargetAllocationStore', () => {
  it('저장한 값을 이후 조회에서 그대로 반환한다', async () => {
    const store = createInMemoryTargetAllocationStore();

    const saved = await store.save(SAMPLE);
    const read = await store.read();

    expect(saved).toEqual(SAMPLE);
    expect(read).toEqual(SAMPLE);
  });

  it('seed 기본값으로 초기 조회 결과를 제공한다', async () => {
    const store = createInMemoryTargetAllocationStore();
    await expect(store.read()).resolves.toEqual(MOCK_TARGET_ALLOCATION);
  });
});

describe('getTargetAllocationStore — Supabase 미설정 fallback', () => {
  it('기본(미설정 fallback) 스토어가 seed 목표 비중을 조회한다', async () => {
    // 환경변수 상태에 의존하지 않고, 기본 어댑터(미설정 시 in-memory fallback)의 동작만 검증한다.
    await expect(getTargetAllocationStore().read()).resolves.toEqual(MOCK_TARGET_ALLOCATION);
  });
});

describe('targetAllocationStore — env fallback (dynamic import)', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('Supabase env 미설정 시 in-memory store로 read/save 동작', async () => {
    vi.stubEnv('VITE_SUPABASE_URL', '');
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '');

    const { resetTargetAllocationStore: reset, getTargetAllocationStore: getStore } = await import(
      './targetAllocationStore'
    );
    reset();
    const store = getStore();

    const initial = await store.read();
    expect(initial).toEqual(MOCK_TARGET_ALLOCATION);

    const saved = await store.save({ equity: 50, bond: 40, 'cash-and-alternative': 10 });
    expect(saved).toEqual({ equity: 50, bond: 40, 'cash-and-alternative': 10 });

    const after = await store.read();
    expect(after).toEqual({ equity: 50, bond: 40, 'cash-and-alternative': 10 });
  });
});
