import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { APP_ROUTES } from './routes.config';

const renderAt = (initialPath: string) => {
  const router = createMemoryRouter(APP_ROUTES, { initialEntries: [initialPath] });
  return render(<RouterProvider router={router} />);
};

describe('AppRouter routing', () => {
  it('redirects / to /login', async () => {
    renderAt('/');
    expect(await screen.findByRole('heading', { name: 'AssetFlow AI' })).toBeInTheDocument();
  });

  it('renders LoginPage at /login', () => {
    renderAt('/login');
    expect(screen.getByRole('heading', { name: 'AssetFlow AI' })).toBeInTheDocument();
  });

  it('renders main landmark at /dashboard', () => {
    renderAt('/dashboard');
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('renders dashboard page content inside main at /dashboard', () => {
    renderAt('/dashboard');
    expect(screen.getByRole('main')).toContainElement(
      screen.getByRole('heading', { name: '자산군 비중' }),
    );
  });

  it('renders navigation items at /dashboard', () => {
    renderAt('/dashboard');
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Portfolio' })).toBeInTheDocument();
  });

  it('marks Dashboard link as active at /dashboard', () => {
    renderAt('/dashboard');
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});
