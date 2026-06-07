import { getSupabaseClient, isSupabaseConfigured } from '@shared';
import { MOCK_TARGET_ALLOCATION } from '../model/mockPortfolio';
import type { TargetAllocation } from '../model/types';
import { createSupabaseTargetAllocationStore } from './supabaseTargetAllocationStore';

// persistence port: 목표 비중 저장소 인터페이스(어댑터 교체 지점).
export interface TargetAllocationStore {
  read: () => Promise<TargetAllocation>;
  save: (next: TargetAllocation) => Promise<TargetAllocation>;
}

// mock(in-memory) 어댑터. Supabase 미설정 환경의 fallback이자 현재 기본 persistence 경로.
export const createInMemoryTargetAllocationStore = (
  seed: TargetAllocation = MOCK_TARGET_ALLOCATION,
): TargetAllocationStore => {
  let current: TargetAllocation = { ...seed };

  return {
    read: async () => ({ ...current }),
    save: async (next: TargetAllocation) => {
      current = { ...next };
      return { ...current };
    },
  };
};

// Supabase 설정 시 supabase 어댑터로, 미설정 시 in-memory mock으로 fallback한다.
const resolveDefaultStore = (): TargetAllocationStore => {
  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (client) return createSupabaseTargetAllocationStore(client);
  }
  return createInMemoryTargetAllocationStore();
};

let activeStore: TargetAllocationStore = resolveDefaultStore();

export const getTargetAllocationStore = (): TargetAllocationStore => activeStore;

// 어댑터 구성 지점(앱 부트스트랩/테스트에서 주입).
export const configureTargetAllocationStore = (store: TargetAllocationStore): void => {
  activeStore = store;
};

export const resetTargetAllocationStore = (): void => {
  activeStore = resolveDefaultStore();
};
