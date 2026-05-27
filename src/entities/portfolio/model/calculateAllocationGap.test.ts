import { describe, expect, it } from 'vitest';
import { calculateAllocationGap } from './calculateAllocationGap';
import type { PortfolioSummary, TargetAllocation } from './types';

const makeSummary = (breakdown: PortfolioSummary['breakdown'], totalValue = 10000000): PortfolioSummary => ({
  totalValue,
  currency: 'KRW',
  breakdown,
});

describe('calculateAllocationGap', () => {
  it('목표 비중 차이가 targetPercent - currentPercent로 계산된다', () => {
    const summary = makeSummary([
      { group: 'equity', value: 6000000, percent: 60 },
      { group: 'bond', value: 2500000, percent: 25 },
      { group: 'cash-and-alternative', value: 1500000, percent: 15 },
    ]);
    const target: TargetAllocation = { equity: 70, bond: 20, 'cash-and-alternative': 10 };

    const gaps = calculateAllocationGap(summary, target);

    const equityGap = gaps.find(g => g.group === 'equity');
    expect(equityGap?.gapPercent).toBe(10);

    const bondGap = gaps.find(g => g.group === 'bond');
    expect(bondGap?.gapPercent).toBe(-5);

    const caGap = gaps.find(g => g.group === 'cash-and-alternative');
    expect(caGap?.gapPercent).toBe(-5);
  });

  it('허용 오차(0.5%p) 이내 차이는 hold 액션으로 분류된다', () => {
    const summary = makeSummary([
      { group: 'equity', value: 6000000, percent: 60 },
      { group: 'bond', value: 3030000, percent: 30.3 },
      { group: 'cash-and-alternative', value: 970000, percent: 9.7 },
    ]);
    const target: TargetAllocation = { equity: 60, bond: 30, 'cash-and-alternative': 10 };

    const gaps = calculateAllocationGap(summary, target);

    const equityGap = gaps.find(g => g.group === 'equity');
    expect(equityGap?.action).toBe('hold');

    const bondGap = gaps.find(g => g.group === 'bond');
    expect(bondGap?.action).toBe('hold');

    const caGap = gaps.find(g => g.group === 'cash-and-alternative');
    expect(caGap?.action).toBe('hold');
  });

  it('허용 오차 초과 부족 시 buy 액션으로 분류된다', () => {
    const summary = makeSummary([
      { group: 'equity', value: 5000000, percent: 50 },
      { group: 'bond', value: 4000000, percent: 40 },
      { group: 'cash-and-alternative', value: 1000000, percent: 10 },
    ]);
    const target: TargetAllocation = { equity: 70, bond: 20, 'cash-and-alternative': 10 };

    const gaps = calculateAllocationGap(summary, target);

    const equityGap = gaps.find(g => g.group === 'equity');
    expect(equityGap?.action).toBe('buy');
  });

  it('허용 오차 초과 과잉 시 sell 액션으로 분류된다', () => {
    const summary = makeSummary([
      { group: 'equity', value: 8000000, percent: 80 },
      { group: 'bond', value: 1500000, percent: 15 },
      { group: 'cash-and-alternative', value: 500000, percent: 5 },
    ]);
    const target: TargetAllocation = { equity: 60, bond: 30, 'cash-and-alternative': 10 };

    const gaps = calculateAllocationGap(summary, target);

    const equityGap = gaps.find(g => g.group === 'equity');
    expect(equityGap?.action).toBe('sell');
  });

  it('조정 금액이 totalValue * |gapPercent| / 100으로 계산된다', () => {
    const totalValue = 10000000;
    const summary = makeSummary(
      [
        { group: 'equity', value: 5000000, percent: 50 },
        { group: 'bond', value: 4000000, percent: 40 },
        { group: 'cash-and-alternative', value: 1000000, percent: 10 },
      ],
      totalValue,
    );
    const target: TargetAllocation = { equity: 60, bond: 30, 'cash-and-alternative': 10 };

    const gaps = calculateAllocationGap(summary, target);

    const equityGap = gaps.find(g => g.group === 'equity');
    expect(equityGap?.adjustmentAmount).toBeCloseTo(totalValue * 10 / 100, 0);

    const bondGap = gaps.find(g => g.group === 'bond');
    expect(bondGap?.adjustmentAmount).toBeCloseTo(totalValue * 10 / 100, 0);
  });

  it('breakdown에 없는 자산군은 currentPercent 0으로 계산된다', () => {
    const summary = makeSummary([
      { group: 'equity', value: 10000000, percent: 100 },
    ]);
    const target: TargetAllocation = { equity: 60, bond: 30, 'cash-and-alternative': 10 };

    const gaps = calculateAllocationGap(summary, target);

    const bondGap = gaps.find(g => g.group === 'bond');
    expect(bondGap?.currentPercent).toBe(0);
    expect(bondGap?.gapPercent).toBe(30);
    expect(bondGap?.action).toBe('buy');
  });
});
