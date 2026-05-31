import { AiSettingsSection } from './AiSettingsSection';
import { ManualAssetsSection } from './ManualAssetsSection';
import { TargetAllocationSection } from './TargetAllocationSection';

export const SettingsPortfolioPanel = () => (
  <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
    <ManualAssetsSection />
    <TargetAllocationSection />
    <AiSettingsSection />
  </div>
);
