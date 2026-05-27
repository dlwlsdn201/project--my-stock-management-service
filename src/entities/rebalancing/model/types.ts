type AllocationGroup = 'equity' | 'bond' | 'cash-and-alternative';

export type RebalancingAction = 'buy' | 'sell' | 'hold';

export type RebalancingReasonCode =
  | 'overweight'
  | 'underweight'
  | 'risk_profile_mismatch'
  | 'market_volatility'
  | 'sector_concentration';

export interface RebalancingRecommendationItem {
  group: AllocationGroup;
  currentPercent: number;
  targetPercent: number;
  gapPercent: number;
  action: RebalancingAction;
  adjustmentAmount: number;
  reasonCodes: RebalancingReasonCode[];
}

export interface RebalancingScenario {
  periodMonths: 3 | 6 | 12;
  expectedValue: number;
  expectedReturn: number;
  expectedReturnPercent: number;
}

export interface StockActionRecommendation {
  ticker: string;
  name: string;
  action: RebalancingAction;
  currentWeightPercent: number;
  targetWeightPercent: number;
  reasonSummary: string;
  reasonCodes: RebalancingReasonCode[];
}
