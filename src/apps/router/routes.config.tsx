import { Navigate, type RouteObject } from 'react-router-dom';
import { DashboardPage } from '@pages/dashboard';
import { LoginPage } from '@pages/login';
import { OnboardingBrokeragePage } from '@pages/onboarding-brokerage';
import { PortfolioPage } from '@pages/portfolio';
import { RebalancePage } from '@pages/rebalance';
import { SettingsPage } from '@pages/settings';
import { ROUTES } from '@shared';
import { AppShellLayout } from './AppShellLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicOnlyRoute } from './PublicOnlyRoute';

export const APP_ROUTES: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to={ROUTES.LOGIN} replace />,
  },
  {
    path: ROUTES.LOGIN,
    element: (
      <PublicOnlyRoute>
        <LoginPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: ROUTES.DASHBOARD,
    element: (
      <ProtectedRoute>
        <AppShellLayout routePath={ROUTES.DASHBOARD} />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: <DashboardPage /> }],
  },
  {
    path: ROUTES.ONBOARDING_BROKERAGE,
    element: (
      <ProtectedRoute>
        <AppShellLayout routePath={ROUTES.ONBOARDING_BROKERAGE} />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: <OnboardingBrokeragePage /> }],
  },
  {
    path: ROUTES.REBALANCE,
    element: (
      <ProtectedRoute>
        <AppShellLayout routePath={ROUTES.REBALANCE} />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: <RebalancePage /> }],
  },
  {
    path: ROUTES.PORTFOLIO,
    element: (
      <ProtectedRoute>
        <AppShellLayout routePath={ROUTES.PORTFOLIO} />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: <PortfolioPage /> }],
  },
  {
    path: ROUTES.SETTINGS,
    element: (
      <ProtectedRoute>
        <AppShellLayout routePath={ROUTES.SETTINGS} />
      </ProtectedRoute>
    ),
    children: [{ index: true, element: <SettingsPage /> }],
  },
];
