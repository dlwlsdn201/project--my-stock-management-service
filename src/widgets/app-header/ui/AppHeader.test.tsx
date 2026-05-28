import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AppHeader } from './AppHeader';

describe('AppHeader', () => {
  it('renders the page title', () => {
    render(<AppHeader title="Dashboard" theme="light" onToggleTheme={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });

  it('renders an optional description', () => {
    render(
      <AppHeader title="Dashboard" description="Overview" theme="light" onToggleTheme={vi.fn()} />,
    );
    expect(screen.getByText('Overview')).toBeInTheDocument();
  });

  it('shows aria-pressed=false when theme is light', () => {
    render(<AppHeader title="Dashboard" theme="light" onToggleTheme={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Light' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('shows aria-pressed=true when theme is dark', () => {
    render(<AppHeader title="Dashboard" theme="dark" onToggleTheme={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Dark' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onToggleTheme when button is clicked', async () => {
    const user = userEvent.setup();
    const onToggleTheme = vi.fn();
    render(<AppHeader title="Dashboard" theme="light" onToggleTheme={onToggleTheme} />);
    await user.click(screen.getByRole('button', { name: 'Light' }));
    expect(onToggleTheme).toHaveBeenCalledOnce();
  });
});
