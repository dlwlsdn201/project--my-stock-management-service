import { useState } from 'react';
import { Button, FieldMessage, Surface } from '@shared';
import {
  AI_MODEL_OPTIONS,
  API_KEY_MIN_LENGTH,
  API_KEY_STATUS_LABELS,
  API_KEY_VISIBLE_SUFFIX_COUNT,
  DEFAULT_AI_MODEL_ID,
} from '../model/constants';
import type { AiModelId, ApiKeyStatus } from '../model/types';

const maskApiKey = (key: string): string => {
  const suffix = key.slice(-API_KEY_VISIBLE_SUFFIX_COUNT);
  const maskedLength = Math.max(key.length - API_KEY_VISIBLE_SUFFIX_COUNT, API_KEY_VISIBLE_SUFFIX_COUNT);
  return `${'•'.repeat(maskedLength)}${suffix}`;
};

const inputClassName =
  'w-full rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]';

export const AiSettingsSection = () => {
  const [modelId, setModelId] = useState<AiModelId>(DEFAULT_AI_MODEL_ID);
  const [keyInput, setKeyInput] = useState('');
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const [status, setStatus] = useState<ApiKeyStatus>('unset');

  const handleSave = () => {
    const trimmed = keyInput.trim();
    if (trimmed.length < API_KEY_MIN_LENGTH) {
      setStatus('error');
      setSavedKey(null);
      return;
    }
    setSavedKey(trimmed);
    setStatus('connected');
    setKeyInput('');
  };

  const handleEdit = () => {
    setStatus('unset');
    setSavedKey(null);
  };

  const handleDelete = () => {
    setSavedKey(null);
    setStatus('unset');
    setKeyInput('');
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
                checked={modelId === option.id}
                onChange={() => setModelId(option.id)}
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

        {savedKey ? (
          <div className="flex items-center justify-between gap-3 rounded-[var(--radius)] border border-[hsl(var(--border))] px-3 py-2">
            <span className="text-sm" aria-label="저장된 API key">
              {maskApiKey(savedKey)}
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
            />
            <Button type="button" variant="primary" onClick={handleSave}>
              저장
            </Button>
          </div>
        )}

        {status === 'error' && (
          <FieldMessage tone="error">
            API key는 최소 {API_KEY_MIN_LENGTH}자 이상이어야 합니다.
          </FieldMessage>
        )}
      </div>
    </Surface>
  );
};
