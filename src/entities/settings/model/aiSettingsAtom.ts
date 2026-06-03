import { atom } from 'jotai';
import { readBrowserStorageJson, writeBrowserStorageJson } from '@shared/lib';
import { AI_SETTINGS_STORAGE_KEY, API_KEY_VISIBLE_SUFFIX_COUNT } from './constants';
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

const isAiModelId = (value: unknown): value is AiModelId =>
  value === 'gpt' || value === 'gemini' || value === 'claude';

/** 저장된 값이 AI 설정 메타데이터 shape를 만족하는지 검증한다. */
const isAiSettings = (value: unknown): value is AiSettings => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<AiSettings>;
  return (
    isAiModelId(candidate.modelId) &&
    typeof candidate.isApiKeyConnected === 'boolean' &&
    (candidate.maskedApiKey === null || typeof candidate.maskedApiKey === 'string')
  );
};

const readPersistedAiSettings = (): AiSettings =>
  readBrowserStorageJson<AiSettings>({
    key: AI_SETTINGS_STORAGE_KEY,
    storageType: 'local',
    fallback: DEFAULT_AI_SETTINGS,
    validate: isAiSettings,
  });

/** store별 첫 접근 시 localStorage에서 1회 복원하기 위한 sentinel */
const UNINITIALIZED = Symbol('ai-settings-uninitialized');

/** 내부 base atom. sentinel 동안은 storage 값을 복원하고, write 이후에는 메모리 값을 보관한다. */
const persistedAiSettingsAtom = atom<AiSettings | typeof UNINITIALIZED>(UNINITIALIZED);

/**
 * 앱 전역 AI 설정 상태 (API key 원문 미저장).
 * 초기값은 localStorage에서 복원하며, write 시 메타데이터(modelId·연결 여부·마스킹 값)만 저장한다.
 */
export const aiSettingsAtom = atom(
  (get): AiSettings => {
    const current = get(persistedAiSettingsAtom);
    return current === UNINITIALIZED ? readPersistedAiSettings() : current;
  },
  (_get, set, nextSettings: AiSettings) => {
    set(persistedAiSettingsAtom, nextSettings);
    writeBrowserStorageJson({ key: AI_SETTINGS_STORAGE_KEY, storageType: 'local', value: nextSettings });
  },
);

/** 파생: API key 연결 여부 */
export const isApiKeyConnectedAtom = atom((get) => get(aiSettingsAtom).isApiKeyConnected);

/** 파생: 표시 전용 마스킹 값 (null이면 미설정) */
export const maskedApiKeyAtom = atom((get) => get(aiSettingsAtom).maskedApiKey);

/** AI 모델 선택 변경 액션. storage에도 함께 반영한다. */
export const setAiModelAtom = atom(null, (get, set, modelId: AiModelId) => {
  set(aiSettingsAtom, { ...get(aiSettingsAtom), modelId });
});

/** API key 저장 액션 — 마스킹 값을 기록하고 연결 상태로 전환 (key 원문은 저장하지 않음) */
export const saveApiKeyAtom = atom(null, (get, set, key: string) => {
  set(aiSettingsAtom, { ...get(aiSettingsAtom), isApiKeyConnected: true, maskedApiKey: maskKey(key) });
});

/** API key 삭제 액션 — 미연결 상태로 초기화. storage에도 함께 반영한다. */
export const clearApiKeyAtom = atom(null, (get, set) => {
  set(aiSettingsAtom, { ...get(aiSettingsAtom), isApiKeyConnected: false, maskedApiKey: null });
});
