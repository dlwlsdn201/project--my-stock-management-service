import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ALLOCATION_GROUP_LABELS } from '@entities/portfolio';
import {
  MOCK_REBALANCING_RECOMMENDATIONS,
  MOCK_REBALANCING_SCENARIOS,
  MOCK_STOCK_ACTION_RECOMMENDATIONS,
  REBALANCING_ACTION_LABELS,
  REBALANCING_DISCLOSURE,
} from '@entities/rebalancing';
import type {
  RebalancingRecommendationItem,
  RebalancingScenario,
  StockActionRecommendation,
} from '@entities/rebalancing';
import { DEFAULT_AI_TRIAL_COUNT } from '@entities/session';
import { Button, MetricValue, ROUTES, Surface } from '@shared';
import {
  ACTION_TONE_CLASSES,
  API_KEY_CONNECTED_NOTE,
  API_KEY_PROMPT,
  buildTrialRemainingLabel,
  PROPOSAL_REQUEST_CTA_LABEL,
  PROPOSAL_SECTION_LABELS,
  SIMULATION_PERIOD_SUFFIX,
  TRIAL_EXHAUSTED_NOTICE,
} from '../model/constants';

interface RebalancingProposalPanelProps {
  isApiKeyConnected?: boolean;
  aiTrialRemainingCount?: number;
  recommendations?: RebalancingRecommendationItem[];
  stockActions?: StockActionRecommendation[];
  scenarios?: RebalancingScenario[];
}

const formatKrw = (value: number) => `${value.toLocaleString('ko-KR')}원`;

const formatPercent = (value: number) => `${value}%`;

const formatSignedPercent = (value: number) => `${value >= 0 ? '+' : '-'}${Math.abs(value)}%`;

const CompositionCard = ({
  label,
  items,
}: {
  label: string;
  items: { group: RebalancingRecommendationItem['group']; percent: number }[];
}) => (
  <Surface as="section" aria-label={label} className="flex h-full flex-col gap-3">
    <h3 className="text-base font-semibold">{label}</h3>
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li key={item.group} className="flex items-center justify-between text-sm">
          <span>{ALLOCATION_GROUP_LABELS[item.group]}</span>
          <span className="font-medium">{formatPercent(item.percent)}</span>
        </li>
      ))}
    </ul>
  </Surface>
);

export const RebalancingProposalPanel = ({
  isApiKeyConnected = false,
  aiTrialRemainingCount = DEFAULT_AI_TRIAL_COUNT,
  recommendations = MOCK_REBALANCING_RECOMMENDATIONS,
  stockActions = MOCK_STOCK_ACTION_RECOMMENDATIONS,
  scenarios = MOCK_REBALANCING_SCENARIOS,
}: RebalancingProposalPanelProps) => {
  const [isApiKeyPromptOpen, setIsApiKeyPromptOpen] = useState(false);

  const isTrialExhausted = !isApiKeyConnected && aiTrialRemainingCount <= 0;

  const handleRequestProposal = () => {
    if (isTrialExhausted) {
      setIsApiKeyPromptOpen(true);
    }
  };

  const handleDismissPrompt = () => setIsApiKeyPromptOpen(false);

  const currentItems = recommendations.map((item) => ({
    group: item.group,
    percent: item.currentPercent,
  }));
  const recommendedItems = recommendations.map((item) => ({
    group: item.group,
    percent: item.targetPercent,
  }));

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <section aria-label="제안 비교" className="grid items-stretch gap-4 sm:grid-cols-2">
        <CompositionCard
          label={PROPOSAL_SECTION_LABELS.currentComposition}
          items={currentItems}
        />
        <CompositionCard
          label={PROPOSAL_SECTION_LABELS.recommendedComposition}
          items={recommendedItems}
        />
      </section>

      <Surface
        as="section"
        aria-label={PROPOSAL_SECTION_LABELS.rationale}
        className="flex flex-col gap-3"
      >
        <h2 className="text-lg font-semibold">{PROPOSAL_SECTION_LABELS.rationale}</h2>
        <ul className="flex flex-col gap-3">
          {stockActions.map((stock) => (
            <li key={stock.ticker} className="flex flex-col gap-1 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {stock.name} ({stock.ticker})
                </span>
                <span className={`font-semibold ${ACTION_TONE_CLASSES[stock.action]}`}>
                  {REBALANCING_ACTION_LABELS[stock.action]}
                </span>
              </div>
              <p className="text-[hsl(var(--muted-foreground))]">{stock.reasonSummary}</p>
            </li>
          ))}
        </ul>
      </Surface>

      <Surface
        as="section"
        aria-label={PROPOSAL_SECTION_LABELS.simulation}
        className="flex flex-col gap-3"
      >
        <h2 className="text-lg font-semibold">{PROPOSAL_SECTION_LABELS.simulation}</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {scenarios.map((scenario) => (
            <MetricValue
              key={scenario.periodMonths}
              label={`${scenario.periodMonths}${SIMULATION_PERIOD_SUFFIX}`}
              value={formatKrw(scenario.expectedValue)}
              description={`예상 수익 ${formatKrw(scenario.expectedReturn)} · ${formatSignedPercent(
                scenario.expectedReturnPercent,
              )}`}
            />
          ))}
        </div>
      </Surface>

      <Surface as="section" aria-label="AI 추천 요청" className="flex flex-col gap-3">
        {isApiKeyConnected ? (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">{API_KEY_CONNECTED_NOTE}</p>
        ) : (
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">{buildTrialRemainingLabel(aiTrialRemainingCount)}</span>
            {isTrialExhausted && (
              <span className="text-sm text-red-600">{TRIAL_EXHAUSTED_NOTICE}</span>
            )}
          </div>
        )}
        <div>
          <Button type="button" variant="primary" onClick={handleRequestProposal}>
            {PROPOSAL_REQUEST_CTA_LABEL}
          </Button>
        </div>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">{REBALANCING_DISCLOSURE}</p>
      </Surface>

      {isApiKeyPromptOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={API_KEY_PROMPT.dialogLabel}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        >
          <Surface className="flex w-full max-w-sm flex-col gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-semibold">{API_KEY_PROMPT.title}</h2>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {API_KEY_PROMPT.description}
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={handleDismissPrompt}>
                {API_KEY_PROMPT.dismissLabel}
              </Button>
              <Link
                to={ROUTES.SETTINGS}
                className="inline-flex items-center justify-center rounded-[var(--radius)] bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
              >
                {API_KEY_PROMPT.settingsCtaLabel}
              </Link>
            </div>
          </Surface>
        </div>
      )}
    </div>
  );
};
