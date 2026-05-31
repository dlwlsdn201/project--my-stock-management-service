export type {
  AllocationBreakdown,
  AllocationGap,
  AllocationGroup,
  AssetType,
  CurrencyCode,
  ExpectedValuePoint,
  HoldingAsset,
  InvestmentProfile,
  PortfolioSummary,
  TargetAllocation,
} from './model/types';

export {
  ALL_ALLOCATION_GROUPS,
  ALLOCATION_GROUP_LABELS,
  ALLOCATION_TOLERANCE_PERCENT,
  ANNUAL_EXPECTED_RETURN_BY_PROFILE,
  ASSET_TYPE_TO_ALLOCATION_GROUP,
  BASE_CURRENCY_CODE,
  INVESTMENT_PRESET_ALLOCATIONS,
  PERCENT_DECIMAL_PLACES,
  SIMULATION_PERIOD_MONTHS,
  TARGET_ALLOCATION_TOTAL_PERCENT,
} from './model/constants';

export { applyInvestmentPreset } from './model/applyInvestmentPreset';
export { calculateAllocationGap } from './model/calculateAllocationGap';
export { calculateExpectedValue } from './model/calculateExpectedValue';
export { calculatePortfolioSummary } from './model/calculatePortfolioSummary';

export {
  MOCK_HOLDINGS,
  MOCK_PORTFOLIO_SUMMARY,
  MOCK_TARGET_ALLOCATION,
} from './model/mockPortfolio';
