import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore } from 'jotai';
import { Provider } from 'jotai';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { sessionAtom } from '@entities/session';
import { AppHeader } from './AppHeader';

const renderAppHeader = (props: { showLogout?: boolean; theme?: 'light' | 'dark' } = {}) => {
  const store = createStore();
  store.set(sessionAtom, { userStatus: 'existing', aiTrialRemainingCount: 3 });
  const user = userEvent.setup();
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <AppHeader
                title="Dashboard"
                theme={props.theme ?? 'light'}
                onToggleTheme={vi.fn()}
                showLogout={props.showLogout}
              />
            }
          />
          <Route path="/login" element={<div>로그인 페이지</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
  return { user, store };
};

describe('AppHeader', () => {
  it('renders the page title', () => {
    renderAppHeader();
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('renders an optional description', () => {
    const store = createStore();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <AppHeader title="Dashboard" description="Overview" theme="light" onToggleTheme={vi.fn()} />
        </MemoryRouter>
      </Provider>,
    );
    expect(screen.getByText('Overview')).toBeInTheDocument();
  });

  it('shows aria-pressed=false when theme is light', () => {
    renderAppHeader({ theme: 'light' });
    expect(screen.getByRole('button', { name: 'Light' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('shows aria-pressed=true when theme is dark', () => {
    renderAppHeader({ theme: 'dark' });
    expect(screen.getByRole('button', { name: 'Dark' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onToggleTheme when button is clicked', async () => {
    const store = createStore();
    const onToggleTheme = vi.fn();
    const user = userEvent.setup();
    render(
      <Provider store={store}>
        <MemoryRouter>
          <AppHeader title="Dashboard" theme="light" onToggleTheme={onToggleTheme} />
        </MemoryRouter>
      </Provider>,
    );
    await user.click(screen.getByRole('button', { name: 'Light' }));
    expect(onToggleTheme).toHaveBeenCalledOnce();
  });

  it('showLogout=true일 때 로그아웃 버튼이 표시된다', () => {
    renderAppHeader({ showLogout: true });
    expect(screen.getByRole('button', { name: '로그아웃' })).toBeInTheDocument();
  });

  it('showLogout이 없으면 로그아웃 버튼이 표시되지 않는다', () => {
    renderAppHeader({ showLogout: false });
    expect(screen.queryByRole('button', { name: '로그아웃' })).not.toBeInTheDocument();
  });
});
