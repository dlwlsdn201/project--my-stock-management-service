import type { InvestmentProfile, TargetAllocation } from './types';
import { INVESTMENT_PRESET_ALLOCATIONS } from './constants';

/**
 * 투자 성향 프리셋에 해당하는 목표 비중을 반환한다.
 * @returns 자산군별 목표 비중 합계 100%의 TargetAllocation
 */
export const applyInvestmentPreset = (profile: InvestmentProfile): TargetAllocation => {
  return INVESTMENT_PRESET_ALLOCATIONS[profile];
};
