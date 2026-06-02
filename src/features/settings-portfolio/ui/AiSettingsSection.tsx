import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useState } from 'react';
import {
  aiSettingsAtom,
  clearApiKeyAtom,
  maskedApiKeyAtom,
  saveApiKeyAtom,
  setAiModelAtom,
} from '@entities/settings';
import type { ApiKeyStatus } from '@entities/settings';
import { Button, FieldMessage, Surface } from '@shared';
import {
  AI_MODEL_OPTIONS,
  API_KEY_ERROR_ID,
  API_KEY_MIN_LENGTH,
  API_KEY_STATUS_LABELS,
} from '../model/constants';

const inputClassName =
  'w-full rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]';

export const AiSettingsSection = () => {
  const [aiSettings] = useAtom(aiSettingsAtom);
  const maskedApiKey = useAtomValue(maskedApiKeyAtom);   // 전역 마스킹 값
  const setAiModel = useSetAtom(setAiModelAtom);
  const saveApiKey = useSetAtom(saveApiKeyAtom);
  const clearApiKey = useSetAtom(clearApiKeyAtom);

  // 로컬 UI 상태 — 현재 입력 중인 key 원문과 로컬 오류 상태만 유지
  const [keyInput, setKeyInput] = useState('');
  const [hasError, setHasError] = useState(false);

  const status: ApiKeyStatus = aiSettings.isApiKeyConnected
    ? 'connected'
    : hasError
      ? 'error'
      : 'unset';

  const handleSave = () => {
    const trimmed = keyInput.trim();
    if (trimmed.length < API_KEY_MIN_LENGTH) {
      setHasError(true);
      return;
    }
    setHasError(false);
    setKeyInput('');
    saveApiKey(trimmed); // 전역 atom에 마스킹+연결 상태 저장 (원문 미저장)
  };

  const handleEdit = () => {
    setHasError(false);
    clearApiKey();
  };

  const handleDelete = () => {
    setHasError(false);
    setKeyInput('');
    clearApiKey(); // 전역 atom에 미연결 + maskedKey null 저장
  };

  return (
    <Surface as="section" aria-label="AI 모델 및 API key 설정" className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">AI 모델 및 API key</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          진단에 사용할 AI 모델과 개인 API key를 설정합니다.
        </p>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium">AI 모델 선택</legend>
        <div className="flex flex-wrap gap-4">
          {AI_MODEL_OPTIONS.map((option) => (
            <label key={option.id} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="ai-model"
                value={option.id}
                checked={aiSettings.modelId === option.id}
                onChange={() => setAiModel(option.id)}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <label htmlFor="api-key" className="text-sm font-medium">
            API key
          </label>
          <span className="text-xs text-[hsl(var(--muted-foreground))]">
            상태:{' '}
            <span
              aria-live="polite"
              className={status === 'error' ? 'text-red-600' : undefined}
            >
              {API_KEY_STATUS_LABELS[status]}
            </span>
          </span>
        </div>

        {/* maskedApiKey가 전역에 있으면 저장된 상태 — 재마운트 후에도 복원됨 */}
        {maskedApiKey !== null ? (
          <div className="flex items-center justify-between gap-3 rounded-[var(--radius)] border border-[hsl(var(--border))] px-3 py-2">
            <span className="text-sm" aria-label="저장된 API key">
              {maskedApiKey}
            </span>
            <div className="flex shrink-0 gap-1">
              <Button type="button" variant="secondary" onClick={handleEdit}>
                수정
              </Button>
              <Button type="button" variant="ghost" onClick={handleDelete}>
                삭제
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              id="api-key"
              type="password"
              autoComplete="off"
              className={inputClassName}
              value={keyInput}
              onChange={(event) => setKeyInput(event.target.value)}
              placeholder="개인 API key를 입력하세요"
              aria-invalid={status === 'error'}
              aria-describedby={status === 'error' ? API_KEY_ERROR_ID : undefined}
            />
            <Button type="button" variant="primary" onClick={handleSave}>
              저장
            </Button>
          </div>
        )}

        {status === 'error' && (
          <FieldMessage tone="error" id={API_KEY_ERROR_ID}>
            API key는 최소 {API_KEY_MIN_LENGTH}자 이상이어야 합니다.
          </FieldMessage>
        )}
      </div>
    </Surface>
  );
};
