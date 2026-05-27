import { ROUTES } from './routes';

export type NavItemId =
  | 'dashboard'
  | 'brokerage'
  | 'rebalance'
  | 'portfolio'
  | 'settings';

export type NavItem = {
  id: NavItemId;
  label: string;
  route: string;
};

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', route: ROUTES.DASHBOARD },
  { id: 'brokerage', label: 'Brokerage', route: ROUTES.ONBOARDING_BROKERAGE },
  { id: 'rebalance', label: 'AI Rebalance', route: ROUTES.REBALANCE },
  { id: 'portfolio', label: 'Portfolio', route: ROUTES.PORTFOLIO },
  { id: 'settings', label: 'Settings', route: ROUTES.SETTINGS },
];
