import {
  ALLOCATION_GROUP_LABELS,
  MOCK_HOLDINGS,
  MOCK_PORTFOLIO_SUMMARY,
} from '@entities/portfolio';
import type { HoldingAsset, PortfolioSummary } from '@entities/portfolio';
import { REBALANCING_DISCLOSURE } from '@entities/rebalancing';
import { EmptyState, ErrorState, MetricValue, Surface } from '@shared';
import {
  MOCK_DIAGNOSIS_SUMMARY,
  MOCK_PREVIOUS_TOTAL_VALUE,
  TOP_HOLDINGS_COUNT,
  VALUE_CHANGE_DIRECTION_CLASSES,
  VALUE_CHANGE_DIRECTION_LABELS,
  VALUE_CHANGE_DIRECTION_SYMBOLS,
} from '../model/constants';
import type { DashboardStatus, ValueChangeDirection } from '../model/types';

interface DashboardOverviewPanelProps {
  status?: DashboardStatus;
  holdings?: HoldingAsset[];
  summary?: PortfolioSummary;
  previousTotalValue?: number;
  diagnosisSummary?: string;
}

const formatKrw = (value: number) => `${value.toLocaleString('ko-KR')}원`;

const resolveDirection = (changeAmount: number): ValueChangeDirection => {
  if (changeAmount > 0) return 'up';
  if (changeAmount < 0) return 'down';
  return 'flat';
};

const getHoldingValue = (holding: HoldingAsset) => holding.quantity * holding.currentPrice;

export const DashboardOverviewPanel = ({
  status = 'ready',
  holdings = MOCK_HOLDINGS,
  summary = MOCK_PORTFOLIO_SUMMARY,
  previousTotalValue = MOCK_PREVIOUS_TOTAL_VALUE,
  diagnosisSummary = MOCK_DIAGNOSIS_SUMMARY,
}: DashboardOverviewPanelProps) => {
  if (status === 'error') {
    return (
      <ErrorState description="대시보드 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요." />
    );
  }

  if (status === 'empty' || holdings.length === 0) {
    return (
      <EmptyState
        title="표시할 포트폴리오가 없습니다"
        description="증권사 계좌를 연동하거나 자산을 추가하면 대시보드가 표시됩니다."
      />
    );
  }

  const changeAmount = summary.totalValue - previousTotalValue;
  const changeRate =
    previousTotalValue === 0 ? 0 : Number(((changeAmount / previousTotalValue) * 100).toFixed(2));
  const direction = resolveDirection(changeAmount);
  const changeSign = changeAmount >= 0 ? '+' : '-';

  const topHoldings = [...holdings]
    .sort((a, b) => getHoldingValue(b) - getHoldingValue(a))
    .slice(0, TOP_HOLDINGS_COUNT);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Surface>
          <MetricValue label="총 자산 가치" value={formatKrw(summary.totalValue)} />
        </Surface>
        <Surface>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-[hsl(var(--muted-foreground))]">전일 대비</span>
            <span className={`text-2xl font-semibold ${VALUE_CHANGE_DIRECTION_CLASSES[direction]}`}>
              <span aria-hidden="true">{VALUE_CHANGE_DIRECTION_SYMBOLS[direction]} </span>
              {formatKrw(Math.abs(changeAmount))}
            </span>
            <span className={`text-xs ${VALUE_CHANGE_DIRECTION_CLASSES[direction]}`}>
              {VALUE_CHANGE_DIRECTION_LABELS[direction]} · {changeSign}
              {Math.abs(changeRate)}%
            </span>
          </div>
        </Surface>
      </div>

      <Surface as="section" aria-label="자산군 비중" className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">자산군 비중</h2>
        <ul className="flex flex-col gap-2">
          {summary.breakdown.map((item) => (
            <li key={item.group} className="flex items-center justify-between text-sm">
              <span>{ALLOCATION_GROUP_LABELS[item.group]}</span>
              <span className="font-medium">{item.percent}%</span>
            </li>
          ))}
        </ul>
      </Surface>

      <Surface as="section" aria-label="주요 보유 종목" className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">주요 보유 종목</h2>
        <ul className="flex flex-col gap-2">
          {topHoldings.map((holding) => (
            <li key={holding.id} className="flex items-center justify-between text-sm">
              <span>
                {holding.name} ({holding.ticker})
              </span>
              <span className="font-medium">{formatKrw(getHoldingValue(holding))}</span>
            </li>
          ))}
        </ul>
      </Surface>

      <Surface as="section" aria-label="AI 포트폴리오 진단" className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">AI 포트폴리오 진단</h2>
        <p className="text-sm text-[hsl(var(--foreground))]">{diagnosisSummary}</p>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">{REBALANCING_DISCLOSURE}</p>
      </Surface>
    </div>
  );
};
