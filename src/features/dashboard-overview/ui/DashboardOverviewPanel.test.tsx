import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { HoldingAsset, PortfolioSummary } from '@entities/portfolio';
import { DashboardOverviewPanel } from './DashboardOverviewPanel';

const customHoldings: HoldingAsset[] = [
  {
    id: 'c1',
    ticker: 'AAA',
    name: '커스텀종목',
    assetType: 'stock',
    quantity: 10,
    currentPrice: 50000,
    currency: 'KRW',
  },
];

const customSummary: PortfolioSummary = {
  totalValue: 10_000_000,
  currency: 'KRW',
  breakdown: [
    { group: 'equity', value: 7_000_000, percent: 70 },
    { group: 'bond', value: 2_000_000, percent: 20 },
    { group: 'cash-and-alternative', value: 1_000_000, percent: 10 },
  ],
};

describe('DashboardOverviewPanel', () => {
  it('총 자산 가치와 전일 대비 KPI를 렌더링한다', () => {
    render(<DashboardOverviewPanel />);
    expect(screen.getByText('20,000,000원')).toBeInTheDocument();
    expect(screen.getByText(/상승/)).toBeInTheDocument();
  });

  it('자산군 비중을 렌더링한다', () => {
    render(<DashboardOverviewPanel />);
    const section = screen.getByRole('region', { name: '자산군 비중' });
    expect(within(section).getByText('주식')).toBeInTheDocument();
    expect(within(section).getByText('67.5%')).toBeInTheDocument();
    expect(within(section).getByText('채권')).toBeInTheDocument();
    expect(within(section).getByText('현금 및 기타')).toBeInTheDocument();
  });

  it('주요 보유 종목을 평가액 상위로 렌더링한다', () => {
    render(<DashboardOverviewPanel />);
    const section = screen.getByRole('region', { name: '주요 보유 종목' });
    expect(within(section).getByText(/삼성전자/)).toBeInTheDocument();
    // 평가액 하위(CMA형 MMF 1,000,000원)는 상위 3개에서 제외된다.
    expect(within(section).queryByText(/CMA형 MMF/)).not.toBeInTheDocument();
  });

  it('주입된 데이터로 전일 대비 하락 KPI를 계산해 표시한다', () => {
    render(
      <DashboardOverviewPanel
        holdings={customHoldings}
        summary={customSummary}
        previousTotalValue={11_000_000}
      />,
    );
    // 총 자산 10,000,000원, 전일 11,000,000원 → 1,000,000원 하락
    expect(screen.getByText('10,000,000원')).toBeInTheDocument();
    expect(screen.getByText(/하락/)).toBeInTheDocument();
    expect(screen.getByText(/1,000,000원/)).toBeInTheDocument();
  });

  it('빈 데이터일 때 EmptyState를 표시한다', () => {
    render(<DashboardOverviewPanel holdings={[]} />);
    expect(screen.getByText('표시할 포트폴리오가 없습니다')).toBeInTheDocument();
  });

  it('에러 상태일 때 ErrorState를 표시한다', () => {
    render(<DashboardOverviewPanel status="error" />);
    expect(screen.getByRole('alert')).toHaveTextContent('불러오지 못했습니다');
  });
});
