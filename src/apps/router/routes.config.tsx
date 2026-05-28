import { Navigate, type RouteObject } from 'react-router-dom';
import { DashboardPage } from '@pages/dashboard';
import { LoginPage } from '@pages/login';
import { OnboardingBrokeragePage } from '@pages/onboarding-brokerage';
import { PortfolioPage } from '@pages/portfolio';
import { RebalancePage } from '@pages/rebalance';
import { SettingsPage } from '@pages/settings';
import { ROUTES } from '@shared';
import { AppShellLayout } from './AppShellLayout';

export const APP_ROUTES: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to={ROUTES.LOGIN} replace />,
  },
  {
    path: ROUTES.LOGIN,
    element: <LoginPage />,
  },
  {
    path: ROUTES.DASHBOARD,
    element: <AppShellLayout routePath={ROUTES.DASHBOARD} />,
    children: [{ index: true, element: <DashboardPage /> }],
  },
  {
    path: ROUTES.ONBOARDING_BROKERAGE,
    element: <AppShellLayout routePath={ROUTES.ONBOARDING_BROKERAGE} />,
    children: [{ index: true, element: <OnboardingBrokeragePage /> }],
  },
  {
    path: ROUTES.REBALANCE,
    element: <AppShellLayout routePath={ROUTES.REBALANCE} />,
    children: [{ index: true, element: <RebalancePage /> }],
  },
  {
    path: ROUTES.PORTFOLIO,
    element: <AppShellLayout routePath={ROUTES.PORTFOLIO} />,
    children: [{ index: true, element: <PortfolioPage /> }],
  },
  {
    path: ROUTES.SETTINGS,
    element: <AppShellLayout routePath={ROUTES.SETTINGS} />,
    children: [{ index: true, element: <SettingsPage /> }],
  },
];
