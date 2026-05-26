import { describe, expect, it } from 'vitest';
import { ROUTES } from './routes';

describe('ROUTES', () => {
  it('모든 필수 라우트가 정의되어 있다', () => {
    expect(ROUTES.LOGIN).toBe('/login');
    expect(ROUTES.DASHBOARD).toBe('/dashboard');
    expect(ROUTES.ONBOARDING_BROKERAGE).toBe('/onboarding/brokerage');
    expect(ROUTES.REBALANCE).toBe('/rebalance');
    expect(ROUTES.PORTFOLIO).toBe('/portfolio');
    expect(ROUTES.SETTINGS).toBe('/settings');
  });
});
