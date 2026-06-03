import { useState } from 'react';
import {
  ALL_ALLOCATION_GROUPS,
  applyInvestmentPreset,
  TARGET_ALLOCATION_TOTAL_PERCENT,
  useSuspenseTargetAllocation,
  useUpdateTargetAllocation,
} from '@entities/portfolio';
import type { AllocationGroup, InvestmentProfile, TargetAllocation } from '@entities/portfolio';
import { Button, FieldMessage, Surface } from '@shared';
import {
  ALLOCATION_GROUP_LABELS,
  INVESTMENT_PROFILE_LABELS,
  INVESTMENT_PROFILE_ORDER,
  TARGET_ALLOCATION_SAVE_ERROR,
  TARGET_ALLOCATION_SAVE_LABEL,
  TARGET_ALLOCATION_SAVE_SUCCESS,
  TARGET_ALLOCATION_SAVING_LABEL,
} from '../model/constants';

type SaveStatus = 'idle' | 'success' | 'error';

const inputClassName =
  'w-24 rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]';

export const TargetAllocationSection = () => {
  // 조회는 useSuspenseQuery — 로딩/에러는 상위 <ApiQueryBoundary>가 담당한다.
  const { data: persistedAllocation } = useSuspenseTargetAllocation();
  const updateMutation = useUpdateTargetAllocation();

  const [allocation, setAllocation] = useState<TargetAllocation>(persistedAllocation);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  const total =
    allocation.equity + allocation.bond + allocation['cash-and-alternative'];
  const isValid = total === TARGET_ALLOCATION_TOTAL_PERCENT;

  const handleGroupChange = (group: AllocationGroup) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = Number(event.target.value);
    setSaveStatus('idle');
    setAllocation((prev) => ({
      ...prev,
      [group]: Number.isFinite(nextValue) ? nextValue : 0,
    }));
  };

  const handleApplyPreset = (profile: InvestmentProfile) => {
    setSaveStatus('idle');
    setAllocation(applyInvestmentPreset(profile));
  };

  // 변경 호출부(features): mutateAsync로 호출하고 성공/실패 UX 피드백을 처리한다.
  const handleSave = async () => {
    if (!isValid) return;
    try {
      await updateMutation.mutateAsync(allocation);
      setSaveStatus('success');
    } catch {
      setSaveStatus('error');
    }
  };

  return (
    <Surface as="section" aria-label="목표 비중 설정" className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">목표 비중 설정</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          자산군별 목표 비중을 설정하거나 투자 성향 프리셋을 적용합니다.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {INVESTMENT_PROFILE_ORDER.map((profile) => (
          <Button
            key={profile}
            type="button"
            variant="secondary"
            onClick={() => handleApplyPreset(profile)}
          >
            {INVESTMENT_PROFILE_LABELS[profile]}
          </Button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {ALL_ALLOCATION_GROUPS.map((group) => (
          <div key={group} className="flex items-center justify-between gap-3">
            <label htmlFor={`allocation-${group}`} className="text-sm font-medium">
              {ALLOCATION_GROUP_LABELS[group]}
            </label>
            <div className="flex items-center gap-1">
              <input
                id={`allocation-${group}`}
                type="number"
                min="0"
                max="100"
                aria-label={`${ALLOCATION_GROUP_LABELS[group]} 목표 비중`}
                className={inputClassName}
                value={allocation[group]}
                onChange={handleGroupChange(group)}
              />
              <span className="text-sm text-[hsl(var(--muted-foreground))]">%</span>
            </div>
          </div>
        ))}
      </div>

      <FieldMessage tone={isValid ? 'info' : 'error'} className="font-medium">
        {isValid
          ? `합계 ${total}% — 목표 비중이 올바릅니다.`
          : `합계가 ${total}%입니다. 100%가 되도록 조정해주세요.`}
      </FieldMessage>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="primary"
          onClick={() => {
            void handleSave();
          }}
          disabled={!isValid || updateMutation.isPending}
        >
          {updateMutation.isPending ? TARGET_ALLOCATION_SAVING_LABEL : TARGET_ALLOCATION_SAVE_LABEL}
        </Button>
        {saveStatus === 'success' && (
          <FieldMessage tone="info" className="font-medium">
            {TARGET_ALLOCATION_SAVE_SUCCESS}
          </FieldMessage>
        )}
        {saveStatus === 'error' && (
          <FieldMessage tone="error">{TARGET_ALLOCATION_SAVE_ERROR}</FieldMessage>
        )}
      </div>
    </Surface>
  );
};
