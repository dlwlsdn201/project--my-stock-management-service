export const ROUTES = {
  LOGIN: '/login',
  ONBOARDING_BROKERAGE: '/onboarding/brokerage',
  DASHBOARD: '/dashboard',
  REBALANCE: '/rebalance',
  PORTFOLIO: '/portfolio',
  SETTINGS: '/settings',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
