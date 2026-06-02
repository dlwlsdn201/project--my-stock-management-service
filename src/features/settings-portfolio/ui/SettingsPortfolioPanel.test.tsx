import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider, createStore } from 'jotai';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import {
  configureManualAssetStore,
  configureTargetAllocationStore,
  MOCK_TARGET_ALLOCATION,
  resetManualAssetStore,
  resetTargetAllocationStore,
} from '@entities/portfolio';
import { aiSettingsAtom } from '@entities/settings';
import { SettingsPortfolioPanel } from './SettingsPortfolioPanel';

const renderPanel = () => {
  const user = userEvent.setup();
  const store = createStore();
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Provider>
  );
  render(<SettingsPortfolioPanel />, { wrapper: Wrapper });
  return { user, store };
};

afterEach(() => {
  resetTargetAllocationStore();
  resetManualAssetStore();
});

describe('SettingsPortfolioPanel — 수동 자산', () => {
  it('필수값을 모두 입력하면 자산이 목록에 추가된다', async () => {
    const { user } = renderPanel();
    await user.type(await screen.findByLabelText('티커'), '005930');
    await user.type(screen.getByLabelText('종목명'), '삼성전자');
    await user.type(screen.getByLabelText('보유 수량'), '10');
    await user.type(screen.getByLabelText('평균 단가'), '70000');
    await user.click(screen.getByRole('button', { name: '자산 추가' }));

    const list = await screen.findByRole('list', { name: '추가된 자산 목록' });
    expect(within(list).getByText('삼성전자 (005930)')).toBeInTheDocument();
  });

  it('필수값 누락 시 오류를 표시하고 추가하지 않는다', async () => {
    const { user } = renderPanel();
    await screen.findByLabelText('티커');
    await user.click(screen.getByRole('button', { name: '자산 추가' }));
    expect(screen.getByText('티커와 종목명을 입력해주세요.')).toBeInTheDocument();
    expect(screen.queryByRole('list', { name: '추가된 자산 목록' })).not.toBeInTheDocument();
  });

  it('추가한 자산을 삭제할 수 있다', async () => {
    const { user } = renderPanel();
    await user.type(await screen.findByLabelText('티커'), '005930');
    await user.type(screen.getByLabelText('종목명'), '삼성전자');
    await user.type(screen.getByLabelText('보유 수량'), '10');
    await user.type(screen.getByLabelText('평균 단가'), '70000');
    await user.click(screen.getByRole('button', { name: '자산 추가' }));
    await user.click(await screen.findByRole('button', { name: '삼성전자 삭제' }));
    expect(await screen.findByText('아직 추가된 자산이 없습니다.')).toBeInTheDocument();
  });

  it('자산 편집 후 수정하면 목록 값이 바뀐다', async () => {
    const { user } = renderPanel();
    await user.type(await screen.findByLabelText('티커'), 'AAPL');
    await user.type(screen.getByLabelText('종목명'), 'Apple');
    await user.type(screen.getByLabelText('보유 수량'), '5');
    await user.type(screen.getByLabelText('평균 단가'), '150');
    await user.click(screen.getByRole('button', { name: '자산 추가' }));

    await user.click(await screen.findByRole('button', { name: 'Apple 편집' }));
    await user.clear(screen.getByLabelText('종목명'));
    await user.type(screen.getByLabelText('종목명'), 'Apple Inc');
    await user.click(screen.getByRole('button', { name: '자산 수정' }));

    expect(await screen.findByText('Apple Inc (AAPL)')).toBeInTheDocument();
  });

  it('자산 추가 성공 시 성공 메시지를 표시한다', async () => {
    const { user } = renderPanel();
    await user.type(await screen.findByLabelText('티커'), '005930');
    await user.type(screen.getByLabelText('종목명'), '삼성전자');
    await user.type(screen.getByLabelText('보유 수량'), '10');
    await user.type(screen.getByLabelText('평균 단가'), '70000');
    await user.click(screen.getByRole('button', { name: '자산 추가' }));

    expect(await screen.findByText('자산을 추가했습니다.')).toBeInTheDocument();
  });

  it('자산 수정 성공 시 성공 메시지를 표시한다', async () => {
    const { user } = renderPanel();
    await user.type(await screen.findByLabelText('티커'), 'AAPL');
    await user.type(screen.getByLabelText('종목명'), 'Apple');
    await user.type(screen.getByLabelText('보유 수량'), '5');
    await user.type(screen.getByLabelText('평균 단가'), '150');
    await user.click(screen.getByRole('button', { name: '자산 추가' }));

    await user.click(await screen.findByRole('button', { name: 'Apple 편집' }));
    await user.clear(screen.getByLabelText('종목명'));
    await user.type(screen.getByLabelText('종목명'), 'Apple Inc');
    await user.click(screen.getByRole('button', { name: '자산 수정' }));

    expect(await screen.findByText('자산을 수정했습니다.')).toBeInTheDocument();
  });

  it('자산 삭제 성공 시 성공 메시지를 표시한다', async () => {
    const { user } = renderPanel();
    await user.type(await screen.findByLabelText('티커'), '005930');
    await user.type(screen.getByLabelText('종목명'), '삼성전자');
    await user.type(screen.getByLabelText('보유 수량'), '10');
    await user.type(screen.getByLabelText('평균 단가'), '70000');
    await user.click(screen.getByRole('button', { name: '자산 추가' }));
    await user.click(await screen.findByRole('button', { name: '삼성전자 삭제' }));

    expect(await screen.findByText('자산을 삭제했습니다.')).toBeInTheDocument();
  });

  it('자산 추가 실패 시 에러 메시지를 표시하고 폼 값을 유지한다', async () => {
    configureManualAssetStore({
      read: async () => [],
      create: async () => { throw new Error('create failed'); },
      update: async (id, payload) => ({ id, ...payload }),
      delete: async () => undefined,
    });

    const { user } = renderPanel();
    await user.type(await screen.findByLabelText('티커'), 'AAPL');
    await user.type(screen.getByLabelText('종목명'), 'Apple');
    await user.type(screen.getByLabelText('보유 수량'), '5');
    await user.type(screen.getByLabelText('평균 단가'), '150');
    await user.click(screen.getByRole('button', { name: '자산 추가' }));

    expect(await screen.findByText('자산 추가에 실패했습니다. 잠시 후 다시 시도해 주세요.')).toBeInTheDocument();
    expect(screen.getByLabelText('티커')).toHaveValue('AAPL');
  });

  it('자산 수정 실패 시 에러 메시지를 표시한다', async () => {
    const { user } = renderPanel();
    await user.type(await screen.findByLabelText('티커'), 'AAPL');
    await user.type(screen.getByLabelText('종목명'), 'Apple');
    await user.type(screen.getByLabelText('보유 수량'), '5');
    await user.type(screen.getByLabelText('평균 단가'), '150');
    await user.click(screen.getByRole('button', { name: '자산 추가' }));

    await screen.findByRole('button', { name: 'Apple 편집' });

    configureManualAssetStore({
      read: async () => [],
      create: async () => { throw new Error('not used'); },
      update: async () => { throw new Error('update failed'); },
      delete: async () => undefined,
    });

    await user.click(screen.getByRole('button', { name: 'Apple 편집' }));
    await user.click(screen.getByRole('button', { name: '자산 수정' }));

    expect(await screen.findByText('자산 수정에 실패했습니다. 잠시 후 다시 시도해 주세요.')).toBeInTheDocument();
  });

  it('자산 삭제 실패 시 에러 메시지를 표시한다', async () => {
    const { user } = renderPanel();
    await user.type(await screen.findByLabelText('티커'), 'AAPL');
    await user.type(screen.getByLabelText('종목명'), 'Apple');
    await user.type(screen.getByLabelText('보유 수량'), '5');
    await user.type(screen.getByLabelText('평균 단가'), '150');
    await user.click(screen.getByRole('button', { name: '자산 추가' }));

    await screen.findByRole('button', { name: 'Apple 삭제' });

    configureManualAssetStore({
      read: async () => [],
      create: async () => { throw new Error('not used'); },
      update: async (id, payload) => ({ id, ...payload }),
      delete: async () => { throw new Error('delete failed'); },
    });

    await user.click(screen.getByRole('button', { name: 'Apple 삭제' }));

    expect(await screen.findByText('자산 삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.')).toBeInTheDocument();
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

describe('SettingsPortfolioPanel — AI 설정 전역 상태 배선', () => {
  it('유효한 API key 저장 시 aiSettingsAtom.isApiKeyConnected가 true가 된다', async () => {
    const { user, store } = renderPanel();
    await user.type(screen.getByLabelText('API key'), 'secret-key-1234');
    await user.click(screen.getByRole('button', { name: '저장' }));

    expect(store.get(aiSettingsAtom).isApiKeyConnected).toBe(true);
  });

  it('API key 삭제 시 aiSettingsAtom.isApiKeyConnected가 false로 돌아간다', async () => {
    const { user, store } = renderPanel();
    await user.type(screen.getByLabelText('API key'), 'secret-key-1234');
    await user.click(screen.getByRole('button', { name: '저장' }));
    await user.click(screen.getByRole('button', { name: '삭제' }));

    expect(store.get(aiSettingsAtom).isApiKeyConnected).toBe(false);
  });

  it('AI 모델 변경 시 aiSettingsAtom.modelId가 갱신된다', async () => {
    const { user, store } = renderPanel();
    await user.click(screen.getByRole('radio', { name: 'Claude' }));

    expect(store.get(aiSettingsAtom).modelId).toBe('claude');
  });
});
