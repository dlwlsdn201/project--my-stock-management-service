import {
  MOCK_REBALANCING_RECOMMENDATIONS,
  MOCK_REBALANCING_SCENARIOS,
  MOCK_STOCK_ACTION_RECOMMENDATIONS,
} from '../model/mockRecommendations';
import type {
  RebalancingRecommendationItem,
  RebalancingScenario,
  StockActionRecommendation,
} from '../model/types';

export type AiProposalErrorCode =
  | 'api_key_required'
  | 'provider_unavailable'
  | 'invalid_response'
  | 'network_error';

// provider 식별자(AiProviderId)는 ai-provider entity 책임이므로, 제안 계약은
// 표시용 라벨만 받아 도메인-중립을 유지한다. provider 선택/배선은 상위 feature가 담당한다.
export interface AiProposalRequest {
  apiKey: string | null;
  providerLabel: string;
}

export interface AiProposalResponse {
  recommendations: RebalancingRecommendationItem[];
  stockActions: StockActionRecommendation[];
  scenarios: RebalancingScenario[];
  generatedAt: string;
  source: 'mock' | 'provider';
}

export interface AiProposalFailure {
  code: AiProposalErrorCode;
  message: string;
}

export type AiProposalResult =
  | { success: true; data: AiProposalResponse }
  | { success: false; error: AiProposalFailure };

export interface AiProposalProvider {
  requestProposal: (request: AiProposalRequest) => Promise<AiProposalResult>;
}

// Unit 23A: 실제 외부 API 호출 없이 기존 mock 데이터를 async provider 경계 뒤로 이동한다.
// Unit 23B에서 이 adapter를 OpenAI Responses API 호출 구현체로 교체/확장한다.
export const mockAiProposalProvider: AiProposalProvider = {
  requestProposal: async ({ apiKey, providerLabel }) => {
    if (!apiKey) {
      return {
        success: false,
        error: {
          code: 'api_key_required',
          message: `${providerLabel} API key가 필요합니다.`,
        },
      };
    }

    return {
      success: true,
      data: {
        recommendations: MOCK_REBALANCING_RECOMMENDATIONS,
        stockActions: MOCK_STOCK_ACTION_RECOMMENDATIONS,
        scenarios: MOCK_REBALANCING_SCENARIOS,
        generatedAt: new Date().toISOString(),
        source: 'mock',
      },
    };
  },
};
