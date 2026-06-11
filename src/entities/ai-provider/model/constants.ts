import type { AiProviderId } from './types';

export const DEFAULT_AI_PROVIDER_ID: AiProviderId = 'codex';

export const AI_PROVIDER_LABELS: Record<AiProviderId, string> = {
  codex: 'Codex',
  gemini: 'Gemini',
  claude: 'Claude',
};

export const AI_API_KEY_SESSION_POLICY_MESSAGE =
  '프로토타입에서는 API key 원문을 브라우저 메모리에만 보관하고 저장소에는 기록하지 않습니다.';
