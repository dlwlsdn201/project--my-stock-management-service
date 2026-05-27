import type { BrokerageConnectionStep, BrokerageProvider } from './types';

export const BROKERAGE_PROVIDERS: BrokerageProvider[] = [
  {
    id: 'kiwoom',
    name: '키움증권',
    logoUrl: '/logos/kiwoom.png',
    supportedFeatures: ['국내주식', '해외주식', 'ETF', '채권'],
    isPopular: true,
  },
  {
    id: 'toss',
    name: '토스증권',
    logoUrl: '/logos/toss.png',
    supportedFeatures: ['국내주식', '해외주식', 'ETF'],
    isPopular: true,
  },
  {
    id: 'mirae',
    name: '미래에셋증권',
    logoUrl: '/logos/mirae.png',
    supportedFeatures: ['국내주식', '해외주식', 'ETF', '채권', '펀드'],
    isPopular: false,
  },
  {
    id: 'samsung',
    name: '삼성증권',
    logoUrl: '/logos/samsung.png',
    supportedFeatures: ['국내주식', '해외주식', 'ETF', '채권', '펀드'],
    isPopular: false,
  },
];

export const BROKERAGE_CONNECTION_STEPS: BrokerageConnectionStep[] = [
  'select',
  'auth',
  'verify',
  'complete',
];

export const SECURITY_BADGES = [
  '256비트 암호화',
  '금융위원회 등록 업체',
  '개인정보 안전 처리',
] as const;
