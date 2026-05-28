import { ROUTES } from './routes';

export interface NavItem {
  label: string;
  path: string;
  description?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: ROUTES.DASHBOARD, description: '포트폴리오 현황 요약' },
  { label: 'Brokerage', path: ROUTES.ONBOARDING_BROKERAGE, description: '증권사 계좌 연동' },
  { label: 'AI Rebalance', path: ROUTES.REBALANCE, description: 'AI 리밸런싱 추천' },
  { label: 'Portfolio', path: ROUTES.PORTFOLIO, description: '보유 종목 상세' },
  { label: 'Settings', path: ROUTES.SETTINGS, description: '앱 설정' },
];
