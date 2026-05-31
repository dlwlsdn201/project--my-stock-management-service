import type { AllocationGroup, InvestmentProfile } from '@entities/portfolio';
import type { AiModelId, ApiKeyStatus } from './types';

export const ALLOCATION_GROUP_LABELS: Record<AllocationGroup, string> = {
  equity: '주식',
  bond: '채권',
  'cash-and-alternative': '현금 및 기타',
};

export const INVESTMENT_PROFILE_LABELS: Record<InvestmentProfile, string> = {
  aggressive: '공격형',
  balanced: '중립형',
  defensive: '방어형',
};

export const INVESTMENT_PROFILE_ORDER: InvestmentProfile[] = [
  'aggressive',
  'balanced',
  'defensive',
];

export const AI_MODEL_OPTIONS: { id: AiModelId; label: string }[] = [
  { id: 'gpt', label: 'GPT' },
  { id: 'gemini', label: 'Gemini' },
  { id: 'claude', label: 'Claude' },
];

export const DEFAULT_AI_MODEL_ID: AiModelId = 'gpt';

export const API_KEY_STATUS_LABELS: Record<ApiKeyStatus, string> = {
  unset: '미설정',
  connected: '연동됨',
  error: '오류',
};

export const API_KEY_MIN_LENGTH = 8;

export const API_KEY_VISIBLE_SUFFIX_COUNT = 4;
