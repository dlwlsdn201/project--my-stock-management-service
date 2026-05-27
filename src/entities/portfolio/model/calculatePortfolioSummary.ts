import type { AllocationBreakdown, AllocationGroup, HoldingAsset, PortfolioSummary } from './types';
import {
  ALL_ALLOCATION_GROUPS,
  ASSET_TYPE_TO_ALLOCATION_GROUP,
  BASE_CURRENCY_CODE,
  PERCENT_DECIMAL_PLACES,
} from './constants';

/**
 * 보유 자산 목록으로 포트폴리오 요약을 계산한다.
 * @returns 총 평가액, 통화, 자산군별 비중 breakdown
 */
export const calculatePortfolioSummary = (holdings: HoldingAsset[]): PortfolioSummary => {
  if (holdings.length === 0) {
    return { totalValue: 0, currency: BASE_CURRENCY_CODE, breakdown: [] };
  }

  const totalValue = holdings.reduce((sum, h) => sum + h.quantity * h.currentPrice, 0);

  const groupValues: Partial<Record<AllocationGroup, number>> = {};
  for (const holding of holdings) {
    const group = ASSET_TYPE_TO_ALLOCATION_GROUP[holding.assetType];
    groupValues[group] = (groupValues[group] ?? 0) + holding.quantity * holding.currentPrice;
  }

  const breakdown: AllocationBreakdown[] = ALL_ALLOCATION_GROUPS.filter(
    group => groupValues[group] !== undefined,
  ).map(group => ({
    group,
    value: groupValues[group] ?? 0,
    percent: parseFloat((((groupValues[group] ?? 0) / totalValue) * 100).toFixed(PERCENT_DECIMAL_PLACES)),
  }));

  return { totalValue, currency: BASE_CURRENCY_CODE, breakdown };
};
