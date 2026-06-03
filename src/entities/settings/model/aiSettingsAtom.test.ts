import { createStore } from 'jotai';
import { beforeEach, describe, expect, it } from 'vitest';
import { AI_SETTINGS_STORAGE_KEY } from './constants';
import {
  aiSettingsAtom,
  clearApiKeyAtom,
  isApiKeyConnectedAtom,
  maskedApiKeyAtom,
  saveApiKeyAtom,
  setAiModelAtom,
} from './aiSettingsAtom';

describe('aiSettingsAtom', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

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
    expect(masked).toContain('1234'); // 끝 4자리 노출
    expect(masked).not.toContain('secret'); // 원문 미노출
    expect(masked).toContain('•'); // 마스킹 문자
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

  describe('localStorage persistence', () => {
    it('유효한 설정이 storage에 있으면 atom 초기값으로 복원한다', () => {
      window.localStorage.setItem(
        AI_SETTINGS_STORAGE_KEY,
        JSON.stringify({ modelId: 'claude', isApiKeyConnected: true, maskedApiKey: '••••1234' }),
      );
      const store = createStore();
      expect(store.get(aiSettingsAtom)).toEqual({
        modelId: 'claude',
        isApiKeyConnected: true,
        maskedApiKey: '••••1234',
      });
    });

    it('모델을 변경하면 localStorage 값도 함께 갱신한다', () => {
      const store = createStore();
      store.set(setAiModelAtom, 'gemini');
      expect(JSON.parse(window.localStorage.getItem(AI_SETTINGS_STORAGE_KEY) ?? '{}').modelId).toBe('gemini');
    });

    it('API key 저장 시 원문은 storage에 기록하지 않고 마스킹 값만 보존한다', () => {
      const store = createStore();
      store.set(saveApiKeyAtom, 'secret-key-1234');
      const persisted = window.localStorage.getItem(AI_SETTINGS_STORAGE_KEY) ?? '';
      expect(persisted).toContain('1234');
      expect(persisted).not.toContain('secret-key');
    });

    it('API key 삭제 시 미연결 메타데이터를 storage에 반영한다', () => {
      const store = createStore();
      store.set(saveApiKeyAtom, 'secret-key-1234');
      store.set(clearApiKeyAtom);
      expect(JSON.parse(window.localStorage.getItem(AI_SETTINGS_STORAGE_KEY) ?? '{}')).toEqual({
        modelId: 'gpt',
        isApiKeyConnected: false,
        maskedApiKey: null,
      });
    });

    it('잘못된 JSON은 무시하고 기본값으로 fallback한다', () => {
      window.localStorage.setItem(AI_SETTINGS_STORAGE_KEY, '{bad-json');
      const store = createStore();
      expect(store.get(aiSettingsAtom)).toEqual({ modelId: 'gpt', isApiKeyConnected: false, maskedApiKey: null });
    });

    it('지원하지 않는 modelId/shape는 기본값으로 fallback한다', () => {
      window.localStorage.setItem(AI_SETTINGS_STORAGE_KEY, JSON.stringify({ modelId: 'unknown' }));
      const store = createStore();
      expect(store.get(aiSettingsAtom)).toEqual({ modelId: 'gpt', isApiKeyConnected: false, maskedApiKey: null });
    });
  });
});
