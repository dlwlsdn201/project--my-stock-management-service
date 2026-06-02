import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider, createStore } from 'jotai';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { sessionAtom } from '@entities/session';
import type { Session } from '@entities/session';
import { APP_ROUTES } from './routes.config';

const EXISTING_SESSION: Session = { userStatus: 'existing', aiTrialRemainingCount: 1 };
const NEW_SESSION: Session = { userStatus: 'new', aiTrialRemainingCount: 3 };

const renderAt = (initialPath: string, session: Session | null = null) => {
  const store = createStore();
  if (session) store.set(sessionAtom, session);
  const router = createMemoryRouter(APP_ROUTES, { initialEntries: [initialPath] });
  const utils = render(
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>,
  );
  return { store, ...utils };
};

describe('AppRouter routing', () => {
  it('redirects / to /login', async () => {
    renderAt('/');
    expect(await screen.findByRole('heading', { name: 'AssetFlow AI' })).toBeInTheDocument();
  });

  it('renders LoginPage at /login (비로그인)', () => {
    renderAt('/login');
    expect(screen.getByRole('heading', { name: 'AssetFlow AI' })).toBeInTheDocument();
  });
});

describe('AppRouter protected route guard (비로그인)', () => {
  it.each([['/dashboard'], ['/rebalance'], ['/portfolio'], ['/settings'], ['/onboarding/brokerage']])(
    '비로그인 상태에서 %s 접근 시 /login으로 redirect한다',
    (path) => {
      renderAt(path);
      expect(screen.getByRole('heading', { name: 'AssetFlow AI' })).toBeInTheDocument();
      expect(screen.queryByRole('main')).not.toBeInTheDocument();
    },
  );
});

describe('AppRouter protected route guard (로그인)', () => {
  it('로그인 상태에서 /dashboard의 main landmark를 렌더링한다', () => {
    renderAt('/dashboard', EXISTING_SESSION);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('로그인 상태에서 /dashboard 콘텐츠를 main 내부에 렌더링한다', () => {
    renderAt('/dashboard', EXISTING_SESSION);
    expect(screen.getByRole('main')).toContainElement(
      screen.getByRole('heading', { name: '자산군 비중' }),
    );
  });

  it('로그인 상태에서 /dashboard 내비게이션을 렌더링한다', () => {
    renderAt('/dashboard', EXISTING_SESSION);
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Portfolio' })).toBeInTheDocument();
  });

  it('로그인 상태에서 Dashboard 링크를 active로 표시한다', () => {
    renderAt('/dashboard', EXISTING_SESSION);
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('aria-current', 'page');
  });
});

describe('AppRouter public-only route guard (로그인 사용자의 /login)', () => {
  it('기존 사용자가 /login 접근 시 /dashboard로 redirect한다', () => {
    renderAt('/login', EXISTING_SESSION);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '자산군 비중' })).toBeInTheDocument();
  });

  it('신규 사용자가 /login 접근 시 /onboarding/brokerage로 redirect한다', () => {
    renderAt('/login', NEW_SESSION);
    expect(screen.getByRole('region', { name: '증권사 연동 온보딩' })).toBeInTheDocument();
  });
});

describe('AppRouter login flow (세션 저장)', () => {
  it('기존 사용자가 로그인하면 /dashboard로 이동하고 세션이 저장된다', async () => {
    const user = userEvent.setup();
    const { store } = renderAt('/login');
    await user.type(screen.getByLabelText('이메일'), 'user@assetflow.ai');
    await user.type(screen.getByLabelText('비밀번호'), 'password123');
    await user.click(screen.getByRole('button', { name: '로그인' }));

    expect(await screen.findByRole('main')).toBeInTheDocument();
    expect(store.get(sessionAtom)).toEqual(EXISTING_SESSION);
  });

  it('신규 사용자가 로그인하면 /onboarding/brokerage로 이동하고 세션이 저장된다', async () => {
    const user = userEvent.setup();
    const { store } = renderAt('/login');
    await user.type(screen.getByLabelText('이메일'), 'new@assetflow.ai');
    await user.type(screen.getByLabelText('비밀번호'), 'password123');
    await user.click(screen.getByRole('button', { name: '로그인' }));

    expect(await screen.findByRole('region', { name: '증권사 연동 온보딩' })).toBeInTheDocument();
    expect(store.get(sessionAtom)).toEqual(NEW_SESSION);
  });
});
