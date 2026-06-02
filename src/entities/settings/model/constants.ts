import type { AiModelId, ApiKeyStatus } from './types';

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
