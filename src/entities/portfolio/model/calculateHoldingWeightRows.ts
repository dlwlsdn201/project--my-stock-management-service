import { ALLOCATION_TOLERANCE_PERCENT, PERCENT_DECIMAL_PLACES } from './constants';
import type { HoldingAsset, HoldingTargetWeight, HoldingWeightAction, HoldingWeightRow } from './types';

const resolveHoldingWeightAction = (gapPercent: number): HoldingWeightAction => {
  if (gapPercent > ALLOCATION_TOLERANCE_PERCENT) return 'sell';
  if (gapPercent < -ALLOCATION_TOLERANCE_PERCENT) return 'buy';
  return 'hold';
};

export const calculateHoldingWeightRows = (
  holdings: HoldingAsset[],
  targetWeights: HoldingTargetWeight[],
): HoldingWeightRow[] => {
  const totalValue = holdings.reduce((sum, h) => sum + h.quantity * h.currentPrice, 0);
  if (totalValue <= 0) return [];

  const targetByTicker = new Map(targetWeights.map((t) => [t.ticker, t.targetWeightPercent]));

  return holdings.map((holding) => {
    const currentWeightPercent = Number(
      (((holding.quantity * holding.currentPrice) / totalValue) * 100).toFixed(PERCENT_DECIMAL_PLACES),
    );
    const targetWeightPercent = targetByTicker.get(holding.ticker) ?? 0;
    const gapPercent = Number((currentWeightPercent - targetWeightPercent).toFixed(PERCENT_DECIMAL_PLACES));
    const action = resolveHoldingWeightAction(gapPercent);

    return { ticker: holding.ticker, name: holding.name, currentWeightPercent, targetWeightPercent, gapPercent, action };
  });
};
