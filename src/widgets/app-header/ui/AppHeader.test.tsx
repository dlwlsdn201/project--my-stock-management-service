import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, afterEach } from 'vitest';
import { createStore, Provider } from 'jotai';
import { AppHeader } from './AppHeader';
import { themeAtom, DEFAULT_THEME } from '@shared';

const renderWithFreshStore = () => {
  const store = createStore();
  store.set(themeAtom, DEFAULT_THEME);
  return {
    store,
    ...render(
      <Provider store={store}>
        <AppHeader />
      </Provider>,
    ),
  };
};

afterEach(() => {
  document.documentElement.classList.remove('dark');
});

describe('AppHeader', () => {
  it('renders theme toggle button in light mode', () => {
    renderWithFreshStore();
    expect(
      screen.getByRole('button', { name: 'Switch to dark mode' }),
    ).toBeInTheDocument();
  });

  it('adds dark class to document when theme toggle is clicked', async () => {
    const user = userEvent.setup();
    renderWithFreshStore();

    await user.click(screen.getByRole('button', { name: 'Switch to dark mode' }));

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('shows light mode button label after switching to dark', async () => {
    const user = userEvent.setup();
    renderWithFreshStore();

    await user.click(screen.getByRole('button', { name: 'Switch to dark mode' }));

    expect(
      screen.getByRole('button', { name: 'Switch to light mode' }),
    ).toBeInTheDocument();
  });

  it('removes dark class when toggled back to light', async () => {
    const user = userEvent.setup();
    renderWithFreshStore();

    await user.click(screen.getByRole('button', { name: 'Switch to dark mode' }));
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    await user.click(screen.getByRole('button', { name: 'Switch to light mode' }));
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
