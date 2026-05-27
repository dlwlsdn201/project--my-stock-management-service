import type { AllocationGap, AllocationGroup, PortfolioSummary, TargetAllocation } from './types';
import { ALL_ALLOCATION_GROUPS, ALLOCATION_TOLERANCE_PERCENT, PERCENT_DECIMAL_PLACES } from './constants';

/**
 * 현재 포트폴리오 요약과 목표 비중을 비교해 자산군별 리밸런싱 차이를 계산한다.
 * @returns 자산군별 현재 비중, 목표 비중, 차이, 조정 금액, 권장 액션
 */
export const calculateAllocationGap = (
  summary: PortfolioSummary,
  targetAllocation: TargetAllocation,
): AllocationGap[] => {
  return ALL_ALLOCATION_GROUPS.map(group => {
    const breakdown = summary.breakdown.find(b => b.group === group);
    const currentPercent = breakdown?.percent ?? 0;
    const targetPercent = targetAllocation[group as AllocationGroup];
    const gapPercent = parseFloat((targetPercent - currentPercent).toFixed(PERCENT_DECIMAL_PLACES));
    const adjustmentAmount = summary.totalValue * (Math.abs(gapPercent) / 100);

    let action: 'buy' | 'sell' | 'hold';
    if (Math.abs(gapPercent) <= ALLOCATION_TOLERANCE_PERCENT) {
      action = 'hold';
    } else if (gapPercent > 0) {
      action = 'buy';
    } else {
      action = 'sell';
    }

    return { group, currentPercent, targetPercent, gapPercent, adjustmentAmount, action };
  });
};
