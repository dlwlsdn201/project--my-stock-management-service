import { describe, expect, it } from 'vitest';
import { calculatePortfolioSummary } from './calculatePortfolioSummary';
import { MOCK_HOLDINGS, MOCK_PORTFOLIO_SUMMARY } from './mockPortfolio';
import type { HoldingAsset } from './types';

const makeHolding = (overrides: Partial<HoldingAsset> & Pick<HoldingAsset, 'id' | 'quantity' | 'currentPrice'>): HoldingAsset => ({
  ticker: 'TEST',
  name: '테스트 종목',
  assetType: 'stock',
  currency: 'KRW',
  ...overrides,
});

describe('calculatePortfolioSummary', () => {
  it('빈 holdings 입력 시 총액 0과 빈 breakdown을 반환한다', () => {
    const result = calculatePortfolioSummary([]);
    expect(result.totalValue).toBe(0);
    expect(result.breakdown).toHaveLength(0);
  });

  it('총 평가액이 quantity * currentPrice 합계로 계산된다', () => {
    const holdings: HoldingAsset[] = [
      makeHolding({ id: '1', quantity: 10, currentPrice: 70000 }),
      makeHolding({ id: '2', quantity: 5, currentPrice: 130000 }),
    ];
    const result = calculatePortfolioSummary(holdings);
    expect(result.totalValue).toBe(10 * 70000 + 5 * 130000);
  });

  it('자산군별 비중 합계가 100%에 근접한다', () => {
    const holdings: HoldingAsset[] = [
      makeHolding({ id: '1', assetType: 'stock', quantity: 100, currentPrice: 78000 }),
      makeHolding({ id: '2', assetType: 'etf', quantity: 50, currentPrice: 42000 }),
      makeHolding({ id: '3', assetType: 'bond', quantity: 100, currentPrice: 55000 }),
      makeHolding({ id: '4', assetType: 'cash', quantity: 1, currentPrice: 1000000 }),
    ];
    const result = calculatePortfolioSummary(holdings);
    const total = result.breakdown.reduce((sum, b) => sum + b.percent, 0);
    expect(total).toBeCloseTo(100, 1);
  });

  it('stock과 etf는 equity 그룹으로 집계된다', () => {
    const holdings: HoldingAsset[] = [
      makeHolding({ id: '1', assetType: 'stock', quantity: 10, currentPrice: 100 }),
      makeHolding({ id: '2', assetType: 'etf', quantity: 10, currentPrice: 100 }),
    ];
    const result = calculatePortfolioSummary(holdings);
    const equityBreakdown = result.breakdown.find(b => b.group === 'equity');
    expect(equityBreakdown?.value).toBe(2000);
    expect(equityBreakdown?.percent).toBe(100);
  });

  it('cash와 alternative는 cash-and-alternative 그룹으로 집계된다', () => {
    const holdings: HoldingAsset[] = [
      makeHolding({ id: '1', assetType: 'cash', quantity: 1, currentPrice: 300000 }),
      makeHolding({ id: '2', assetType: 'alternative', quantity: 1, currentPrice: 200000 }),
    ];
    const result = calculatePortfolioSummary(holdings);
    const caBreakdown = result.breakdown.find(b => b.group === 'cash-and-alternative');
    expect(caBreakdown?.value).toBe(500000);
    expect(caBreakdown?.percent).toBe(100);
  });

  it('MOCK_PORTFOLIO_SUMMARY가 MOCK_HOLDINGS 계산 결과와 일치한다', () => {
    const calculated = calculatePortfolioSummary(MOCK_HOLDINGS);
    expect(calculated.totalValue).toBe(MOCK_PORTFOLIO_SUMMARY.totalValue);
    expect(calculated.currency).toBe(MOCK_PORTFOLIO_SUMMARY.currency);
    MOCK_PORTFOLIO_SUMMARY.breakdown.forEach(expected => {
      const actual = calculated.breakdown.find(b => b.group === expected.group);
      expect(actual?.value).toBe(expected.value);
      expect(actual?.percent).toBeCloseTo(expected.percent, 1);
    });
  });

  it('비중은 소수점 2자리로 반올림된다', () => {
    const holdings: HoldingAsset[] = [
      makeHolding({ id: '1', assetType: 'stock', quantity: 1, currentPrice: 1 }),
      makeHolding({ id: '2', assetType: 'stock', quantity: 1, currentPrice: 2 }),
    ];
    const result = calculatePortfolioSummary(holdings);
    result.breakdown.forEach(b => {
      const decimalPart = b.percent.toString().split('.')[1] ?? '';
      expect(decimalPart.length).toBeLessThanOrEqual(2);
    });
  });
});
