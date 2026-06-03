import { Link } from 'react-router-dom';
import {
  REBALANCING_ACTION_LABELS,
  REBALANCING_ACTION_TONE_CLASSES,
  REBALANCING_DISCLOSURE,
} from '@entities/rebalancing';
import { MOCK_HOLDING_WEIGHT_ROWS } from '@entities/portfolio';
import type { HoldingWeightRow } from '@entities/portfolio';
import { EmptyState, ErrorState, ROUTES, Surface } from '@shared';
import {
  EMPTY_STATE,
  ERROR_STATE_DESCRIPTION,
  GAP_DECIMAL_PLACES,
  GAP_SUFFIX,
  GAP_TONE_CLASSES,
  PANEL_HEADING,
  PORTFOLIO_TABLE_CAPTION,
  PORTFOLIO_TABLE_COLUMNS,
  REBALANCE_CTA_LABEL,
  WEIGHT_SUFFIX,
} from '../model/constants';

type PortfolioStatus = 'ready' | 'empty' | 'error';

interface PortfolioManagementPanelProps {
  status?: PortfolioStatus;
  rows?: HoldingWeightRow[];
}

const formatWeight = (value: number) => `${value}${WEIGHT_SUFFIX}`;

const formatGap = (value: number) => `${value >= 0 ? '+' : '-'}${Math.abs(value)}${GAP_SUFFIX}`;

const resolveGapTone = (gap: number) => {
  if (gap > 0) return GAP_TONE_CLASSES.over;
  if (gap < 0) return GAP_TONE_CLASSES.under;
  return GAP_TONE_CLASSES.even;
};

const columnHeaderClassName = 'py-2 pr-4 text-left font-medium';
const cellClassName = 'py-2 pr-4';

export const PortfolioManagementPanel = ({
  status = 'ready',
  rows = MOCK_HOLDING_WEIGHT_ROWS,
}: PortfolioManagementPanelProps) => {
  if (status === 'error') {
    return <ErrorState description={ERROR_STATE_DESCRIPTION} />;
  }

  if (status === 'empty' || rows.length === 0) {
    return <EmptyState title={EMPTY_STATE.title} description={EMPTY_STATE.description} />;
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <Surface as="section" aria-label={PANEL_HEADING} className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">{PANEL_HEADING}</h2>
          <Link
            to={ROUTES.REBALANCE}
            className="inline-flex items-center justify-center rounded-[var(--radius)] bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-[hsl(var(--primary-foreground))] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
          >
            {REBALANCE_CTA_LABEL}
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">{PORTFOLIO_TABLE_CAPTION}</caption>
            <thead>
              <tr className="border-b border-[hsl(var(--border))]">
                <th scope="col" className={columnHeaderClassName}>
                  {PORTFOLIO_TABLE_COLUMNS.name}
                </th>
                <th scope="col" className={columnHeaderClassName}>
                  {PORTFOLIO_TABLE_COLUMNS.currentWeight}
                </th>
                <th scope="col" className={columnHeaderClassName}>
                  {PORTFOLIO_TABLE_COLUMNS.targetWeight}
                </th>
                <th scope="col" className={columnHeaderClassName}>
                  {PORTFOLIO_TABLE_COLUMNS.gap}
                </th>
                <th scope="col" className="py-2 text-left font-medium">
                  {PORTFOLIO_TABLE_COLUMNS.action}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const gap = Number(row.gapPercent.toFixed(GAP_DECIMAL_PLACES));

                return (
                  <tr key={row.ticker} className="border-b border-[hsl(var(--border))]">
                    <td className={cellClassName}>
                      {row.name} ({row.ticker})
                    </td>
                    <td className={cellClassName}>{formatWeight(row.currentWeightPercent)}</td>
                    <td className={cellClassName}>{formatWeight(row.targetWeightPercent)}</td>
                    <td className={`${cellClassName} font-medium ${resolveGapTone(gap)}`}>
                      {formatGap(gap)}
                    </td>
                    <td className="py-2">
                      <span
                        className={`font-semibold ${REBALANCING_ACTION_TONE_CLASSES[row.action]}`}
                      >
                        {REBALANCING_ACTION_LABELS[row.action]}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-[hsl(var(--muted-foreground))]">{REBALANCING_DISCLOSURE}</p>
      </Surface>
    </div>
  );
};
