export interface ManualAsset {
  id: string;
  ticker: string;
  name: string;
  quantity: number;
  avgPrice: number;
}

export type AiModelId = 'gpt' | 'gemini' | 'claude';

export type ApiKeyStatus = 'unset' | 'connected' | 'error';
