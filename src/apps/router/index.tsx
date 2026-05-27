import { createBrowserRouter, Navigate, RouterProvider, Outlet } from 'react-router-dom';
import { ROUTES, AppShell, AuthLayout } from '@shared';
import { AppSidebar } from '@widgets/app-sidebar';
import { AppHeader } from '@widgets/app-header';
import { LoginPage } from '@pages/login';
import { DashboardPage } from '@pages/dashboard';
import { OnboardingBrokeragePage } from '@pages/onboarding-brokerage';
import { RebalancePage } from '@pages/rebalance';
import { PortfolioPage } from '@pages/portfolio';
import { SettingsPage } from '@pages/settings';

const AppShellLayout = () => (
  <AppShell sidebar={<AppSidebar />} header={<AppHeader />}>
    <Outlet />
  </AppShell>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to={ROUTES.LOGIN} replace />,
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: ROUTES.LOGIN,
        element: <LoginPage />,
      },
    ],
  },
  {
    element: <AppShellLayout />,
    children: [
      { path: ROUTES.DASHBOARD, element: <DashboardPage /> },
      { path: ROUTES.ONBOARDING_BROKERAGE, element: <OnboardingBrokeragePage /> },
      { path: ROUTES.REBALANCE, element: <RebalancePage /> },
      { path: ROUTES.PORTFOLIO, element: <PortfolioPage /> },
      { path: ROUTES.SETTINGS, element: <SettingsPage /> },
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;
