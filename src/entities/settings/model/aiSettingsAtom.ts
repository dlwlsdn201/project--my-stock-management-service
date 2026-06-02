import { atom } from 'jotai';
import { API_KEY_VISIBLE_SUFFIX_COUNT } from './constants';
import type { AiModelId, AiSettings } from './types';

const maskKey = (key: string): string => {
  const suffix = key.slice(-API_KEY_VISIBLE_SUFFIX_COUNT);
  const maskedLength = Math.max(key.length - API_KEY_VISIBLE_SUFFIX_COUNT, API_KEY_VISIBLE_SUFFIX_COUNT);
  return `${'•'.repeat(maskedLength)}${suffix}`;
};

const DEFAULT_AI_SETTINGS: AiSettings = {
  modelId: 'gpt',
  isApiKeyConnected: false,
  maskedApiKey: null,
};

/** 앱 전역 AI 설정 상태 (메모리 전용 — API key 원문 미저장) */
export const aiSettingsAtom = atom<AiSettings>(DEFAULT_AI_SETTINGS);

/** 파생: API key 연결 여부 */
export const isApiKeyConnectedAtom = atom((get) => get(aiSettingsAtom).isApiKeyConnected);

/** 파생: 표시 전용 마스킹 값 (null이면 미설정) */
export const maskedApiKeyAtom = atom((get) => get(aiSettingsAtom).maskedApiKey);

/** AI 모델 선택 변경 액션 */
export const setAiModelAtom = atom(null, (_get, set, modelId: AiModelId) => {
  set(aiSettingsAtom, (prev) => ({ ...prev, modelId }));
});

/** API key 저장 액션 — 마스킹 값을 전역에 기록하고 연결 상태로 전환 (key 원문은 저장하지 않음) */
export const saveApiKeyAtom = atom(null, (_get, set, key: string) => {
  set(aiSettingsAtom, (prev) => ({
    ...prev,
    isApiKeyConnected: true,
    maskedApiKey: maskKey(key),
  }));
});

/** API key 삭제 액션 — 미연결 상태로 초기화 */
export const clearApiKeyAtom = atom(null, (_get, set) => {
  set(aiSettingsAtom, (prev) => ({ ...prev, isApiKeyConnected: false, maskedApiKey: null }));
});
