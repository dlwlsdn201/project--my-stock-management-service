import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { BrokerageOnboardingPanel } from './BrokerageOnboardingPanel';

const renderPanel = () => {
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={['/onboarding/brokerage']}>
      <Routes>
        <Route path="/onboarding/brokerage" element={<BrokerageOnboardingPanel />} />
        <Route path="/dashboard" element={<div>Dashboard 페이지</div>} />
      </Routes>
    </MemoryRouter>,
  );
  return { user };
};

describe('BrokerageOnboardingPanel', () => {
  it('증권사 카드 목록을 렌더링한다', () => {
    renderPanel();
    expect(screen.getByRole('button', { name: '키움증권 연결하기' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '토스증권 연결하기' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '미래에셋증권 연결하기' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '삼성증권 연결하기' })).toBeInTheDocument();
  });

  it('검색 입력 시 증권사 목록을 필터링한다', async () => {
    const { user } = renderPanel();
    await user.type(screen.getByLabelText('증권사 검색'), '키움');
    expect(screen.getByRole('button', { name: '키움증권 연결하기' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '토스증권 연결하기' })).not.toBeInTheDocument();
  });

  it('연결 성공 시 완료 메시지와 대시보드 이동 버튼을 표시한다', async () => {
    const { user } = renderPanel();
    await user.click(screen.getByRole('button', { name: '키움증권 연결하기' }));
    await waitFor(() => {
      expect(screen.getByText('키움증권 연결이 완료되었습니다')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: '대시보드로 이동' })).toBeInTheDocument();
  });

  it('연결 성공 후 대시보드로 이동한다', async () => {
    const { user } = renderPanel();
    await user.click(screen.getByRole('button', { name: '키움증권 연결하기' }));
    await user.click(await screen.findByRole('button', { name: '대시보드로 이동' }));
    await waitFor(() => {
      expect(screen.getByText('Dashboard 페이지')).toBeInTheDocument();
    });
  });

  it('연결 실패 시 오류 메시지와 재시도 버튼을 표시한다', async () => {
    const { user } = renderPanel();
    await user.click(screen.getByRole('button', { name: '토스증권 연결하기' }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('증권사 연결에 실패했습니다');
    });
    expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument();
  });

  it('나중에 하기 클릭 시 대시보드로 이동한다', async () => {
    const { user } = renderPanel();
    await user.click(screen.getByRole('button', { name: '나중에 하기' }));
    await waitFor(() => {
      expect(screen.getByText('Dashboard 페이지')).toBeInTheDocument();
    });
  });
});

describe('BrokerageOnboardingPanel — 모바일 레이아웃', () => {
  it('스테퍼가 모바일 flex-col / 데스크톱 sm:flex-row 클래스를 갖는다', () => {
    renderPanel();
    const stepper = screen.getByRole('list', { name: '연동 진행 단계' });
    expect(stepper).toHaveClass('flex-col');
    expect(stepper).toHaveClass('sm:flex-row');
  });

  it('연결 실패 에러 영역이 모바일 flex-col / sm:flex-row 클래스를 갖는다', async () => {
    const { user } = renderPanel();
    await user.click(screen.getByRole('button', { name: '토스증권 연결하기' }));
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveClass('flex-col');
    expect(alert).toHaveClass('sm:flex-row');
  });
});
