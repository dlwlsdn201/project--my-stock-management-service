import type { AllocationGroup, AssetType, InvestmentProfile, TargetAllocation } from './types';

// 허용 오차 정책 SSOT는 shared에 있다. 기존 @entities/portfolio 소비자 호환을 위해 re-export 한다.
export { ALLOCATION_TOLERANCE_PERCENT } from '@shared';

export const BASE_CURRENCY_CODE = 'KRW' as const;

export const TARGET_ALLOCATION_TOTAL_PERCENT = 100;

export const PERCENT_DECIMAL_PLACES = 2;

export const SIMULATION_PERIOD_MONTHS = [3, 6, 12] as const;

export const ANNUAL_EXPECTED_RETURN_BY_PROFILE: Record<InvestmentProfile, number> = {
  aggressive: 10,
  balanced: 6,
  defensive: 3,
};

export const INVESTMENT_PRESET_ALLOCATIONS: Record<InvestmentProfile, TargetAllocation> = {
  aggressive: { equity: 80, bond: 10, 'cash-and-alternative': 10 },
  balanced: { equity: 60, bond: 30, 'cash-and-alternative': 10 },
  defensive: { equity: 30, bond: 50, 'cash-and-alternative': 20 },
};

export const ASSET_TYPE_TO_ALLOCATION_GROUP: Record<AssetType, AllocationGroup> = {
  stock: 'equity',
  etf: 'equity',
  bond: 'bond',
  cash: 'cash-and-alternative',
  alternative: 'cash-and-alternative',
};

export const ALL_ALLOCATION_GROUPS: AllocationGroup[] = ['equity', 'bond', 'cash-and-alternative'];

export const ALLOCATION_GROUP_LABELS: Record<AllocationGroup, string> = {
  equity: '주식',
  bond: '채권',
  'cash-and-alternative': '현금 및 기타',
};
