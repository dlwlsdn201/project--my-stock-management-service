import { describe, expect, it } from 'vitest';
import { applyInvestmentPreset } from './applyInvestmentPreset';
import type { InvestmentProfile, TargetAllocation } from './types';

const sumAllocation = (allocation: TargetAllocation): number =>
  allocation.equity + allocation.bond + allocation['cash-and-alternative'];

describe('applyInvestmentPreset', () => {
  it.each<InvestmentProfile>(['aggressive', 'balanced', 'defensive'])(
    '%s 프리셋의 목표 비중 합계가 100이다',
    profile => {
      const result = applyInvestmentPreset(profile);
      expect(sumAllocation(result)).toBe(100);
    },
  );

  it('공격형(aggressive) 프리셋은 equity 비중이 가장 높다', () => {
    const result = applyInvestmentPreset('aggressive');
    expect(result.equity).toBeGreaterThan(result.bond);
    expect(result.equity).toBeGreaterThan(result['cash-and-alternative']);
  });

  it('방어형(defensive) 프리셋은 bond 비중이 가장 높다', () => {
    const result = applyInvestmentPreset('defensive');
    expect(result.bond).toBeGreaterThan(result.equity);
  });

  it('중립형(balanced) 프리셋은 equity 60, bond 30, cash-and-alternative 10을 반환한다', () => {
    const result = applyInvestmentPreset('balanced');
    expect(result.equity).toBe(60);
    expect(result.bond).toBe(30);
    expect(result['cash-and-alternative']).toBe(10);
  });
});
