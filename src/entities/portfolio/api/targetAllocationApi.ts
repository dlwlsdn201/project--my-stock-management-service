import type { TargetAllocation } from '../model/types';
import { getTargetAllocationStore } from './targetAllocationStore';

// [1단계] 순수 fetcher: 활성 persistence 어댑터에 위임한다.
export const readTargetAllocation = (): Promise<TargetAllocation> =>
  getTargetAllocationStore().read();

export const saveTargetAllocation = (next: TargetAllocation): Promise<TargetAllocation> =>
  getTargetAllocationStore().save(next);
