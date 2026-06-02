import { createStore } from 'jotai';
import { describe, expect, it } from 'vitest';
import {
  aiSettingsAtom,
  clearApiKeyAtom,
  isApiKeyConnectedAtom,
  maskedApiKeyAtom,
  saveApiKeyAtom,
  setAiModelAtom,
} from './aiSettingsAtom';

describe('aiSettingsAtom', () => {
  it('기본값은 GPT 모델, API key 미연결이다', () => {
    const store = createStore();
    const settings = store.get(aiSettingsAtom);
    expect(settings.modelId).toBe('gpt');
    expect(settings.isApiKeyConnected).toBe(false);
    expect(store.get(isApiKeyConnectedAtom)).toBe(false);
  });

  it('AI 모델을 변경하면 modelId가 갱신된다', () => {
    const store = createStore();
    store.set(setAiModelAtom, 'claude');
    expect(store.get(aiSettingsAtom).modelId).toBe('claude');
    expect(store.get(aiSettingsAtom).isApiKeyConnected).toBe(false);
  });

  it('유효한 API key 저장 시 isApiKeyConnected가 true가 된다', () => {
    const store = createStore();
    store.set(saveApiKeyAtom, 'valid-secret-key-1234');
    expect(store.get(isApiKeyConnectedAtom)).toBe(true);
    expect(store.get(aiSettingsAtom).isApiKeyConnected).toBe(true);
  });

  it('API key 삭제 시 isApiKeyConnected가 false로 돌아간다', () => {
    const store = createStore();
    store.set(saveApiKeyAtom, 'valid-secret-key-1234');
    store.set(clearApiKeyAtom);
    expect(store.get(isApiKeyConnectedAtom)).toBe(false);
  });

  it('API key 저장 시 maskedApiKey에 마스킹 값이 저장된다', () => {
    const store = createStore();
    store.set(saveApiKeyAtom, 'secret-key-1234');
    const masked = store.get(maskedApiKeyAtom);
    expect(masked).not.toBeNull();
    expect(masked).toContain('1234');      // 끝 4자리 노출
    expect(masked).not.toContain('secret'); // 원문 미노출
    expect(masked).toContain('•');          // 마스킹 문자
  });

  it('API key 삭제 시 maskedApiKey가 null로 초기화된다', () => {
    const store = createStore();
    store.set(saveApiKeyAtom, 'secret-key-1234');
    store.set(clearApiKeyAtom);
    expect(store.get(maskedApiKeyAtom)).toBeNull();
  });

  it('컴포넌트 재마운트 후에도 전역 상태에서 마스킹 값을 복원할 수 있다', () => {
    const store = createStore();
    store.set(saveApiKeyAtom, 'secret-key-1234');
    // 재마운트 시뮬레이션: 같은 store에서 읽기
    const masked = store.get(maskedApiKeyAtom);
    expect(masked).not.toBeNull();
    expect(store.get(isApiKeyConnectedAtom)).toBe(true);
  });
});
