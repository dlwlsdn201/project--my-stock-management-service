import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { ROUTES } from '@shared';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to={ROUTES.LOGIN} replace />,
  },
  {
    path: ROUTES.LOGIN,
    element: (
      <div className="flex h-screen items-center justify-center">
        <h1 className="text-2xl font-bold">AssetFlow AI — Login</h1>
      </div>
    ),
  },
  {
    path: ROUTES.DASHBOARD,
    element: (
      <div className="flex h-screen items-center justify-center">
        <h1 className="text-2xl font-bold">AssetFlow AI — Dashboard</h1>
      </div>
    ),
  },
  {
    path: ROUTES.ONBOARDING_BROKERAGE,
    element: (
      <div className="flex h-screen items-center justify-center">
        <h1 className="text-2xl font-bold">AssetFlow AI — Onboarding</h1>
      </div>
    ),
  },
  {
    path: ROUTES.REBALANCE,
    element: (
      <div className="flex h-screen items-center justify-center">
        <h1 className="text-2xl font-bold">AssetFlow AI — Rebalance</h1>
      </div>
    ),
  },
  {
    path: ROUTES.PORTFOLIO,
    element: (
      <div className="flex h-screen items-center justify-center">
        <h1 className="text-2xl font-bold">AssetFlow AI — Portfolio</h1>
      </div>
    ),
  },
  {
    path: ROUTES.SETTINGS,
    element: (
      <div className="flex h-screen items-center justify-center">
        <h1 className="text-2xl font-bold">AssetFlow AI — Settings</h1>
      </div>
    ),
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;
