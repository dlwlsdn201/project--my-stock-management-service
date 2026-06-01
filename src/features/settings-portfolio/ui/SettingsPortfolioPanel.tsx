import { ApiErrorFallback, ApiQueryBoundary } from '@shared';
import { TARGET_ALLOCATION_LOAD_ERROR } from '../model/constants';
import { AiSettingsSection } from './AiSettingsSection';
import { ManualAssetsSection } from './ManualAssetsSection';
import { TargetAllocationSection } from './TargetAllocationSection';

export const SettingsPortfolioPanel = () => (
  <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
    <ManualAssetsSection />
    <ApiQueryBoundary
      errorFallback={(retry) => (
        <ApiErrorFallback onRetry={retry} message={TARGET_ALLOCATION_LOAD_ERROR} />
      )}
    >
      <TargetAllocationSection />
    </ApiQueryBoundary>
    <AiSettingsSection />
  </div>
);
