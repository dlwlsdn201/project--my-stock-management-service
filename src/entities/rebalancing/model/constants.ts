import type { RebalancingAction, RebalancingReasonCode } from './types';

export const REBALANCING_ACTION_LABELS: Record<RebalancingAction, string> = {
  buy: '매수',
  sell: '매도',
  hold: '유지',
};

// 액션 색상 톤 SSOT. 색상은 항상 텍스트 라벨(REBALANCING_ACTION_LABELS)과 함께 사용한다(색상 단독 표현 금지).
export const REBALANCING_ACTION_TONE_CLASSES: Record<RebalancingAction, string> = {
  buy: 'text-blue-600',
  sell: 'text-red-600',
  hold: 'text-[hsl(var(--muted-foreground))]',
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
