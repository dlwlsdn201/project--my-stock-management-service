import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  configureTargetAllocationStore,
  MOCK_TARGET_ALLOCATION,
  resetTargetAllocationStore,
} from '@entities/portfolio';
import { SettingsPortfolioPanel } from './SettingsPortfolioPanel';

const renderPanel = () => {
  const user = userEvent.setup();
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  render(<SettingsPortfolioPanel />, { wrapper: Wrapper });
  return { user };
};

afterEach(() => resetTargetAllocationStore());

describe('SettingsPortfolioPanel — 수동 자산', () => {
  it('필수값을 모두 입력하면 자산이 목록에 추가된다', async () => {
    const { user } = renderPanel();
    await user.type(screen.getByLabelText('티커'), '005930');
    await user.type(screen.getByLabelText('종목명'), '삼성전자');
    await user.type(screen.getByLabelText('보유 수량'), '10');
    await user.type(screen.getByLabelText('평균 단가'), '70000');
    await user.click(screen.getByRole('button', { name: '자산 추가' }));

    const list = screen.getByRole('list', { name: '추가된 자산 목록' });
    expect(within(list).getByText('삼성전자 (005930)')).toBeInTheDocument();
  });

  it('필수값 누락 시 오류를 표시하고 추가하지 않는다', async () => {
    const { user } = renderPanel();
    await user.click(screen.getByRole('button', { name: '자산 추가' }));
    expect(screen.getByText('티커와 종목명을 입력해주세요.')).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: '추가된 자산 목록' })).not.toBeInTheDocument();
  });

  it('추가한 자산을 삭제할 수 있다', async () => {
    const { user } = renderPanel();
    await user.type(screen.getByLabelText('티커'), '005930');
    await user.type(screen.getByLabelText('종목명'), '삼성전자');
    await user.type(screen.getByLabelText('보유 수량'), '10');
    await user.type(screen.getByLabelText('평균 단가'), '70000');
    await user.click(screen.getByRole('button', { name: '자산 추가' }));
    await user.click(screen.getByRole('button', { name: '삼성전자 삭제' }));
    expect(screen.getByText('아직 추가된 자산이 없습니다.')).toBeInTheDocument();
  });
});

describe('SettingsPortfolioPanel — 목표 비중', () => {
  it('합계가 100%가 아니면 오류를 표시한다', async () => {
    const { user } = renderPanel();
    const equityInput = await screen.findByLabelText('주식 목표 비중');
    await user.clear(equityInput);
    await user.type(equityInput, '50');
    expect(screen.getByText(/100%가 되도록 조정해주세요/)).toBeInTheDocument();
  });

  it('공격형 프리셋을 적용하면 비중이 반영된다', async () => {
    const { user } = renderPanel();
    await user.click(await screen.findByRole('button', { name: '공격형' }));
    expect(screen.getByLabelText('주식 목표 비중')).toHaveValue(80);
    expect(screen.getByLabelText('채권 목표 비중')).toHaveValue(10);
    expect(screen.getByLabelText('현금 및 기타 목표 비중')).toHaveValue(10);
  });

  it('목표 비중 저장에 성공하면 성공 메시지를 표시한다', async () => {
    const { user } = renderPanel();
    await user.click(await screen.findByRole('button', { name: '공격형' }));
    await user.click(screen.getByRole('button', { name: '목표 비중 저장' }));
    expect(await screen.findByText('목표 비중을 저장했습니다.')).toBeInTheDocument();
  });

  it('목표 비중 저장에 실패하면 에러 메시지를 표시한다', async () => {
    configureTargetAllocationStore({
      read: async () => MOCK_TARGET_ALLOCATION,
      save: async () => {
        throw new Error('save failed');
      },
    });
    const { user } = renderPanel();
    await user.click(await screen.findByRole('button', { name: '공격형' }));
    await user.click(screen.getByRole('button', { name: '목표 비중 저장' }));
    expect(
      await screen.findByText('목표 비중 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.'),
    ).toBeInTheDocument();
  });
});

describe('SettingsPortfolioPanel — AI 모델/API key', () => {
  it('AI 모델을 변경하면 선택 상태가 반영된다', async () => {
    const { user } = renderPanel();
    const geminiRadio = screen.getByRole('radio', { name: 'Gemini' });
    await user.click(geminiRadio);
    expect(geminiRadio).toBeChecked();
    expect(screen.getByRole('radio', { name: 'GPT' })).not.toBeChecked();
  });

  it('유효한 API key 저장 시 마스킹과 연동됨 상태를 표시한다', async () => {
    const { user } = renderPanel();
    await user.type(screen.getByLabelText('API key'), 'secret-key-1234');
    await user.click(screen.getByRole('button', { name: '저장' }));

    expect(screen.getByText('연동됨')).toBeInTheDocument();
    const maskedKey = screen.getByLabelText('저장된 API key');
    expect(maskedKey).toHaveTextContent('1234');
    expect(maskedKey).toHaveTextContent('•');
    expect(maskedKey).not.toHaveTextContent('secret-key');
  });

  it('짧은 API key 저장 시 오류 상태를 표시한다', async () => {
    const { user } = renderPanel();
    await user.type(screen.getByLabelText('API key'), 'short');
    await user.click(screen.getByRole('button', { name: '저장' }));
    expect(screen.getByRole('alert')).toHaveTextContent('최소 8자 이상');
  });

  it('API key 오류 시 입력과 오류 메시지가 aria로 연결된다', async () => {
    const { user } = renderPanel();
    await user.type(screen.getByLabelText('API key'), 'short');
    await user.click(screen.getByRole('button', { name: '저장' }));

    const input = screen.getByLabelText('API key');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'api-key-error');
    expect(screen.getByText('API key는 최소 8자 이상이어야 합니다.')).toHaveAttribute(
      'id',
      'api-key-error',
    );
  });

  it('저장된 API key를 삭제하면 미설정 상태로 돌아간다', async () => {
    const { user } = renderPanel();
    await user.type(screen.getByLabelText('API key'), 'secret-key-1234');
    await user.click(screen.getByRole('button', { name: '저장' }));
    await user.click(screen.getByRole('button', { name: '삭제' }));

    expect(screen.getByText('미설정')).toBeInTheDocument();
    expect(screen.getByLabelText('API key')).toBeInTheDocument();
  });
});
