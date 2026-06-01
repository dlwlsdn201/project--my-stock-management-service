import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { RebalancingProposalPanel } from './RebalancingProposalPanel';

type PanelProps = Parameters<typeof RebalancingProposalPanel>[0];

const renderPanel = (props?: PanelProps) =>
  render(
    <MemoryRouter>
      <RebalancingProposalPanel {...props} />
    </MemoryRouter>,
  );

describe('RebalancingProposalPanel — 제안 비교', () => {
  it('현재 구성과 AI 추천 구성 비교 섹션을 렌더링한다', () => {
    renderPanel();

    const current = screen.getByRole('region', { name: '현재 자산 구성' });
    const recommended = screen.getByRole('region', { name: 'AI 추천 구성' });

    expect(within(current).getByText('주식')).toBeInTheDocument();
    expect(within(current).getByText('67.5%')).toBeInTheDocument();
    expect(within(recommended).getByText('주식')).toBeInTheDocument();
    expect(within(recommended).getByText('60%')).toBeInTheDocument();
  });
});

describe('RebalancingProposalPanel — 추천 근거', () => {
  it('종목별 액션과 사유를 렌더링한다', () => {
    renderPanel();

    const rationale = screen.getByRole('region', { name: 'AI 추천 근거' });
    expect(within(rationale).getByText(/삼성전자/)).toBeInTheDocument();
    expect(
      within(rationale).getByText('반도체 섹터 편중으로 리스크 분산이 필요합니다.'),
    ).toBeInTheDocument();
    expect(within(rationale).getAllByText('매도').length).toBeGreaterThan(0);
    expect(within(rationale).getAllByText('매수').length).toBeGreaterThan(0);
  });
});

describe('RebalancingProposalPanel — 시뮬레이션', () => {
  it('3/6/12개월 예상 시뮬레이션을 렌더링한다', () => {
    renderPanel();

    const simulation = screen.getByRole('region', { name: '예상 시뮬레이션' });
    expect(within(simulation).getByText('3개월')).toBeInTheDocument();
    expect(within(simulation).getByText('6개월')).toBeInTheDocument();
    expect(within(simulation).getByText('12개월')).toBeInTheDocument();
  });
});

describe('RebalancingProposalPanel — 무료 3회 + API key 정책', () => {
  it('API key 미설정 + 잔여 횟수가 남아있으면 잔여 횟수를 표시한다', () => {
    renderPanel({ isApiKeyConnected: false, aiTrialRemainingCount: 2 });

    expect(screen.getByText('무료 제안 잔여 2회')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('API key 미설정 + 잔여 0이면 제안 요청 시 연동 유도 팝업으로 차단한다', async () => {
    const user = userEvent.setup();
    renderPanel({ isApiKeyConnected: false, aiTrialRemainingCount: 0 });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'AI 추천 받기' }));

    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByRole('link', { name: '설정으로 이동' })).toHaveAttribute(
      'href',
      '/settings',
    );
  });

  it('팝업이 열리면 포커스가 다이얼로그 내부로 이동한다', async () => {
    const user = userEvent.setup();
    renderPanel({ isApiKeyConnected: false, aiTrialRemainingCount: 0 });

    await user.click(screen.getByRole('button', { name: 'AI 추천 받기' }));

    const dialog = screen.getByRole('dialog');
    await waitFor(() =>
      expect(dialog).toContainElement(document.activeElement as HTMLElement | null),
    );
  });

  it('ESC 키로 팝업을 닫고 포커스를 트리거 버튼으로 복귀한다', async () => {
    const user = userEvent.setup();
    renderPanel({ isApiKeyConnected: false, aiTrialRemainingCount: 0 });

    const trigger = screen.getByRole('button', { name: 'AI 추천 받기' });
    await user.click(trigger);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it('다이얼로그가 제목/설명과 aria로 연결된다', async () => {
    const user = userEvent.setup();
    renderPanel({ isApiKeyConnected: false, aiTrialRemainingCount: 0 });

    await user.click(screen.getByRole('button', { name: 'AI 추천 받기' }));

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby', 'api-key-prompt-title');
    expect(dialog).toHaveAttribute('aria-describedby', 'api-key-prompt-description');
  });

  it('API key 연동 상태면 잔여 횟수 없이 차단 없는 제안을 표시한다', () => {
    renderPanel({ isApiKeyConnected: true, aiTrialRemainingCount: 0 });

    expect(screen.getByRole('region', { name: 'AI 추천 근거' })).toBeInTheDocument();
    expect(screen.queryByText(/무료 제안 잔여/)).not.toBeInTheDocument();
    expect(screen.queryByText('무료 제안 횟수를 모두 사용했습니다.')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
