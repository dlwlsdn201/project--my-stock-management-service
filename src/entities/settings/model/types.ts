export type AiModelId = 'codex' | 'gemini' | 'claude';

export type ApiKeyStatus = 'unset' | 'connected' | 'error';

export interface AiSettings {
  modelId: AiModelId;
  isApiKeyConnected: boolean;
  /** 표시 전용 마스킹 값. 원문 key는 저장하지 않음. null이면 미설정 상태. */
  maskedApiKey: string | null;
}
