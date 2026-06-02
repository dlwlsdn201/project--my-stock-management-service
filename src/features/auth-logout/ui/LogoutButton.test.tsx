import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore } from 'jotai';
import { Provider } from 'jotai';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { sessionAtom } from '@entities/session';
import { LogoutButton } from './LogoutButton';

const renderLogoutButton = (initialAuthenticated = true) => {
  const store = createStore();
  if (initialAuthenticated) {
    store.set(sessionAtom, { userStatus: 'existing', aiTrialRemainingCount: 3 });
  }
  const user = userEvent.setup();
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/dashboard" element={<LogoutButton />} />
          <Route path="/login" element={<div>로그인 페이지</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
  return { user, store };
};

describe('LogoutButton', () => {
  it('로그아웃 버튼이 렌더된다', () => {
    renderLogoutButton();
    expect(screen.getByRole('button', { name: '로그아웃' })).toBeInTheDocument();
  });

  it('클릭 시 세션이 null이 된다', async () => {
    const { user, store } = renderLogoutButton();
    expect(store.get(sessionAtom)).not.toBeNull();
    await user.click(screen.getByRole('button', { name: '로그아웃' }));
    expect(store.get(sessionAtom)).toBeNull();
  });

  it('클릭 후 /login으로 이동한다', async () => {
    const { user } = renderLogoutButton();
    await user.click(screen.getByRole('button', { name: '로그아웃' }));
    expect(screen.getByText('로그인 페이지')).toBeInTheDocument();
  });
});
