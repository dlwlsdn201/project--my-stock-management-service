export type {
  AllocationBreakdown,
  AllocationGap,
  AllocationGroup,
  AssetType,
  CurrencyCode,
  ExpectedValuePoint,
  HoldingAsset,
  HoldingTargetWeight,
  HoldingWeightAction,
  HoldingWeightRow,
  InvestmentProfile,
  ManualAsset,
  ManualAssetPayload,
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
export { calculateHoldingWeightRows } from './model/calculateHoldingWeightRows';
export { calculateAllocationGap } from './model/calculateAllocationGap';
export { calculateExpectedValue } from './model/calculateExpectedValue';
export { calculatePortfolioSummary } from './model/calculatePortfolioSummary';

export {
  MOCK_HOLDING_TARGET_WEIGHTS,
  MOCK_HOLDING_WEIGHT_ROWS,
  MOCK_HOLDINGS,
  MOCK_PORTFOLIO_SUMMARY,
  MOCK_TARGET_ALLOCATION,
} from './model/mockPortfolio';

export type { TargetAllocationStore } from './api/targetAllocationStore';
export {
  configureTargetAllocationStore,
  createInMemoryTargetAllocationStore,
  getTargetAllocationStore,
  resetTargetAllocationStore,
} from './api/targetAllocationStore';
export { createSupabaseTargetAllocationStore } from './api/supabaseTargetAllocationStore';
export { createSupabaseManualAssetStore } from './api/supabaseManualAssetStore';
export { MOCK_SUPABASE_USER_ID } from './api/supabaseMockUser';
export { readTargetAllocation, saveTargetAllocation } from './api/targetAllocationApi';
export {
  TARGET_ALLOCATION_QUERY_KEY,
  useSuspenseTargetAllocation,
  useUpdateTargetAllocation,
} from './hook/useTargetAllocation';

export type { ManualAssetStore } from './api/manualAssetStore';
export {
  configureManualAssetStore,
  createInMemoryManualAssetStore,
  getManualAssetStore,
  resetManualAssetStore,
} from './api/manualAssetStore';
export { createManualAsset, deleteManualAsset, readManualAssets, updateManualAsset } from './api/manualAssetApi';
export {
  MANUAL_ASSETS_QUERY_KEY,
  useCreateManualAsset,
  useDeleteManualAsset,
  useSuspenseManualAssets,
  useUpdateManualAsset,
} from './hook/useManualAssets';
