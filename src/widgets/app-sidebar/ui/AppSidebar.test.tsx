import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { AppSidebar } from './AppSidebar';
import { NAV_ITEMS } from '@shared';

const renderSidebar = (initialPath = '/') =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AppSidebar />
    </MemoryRouter>,
  );

describe('AppSidebar', () => {
  it('renders all navigation items', () => {
    renderSidebar();
    NAV_ITEMS.forEach((item) => {
      expect(screen.getByRole('link', { name: item.label })).toBeInTheDocument();
    });
  });

  it('marks the dashboard link as active when on /dashboard', () => {
    renderSidebar('/dashboard');
    const dashboardLink = screen.getByRole('link', { name: 'Dashboard' });
    expect(dashboardLink.className).toContain('bg-blue-600');
  });

  it('does not mark non-current routes as active', () => {
    renderSidebar('/dashboard');
    const portfolioLink = screen.getByRole('link', { name: 'Portfolio' });
    expect(portfolioLink.className).not.toContain('bg-blue-600');
  });

  it('marks the portfolio link as active when on /portfolio', () => {
    renderSidebar('/portfolio');
    const portfolioLink = screen.getByRole('link', { name: 'Portfolio' });
    expect(portfolioLink.className).toContain('bg-blue-600');
  });

  it('renders the brand name', () => {
    renderSidebar();
    expect(screen.getByText('AssetFlow AI')).toBeInTheDocument();
  });
});
