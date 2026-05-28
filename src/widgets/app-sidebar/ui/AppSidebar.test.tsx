import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { NAV_ITEMS } from '@shared';
import { AppSidebar } from './AppSidebar';

const renderSidebar = (initialPath = '/dashboard') =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AppSidebar />
    </MemoryRouter>,
  );

describe('AppSidebar', () => {
  it('renders all navigation items', () => {
    renderSidebar();
    for (const item of NAV_ITEMS) {
      expect(screen.getByRole('link', { name: item.label })).toBeInTheDocument();
    }
  });

  it('applies aria-current="page" to the active route link', () => {
    renderSidebar('/dashboard');
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('does not apply aria-current to inactive route links', () => {
    renderSidebar('/dashboard');
    expect(screen.getByRole('link', { name: 'Portfolio' })).not.toHaveAttribute('aria-current');
  });

  it('updates aria-current when navigating to another route', () => {
    renderSidebar('/portfolio');
    expect(screen.getByRole('link', { name: 'Portfolio' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute('aria-current');
  });
});
