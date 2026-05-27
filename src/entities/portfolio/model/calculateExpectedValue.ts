import type { ExpectedValuePoint } from './types';

/**
 * 연 기대 수익률과 기간 목록으로 기간별 복리 예상 자산 가치를 계산한다.
 * @returns 기간별 예상 자산 가치와 예상 수익 배열
 */
export const calculateExpectedValue = (
  totalValue: number,
  annualReturnPercent: number,
  periodMonths: number[],
): ExpectedValuePoint[] => {
  return periodMonths.map(months => {
    const expectedValue = totalValue * Math.pow(1 + annualReturnPercent / 100, months / 12);
    const expectedReturn = expectedValue - totalValue;
    return { periodMonths: months, expectedValue, expectedReturn };
  });
};
