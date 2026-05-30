import type { MockAccount } from './types';

export const MOCK_ACCOUNTS: MockAccount[] = [
  {
    id: 'user-001',
    email: 'new@assetflow.ai',
    password: 'password123',
    userStatus: 'new',
    aiTrialRemainingCount: 3,
  },
  {
    id: 'user-002',
    email: 'user@assetflow.ai',
    password: 'password123',
    userStatus: 'existing',
    aiTrialRemainingCount: 1,
  },
];
