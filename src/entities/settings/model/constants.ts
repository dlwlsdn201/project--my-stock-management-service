import type { AiModelId, ApiKeyStatus } from './types';

export const AI_MODEL_OPTIONS: { id: AiModelId; label: string }[] = [
  { id: 'codex', label: 'Codex' },
  { id: 'gemini', label: 'Gemini' },
  { id: 'claude', label: 'Claude' },
];

export const DEFAULT_AI_MODEL_ID: AiModelId = 'codex';

export const API_KEY_STATUS_LABELS: Record<ApiKeyStatus, string> = {
  unset: '미설정',
  connected: '연동됨',
  error: '오류',
};

export const API_KEY_MIN_LENGTH = 8;

export const API_KEY_VISIBLE_SUFFIX_COUNT = 4;

/** AI 설정 메타데이터 persistence용 localStorage key (API key 원문 미저장) */
export const AI_SETTINGS_STORAGE_KEY = 'assetflow.ai-settings';
