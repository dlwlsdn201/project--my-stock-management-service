import type { HoldingAsset, PortfolioSummary, TargetAllocation } from './types';

export const MOCK_HOLDINGS: HoldingAsset[] = [
  {
    id: 'h1',
    ticker: '005930',
    name: '삼성전자',
    assetType: 'stock',
    quantity: 100,
    currentPrice: 78000,
    currency: 'KRW',
    sector: '반도체',
  },
  {
    id: 'h2',
    ticker: '000660',
    name: 'SK하이닉스',
    assetType: 'stock',
    quantity: 20,
    currentPrice: 180000,
    currency: 'KRW',
    sector: '반도체',
  },
  {
    id: 'h3',
    ticker: '069500',
    name: 'KODEX 200',
    assetType: 'etf',
    quantity: 50,
    currentPrice: 42000,
    currency: 'KRW',
    sector: '인덱스',
  },
  {
    id: 'h4',
    ticker: '114820',
    name: 'KODEX 국고채3년',
    assetType: 'bond',
    quantity: 100,
    currentPrice: 55000,
    currency: 'KRW',
    sector: '채권',
  },
  {
    id: 'h5',
    ticker: 'MMF001',
    name: 'CMA형 MMF',
    assetType: 'cash',
    quantity: 1,
    currentPrice: 1000000,
    currency: 'KRW',
    sector: '현금성',
  },
];

export const MOCK_TARGET_ALLOCATION: TargetAllocation = {
  equity: 60,
  bond: 30,
  'cash-and-alternative': 10,
};

export const MOCK_PORTFOLIO_SUMMARY: PortfolioSummary = {
  totalValue: 20000000,
  currency: 'KRW',
  breakdown: [
    { group: 'equity', value: 13500000, percent: 67.5 },
    { group: 'bond', value: 5500000, percent: 27.5 },
    { group: 'cash-and-alternative', value: 1000000, percent: 5 },
  ],
};
