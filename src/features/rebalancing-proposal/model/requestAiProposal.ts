import { AI_PROVIDER_LABELS, type AiProviderId } from '@entities/ai-provider';
import {
  mockAiProposalProvider,
  type AiProposalProvider,
  type AiProposalResult,
} from '@entities/rebalancing';

// provider 식별자(ai-provider)와 도메인 제안 adapter(rebalancing)를 조합하는 상위 배선부.
// Unit 23A: 모든 provider가 mock adapter를 사용한다.
// Unit 23B에서 codex 항목을 실제 OpenAI 호환 adapter로 교체한다.
const PROVIDERS = {
  codex: mockAiProposalProvider,
  gemini: mockAiProposalProvider,
  claude: mockAiProposalProvider,
} satisfies Record<AiProviderId, AiProposalProvider>;

export interface RequestAiProposalParams {
  providerId: AiProviderId;
  apiKey: string | null;
}

export const requestAiProposal = ({
  providerId,
  apiKey,
}: RequestAiProposalParams): Promise<AiProposalResult> =>
  PROVIDERS[providerId].requestProposal({
    apiKey,
    providerLabel: AI_PROVIDER_LABELS[providerId],
  });
