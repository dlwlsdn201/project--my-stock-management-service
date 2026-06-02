export type CurrencyCode = 'KRW' | 'USD';

export type AssetType = 'stock' | 'etf' | 'bond' | 'cash' | 'alternative';

export type AllocationGroup = 'equity' | 'bond' | 'cash-and-alternative';

export type InvestmentProfile = 'aggressive' | 'balanced' | 'defensive';

export interface HoldingAsset {
  id: string;
  ticker: string;
  name: string;
  assetType: AssetType;
  quantity: number;
  currentPrice: number;
  currency: CurrencyCode;
  sector?: string;
}

export interface TargetAllocation {
  equity: number;
  bond: number;
  'cash-and-alternative': number;
}

export interface AllocationBreakdown {
  group: AllocationGroup;
  value: number;
  percent: number;
}

export interface AllocationGap {
  group: AllocationGroup;
  currentPercent: number;
  targetPercent: number;
  gapPercent: number;
  adjustmentAmount: number;
  action: 'buy' | 'sell' | 'hold';
}

export interface PortfolioSummary {
  totalValue: number;
  currency: CurrencyCode;
  breakdown: AllocationBreakdown[];
}

export interface ExpectedValuePoint {
  periodMonths: number;
  expectedValue: number;
  expectedReturn: number;
}

export interface ManualAsset {
  id: string;
  ticker: string;
  name: string;
  quantity: number;
  avgPrice: number;
}

export interface ManualAssetPayload {
  ticker: string;
  name: string;
  quantity: number;
  avgPrice: number;
}
