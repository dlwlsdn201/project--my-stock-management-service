// AiModelId, ApiKeyStatus는 entities/settings로 승격 — 하위 호환을 위해 재노출
export type { AiModelId, ApiKeyStatus } from '@entities/settings';

export interface ManualAsset {
  id: string;
  ticker: string;
  name: string;
  quantity: number;
  avgPrice: number;
}
