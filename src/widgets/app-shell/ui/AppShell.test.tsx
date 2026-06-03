import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppShell } from './AppShell';

const renderShell = () =>
  render(
    <AppShell
      header={<div>header</div>}
      sidebar={<div>sidebar</div>}
    >
      <div>content</div>
    </AppShell>,
  );

describe('AppShell', () => {
  it('renders skip link to main content', () => {
    renderShell();
    expect(screen.getByText('본문으로 건너뛰기')).toBeInTheDocument();
  });

  it('renders main content landmark with id="main-content"', () => {
    renderShell();
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content');
  });

  it('main has p-4 class for mobile padding', () => {
    renderShell();
    expect(screen.getByRole('main')).toHaveClass('p-4');
  });

  it('main has sm:p-6 class for tablet/desktop padding', () => {
    renderShell();
    expect(screen.getByRole('main')).toHaveClass('sm:p-6');
  });
});
