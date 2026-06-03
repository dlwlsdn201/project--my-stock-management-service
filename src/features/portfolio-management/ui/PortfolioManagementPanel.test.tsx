import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import type { HoldingWeightRow } from '@entities/portfolio';
import { PortfolioManagementPanel } from './PortfolioManagementPanel';

type PanelProps = Parameters<typeof PortfolioManagementPanel>[0];

const renderPanel = (props?: PanelProps) =>
  render(
    <MemoryRouter>
      <PortfolioManagementPanel {...props} />
    </MemoryRouter>,
  );

const mockRow = (overrides: Partial<HoldingWeightRow>): HoldingWeightRow => ({
  ticker: 'TEST',
  name: '테스트종목',
  currentWeightPercent: 30,
  targetWeightPercent: 30,
  gapPercent: 0,
  action: 'hold',
  ...overrides,
});

describe('PortfolioManagementPanel — 종목 테이블', () => {
  it('컬럼 헤더와 종목 행을 렌더링한다', () => {
    renderPanel();

    const table = screen.getByRole('table');
    expect(within(table).getByRole('columnheader', { name: '종목' })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: '현재 비중' })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: '목표 비중' })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: '차이' })).toBeInTheDocument();
    expect(within(table).getByRole('columnheader', { name: 'AI 액션' })).toBeInTheDocument();
    expect(within(table).getByText(/삼성전자/)).toBeInTheDocument();
  });

  it('현재/목표 비중 차이를 +/- 부호로 렌더링한다', () => {
    renderPanel();

    const table = screen.getByRole('table');
    expect(within(table).getByText('+4%p')).toBeInTheDocument();
    expect(within(table).getAllByText('-2.5%p').length).toBeGreaterThan(0);
  });

  it('AI 액션 라벨을 렌더링한다', () => {
    renderPanel();

    const table = screen.getByRole('table');
    expect(within(table).getAllByText('매도').length).toBeGreaterThan(0);
    expect(within(table).getAllByText('매수').length).toBeGreaterThan(0);
  });

  it('HoldingWeightRow[] rows prop으로 주입한 데이터를 렌더링한다', () => {
    const rows: HoldingWeightRow[] = [
      mockRow({ ticker: 'X001', name: '테스트A', currentWeightPercent: 40, targetWeightPercent: 35, gapPercent: 5, action: 'sell' }),
      mockRow({ ticker: 'X002', name: '테스트B', currentWeightPercent: 20, targetWeightPercent: 25, gapPercent: -5, action: 'buy' }),
    ];

    renderPanel({ rows });

    const table = screen.getByRole('table');
    expect(within(table).getByText(/테스트A/)).toBeInTheDocument();
    expect(within(table).getByText(/테스트B/)).toBeInTheDocument();
    expect(within(table).getByText('+5%p')).toBeInTheDocument();
    expect(within(table).getByText('-5%p')).toBeInTheDocument();
    expect(within(table).getByText('매도')).toBeInTheDocument();
    expect(within(table).getByText('매수')).toBeInTheDocument();
  });
});

describe('PortfolioManagementPanel — 상태', () => {
  it('빈 데이터일 때 EmptyState를 렌더링한다', () => {
    renderPanel({ status: 'empty' });

    expect(screen.getByText('표시할 보유 종목이 없습니다')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('에러 상태일 때 ErrorState를 렌더링한다', () => {
    renderPanel({ status: 'error' });

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('rows가 빈 배열이면 EmptyState를 렌더링한다', () => {
    renderPanel({ rows: [] });

    expect(screen.getByText('표시할 보유 종목이 없습니다')).toBeInTheDocument();
  });
});

describe('PortfolioManagementPanel — 리밸런싱 이동', () => {
  it('리밸런싱 화면으로 이동하는 CTA를 제공한다', () => {
    renderPanel();

    expect(screen.getByRole('link', { name: 'AI 리밸런싱 추천 보기' })).toHaveAttribute(
      'href',
      '/rebalance',
    );
  });
});
