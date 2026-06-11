import { createStore } from 'jotai';
import { describe, expect, it } from 'vitest';
import {
  aiApiKeySessionAtom,
  clearAiApiKeySessionAtom,
  hasAiApiKeySessionAtom,
  setAiApiKeySessionAtom,
} from './apiKeySessionAtom';

describe('aiApiKeySessionAtom', () => {
  it('keeps raw API key in memory only', () => {
    const store = createStore();

    store.set(setAiApiKeySessionAtom, 'sk-prototype-session-key');

    expect(store.get(aiApiKeySessionAtom)).toBe('sk-prototype-session-key');
    expect(store.get(hasAiApiKeySessionAtom)).toBe(true);
    expect(window.localStorage.getItem('assetflow.ai-api-key')).toBeNull();
    expect(window.sessionStorage.getItem('assetflow.ai-api-key')).toBeNull();
  });

  it('clears the in-memory API key', () => {
    const store = createStore();

    store.set(setAiApiKeySessionAtom, 'sk-prototype-session-key');
    store.set(clearAiApiKeySessionAtom);

    expect(store.get(aiApiKeySessionAtom)).toBeNull();
    expect(store.get(hasAiApiKeySessionAtom)).toBe(false);
  });
});
