import { describe, expect, it } from 'vitest';
import { calculateHoldingWeightRows } from './calculateHoldingWeightRows';
import type { HoldingAsset, HoldingTargetWeight } from './types';

const makeHolding = (overrides: Partial<HoldingAsset> & Pick<HoldingAsset, 'ticker' | 'quantity' | 'currentPrice'>): HoldingAsset => ({
  id: overrides.ticker,
  name: overrides.ticker,
  assetType: 'stock',
  currency: 'KRW',
  ...overrides,
});

describe('calculateHoldingWeightRows', () => {
  describe('현재 비중 계산', () => {
    it('quantity * currentPrice 기준으로 현재 비중을 산출한다', () => {
      const holdings: HoldingAsset[] = [
        makeHolding({ ticker: 'A', quantity: 100, currentPrice: 1000 }),
        makeHolding({ ticker: 'B', quantity: 100, currentPrice: 3000 }),
      ];
      const targets: HoldingTargetWeight[] = [
        { ticker: 'A', targetWeightPercent: 25 },
        { ticker: 'B', targetWeightPercent: 75 },
      ];

      const rows = calculateHoldingWeightRows(holdings, targets);

      expect(rows[0].currentWeightPercent).toBe(25);
      expect(rows[1].currentWeightPercent).toBe(75);
    });
  });

  describe('gap 계산', () => {
    it('gapPercent는 currentWeightPercent - targetWeightPercent 이다', () => {
      const holdings: HoldingAsset[] = [
        makeHolding({ ticker: 'A', quantity: 100, currentPrice: 1000 }),
        makeHolding({ ticker: 'B', quantity: 100, currentPrice: 3000 }),
      ];
      const targets: HoldingTargetWeight[] = [
        { ticker: 'A', targetWeightPercent: 20 },
        { ticker: 'B', targetWeightPercent: 80 },
      ];

      const rows = calculateHoldingWeightRows(holdings, targets);

      expect(rows[0].gapPercent).toBe(5);
      expect(rows[1].gapPercent).toBe(-5);
    });
  });

  describe('액션 판단', () => {
    it('현재 비중이 목표보다 허용 오차 초과 시 sell을 반환한다', () => {
      const holdings = [makeHolding({ ticker: 'A', quantity: 1, currentPrice: 100 })];
      const targets: HoldingTargetWeight[] = [{ ticker: 'A', targetWeightPercent: 90 }];

      const [row] = calculateHoldingWeightRows(holdings, targets);

      expect(row.action).toBe('sell');
      expect(row.gapPercent).toBeGreaterThan(0);
    });

    it('현재 비중이 목표보다 허용 오차 부족 시 buy를 반환한다', () => {
      const holdings = [
        makeHolding({ ticker: 'A', quantity: 1, currentPrice: 10 }),
        makeHolding({ ticker: 'B', quantity: 1, currentPrice: 90 }),
      ];
      const targets: HoldingTargetWeight[] = [
        { ticker: 'A', targetWeightPercent: 20 },
        { ticker: 'B', targetWeightPercent: 80 },
      ];

      const [rowA] = calculateHoldingWeightRows(holdings, targets);

      expect(rowA.action).toBe('buy');
      expect(rowA.gapPercent).toBeLessThan(0);
    });

    it('현재 비중이 허용 오차 이내이면 hold를 반환한다', () => {
      const holdings = [
        makeHolding({ ticker: 'A', quantity: 50, currentPrice: 1 }),
        makeHolding({ ticker: 'B', quantity: 50, currentPrice: 1 }),
      ];
      // A: 50%, B: 50%, 허용 오차(0.5) 이내
      const targets: HoldingTargetWeight[] = [
        { ticker: 'A', targetWeightPercent: 50 },
        { ticker: 'B', targetWeightPercent: 50 },
      ];

      const rows = calculateHoldingWeightRows(holdings, targets);

      expect(rows[0].action).toBe('hold');
      expect(rows[1].action).toBe('hold');
    });
  });

  describe('엣지 케이스', () => {
    it('빈 holdings이면 빈 배열을 반환한다', () => {
      const rows = calculateHoldingWeightRows([], []);
      expect(rows).toEqual([]);
    });

    it('totalValue가 0이면 빈 배열을 반환한다', () => {
      const holdings = [makeHolding({ ticker: 'A', quantity: 0, currentPrice: 1000 })];
      const rows = calculateHoldingWeightRows(holdings, []);
      expect(rows).toEqual([]);
    });

    it('targetWeight가 없는 ticker는 targetWeightPercent를 0으로 처리한다', () => {
      const holdings = [makeHolding({ ticker: 'A', quantity: 1, currentPrice: 100 })];
      const targets: HoldingTargetWeight[] = [];

      const [row] = calculateHoldingWeightRows(holdings, targets);

      expect(row.targetWeightPercent).toBe(0);
      expect(row.gapPercent).toBe(100);
      expect(row.action).toBe('sell');
    });
  });

  describe('MOCK_HOLDINGS 기반 통합 검증', () => {
    it('삼성전자는 39% 현재비중, 35% 목표비중, +4%p gap, sell을 반환한다', () => {
      const holdings: HoldingAsset[] = [
        { id: 'h1', ticker: '005930', name: '삼성전자', assetType: 'stock', quantity: 100, currentPrice: 78000, currency: 'KRW' },
        { id: 'h2', ticker: '000660', name: 'SK하이닉스', assetType: 'stock', quantity: 20, currentPrice: 180000, currency: 'KRW' },
        { id: 'h3', ticker: '069500', name: 'KODEX 200', assetType: 'etf', quantity: 50, currentPrice: 42000, currency: 'KRW' },
        { id: 'h4', ticker: '114820', name: 'KODEX 국고채3년', assetType: 'bond', quantity: 100, currentPrice: 55000, currency: 'KRW' },
        { id: 'h5', ticker: 'MMF001', name: 'CMA형 MMF', assetType: 'cash', quantity: 1, currentPrice: 1000000, currency: 'KRW' },
      ];
      const targets: HoldingTargetWeight[] = [
        { ticker: '005930', targetWeightPercent: 35 },
        { ticker: '000660', targetWeightPercent: 12 },
        { ticker: '069500', targetWeightPercent: 13 },
        { ticker: '114820', targetWeightPercent: 30 },
        { ticker: 'MMF001', targetWeightPercent: 10 },
      ];

      const rows = calculateHoldingWeightRows(holdings, targets);
      const samsung = rows.find((r) => r.ticker === '005930')!;

      expect(samsung.currentWeightPercent).toBe(39);
      expect(samsung.targetWeightPercent).toBe(35);
      expect(samsung.gapPercent).toBe(4);
      expect(samsung.action).toBe('sell');
    });
  });
});
