import { describe, expect, it } from 'vitest';
import { ALLOCATION_TOLERANCE_PERCENT } from '@shared';
import { MOCK_STOCK_ACTION_RECOMMENDATIONS } from './mockRecommendations';

const expectedAction = (current: number, target: number): 'buy' | 'sell' | 'hold' => {
  const gap = target - current;
  if (Math.abs(gap) <= ALLOCATION_TOLERANCE_PERCENT) return 'hold';
  return gap > 0 ? 'buy' : 'sell';
};

describe('MOCK_STOCK_ACTION_RECOMMENDATIONS', () => {
  it('각 종목의 action이 currentWeightPercent와 targetWeightPercent 차이와 일치한다', () => {
    MOCK_STOCK_ACTION_RECOMMENDATIONS.forEach(item => {
      const expected = expectedAction(item.currentWeightPercent, item.targetWeightPercent);
      expect(item.action, `${item.name}(${item.ticker})`).toBe(expected);
    });
  });

  it('삼성전자는 비중 초과(39% > 35%)이므로 sell 액션이다', () => {
    const samsung = MOCK_STOCK_ACTION_RECOMMENDATIONS.find(r => r.ticker === '005930');
    expect(samsung?.action).toBe('sell');
    expect(samsung?.currentWeightPercent).toBeGreaterThan(samsung?.targetWeightPercent ?? 0);
  });

  it('모든 종목의 현재 비중 합계가 100%에 근접한다', () => {
    const total = MOCK_STOCK_ACTION_RECOMMENDATIONS.reduce(
      (sum, r) => sum + r.currentWeightPercent,
      0,
    );
    expect(total).toBeCloseTo(100, 1);
  });
});
