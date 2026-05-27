import type { RebalancingRecommendationItem, RebalancingScenario, StockActionRecommendation } from './types';
import { REBALANCING_DISCLOSURE } from './constants';

export const MOCK_REBALANCING_RECOMMENDATIONS: RebalancingRecommendationItem[] = [
  {
    group: 'equity',
    currentPercent: 67.5,
    targetPercent: 60,
    gapPercent: -7.5,
    action: 'sell',
    adjustmentAmount: 1500000,
    reasonCodes: ['overweight', 'risk_profile_mismatch'],
  },
  {
    group: 'bond',
    currentPercent: 27.5,
    targetPercent: 30,
    gapPercent: 2.5,
    action: 'buy',
    adjustmentAmount: 500000,
    reasonCodes: ['underweight'],
  },
  {
    group: 'cash-and-alternative',
    currentPercent: 5,
    targetPercent: 10,
    gapPercent: 5,
    action: 'buy',
    adjustmentAmount: 1000000,
    reasonCodes: ['underweight', 'market_volatility'],
  },
];

export const MOCK_STOCK_ACTION_RECOMMENDATIONS: StockActionRecommendation[] = [
  {
    ticker: '005930',
    name: '삼성전자',
    action: 'sell',
    currentWeightPercent: 39,
    targetWeightPercent: 35,
    reasonSummary: '현재 비중이 목표 대비 4%p 초과합니다. 비중 축소를 검토하세요.',
    reasonCodes: ['overweight'],
  },
  {
    ticker: '000660',
    name: 'SK하이닉스',
    action: 'sell',
    currentWeightPercent: 18,
    targetWeightPercent: 12,
    reasonSummary: '반도체 섹터 편중으로 리스크 분산이 필요합니다.',
    reasonCodes: ['overweight', 'sector_concentration'],
  },
  {
    ticker: '069500',
    name: 'KODEX 200',
    action: 'buy',
    currentWeightPercent: 10.5,
    targetWeightPercent: 13,
    reasonSummary: '인덱스 ETF 비중이 목표보다 2.5%p 낮습니다. 비중 확대를 검토하세요.',
    reasonCodes: ['underweight'],
  },
  {
    ticker: '114820',
    name: 'KODEX 국고채3년',
    action: 'buy',
    currentWeightPercent: 27.5,
    targetWeightPercent: 30,
    reasonSummary: '채권 비중을 늘려 포트폴리오 안정성을 높이세요.',
    reasonCodes: ['underweight', 'risk_profile_mismatch'],
  },
  {
    ticker: 'MMF001',
    name: 'CMA형 MMF',
    action: 'buy',
    currentWeightPercent: 5,
    targetWeightPercent: 10,
    reasonSummary: '현금성 자산 확보로 시장 변동성에 대비하세요.',
    reasonCodes: ['underweight', 'market_volatility'],
  },
];

// 연 기대 수익률 6%(balanced 프리셋) 기준, 20,000,000 KRW에 calculateExpectedValue 공식 적용 결과
export const MOCK_REBALANCING_SCENARIOS: RebalancingScenario[] = [
  {
    periodMonths: 3,
    expectedValue: 20293477,
    expectedReturn: 293477,
    expectedReturnPercent: 1.47,
  },
  {
    periodMonths: 6,
    expectedValue: 20591260,
    expectedReturn: 591260,
    expectedReturnPercent: 2.96,
  },
  {
    periodMonths: 12,
    expectedValue: 21200000,
    expectedReturn: 1200000,
    expectedReturnPercent: 6.0,
  },
];

export const MOCK_REBALANCING_DISCLOSURE = REBALANCING_DISCLOSURE;
