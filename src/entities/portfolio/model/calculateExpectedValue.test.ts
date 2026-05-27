import { describe, expect, it } from 'vitest';
import { calculateExpectedValue } from './calculateExpectedValue';

describe('calculateExpectedValue', () => {
  it('12개월 기대 수익률이 연 수익률 복리로 계산된다', () => {
    const totalValue = 1000000;
    const annualReturnPercent = 10;

    const result = calculateExpectedValue(totalValue, annualReturnPercent, [12]);

    expect(result[0].periodMonths).toBe(12);
    expect(result[0].expectedValue).toBeCloseTo(1100000, 0);
    expect(result[0].expectedReturn).toBeCloseTo(100000, 0);
  });

  it('6개월 기대 수익률이 연 수익률의 반기 복리로 계산된다', () => {
    const totalValue = 1000000;
    const annualReturnPercent = 10;

    const result = calculateExpectedValue(totalValue, annualReturnPercent, [6]);

    const expected = totalValue * Math.pow(1.1, 0.5);
    expect(result[0].expectedValue).toBeCloseTo(expected, 0);
  });

  it('3개월 기대 수익률이 연 수익률의 분기 복리로 계산된다', () => {
    const totalValue = 1000000;
    const annualReturnPercent = 10;

    const result = calculateExpectedValue(totalValue, annualReturnPercent, [3]);

    const expected = totalValue * Math.pow(1.1, 0.25);
    expect(result[0].expectedValue).toBeCloseTo(expected, 0);
  });

  it('3개월, 6개월, 12개월 3개 결과를 순서대로 반환한다', () => {
    const result = calculateExpectedValue(1000000, 6, [3, 6, 12]);

    expect(result).toHaveLength(3);
    expect(result[0].periodMonths).toBe(3);
    expect(result[1].periodMonths).toBe(6);
    expect(result[2].periodMonths).toBe(12);
  });

  it('예상 수익이 expectedValue - totalValue로 계산된다', () => {
    const totalValue = 2000000;
    const result = calculateExpectedValue(totalValue, 6, [12]);

    expect(result[0].expectedReturn).toBeCloseTo(result[0].expectedValue - totalValue, 0);
  });

  it('기간이 길수록 예상 자산 가치가 증가한다', () => {
    const result = calculateExpectedValue(1000000, 5, [3, 6, 12]);

    expect(result[0].expectedValue).toBeLessThan(result[1].expectedValue);
    expect(result[1].expectedValue).toBeLessThan(result[2].expectedValue);
  });
});
