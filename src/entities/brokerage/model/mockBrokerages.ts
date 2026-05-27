import type { BrokerageAccount } from './types';

export const MOCK_BROKERAGE_ACCOUNTS: BrokerageAccount[] = [
  {
    id: 'ba1',
    providerId: 'kiwoom',
    providerName: '키움증권',
    accountNumber: '****-****-1234',
    status: 'connected',
    connectedAt: '2026-03-10T09:00:00Z',
    lastSyncedAt: '2026-05-26T08:00:00Z',
  },
  {
    id: 'ba2',
    providerId: 'toss',
    providerName: '토스증권',
    accountNumber: '****-****-5678',
    status: 'failed',
    connectedAt: '2026-05-20T14:30:00Z',
    errorMessage: '인증 토큰이 만료되었습니다. 다시 연결해 주세요.',
  },
];
