import { describe, expect, it } from 'vitest';
import { AI_PROVIDER_LABELS, DEFAULT_AI_PROVIDER_ID } from '@entities/ai-provider';
import { requestAiProposal } from './requestAiProposal';

describe('ai provider contracts', () => {
  it('uses Codex as the first prototype provider', () => {
    expect(DEFAULT_AI_PROVIDER_ID).toBe('codex');
    expect(AI_PROVIDER_LABELS.codex).toBe('Codex');
  });
});

describe('requestAiProposal', () => {
  it('returns mock proposal data through the provider boundary', async () => {
    const result = await requestAiProposal({ providerId: 'codex', apiKey: 'sk-session-key' });

    expect(result.success).toBe(true);
    if (!result.success) throw new Error(result.error.message);
    expect(result.data.source).toBe('mock');
    expect(result.data.recommendations.length).toBeGreaterThan(0);
    expect(result.data.stockActions.length).toBeGreaterThan(0);
    expect(result.data.scenarios.length).toBeGreaterThan(0);
  });

  it('returns api_key_required when no key is provided', async () => {
    const result = await requestAiProposal({ providerId: 'codex', apiKey: null });

    expect(result).toEqual({
      success: false,
      error: {
        code: 'api_key_required',
        message: 'Codex API key가 필요합니다.',
      },
    });
  });

  it('api_key_required 메시지는 요청한 provider 라벨을 사용한다', async () => {
    const result = await requestAiProposal({ providerId: 'gemini', apiKey: null });

    expect(result).toEqual({
      success: false,
      error: {
        code: 'api_key_required',
        message: 'Gemini API key가 필요합니다.',
      },
    });
  });
});
