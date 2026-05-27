import type { RebalancingAction, RebalancingReasonCode } from './types';

export const REBALANCING_ACTION_LABELS: Record<RebalancingAction, string> = {
  buy: '매수',
  sell: '매도',
  hold: '유지',
};

export const REBALANCING_REASON_LABELS: Record<RebalancingReasonCode, string> = {
  overweight: '비중 초과',
  underweight: '비중 부족',
  risk_profile_mismatch: '투자 성향 불일치',
  market_volatility: '시장 변동성',
  sector_concentration: '섹터 편중',
};

export const REBALANCING_DISCLOSURE =
  '이 추천은 투자 판단 보조 정보이며 수익을 보장하지 않습니다. ' +
  '투자에는 원금 손실 위험이 있으며 최종 투자 결정은 본인의 책임입니다.';
