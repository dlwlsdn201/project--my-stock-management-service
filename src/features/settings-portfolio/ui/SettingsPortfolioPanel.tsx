import { ApiErrorFallback, ApiQueryBoundary } from '@shared';
import { MANUAL_ASSET_LOAD_ERROR, TARGET_ALLOCATION_LOAD_ERROR } from '../model/constants';
import { AiSettingsSection } from './AiSettingsSection';
import { ManualAssetsSection } from './ManualAssetsSection';
import { TargetAllocationSection } from './TargetAllocationSection';

export const SettingsPortfolioPanel = () => (
  <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
    <ApiQueryBoundary
      errorFallback={(retry) => (
        <ApiErrorFallback onRetry={retry} message={MANUAL_ASSET_LOAD_ERROR} />
      )}
    >
      <ManualAssetsSection />
    </ApiQueryBoundary>
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
